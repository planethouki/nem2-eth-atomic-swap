export default {
  mode: 'spa',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['~/plugins/nem.js', '~/plugins/eth.js'],
  /*
   ** Nuxt.js dev-modules
   */
  devModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://bootstrap-vue.js.org/docs/
    'bootstrap-vue/nuxt'
  ],
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      config.node = {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
      }
    }
  },
  srcDir: 'src/',
  env: {
    alice: {
      nemPrivateKey:
        '25B3F54217340F7061D02676C4B928ADB4395EB70A2A52D2A11E2F4AE011B03E',
      ethPrivateKey:
        '0x25b3f54217340f7061d02676c4b928adb4395eb70a2a52d2a11e2f4ae011b03e',
      cpNemAddress: 'SBWUUQYUPEVBZSQ3DQOPAZM2IPET7UY6TGPXPX34',
      cpEthAddress: '0x608f801a3ebf472c0a6503750d7829f4deebcfcd'
    },
    bob: {
      nemPrivateKey:
        '1B31F0BBB87891E747501C2B79103F986BD6F0B12B892EB0ACFB78ADBF9B3DF1',
      ethPrivateKey:
        '0x1b31f0bbb87891e747501c2b79103f986bd6f0b12b892eb0acfb78adbf9b3df1',
      cpNemAddress: 'SCA7ZS2B7DEEBGU3THSILYHCRUR32YYE55ZBLYA2',
      cpEthAddress: '0xd11690c03f36cf220f9a4fbbcfc1658f306e4c6a'
    },
    ethEndpoint:
      'https://ropsten.infura.io/v3/d3469136f14f4deaafabfaf7e7c0d389',
    nemEndpoint: 'https://elephant2.48gh23s.xyz:3001',
    xemMosaicHexId: '6DE471A241E7AC7C',
    nemGenerationHash:
      '43AE99FE757451CCF50E5CB372828254CD2CA2B91CBA61F11A2A1C031C09FE15',
    ethSwapContractAddress: '0x21C0750C4bb2b38c52D997A06EAcBc7Dc48b90eE'
  }
}
