
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
    'index.csr.html': {size: 504, hash: '87c79450e5c78851e723efc7d03f5e8add8585bebf0f9201f9c85d641721c453', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1017, hash: 'c7db6bd0880d31af5b7397d7f6f4faad4bf2792c5d2bc0e178456db8abca5196', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'home/index.html': {size: 14041, hash: '80aa275acb8c91ae721544040dcda2a4bcbd24598cda00f1cd77944634ffa000', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 8759, hash: '3e7641931f51ea3643b8d10f47831de61e1d712c7dc6170205bb9e9f66b3a4f8', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'about/index.html': {size: 12167, hash: 'ae7a9df4fa6f64c66c8770d94fc43719293b2e293d333e8338edc3c5af44bd17', text: () => import('./assets-chunks/about_index_html.mjs').then(m => m.default)},
    'product/index.html': {size: 20115, hash: 'a835fd85f4244d4339174ac1161887545fcd7369d5e8759d495d6c725d8101bc', text: () => import('./assets-chunks/product_index_html.mjs').then(m => m.default)},
    'blog/index.html': {size: 12407, hash: '70ccaace6273ef398cccbbdc9b52aeff5a4c5a7e6c95918466731834fa8cb5fe', text: () => import('./assets-chunks/blog_index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
