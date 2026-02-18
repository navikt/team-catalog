import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    origin: "http://localhost:5173",
    proxy: {
      // "/frackend/team-catalog/userinfo": {
      //   rewrite: (uri) => uri.replace("/frackend/team-catalog", ""),
      //   target: "http://localhost:8080/",
      //   // Customisation is possible
      //   selfHandleResponse: true,
      //   bypass: (request, response) => {
      //     response.write(
      //       JSON.stringify({
      //         email: null,
      //         groups: ["READ", "WRITE", "ADMIN"],
      //         ident: "y000000",
      //         loggedIn: false,
      //         name: "Anon",
      //       }),
      //     );
      //     response.end();
      //     response.flushHeaders();
      //   },
      // },
      "/frackend/team-catalog": {
        target: "http://localhost:8080/",
        changeOrigin: true,
        rewrite: (uri) => uri.replace("/frackend/team-catalog", ""),
      },
      "/frackend/sessionInfo": {
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
  },
});
