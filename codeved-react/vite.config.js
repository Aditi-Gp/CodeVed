import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "extensionless-html-routes",
      enforce: "post",
      generateBundle(_, bundle) {
        for (const [fileName, output] of Object.entries(bundle)) {
          if (output.type !== "asset" || !fileName.endsWith(".html") || fileName === "index.html") {
            continue;
          }

          const route = fileName.slice(0, -".html".length);
          this.emitFile({
            type: "asset",
            fileName: `${route}/index.html`,
            source: output.source,
          });
          delete bundle[fileName];
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        auth: resolve(__dirname, "login&register.html"),
        compiler: resolve(__dirname, "compiler.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        editor: resolve(__dirname, "editor.html"),
        problemDetails: resolve(__dirname, "problemdetails.html"),
        problemList: resolve(__dirname, "problemlist.html"),
      },
    },
  },
});