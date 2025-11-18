import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 61924,
    },

    resolve: {
        alias: {
            "@hooks": "/src/hooks",
            "@assets": "/src/assets",
            "@components": "/src/components",
            "@utils": "/src/utils",
        },
    }
})

