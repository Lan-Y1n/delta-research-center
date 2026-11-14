#!/usr/bin/env bash
# 部署验收：路由回落、静态资源缓存头、gzip、真实内容。
# 用法：./verify.sh            # 默认 http://127.0.0.1:8080
#       BASE=http://192.168.10.60:8080 ./verify.sh
set -Eeuo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if [[ -f .env ]]; then . ./.env; fi
BASE="${BASE:-http://127.0.0.1:${HOST_PORT:-8080}}"
pass=0; fail=0
ok()   { printf '  PASS  %s\n' "$*"; pass=$((pass+1)); }
bad()  { printf '  FAIL  %s\n' "$*"; fail=$((fail+1)); }
head_() { curl -sS -o /dev/null -w '%{http_code}' --max-time 8 "$@"; }

say() { printf '%s\n' "$*"; }
say "验收目标：$BASE"

# 1) 首屏与 SPA 深链都必须 200（nginx try_files 回落 index.html）
for p in / /field/physics /field/armed-forces /leader/lanyin /cooperation /does-not-exist; do
  code="$(head_ "$BASE$p" || echo 000)"
  [[ "$code" == "200" ]] && ok "$p -> $code" || bad "$p -> $code（期望 200）"
done

# 2) index.html 不得被缓存
cc="$(curl -sSI --max-time 8 "$BASE/" | tr -d '\r' | awk -F': ' 'tolower($1)=="cache-control"{print $2; exit}')"
[[ "$cc" == *no-cache* ]] && ok "index.html Cache-Control: $cc" || bad "index.html Cache-Control 缺少 no-cache（实际：${cc:-无}）"

# 3) 带 hash 的静态资源必须长缓存 + immutable
asset="$(curl -sS --max-time 8 "$BASE/" | grep -oE '/assets/[^"]+\.(js|css)' | head -n 1)"
if [[ -n "$asset" ]]; then
  code="$(head_ "$BASE$asset" || echo 000)"
  ach="$(curl -sSI --max-time 8 "$BASE$asset" | tr -d '\r' | awk -F': ' 'tolower($1)=="cache-control"{print $2; exit}')"
  [[ "$code" == "200" ]] && ok "$asset -> 200" || bad "$asset -> $code"
  [[ "$ach" == *immutable* ]] && ok "assets Cache-Control: $ach" || bad "assets 缺少 immutable（实际：${ach:-无}）"
  # 4) gzip 生效
  enc="$(curl -sS -H 'Accept-Encoding: gzip' -o /dev/null -D - --max-time 8 "$BASE$asset" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-encoding"{print $2; exit}')"
  [[ "$enc" == "gzip" ]] && ok "gzip: $enc" || bad "assets 未 gzip（实际：${enc:-无}）"
else
  bad '页面里找不到 /assets/ 引用，产物可能不完整'
fi

# 5) 内容真实性：标题里必须有站名
title="$(curl -sS --max-time 8 "$BASE/" | grep -oE '<title>[^<]*' | head -n 1)"
[[ "$title" == *DELTA* ]] && ok "标题：${title#<title>}" || bad "标题异常：${title:-空}"

# 6) 安全头
for h in x-content-type-options referrer-policy; do
  v="$(curl -sSI --max-time 8 "$BASE/" | tr -d '\r' | awk -F': ' -v k="$h" 'tolower($1)==k{print $2; exit}')"
  [[ -n "$v" ]] && ok "$h: $v" || bad "缺少响应头 $h"
done

say ""
say "结果：$pass 通过，$fail 失败"
[[ "$fail" -eq 0 ]]
