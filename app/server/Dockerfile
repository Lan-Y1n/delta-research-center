# 内容后台（Node 内置模块，无第三方依赖）
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=8090 \
    DATA_DIR=/data

WORKDIR /app

COPY server.js ./
COPY content.seed.json ./
COPY admin ./admin

# node:22-alpine 自带 node 用户（uid/gid 1000）；固定用它，deploy.sh 会 chown 1000:1000 ./data
RUN mkdir -p /data && chown -R 1000:1000 /data /app \
    && chmod 750 /data

USER node

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8090/api/health || exit 1

CMD ["node", "server.js"]
