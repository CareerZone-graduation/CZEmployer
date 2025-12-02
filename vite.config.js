import { defineConfig ,loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from "node:url";
// https://vite.dev/config/

import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      },
    },
    define: {
      global: 'globalThis',
      'process.env': {},
    },

    server: {
      allowedHosts: [
        '.serveo.net',
        '.ngrok-free.app'
      ],
      port: 4000,
      open: true,
      host: true
    },

    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            icons: ["lucide-react"],
            motion: ["framer-motion"],
            forms: ["react-hook-form", "@hookform/resolvers", "zod"],
            ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"]
          },
        },
      },
      // Performance optimizations
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      // Asset optimization
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    },

    // Performance optimizations for development
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'lucide-react'
      ],
    },
  }
})
