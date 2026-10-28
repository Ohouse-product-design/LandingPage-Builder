import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
await build({
  entryPoints: [path.join(here, "entry.tsx")],
  bundle: true, platform: "node", format: "esm", target: "node18",
  outfile: path.join(here, "../.build/render.mjs"),
  jsx: "automatic", external: ["react", "react-dom", "react/jsx-runtime"],
  alias: {
    "@": path.join(root, "src"),
    "@bucketplace/icons": path.join(root, "src/shims/bucketplace-icons.tsx"),
    "@bucketplace/assets/image": path.join(root, "src/shims/bucketplace-assets-image.tsx"),
    "lottie-react": path.join(here, "lottie-stub.tsx"),
  },
  logLevel: "warning",
});
console.log("render bundle ok");
