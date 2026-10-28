/**
 * 생성형 에셋 후처리 — Figma AI(generate_image) 결과를 LP 에셋으로 가공.
 *
 *  1) 원본 확보: image.url(풀해상도) 다운로드 → 실패 시(네트워크 허용 목록 등) 도구가 저장한 미리보기 파일 사용
 *  2) 배경 제거: 가장자리에서 시작하는 flood-fill 로 단색 배경(#EDEFF2 계열)을 투명 처리 + 경계 페더링
 *  3) 정규화: 정사각 캔버스 중앙 정렬, 최소 480px (ODS still-image 480w 와 동일 규격) PNG
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export async function importGenerated({ url, file, name, outDir, tolerance = 22 }) {
  const sharp = (await import("sharp")).default;
  fs.mkdirSync(outDir, { recursive: true });
  let src = null, origin = null;
  if (url) {
    const tmp = path.join(outDir, `${name}.src`);
    try {
      execFileSync("curl", ["-sSfL", "--max-time", "30", "-o", tmp, url], { stdio: "ignore" });
      if (fs.statSync(tmp).size > 1000) { src = tmp; origin = "full-res"; }
    } catch { /* 허용 목록 밖 → 미리보기로 폴백 */ }
  }
  if (!src && file && fs.existsSync(file)) { src = file; origin = "preview-thumbnail"; }
  if (!src) throw new Error("생성 이미지 원본을 찾을 수 없음 (url 다운로드 실패 + file 없음)");

  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const px = (x, y) => (y * W + x) * 4;
  // 배경색 = 네 모서리 평균
  const corners = [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]].map(([x, y]) => data.slice(px(x, y), px(x, y) + 3));
  const bg = [0, 1, 2].map((c) => corners.reduce((s, k) => s + k[c], 0) / 4);
  const dist = (i) => Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
  const seen = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push([x, 0], [x, H - 1]);
  for (let y = 0; y < H; y++) stack.push([0, y], [W - 1, y]);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const k = y * W + x;
    if (seen[k]) continue;
    seen[k] = 1;
    const i = k * 4;
    const d = dist(i);
    if (d > tolerance * 1.6) continue;
    // 경계부는 부분 투명(페더)
    data[i + 3] = d <= tolerance ? 0 : Math.round(255 * ((d - tolerance) / (tolerance * 0.6)));
    if (d <= tolerance) stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const size = Math.max(480, W);
  const out = path.join(outDir, `${name}.png`);
  await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .resize({ width: size, height: size, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "lanczos3" })
    .png()
    .toFile(out);
  return { file: out, origin, sourceSize: W };
}
