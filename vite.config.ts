import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split heavy vendor libs into their own long-cache chunks so the
        // initial public bundle stays lean and the admin chunks reuse them.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router")) return "router";
          if (id.includes("@tanstack/react-query") || id.includes("@tanstack/query-core")) return "query";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          // NOTE: lucide-react is intentionally NOT grouped so Vite can
          // tree-shake per-route and split icon usage across chunks.
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("react-hook-form") || id.includes("zod") || id.includes("@hookform")) return "forms";
          if (id.includes("date-fns")) return "date";
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("scheduler")) return "react";
        },
      },
    },
  },
}));
