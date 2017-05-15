import { async } from 'app/routes/util/AsyncUtil'
import {
	i18nIndexRoute,
	checkAuth,
	i18nPath,
} from 'common/util/RouteUtil';

import TransactionsView from 'bundle?lazy&name=[name]!header/view/transactions/TransactionsView'
import SportTransactionsView from 'bundle?lazy&name=[name]!header/view/transactions/SportTransactionsView'
import CasinoTransactionsView from 'bundle?lazy&name=[name]!header/view/transactions/CasinoTransactionsView'


export default {
	path: i18nPath('route.transactions'),
	indexRoute: i18nIndexRoute('route.transactions.indexroute'),
	onEnter: checkAuth,
	getComponent: async(TransactionsView),
	getChildRoutes(next, cb) {
		cb(null, [
			{
				path: i18nPath('route.transactions.sports'),
				getComponent: async(SportTransactionsView)
			}, {
				path: i18nPath('route.transactions.games'),
				getComponent: async(SportTransactionsView)
			}, {
				path: i18nPath('route.transactions.casino'),
				getComponent: async(CasinoTransactionsView)
			}]);
	}
};
