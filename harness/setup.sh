#!/usr/bin/env bash
# LP 하네스 환경 준비 — 레포 루트에서 실행: bash harness/setup.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "▸ npm 의존성"
npm install --no-audit --no-fund >/dev/null 2>&1 || npm install --no-audit --no-fund --legacy-peer-deps >/dev/null
node -e "require('sharp');require('pretendard/package.json')" 2>/dev/null || npm i -D --no-audit --no-fund --legacy-peer-deps sharp@0.33.5 pretendard@1.3.9 >/dev/null

echo "▸ 폰트 서브셋 도구 (fonttools + brotli)"
python3 -c "import fontTools, brotli" 2>/dev/null || pip install -q --break-system-packages fonttools brotli 2>/dev/null || pip install -q fonttools brotli

echo "▸ design-assets (ODS 원본)"
DA="${DESIGN_ASSETS_ROOT:-}"
for c in "$DA" "$HOME/design-assets" "/home/claude/design-assets" "$ROOT/vendor/design-assets"; do
  if [ -n "$c" ] && [ -d "$c/assets" ]; then DA="$c"; break; fi
done
if [ -z "$DA" ] || [ ! -d "$DA/assets" ]; then
  DA="$ROOT/vendor/design-assets"
  mkdir -p "$ROOT/vendor"
  git clone --depth 1 --filter=blob:none --no-checkout https://github.com/bucketplace/design-assets "$DA"
  git -C "$DA" sparse-checkout init --no-cone
  printf '%s\n' '/assets/*/*.adf.jsonc' '/assets/*/still-image/*_480w.png' '/assets/*/still-image/*_480w.webp' '/assets/*/svg/*.svg' > "$DA/.git/info/sparse-checkout"
  git -C "$DA" -c gc.auto=0 checkout HEAD
fi
echo "  → $DA ($(ls "$DA/assets" | wc -l | tr -d ' ') assets)"

echo "▸ 에셋 인덱스 재생성"
node harness/bin/build-asset-index.mjs "$DA"

echo "▸ 렌더 번들"
node harness/render/build.mjs

echo "✓ 준비 완료 — node harness/bin/lp.mjs build harness/examples/moving.spec.json"
