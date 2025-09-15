
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/vanja-ivanovic/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/vanja-ivanovic/home",
    "route": "/vanja-ivanovic"
  },
  {
    "renderMode": 2,
    "route": "/vanja-ivanovic/home"
  },
  {
    "renderMode": 2,
    "route": "/vanja-ivanovic/blog"
  },
  {
    "renderMode": 2,
    "route": "/vanja-ivanovic/product"
  },
  {
    "renderMode": 2,
    "route": "/vanja-ivanovic/about"
  },
  {
    "renderMode": 2,
    "route": "/vanja-ivanovic/login"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-MXKBEUAC.js"
    ],
    "route": "/vanja-ivanovic/post"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 505, hash: '097f175064859cd9c08dcef30039130d199ec420c6afa98aab0d1c3c89d14a13', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1018, hash: '4d41e4ce0a98492f57334150674fc34c4786eae3d224b719fadd429c8a069f1b', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'product/index.html': {size: 20116, hash: '69658eb288c537da958eda6b7eb6ff31e80be922f8d4ee3fcf7e6c5267732f77', text: () => import('./assets-chunks/product_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 8760, hash: '6fe3074f38379ef0755fc1b2f51f05b15f25a69eac25438e08869ce326430f10', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'about/index.html': {size: 12168, hash: '512c372bf5bc88dcf5321d0e4b8ec819e6902a8c4c9347eb8b1505a10c5c00a5', text: () => import('./assets-chunks/about_index_html.mjs').then(m => m.default)},
    'home/index.html': {size: 14042, hash: '217cc8b2bc8d465a59a7f4429c9114798367ac7ff63adc0629edfefbbf750a2e', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'blog/index.html': {size: 12408, hash: 'bfc88c53db324ab0c4a05ea51d2a03ee4f433747e7f11a1b342f3b1505e33372', text: () => import('./assets-chunks/blog_index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
