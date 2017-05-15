// add source map support for debugging
// require('source-map-support').install()

// ensure common libs is not excluded from compilation
require('babel-register')({
    ignore: /\/?node_modules(?!\/ats-common-libs)/,
})
