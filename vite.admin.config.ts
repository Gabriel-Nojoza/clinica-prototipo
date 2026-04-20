import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const serveAdminHtml = {
  name: "serve-admin-html",
  configureServer(server: import("vite").ViteDevServer) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === "/" || req.url === "/index.html") {
        req.url = "/admin.html";
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), serveAdminHtml],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  root: ".",
  build: {
    outDir: "dist-admin",
    rollupOptions: {
      input: path.resolve(__dirname, "admin.html"),
    },
  },
  server: {
    port: 5174,
  },
});
