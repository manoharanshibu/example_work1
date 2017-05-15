import factory from 'sportsbookCms/model/LayoutFactory';

/**
 * Asynchronously load a route component
 * @param asyncModule
 * @returns {function(*, *)}
 */
export const async = (asyncModule, target = '') => (location, cb) => {
  asyncModule((module) => {
    if (target !== '') {
      cb(null, { [target]: module });
      return;
    }
    cb(null, module);
  });
};

/**
 * Asynchronously load a route component + layout config
 * @param asyncModule
 * @returns {function(*=, *=)}
 */
export const asyncLayout = asyncModule => (location, cb) => {
  asyncModule((module) => {
    loadLayout(location, cb, module);
  });
};

/**
 * @param asyncModule
 * @param cb
 */
export const asyncCallback = (asyncModule, cb) => asyncModule(module => cb(module));

/**
 * Asynchoronously load a route layout
 */
function loadLayout(location, callback, params) {
  callback(null, params);
  factory.onRouteChange(location);
}

