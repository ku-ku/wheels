const isDev = (process.env.NODE_ENV === 'development');
const _HOST = isDev ? 'http://localhost:8000' : 'https://api.arnod.ru';
export default defineNuxtConfig({
    ssr: false,
    app: {
        head: {
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=contain' },
                { hid: 'description', name: 'description', content: 'АРНОД,Мониторинг,перевозки' },
                { name: 'format-detection', content: 'telephone=no' },
                { name: 'theme-color', content: '#E8F5E9' },
                { name: 'mobile-web-app-capable', content: 'yes'},
                { name: 'apple-touch-fullscreen', content: 'yes'},
                { name: 'apple-mobile-web-app-title', content: 'АРНОД, Мониторинг, Перевозки'},
                { name: 'apple-mobile-web-app-capable', content: 'yes'},
                { name: 'apple-mobile-web-app-status-bar-style', content: 'default'}
            ],
            link: [
                    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
                    { rel: 'manifest', type: 'application/manifest+json', href: 'https://web.arnod.ru/bids/arnod.webmanifest'}
            ]
        },
        baseURL: isDev ? '/' : '/bids'
    },
    css: [
        'vuetify/lib/styles/main.sass',
        '~/assets/index.scss',
        'app-ext/app.scss'
    ],
    runtimeConfig: {
        public: {
            api: isDev ? '/api' : `${ _HOST }/api`,
            gwUrl: isDev ? '192.168.61.244' : 'gw.arnod.ru',
            telemetry: isDev ? 'http://192.168.61.244' : 'https://telemetry.arnod.ru',
            channel: "arnod-main",
            _X_SERV_TOKEN: '1958eaaa-7876-4ae6-a10e-71f4d61db107',
            YM_ID: 94347494,
            theme: {
                dark: false,
                colors: {
                    primary: '#3F51B5',
                }
            }
        }
    },
    nitro: {
        devProxy: {
            '/api': {
                target: `${ _HOST }/api`,
                changeOrigin: true
            }
        }
    },
    vite: {
        define: {
          'process.env.POLYGON_CLIPPING_MAX_QUEUE_SIZE': 1000000,
          'process.env.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS': 1000000,
          '__DEFINES__': {}
        },
        optimizeDeps: {
            exclude: ['vue-demi', '@vite/client', '@vite/env'] /*ReferenceError: __DEFINES__ is not defined*/
        },
        vue: {
            script: {
                defineModel: true   //TODO:
            }
        },
        server:{
            host: '0',
            fs: {
                allow: ['..']
            }
        }
    },
    build: {
        transpile: ['vuetify']
    },
    typescript: {
        shim: false
    },
    experimental: {
        defaults: {
            useAsyncData: {
                deep: false
            }
        }
    }
})
