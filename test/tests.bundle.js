// setup
const setupContext = require.context('./misc', false, /(app|libs|test)-setup.js$/)
setupContext.keys().forEach(setupContext)

// tests
const testsContext = require.context('./specs', true, /-test\.js$/)
testsContext.keys().forEach(testsContext)
