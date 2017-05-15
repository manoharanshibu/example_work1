import factory from 'sportsbookCms/model/LayoutFactory';

export default {
  path: '*',
  getComponent(location, cb) {
    require.ensure([], (require) => {
      factory.loadLayout(location, cb, require('app/components/main/LayoutView'));
    });
  },
};
