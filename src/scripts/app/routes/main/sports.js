import factory from 'sportsbookCms/model/LayoutFactory';

export default {
  path: 'sports/(:sport)',
  onEnter: (next, replace) => {
    App.Globals.setSport(next.params.sport);
    App.Globals.PREVIOUS = next.location.pathname;
  },
  getComponent(location, cb) {
    require.ensure([], (require) => {
      factory.loadLayout(location, cb, require('app/components/main/SportView'));
    });
  },
  childRoutes: [
    {
      path: 'countries',
      getComponent(location, cb) {
        require.ensure([], (require) => {
          cb(null, require('app/components/main/sport/CountriesView'));
        });
      },
    }, {
      path: 'country/:country',
      getComponent(location, cb) {
        require.ensure([], (require) => {
          cb(null, require('app/components/main/sport/CountryView'));
        });
      },
    }, {
      path: 'competitions',
      getComponent(location, cb) {
        require.ensure([], (require) => {
          cb(null, require('app/components/main/sport/CompetitionsView'));
        });
      },
    }, {
      path: 'competition/:competition',
      getComponent(location, cb) {
        require.ensure([], (require) => {
          cb(null, require('app/components/main/sport/CompetitionView'));
        });
      },
    }, {
      path: 'competition/racing/:competition',
      getComponent(location, cb) {
        require.ensure([], (require) => {
          cb(null, require('app/components/main/sport/MultiEventsView'));
        });
      },
    }, {
      path: 'event/:event',
      getComponent(location, cb) {
        require.ensure([], (require) => {
          cb(null, require('app/components/main/sport/eventView/EventView'));
        });
      },
    }, {
      path: 'today',
      getComponent(location, cb) {
        require.ensure([], (require) => {
          cb(null, require('app/components/main/TodaysView'));
        });
      },
    }],
};
