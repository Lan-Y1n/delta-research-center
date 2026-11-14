# syntax=docker/dockerfile:1
# 预构建静态产物镜像：只需 nginx:alpine，不装 Node、不跑 npm ci、不访问 npm registry。
# 适用于离网/内网受限的部署目标（VM101 等）。
ARG BASE_IMAGE=nginx:alpine
FROM ${BASE_IMAGE}

LABEL org.opencontainers.image.title="delta-research-center" \
      org.opencontainers.image.description="德尔塔研究中心 · 虚构科研机构展示站（静态）" \
      org.opencontainers.image.source="https://github.com/Lan-Y1n/delta-research-center"

# SPA 路由 + 静态资源缓存策略
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 已构建好的产物（npm run build 的 dist/）
COPY dist/ /usr/share/nginx/html/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
