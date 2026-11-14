#!/usr/bin/env bash
# 德尔塔研究中心 · 一键部署（在部署目标上执行，需要 docker + compose v2）
# 用法：
#   ./deploy.sh                     # 默认 8080:8080
#   HOST_PORT=8080 ./deploy.sh      # 指定宿主端口
#   ./deploy.sh verify              # 只做验收，不起容器
# 特性：镜像 tag 逐次轮转、健康检查不通过自动回滚上一版、部署前检查端口占用。
set -Eeuo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
umask 077
say()  { printf '%s\n' "$*"; }
die()  { printf '%s\n' "$*" >&2; exit 1; }

command -v docker >/dev/null || die '需要 Docker；未安装则改用同目录的 DEPLOY.md「无 Docker 兜底」一节。'
docker compose version >/dev/null || die '需要 Docker Compose v2（docker compose，而不是 docker-compose）。'

# ---------- 只验收模式 ----------
if [[ "${1:-}" == "verify" ]]; then
  exec ./verify.sh
fi

# ---------- 前置检查 ----------
[[ -f dist/index.html ]] || die '缺少 dist/ 产物；先在源码侧执行 npm run build 再重新打包。'
[[ -f nginx.conf ]] || die '缺少 nginx.conf。'

if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  . ./.env
fi
IMAGE_NAME="${IMAGE_NAME:-delta-research-center}"
HOST_PORT="${HOST_PORT:-8080}"
BASE_IMAGE="${BASE_IMAGE:-nginx:alpine}"
[[ "$IMAGE_NAME" =~ ^[a-z0-9][a-z0-9./:_-]*$ ]] || die "IMAGE_NAME 格式无效：$IMAGE_NAME"
[[ "$HOST_PORT" =~ ^[0-9]+$ ]] || die "HOST_PORT 无效：$HOST_PORT"

# 端口占用检查（同端口同 IP 例外用 ss 判断，不盲改端口）
if ss -lnt 2>/dev/null | awk '{print $4}' | grep -qE "[:.]${HOST_PORT}\$"; then
  say "警告：宿主 ${HOST_PORT} 已有监听："
  ss -lntp 2>/dev/null | grep -E "[:.]${HOST_PORT}\$" || true
  die "端口被占用，部署中止。按 AGENTS §5 换端口（8100+ 建议段）后重试：HOST_PORT=8101 ./deploy.sh"
fi

mkdir .deploy.lock 2>/dev/null || die '已有部署进行中；请先检查 .deploy.lock。'
trap 'rm -f -- ".env.new.$$"; rmdir -- .deploy.lock 2>/dev/null || true' EXIT

write_env() { # $1=tag
  {
    printf 'IMAGE_NAME=%s\n' "$IMAGE_NAME"
    printf 'TAG=%s\n' "$1"
    printf 'HOST_PORT=%s\n' "$HOST_PORT"
    printf 'BASE_IMAGE=%s\n' "$BASE_IMAGE"
  } > ".env.new.$$"
  chmod 600 ".env.new.$$"
  mv -- ".env.new.$$" .env
}

new_tag="$(date -u +%Y%m%dT%H%M%SZ)-$$"
previous_tag=''
compose() { IMAGE_NAME="$IMAGE_NAME" TAG="$1" HOST_PORT="$HOST_PORT" BASE_IMAGE="$BASE_IMAGE" docker compose --env-file .env "${@:2}"; }

# 记录当前运行的镜像，供回滚
current_container="$(compose local ps -a -q web 2>/dev/null || true)"
if [[ -n "$current_container" ]]; then
  previous_ref="$(docker inspect --format '{{.Config.Image}}' "$current_container")"
  previous_id="$(docker inspect --format '{{.Image}}' "$current_container")"
  if [[ "$previous_ref" == "$IMAGE_NAME":* ]] && [[ "$(docker image inspect --format '{{.Id}}' "$previous_ref" 2>/dev/null || true)" == "$previous_id" ]]; then
    previous_tag="${previous_ref#"$IMAGE_NAME":}"
  else
    previous_tag="rollback-$new_tag"
    docker image tag "$previous_id" "$IMAGE_NAME:$previous_tag"
  fi
fi

# ---------- 构建 ----------
say "构建 ${IMAGE_NAME}:${new_tag}（base=${BASE_IMAGE}，无需 Node）"
if ! compose "$new_tag" build web; then
  die '构建失败；原容器与上一 tag 均未改动。'
fi

# ---------- 启动 + 健康检查 ----------
say "启动容器，映射 ${HOST_PORT}:8080"
if compose "$new_tag" up -d --no-build --wait --wait-timeout 120 web; then
  write_env "$new_tag"
  say "部署成功：${IMAGE_NAME}:${new_tag}（宿主 ${HOST_PORT} -> 容器 8080）"
else
  say '启动或健康检查失败。' >&2
  if [[ -n "$previous_tag" ]]; then
    say "回滚至 ${IMAGE_NAME}:${previous_tag}" >&2
    if compose "$previous_tag" up -d --no-build --wait --wait-timeout 120 web; then
      write_env "$previous_tag"
      say '已恢复上一镜像并通过健康检查。' >&2
    else
      say '回滚健康检查也失败；镜像保留，请查 docker compose logs web。' >&2
    fi
  else
    compose "$new_tag" stop web || true
    say '首次部署无上一版可回滚；新容器已停止，失败镜像保留供排查。' >&2
  fi
  exit 1
fi

# ---------- 验收 ----------
say '--- 验收 ---'
HOST_PORT="$HOST_PORT" ./verify.sh || say '验收未全通过，见上。'
