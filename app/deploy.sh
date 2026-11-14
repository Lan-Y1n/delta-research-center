#!/usr/bin/env bash
set -Eeuo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
umask 077
command -v docker >/dev/null || { printf '%s\n' '需要 Docker 和 Docker Compose v2。' >&2; exit 1; }
docker compose version >/dev/null
mkdir .deploy.lock 2>/dev/null || { printf '%s\n' '已有部署进行中；请先检查 .deploy.lock。' >&2; exit 1; }
trap 'rm -f -- ".env.new.$$"; rmdir -- .deploy.lock' EXIT

[[ -f .env ]] || cp -- .env.example .env
chmod 600 .env
image_name="$(sed -n 's/^IMAGE_NAME=//p' .env | tail -n 1 | tr -d '\r')"
image_name="${image_name:-delta-research-center}"
[[ "$image_name" =~ ^[a-z0-9][a-z0-9./:_-]*$ ]] || { printf '%s\n' 'IMAGE_NAME 格式无效。' >&2; exit 1; }
new_tag="$(date -u +%Y%m%dT%H%M%SZ)-$$"
previous_tag=''

compose() {
  IMAGE_NAME="$image_name" TAG="$1" docker compose --env-file .env "${@:2}"
}

write_tag() {
  awk -v name="$image_name" -v tag="$1" '
    BEGIN { have_name = 0; have_tag = 0 }
    /^IMAGE_NAME=/ { print "IMAGE_NAME=" name; have_name = 1; next }
    /^TAG=/ { print "TAG=" tag; have_tag = 1; next }
    { print }
    END {
      if (!have_name) print "IMAGE_NAME=" name
      if (!have_tag) print "TAG=" tag
    }
  ' .env > ".env.new.$$"
  chmod 600 ".env.new.$$"
  mv -- ".env.new.$$" .env
}

current_container="$(compose local ps -a -q web)"
if [[ -n "$current_container" ]]; then
  previous_ref="$(docker inspect --format '{{.Config.Image}}' "$current_container")"
  previous_id="$(docker inspect --format '{{.Image}}' "$current_container")"
  if [[ "$previous_ref" == "$image_name":* ]] && [[ "$(docker image inspect --format '{{.Id}}' "$previous_ref" 2>/dev/null || true)" == "$previous_id" ]]; then
    previous_tag="${previous_ref#"$image_name":}"
  else
    previous_tag="rollback-$new_tag"
    docker image tag "$previous_id" "$image_name:$previous_tag"
  fi
fi

printf '构建 %s:%s\n' "$image_name" "$new_tag"
if ! compose "$new_tag" build web; then
  printf '%s\n' '构建失败，原容器与上一 tag 保持不变。' >&2
  exit 1
fi

if compose "$new_tag" up -d --no-build --wait --wait-timeout 120 web; then
  write_tag "$new_tag"
  printf '部署成功：%s:%s（8080，健康检查通过）\n' "$image_name" "$new_tag"
else
  printf '%s\n' '启动或健康检查失败。' >&2
  if [[ -n "$previous_tag" ]]; then
    printf '回滚至 %s:%s\n' "$image_name" "$previous_tag" >&2
    if compose "$previous_tag" up -d --no-build --wait --wait-timeout 120 web; then
      write_tag "$previous_tag"
      printf '%s\n' '已恢复上一镜像并通过健康检查。' >&2
    else
      printf '%s\n' '回滚健康检查也失败；镜像已保留，请检查 docker compose logs web。' >&2
    fi
  else
    if compose "$new_tag" stop web; then
      printf '%s\n' '首次部署无上一 tag，新容器已停止，失败镜像保留供排查。' >&2
    else
      printf '%s\n' '首次部署无上一 tag，停止新容器失败；请检查 docker compose ps 与 logs web。' >&2
    fi
  fi
  exit 1
fi
