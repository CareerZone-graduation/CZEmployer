import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from "node:url";
// https://vite.dev/config/

import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      },
    },
    define: {
      global: 'globalThis',
      
    },

    server: {
      allowedHosts: [
        '.serveo.net',
        '.ngrok-free.app'
      ],
      port: 4000,
      // open: true,
      host: true
    },
  }
})
