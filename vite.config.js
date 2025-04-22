// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "/", // hoặc './' nếu bạn deploy vào thư mục con
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@microsoft/signalr")) {
              return "signalr";
            }
            if (id.includes("vue")) {
              return "vue";
            }
            if (id.includes("lodash")) {
              return "lodash";
            }
            // fallback cho phần còn lại
            return "vendor";
          }
        },
      },
    },
  },
});
