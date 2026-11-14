# 德尔塔研究中心 · 部署说明

静态站点（React 构建产物 + nginx）。**目标机上不需要 Node、不需要 npm、不访问 npm registry**，
只需要一个 `nginx:alpine` 镜像就能跑起来。

---

## 1. 产物清单

| 文件 | 作用 |
|---|---|
| `dist/` | 构建产物（`index.html` 914B + 1 个 CSS 69KB + 1 个 JS 455KB），所有资源走 `/assets/` 绝对路径 |
| `nginx.conf` | 单文件 server 块：监听 8080、SPA 回落、hash 资源长缓存、安全头、gzip |
| `Dockerfile` | `FROM nginx:alpine` 直接 COPY 产物，无构建阶段 |
| `docker-compose.yml` | 服务名 `web`，端口映射 `${HOST_PORT:-8080}:8080`，健康检查 + 日志轮转 |
| `deploy.sh` | 一键部署：端口预检 → 打 tag → 起容器 → 健康检查失败自动回滚 |
| `verify.sh` | 部署后验收：6 条路由 200、缓存头、gzip、标题、安全头 |
| `.env.example` | `IMAGE_NAME` / `TAG` / `HOST_PORT` / `BASE_IMAGE` |

---

## 2. 端口映射

只有**一个**端口，宿主 → 容器是 1:1。

| 宿主监听 | 容器端口 | 用途 | 约定出处 |
|---|---|---|---|
| `192.168.10.60:8080` | `8080` | 站点入口（内网可直连） | `AGENTS-网络与端口约定.md` §4：8080 预留给 VM101 个人网站 |
| — | — | WAF 上游 / Cloudflare Tunnel 上游指向 `http://192.168.10.60:8080` | 同文档 §4、§7 |

**不需要**再开 80/443（VM101 上已被 1Panel-openresty 占用，§5 明令不得占用），
也不做任何 PVE 端口转发 / DNAT（§5 禁止自行加公网入口）。公网访问由已有的 Cloudflare Tunnel 承担。

**端口被占时**：`deploy.sh` 会用 `ss -lnt` 先查，发现占用直接中止并打印占用进程。
按 §5 换到 8100+ 段：

```bash
HOST_PORT=8101 ./deploy.sh
```

换完必须同步两处，否则线上的 WAF/Tunnel 还指着 8080：
1. `AGENTS-网络与端口约定.md` §3 端口表 + §4 预留说明（追加一行变更记录）；
2. SafeLine WAF 上游 / Cloudflare Tunnel 的 ingress 地址。

---

## 3. 部署（VM101，有 Docker）

### 3.1 把包送到 192.168.10.60

Windows 在本机 `192.168.1.3`，与 VM101 的 `192.168.10.60` 不同网段、无路由，**不能直接 scp**。
两条可行路径：

- **A. VM101 主动拉**（推荐，最简单）
  ```powershell
  # 在本包所在目录开一个只读 HTTP 服务
  & 'F:\Python\python.exe' -m http.server 8100 --bind 0.0.0.0
  ```
  ```bash
  # VM101 上（OpenWrt 有出网 NAT，能访问 192.168.1.3）
  cd /opt && sudo mkdir -p delta-site && cd delta-site
  sudo wget -O - http://192.168.1.3:8100/delta-site-deploy.tar.gz | sudo tar xz
  ```
  > 若 8100 被 Windows 防火墙拦住，放行一次入站即可；或改用 PVE 控制台里拖拽上传。

- **B. 经 PVE 控制台 / 跳板机**
  从 PVE 的 VM101 串口/SSH 控制台登录后，用同一招 `wget`，或用 1Panel 文件管理器上传再解包。

### 3.2 起服务

```bash
cd /opt/delta-site
sudo BASE_IMAGE=nginx:alpine ./deploy.sh          # 默认 8080:8080
```

脚本会依次做完：检查产物齐全 → 检查 8080 是否被占 → 加 `.deploy.lock` →
记录当前镜像 tag（供回滚）→ `docker compose build` → `up -d --wait` →
健康检查通过才写回 `.env` 的 tag → 最后跑 `verify.sh`。

### 3.3 验收

```bash
sudo ./verify.sh                                  # 从 .env 读 HOST_PORT
# 或从任何内网机器：
BASE=http://192.168.10.60:8080 ./verify.sh
```

通过标准：6 条路径（`/` `/field/physics` `/field/armed-forces` `/leader/lanyin` `/cooperation` `/does-not-exist`）
全部 200、`index.html` 为 `no-cache`、`/assets/*` 为 `public, immutable`、JS 走 gzip、标题含 `DELTA`、两条安全头存在。

---

## 4. 镜像拉取注意（重要）

VM101 上 **Docker Hub 直连被墙**，已配置 DaoCloud 镜像：

```json
{ "registry-mirrors": ["https://docker.m.daocloud.io"] }
```

`docker compose build` 里 `FROM nginx:alpine` 会走这个 mirror，正常情况无需干预。
若报 `failed to resolve reference` / `i/o timeout`：

```bash
sudo docker pull docker.m.daocloud.io/library/nginx:alpine
sudo docker tag  docker.m.daocloud.io/library/nginx:alpine nginx:alpine
# 然后重新执行
sudo ./deploy.sh

# 或者直接指定完整镜像地址，跳过 tag：
sudo BASE_IMAGE=docker.m.daocloud.io/library/nginx:alpine ./deploy.sh
```

镜像体积约 25 MB，构建过程只做 COPY，秒级完成。

---

## 5. 无 Docker 兜底

万一 VM101 的 Docker 不可用，用宿主 nginx（1Panel 里另建一个 8080 的站点）：

```bash
sudo mkdir -p /var/www/delta-site
sudo cp -r dist/* /var/www/delta-site/
sudo cp nginx.conf /etc/nginx/conf.d/delta-site.conf   # 注意：该文件 listen 8080
sudo nginx -t && sudo systemctl reload nginx
```

或纯静态临时预览（仅排障用，无缓存头、SPA 回落靠 404 兜底）：

```bash
cd dist && python3 -m http.server 8080 --bind 0.0.0.0
```

---

## 6. 更新与回滚

```bash
# 更新：覆盖包内容后重跑，脚本自动打新 tag，失败自动回滚上一版
sudo ./deploy.sh

# 手动回滚到某个 tag（TAG 直接作为环境变量传给 compose）
sudo TAG=20261114T081500Z-1234 docker compose --env-file .env up -d --no-build --wait web

sudo docker image ls | grep delta-research-center   # 看所有历史 tag
```

---

## 7. 已知限制

- 本包在 Windows 侧**无法预构建镜像**（本机无 docker/podman），构建发生在部署目标上；因此镜像构建这一步只能到 VM101 才能验证。
- `nginx.conf` 与 `Dockerfile` 沿用了仓库里既有实现（原本是 `node:22-alpine` 多阶段构建），本包改为「预构建产物 + 纯 nginx」，行为一致但不再需要 Node。
- 站点是纯 CSR（客户端渲染），`document.title` 由 JS 运行时写入；爬虫拿到的 `index.html` 标题是静态的。要 SEO 需另做预渲染，不在本包范围。
- 站点内容目前全部是占位文案（`（占位）`、`待补充`、`示例占位数据 · SAMPLE DATA`），上线前需替换真实资料。
