import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import "dotenv/config";

const apiUrl = process.env.VITE_BACKEND_URL;

export default defineConfig({
  server: {
    proxy: {
      "/backend": apiUrl,
    },
  },
  plugins: [react(), tailwindcss()],
});
