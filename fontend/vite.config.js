import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.glb"],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: ["all"],
    hmr: {
      clientPort: 5173,
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },

  },
  preview: {
    port: 5173,
    strictPort: true,
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    target: "esnext",
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          three: ["three", "@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
});
