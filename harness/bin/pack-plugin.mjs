#!/usr/bin/env node
/**
 * 마켓플레이스 플러그인용 독립 패키지 생성.
 *   node harness/bin/pack-plugin.mjs <dest>      (예: ~/claude-marketplace/plugins/product-design/skills/lp-draft)
 *
 * dest/
 *   SKILL.md            ← harness/skill/SKILL.md (경로를 플러그인 기준으로 치환)
 *   references/         ← harness/prompts/
 *   harness/            ← 렌더에 필요한 src 서브셋 + harness 런타임 + 최소 package.json (Next 앱·빌더 어드민 제외)
 *
 * 사용자는 dest/harness 에서 `bash setup.sh` 한 번 → `node bin/lp.mjs build …`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "../..");
const dest = path.resolve(process.argv[2] || "dist-plugin/lp-draft");
const H = path.join(dest, "harness");

const rm = (p) => fs.rmSync(p, { recursive: true, force: true });
const cp = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.cpSync(from, to, { recursive: true }); };

rm(dest);
fs.mkdirSync(H, { recursive: true });

// 1) 스킬 본문 + 참고 규칙
let skill = fs.readFileSync(path.join(ROOT, "harness/skill/SKILL.md"), "utf8");
skill = skill
  .replace(/`harness\/prompts\/`/g, "`references/`")
  .replace(/prompts\/(0\d-[a-z-]+\.md|spec-format\.md)/g, "references/$1")
  .replace(/node harness\/bin\/lp\.mjs/g, "node harness/bin/lp.mjs")
  .replace(/harness\/out\//g, "harness/out/");
// 0단계(환경 준비)를 임베드본 기준으로 교체
skill = skill.replace(/## 0\. 환경 준비[\s\S]*?(?=\n## 1)/, `## 0. 환경 준비 (최초 1회)

하네스 런타임(컴파일러·검증·렌더러·ODS 에셋 인덱스)은 **이 스킬 폴더 안** \`harness/\` 에 임베드돼 있다. 외부 레포·노션 없이 동작한다.

**준비물(한눈에):** Node 20+ · npm · Python3(+fontTools·brotli, setup.sh 가 설치) · Chromium(Playwright, 없으면 \`--no-qa\`) · \`bucketplace/design-assets\` 읽기 권한(없으면 CDN 폴백/플레이스홀더) · 목업 섹션용 Loom 플러그인(\`bucketplace-loom\`, 선택).

\`\`\`bash
cd <이 스킬 폴더>/harness      # 예: ~/claude-marketplace/plugins/product-design/skills/lp-draft/harness
bash setup.sh                 # npm 의존성 · 폰트 도구 · 렌더 QA 브라우저 · (권한 있으면) design-assets 원본 · 렌더 번들
node bin/lp.mjs doctor        # 상태 점검
\`\`\`
플러그인 설치 경로를 모르면 \`~/.claude/plugins\` 아래 \`product-design/skills/lp-draft\` 를 찾는다. 이후 명령은 모두 그 \`harness/\` 에서 실행하고, 산출물은 \`harness/out/<slug>/\` 에 쌓인다(같은 slug 재빌드 시 직전 산출물은 \`prev/\` 에 한 세대 보관). 설치 경로가 읽기 전용이면 \`--out ~/lp-draft/<slug>\` 로 바꾼다(그 폴더에 기존 산출물이 있으면 \`--force\` 가 있어야 덮어쓴다).

**design-assets 읽기 권한이 없을 때** — 빌드는 되고 에셋은 CDN 폴백(자동) → 플레이스홀더 순으로 채워진다. 리포트에 \`CDN 폴백 N개 성공/실패\` 가 뜬다.
사용자에게 이렇게 안내한다: ① \`#ai_frontier\` 에 bucketplace/design-assets 읽기 권한 요청 ② 급하면 권한 있는 팀원의 \`node bin/lp.mjs pack-assets\` 결과를 받아 \`DESIGN_ASSETS_ROOT\` 지정 ③ 그 전까지는 플레이스홀더 시안으로 구조·카피를 먼저 리뷰. 플레이스홀더 상태의 시안을 "완성"이라고 말하지 않는다.
입력이 **기존 페이지 URL** 이면 브라우저로 열어 본문·FAQ 펼침 텍스트·메타를 전부 추출한 뒤 시작.
`);
skill = skill.replace(/node harness\/bin\/lp\.mjs/g, "node bin/lp.mjs").replace(/harness\/out\//g, "out/").replace(/`harness\/examples\/`/g, "`examples/`");
fs.writeFileSync(path.join(dest, "SKILL.md"), skill);
fs.writeFileSync(path.join(dest, ".gitignore"), "harness/node_modules/\nharness/.build/\nharness/out/\nharness/package-lock.json\n");
cp(path.join(ROOT, "harness/prompts"), path.join(dest, "references"));

// 2) 렌더에 필요한 src 서브셋 (esbuild metafile 기준)
const SRC = [
  "src/schema", "src/lib", "src/shims", "src/catalog",
  "src/components/preview", "src/components/lead",
];
for (const d of SRC) cp(path.join(ROOT, d), path.join(H, d));
// 빌더 전용·스토리 파일 제거
for (const f of walk(path.join(H, "src"))) if (/\.stories\.tsx?$|_decorators\.tsx$|__fixtures__/.test(f)) fs.rmSync(f, { force: true });
cp(path.join(ROOT, "tailwind.config.ts"), path.join(H, "tailwind.config.ts"));
fs.writeFileSync(path.join(H, "tsconfig.json"), JSON.stringify({
  compilerOptions: { target: "ES2020", lib: ["dom", "esnext"], jsx: "preserve", module: "esnext", moduleResolution: "bundler", strict: false, skipLibCheck: true, resolveJsonModule: true, baseUrl: ".", paths: { "@/*": ["./src/*"], "@bucketplace/assets/image": ["./src/shims/bucketplace-assets-image.tsx"], "@bucketplace/icons": ["./src/shims/bucketplace-icons.tsx"] } },
}, null, 2));

// 3) 하네스 런타임
for (const d of ["bin", "lib", "render", "catalog", "prompts", "examples"]) cp(path.join(ROOT, "harness", d), path.join(H, d));
fs.rmSync(path.join(H, "bin/pack-plugin.mjs"), { force: true });
cp(path.join(ROOT, "harness/README.md"), path.join(H, "README.md"));
// render/build.mjs 는 ROOT 를 harness 의 상위로 잡으므로 임베드에서는 harness 자체가 ROOT
fs.writeFileSync(path.join(H, "render/build.mjs"), fs.readFileSync(path.join(ROOT, "harness/render/build.mjs"), "utf8").replace('const root = path.resolve(here, "../..");', 'const root = path.resolve(here, "..");'));
for (const f of ["lib/assemble.mjs"]) {
  const p = path.join(H, f);
  fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace('const ROOT = path.resolve(here, "../..");', 'const ROOT = path.resolve(here, "..");').replace(/path\.join\(ROOT, "harness\//g, 'path.join(ROOT, "'));
}
for (const f of ["lib/assets.mjs"]) {
  const p = path.join(H, f);
  fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace('path.join(here, "../../vendor/design-assets"),', ''));
}

// 4) 최소 package.json + setup.sh
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const pick = (names) => Object.fromEntries(names.map((n) => [n, pkg.dependencies[n] ?? pkg.devDependencies[n]]).filter(([, v]) => v));
fs.writeFileSync(path.join(H, "package.json"), JSON.stringify({
  name: "lp-draft-harness", version: pkg.version || "0.1.0", private: true, type: "module",
  description: "오늘의집 LP 시안 하네스 — 빌더 프리뷰 컴포넌트 SSR + ODS 에셋 + 검증 (마켓플레이스 임베드본)",
  scripts: { setup: "bash setup.sh", doctor: "node bin/lp.mjs doctor", build: "node bin/lp.mjs build" },
  dependencies: { ...pick(["react", "react-dom", "clsx", "sharp", "pretendard", "tailwindcss", "postcss", "autoprefixer", "typescript"]), esbuild: "^0.24.2", playwright: pkg.devDependencies.playwright ?? "^1.60.0" },
}, null, 2));
fs.writeFileSync(path.join(H, "setup.sh"), `#!/usr/bin/env bash
# lp-draft 하네스 준비 (플러그인 임베드본) — 이 폴더에서 실행: bash setup.sh
set -euo pipefail
cd "$(dirname "$0")"
echo "▸ npm 의존성"; npm install --no-audit --no-fund >/dev/null
echo "▸ 폰트 서브셋 도구"; python3 -c "import fontTools, brotli" 2>/dev/null || pip3 install -q fonttools brotli 2>/dev/null || pip3 install -q --break-system-packages fonttools brotli || true
echo "▸ 렌더 QA 브라우저"; npx playwright install chromium >/dev/null 2>&1 || echo "  (playwright 브라우저 설치 실패 — --no-qa 로 빌드 가능)"
echo "▸ design-assets 원본 (선택)"
if [ -n "\${DESIGN_ASSETS_ROOT:-}" ]; then echo "  → DESIGN_ASSETS_ROOT=$DESIGN_ASSETS_ROOT";
elif [ -d "$HOME/design-assets/.git" ]; then echo "  → ~/design-assets 최신화"; git -C "$HOME/design-assets" pull -q --ff-only 2>/dev/null || echo "  (pull 실패 — 권한/네트워크 확인, 오래된 사본이면 일부 에셋이 CDN 폴백)";
elif [ -d "$HOME/.lp-draft/design-assets/.git" ]; then git -C "$HOME/.lp-draft/design-assets" fetch -q --depth 1 origin && git -C "$HOME/.lp-draft/design-assets" -c gc.auto=0 checkout -q FETCH_HEAD 2>/dev/null && echo "  → ~/.lp-draft/design-assets 최신화";
else
  if git ls-remote https://github.com/bucketplace/design-assets >/dev/null 2>&1; then
    mkdir -p "$HOME/.lp-draft" && git clone --depth 1 --filter=blob:none --no-checkout https://github.com/bucketplace/design-assets "$HOME/.lp-draft/design-assets"
    git -C "$HOME/.lp-draft/design-assets" sparse-checkout init --no-cone
    printf '%s\\n' '/assets/*/*.adf.jsonc' '/assets/*/still-image/*_480w.png' '/assets/*/still-image/*_480w.webp' '/assets/*/svg/*.svg' > "$HOME/.lp-draft/design-assets/.git/info/sparse-checkout"
    git -C "$HOME/.lp-draft/design-assets" -c gc.auto=0 checkout HEAD && echo "  → ~/.lp-draft/design-assets"
  else echo "  → 읽기 권한 없음 → CDN 폴백 사용 (README '읽기 권한이 없을 때' 참고)"; fi
fi
echo "▸ 렌더 번들"; node render/build.mjs
echo "✓ 준비 완료 — node bin/lp.mjs doctor 로 점검, node bin/lp.mjs build examples/moving.spec.json 으로 테스트"
`);

const n = walk(dest).length;
console.log(`packed → ${dest} (${n} files)`);

function walk(d) { const out = []; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) out.push(...walk(p)); else out.push(p); } return out; }
