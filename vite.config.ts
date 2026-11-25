import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
// base './' để chạy được ở mọi đường dẫn (GitHub Pages: https://<user>.github.io/<repo>/)
export default defineConfig({base: './', plugins: [react()], build: {chunkSizeWarningLimit: 4000}});
