import AppView from 'app/AppView';
import sports from 'app/routes/main/sports';

export default {
  component: AppView,

  childRoutes: [
    require('header/routes/main'),
    {
      indexRoute: _.omit(sports, 'path'),
      getComponents(location, cb) {
        require.ensure([], (require) => {
          cb(null, { main: require('app/components/MainView') });
        });
      },
      getChildRoutes(next, cb) {
        cb(null,
          [
            require('header/routes/main/login'),
            require('header/routes/main/transactions'),
            require('header/routes/main/mybets'),
            require('header/routes/main/withdraw'),
            require('header/routes/main/account'),
            require('header/routes/main/register'),
            require('header/routes/main/deposit'),
            require('header/routes/main/passwordForgot'),
            require('header/routes/main/passwordNew'),
            require('header/routes/main/bonuses'),
            require('app/routes/main/search'),
            require('app/routes/main/faq'),
            require('app/routes/main/favourites'),
            require('app/routes/main/promotions'),
            require('app/routes/main/games'),
            require('app/routes/main/casino'),
            require('app/routes/main/competitions'),
            require('app/routes/main/sports'),
            require('app/routes/main/raceCards'),
            require('app/routes/main/notFound'),
            require('app/routes/main/baseRoots'),
          ],
				);
      },
    },
  ],
};
