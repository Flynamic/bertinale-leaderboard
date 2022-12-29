import { defineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'

const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vuePlugin(),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
  server: {
    fs: {
      allow: ['..'],
    },
    port: 5174,
  },
})
