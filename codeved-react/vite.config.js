import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
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