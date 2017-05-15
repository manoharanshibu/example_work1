import { async } from 'app/routes/util/AsyncUtil';
import factory from 'sportsbookCms/model/LayoutFactory';
import {
	alreadyAuthed,
	checkRestrictions,
	i18nPath,
} from 'common/util/RouteUtil';

import InnerCasinoView from 'bundle?lazy&name=[name]!app/components/main/InnerCasinoView';
import RulesView from 'bundle?lazy&name=[name]!app/components/main/casino/RulesView';
import CasinoSearchView from 'bundle?lazy&name=[name]!app/components/main/casino/CasinoSearchView';

export default {
  path: i18nPath('route.casino'),
  onEnter: checkRestrictions('casino'),
  getComponent(location, cb) {
    require.ensure([], (require) => {
      factory.loadLayout(location, cb, require('app/components/main/InnerCasinoView'));
    });
  },
  getChildRoutes(next, cb) {
    cb(null,
      [{
        path: 'rules',
        onEnter: checkRestrictions('casino'),
        getComponent: async(RulesView),
      }, {
        path: 'search/s*',
        onEnter: checkRestrictions('casino'),
        getComponent: async(CasinoSearchView),
      }, {
        path: '*',
        onEnter: checkRestrictions('casino'),
				// we're putting InnerCasinoView into InnerCasinoView???????
        getComponent: async(InnerCasinoView),
      }],
		);
  },
};
