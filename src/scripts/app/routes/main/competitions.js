export default {
  path: 'competitions',
  getComponent(location, cb) {
    require.ensure([], (require) => {
      cb(null, require('app/components/main/sport/CompetitionsView'));
    });
  },
};
