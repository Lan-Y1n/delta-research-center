#!/usr/bin/env bash
# 部署：构建 web(nginx) + api(node 后台) 两个镜像，启动并通过健康检查；
# 任一步失败自动回滚到上一组镜像 tag（首次部署则停止新容器）。
set -Eeuo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
umask 077

die() { printf '%s\n' "$*" >&2; exit 1; }

command -v docker >/dev/null || die '需要 Docker 与 Docker Compose v2。'
docker compose version >/dev/null || die '需要 docker compose v2。'
mkdir .deploy.lock 2>/dev/null || die '已有部署进行中；请先检查 .deploy.lock。'
trap 'rm -f -- ".env.new.$$"; rmdir -- .deploy.lock 2>/dev/null || true' EXIT

[[ -f .env ]] || cp -- .env.example .env
chmod 600 .env

rand() { head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | cut -c1-"$1"; }

env_get() { sed -n "s/^$1=//p" .env | tail -n 1 | tr -d '\r'; }

env_set() { # env_set KEY VALUE
  local key="$1" value="$2"
  awk -v key="$key" -v value="$value" '
    BEGIN { done = 0 }
    index($0, key "=") == 1 { print key "=" value; done = 1; next }
    { print }
    END { if (!done) print key "=" value }
  ' .env > ".env.new.$$"
  chmod 600 ".env.new.$$"
  mv -- ".env.new.$$" .env
}

# ---------- 首次部署自动生成后台凭据 ----------
[[ -n "$(env_get ADMIN_USER)" ]] || env_set ADMIN_USER lany1n
if [[ -z "$(env_get ADMIN_PASSWORD)" || "$(env_get ADMIN_PASSWORD)" == change-me* ]]; then
  env_set ADMIN_PASSWORD "$(rand 20)"
  printf '已生成后台密码并写入 .env 的 ADMIN_PASSWORD\n'
fi
if [[ -z "$(env_get ADMIN_SESSION_SECRET)" || "$(env_get ADMIN_SESSION_SECRET)" == please-change* ]]; then
  env_set ADMIN_SESSION_SECRET "$(rand 40)"
fi

image_name="$(env_get IMAGE_NAME)"; image_name="${image_name:-delta-research-center}"
api_image_name="$(env_get API_IMAGE_NAME)"; api_image_name="${api_image_name:-delta-research-center-api}"
[[ "$image_name" =~ ^[a-z0-9][a-z0-9./:_-]*$ ]] || die 'IMAGE_NAME 格式无效。'
[[ "$api_image_name" =~ ^[a-z0-9][a-z0-9./:_-]*$ ]] || die 'API_IMAGE_NAME 格式无效。'

# 有预构建 dist 时用 Dockerfile.deploy（容器内不跑 npm ci），否则用完整 Dockerfile
web_dockerfile="Dockerfile"
if [[ -d dist && -f Dockerfile.deploy ]]; then
  web_dockerfile="Dockerfile.deploy"
  printf '检测到预构建 dist，使用 %s\n' "$web_dockerfile"
fi
export WEB_DOCKERFILE="$web_dockerfile"
export IMAGE_NAME="$image_name" API_IMAGE_NAME="$api_image_name"

new_tag="$(date -u +%Y%m%dT%H%M%SZ)-$$"

compose() { TAG="$1" docker compose --env-file .env "${@:2}"; }

prev_tag_of() { # prev_tag_of 容器名 镜像名前缀
  local container image_ref image_id tag
  container="$(compose local ps -a -q "$1" 2>/dev/null || true)"
  [[ -n "$container" ]] || return 0
  image_ref="$(docker inspect --format '{{.Config.Image}}' "$container")"
  image_id="$(docker inspect --format '{{.Image}}' "$container")"
  if [[ "$image_ref" == "$2":* ]] && [[ "$(docker image inspect --format '{{.Id}}' "$image_ref" 2>/dev/null || true)" == "$image_id" ]]; then
    tag="${image_ref#"$2":}"
  else
    tag="rollback-$new_tag"
    docker image tag "$image_id" "$2:$tag"
  fi
  printf '%s' "$tag"
}

previous_web_tag="$(prev_tag_of web "$image_name")"
previous_api_tag="$(prev_tag_of api "$api_image_name")"

mkdir -p data
chmod 750 data
# ./data 是 bind mount，api 容器以固定 uid/gid 1000 运行（见 server/Dockerfile）
if [[ "$(id -u)" -eq 0 ]]; then
  chown -R 1000:1000 data
else
  sudo chown -R 1000:1000 data 2>/dev/null || printf '提示：无法 chown data（非 root），若 api 报 EACCES 请手动执行：sudo chown -R 1000:1000 data\n' >&2
fi

health_ok() {
  curl -fsS --max-time 5 http://127.0.0.1:8080/ >/dev/null || return 1
  curl -fsS --max-time 5 http://127.0.0.1:8080/api/health >/dev/null || return 1
  curl -fsS --max-time 5 -o /dev/null http://127.0.0.1:8080/admin || return 1
}

bring_up() { # bring_up TAG
  compose "$1" up -d --no-build --wait --wait-timeout 180 web api
}

rollback() {
  if [[ -n "$previous_web_tag" ]]; then
    printf '回滚至 web=%s:%s\n' "$image_name" "$previous_web_tag" >&2
    if [[ -n "$previous_api_tag" ]]; then
      printf '回滚至 api=%s:%s\n' "$api_image_name" "$previous_api_tag" >&2
      compose "$previous_web_tag" up -d --no-build --wait --wait-timeout 180 web api \
        || printf '%s\n' '回滚健康检查失败；请检查 docker compose ps 与 logs。' >&2
    else
      compose "$previous_web_tag" up -d --no-build --wait --wait-timeout 180 web \
        || printf '%s\n' '回滚 web 失败；请检查 docker compose logs web。' >&2
    fi
    return 0
  fi
  printf '%s\n' '首次部署无上一 tag，停止新容器；失败镜像保留供排查。' >&2
  compose "$new_tag" stop web api 2>/dev/null || true
}

printf '构建 %s:%s 与 %s:%s\n' "$image_name" "$new_tag" "$api_image_name" "$new_tag"
if ! compose "$new_tag" build web api; then
  printf '%s\n' '构建失败，原容器保持不变。' >&2
  exit 1
fi

if bring_up "$new_tag" && health_ok; then
  env_set TAG "$new_tag"
  env_set IMAGE_NAME "$image_name"
  env_set API_IMAGE_NAME "$api_image_name"
  printf '部署成功：%s:%s + %s:%s（8080，健康检查通过）\n' "$image_name" "$new_tag" "$api_image_name" "$new_tag"
  printf '后台地址：http://<服务器>:8080/admin （账号见 .env 的 ADMIN_USER / ADMIN_PASSWORD）\n'
  printf '内容数据：%s/data（bind mount，容器重建不丢）\n' "$(pwd)"
  exit 0
fi

printf '%s\n' '启动或健康检查失败。' >&2
rollback
compose "$new_tag" logs --tail=60 web api >&2 || true
exit 1
