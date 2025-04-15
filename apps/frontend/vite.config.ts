import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [react()],
  server: {
    origin: "http://localhost:5173",
    proxy: {
      "/team-catalog": {
        target: "http://localhost:8080/",
        changeOrigin: true,
      },
      "/sessionInfo": {
        target: "http://localhost:8080/",
        changeOrigin: true,
      },
    },
    hmr: {
      // necessary to make hot reloading work in uidev mode in prod and dev environments
      // otherwise secure web sockets protocol (wss) will be inferred from https prefix
      protocol: "ws",
    },
    cors: {
      origin: ["https://teamkatalog.nav.no", "https://teamkatalog.ekstern.dev.nav.no", /^http:\/\/localhost:\d{4}$/],
    },
  }
});
