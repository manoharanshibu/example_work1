## Build Automation Tools

### Setup

To get this repo running:

```
npm install
npm run build
npm run start
```

### Commands

##### `npm run app`

* Bundles just application to `dist` directory (`bundle.js`) 


##### `npm run app:prod`

* Bundles application to `dist` directory in `production` mode - Bamboo (`bundle.js`) 


##### `npm run build`

* Cleans `dist` directory (`clean.js`)
* Copies required resources to `dist` directory (`copy.js`)
* Bundles vendor.dll.js to `dist` directory (`bundle.js --dll`)
* Bundles application to `dist` directory (`bundle.js`)


##### `npm run build:prod`

* Cleans `dist` directory (`clean.js`)
* Copies required resources to `dist` directory (`copy.js`)
* Bundles vendor.dll.js to `dist` directory in `production` mode (`bundle.js --dll`)
* Bundles application to `dist` directory in `production` mode (`bundle.js`)


##### `npm run dll`

* Bundles vendor.dll.js to `dist` directory (`bundle.js --dll`)


##### `npm run dll:prod`

* Bundles vendor.dll.js to `dist` directory in production mode - Bamboo (`bundle.js --dll`)


##### `npm start`

* Bundles vendor.dll.js (`bundle.js --dll`)
* Launches [Webpack](https://webpack.github.io/) compiler in a watch mode (via [webpack-middleware](https://github.com/kriasoft/webpack-middleware))


##### `npm run start:prod`

* Bundles vendor.dll.js to `dist` directory (`bundle.js --dll`)
* Bundles application in production mode
* Starts express server to launch build in `production` mode (`serve.js`)


##### `npm run serve:prod`

* Starts express server to launch previously built `dist` directory contents in `production` mode (`serve.js`)


##### `npm run test` 

* Launches `karma` test runner in `dev` mode (terminal and Chrome for debugging)


##### `npm run test:bamboo` 

* Launches `karma` test runner in `bamboo` mode  - Bamboo


##### `npm run test:watch` 

* Launches `karma` test runner in `watch` mode (terminal and Chrome for debugging)