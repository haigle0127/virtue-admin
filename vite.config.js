import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import vueJsx from '@vitejs/plugin-vue2-jsx'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig(({ mode }) => {
  return {
    base: '/',
    plugins: [
      vue(),
      vueJsx(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
        symbolId: 'icon-[name]',
        inject: 'body-last'
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '~': path.resolve(__dirname, 'node_modules')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: ''
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.vue': 'jsx'
        }
      }
    },
    server: {
      port: 9527,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:9981',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: mode === 'development'
    }
  }
})
