import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const target = "http://localhost:8080";
const headers = {
  "Nav-Consumer-Id": "teamsfrontend-local",
};

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/nom-api": {
        target: target,
        changeOrigin: true,
        headers: headers,
      },
      "/team-catalog": {
        target: target,
        changeOrigin: true,
        headers: headers,
      },
    },
    hmr: {
      // necessary to make hot reloading work in uidev mode in prod and dev environments
      // otherwise secure web sockets protocol (wss) will be inferred from https prefix
      protocol: "ws",
    },
  },
});
