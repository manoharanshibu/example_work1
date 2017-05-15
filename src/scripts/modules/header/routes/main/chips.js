import { async } from 'app/routes/util/AsyncUtil'
import {
	i18nIndexRoute,
	checkAuth,
	i18nPath,
} from 'common/util/RouteUtil';


import ChipsView from 'bundle?lazy&name=[name]!header/view/chips/ChipsView'
import ChipsBuySellSelectView from 'bundle?lazy&name=[name]!header/view/chips/ChipsBuySellSelectView'
import ChipsBuyView from 'bundle?lazy&name=[name]!header/view/chips/buy/ChipsBuyView'
import BuySuccessView from 'bundle?lazy&name=[name]!header/view/chips/buy/BuySuccessView'
import BuyErrorView from 'bundle?lazy&name=[name]!header/view/chips/buy/BuyErrorView'
import ChipsSellView from 'bundle?lazy&name=[name]!header/view/chips/sell/ChipsSellView'
import SellSuccessView from 'bundle?lazy&name=[name]!header/view/chips/sell/SellSuccessView'
import SellErrorView from 'bundle?lazy&name=[name]!header/view/chips/sell/SellErrorView'

export default {
	path: i18nPath('route.chips'),
	indexRoute: i18nIndexRoute('route.chips.select'),
	onEnter: (next, replace) => checkAuth(next, replace),
	getComponent: async(ChipsView),
	getChildRoutes(next, cb) {
		cb(null, [{
			path: i18nPath('route.chips.select'),
			getComponent: async(ChipsBuySellSelectView)
		}, {
			path: i18nPath('route.chips.buy'),
			getComponent: async(ChipsBuyView)
		}, {
			path: i18nPath('route.chips.buysuccess'),
			getComponent: async(BuySuccessView)
		}, {
			path: i18nPath('route.chips.buyerror'),
			getComponent: async(BuyErrorView)
		}, {
			path: i18nPath('route.chips.sell'),
			getComponent: async(ChipsSellView)
		}, {
			path: i18nPath('route.chips.sellsuccess'),
			getComponent: async(SellSuccessView)
		}, {
			path: i18nPath('route.chips.sellerror'),
			getComponent: async(SellErrorView)
		}])
	}
}

