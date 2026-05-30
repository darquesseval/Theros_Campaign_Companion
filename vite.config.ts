// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// When building on Netlify (or any non-Lovable environment), produce a fully
// static prerendered site that can be served from `dist/`. Inside the Lovable
// sandbox we keep the default Cloudflare Worker build.
const isNetlify = !!process.env.NETLIFY;

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  ...(isNetlify
    ? {
        nitro: {
          preset: "static",
          output: { dir: "dist", publicDir: "dist" },
        },
      }
    : {}),
});
