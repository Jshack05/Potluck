import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { pages } from "./src/pages.ts";

const publicPaths = new Set(
  Object.keys(pages).filter((path) => path !== "/404/"),
);

export default defineConfig({
  appType: "mpa",
  plugins: [
    react(),
    {
      name: "potluck-static-pages",
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          const url = new URL(request.url || "/", "http://localhost");
          const path = url.pathname.endsWith("/")
            ? url.pathname
            : `${url.pathname}/`;
          if (publicPaths.has(path)) request.url = `/index.html${url.search}`;
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((request, response, next) => {
          const url = new URL(request.url || "/", "http://localhost");
          if (
            !url.pathname.endsWith("/") &&
            publicPaths.has(`${url.pathname}/`)
          ) {
            response.writeHead(308, {
              Location: `${url.pathname}/${url.search}`,
            });
            response.end();
            return;
          }
          next();
        });
      },
    },
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
  },
});
