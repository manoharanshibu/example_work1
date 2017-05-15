import {async} from 'app/routes/util/AsyncUtil'
import {
	i18nIndexRoute,
	checkAuth,
	i18nPath,
} from 'common/util/RouteUtil';

import DepositView from 'bundle?lazy&name=[name]!header/view/deposit/DepositView'
import DepositAmountViewIlixium from 'bundle?lazy&name=[name]!header/view/deposit/components/DepositAmountViewIlixium'
import DepositPaymentSlipView from 'bundle?lazy&name=[name]!header/view/deposit/components/DepositPaymentSlipView'
import DepositConfirmView from 'bundle?lazy&name=[name]!header/view/deposit/components/DepositConfirmView'
import DepositFailureView from 'bundle?lazy&name=[name]!header/view/deposit/components/DepositFailureView'
import DepositNotAllowedView from 'bundle?lazy&name=[name]!header/view/deposit/components/DepositNotAllowedView'


export default {
	path: i18nPath('route.deposit'),
	indexRoute: i18nIndexRoute('route.deposit.amount'),
	onEnter: checkAuth,
	getComponent: async(DepositView),
	getChildRoutes(next, cb) {
		cb(null, [{
			path: `${i18nPath('route.deposit.amount')}(/:bonusCode)`,
			getComponent: async(DepositAmountViewIlixium)
		}, {
			path: i18nPath('route.deposit.confirm'),
			getComponent: async(DepositConfirmView)
		}, {
			path: 'spei',
			getComponent: async(DepositPaymentSlipView)
		}, {
			path: i18nPath('route.deposit.error'),
			getComponent: async(DepositFailureView)
		}, {
			path: i18nPath('route.deposit.restrict'),
			getComponent: async(DepositNotAllowedView)
		}])
	}
}
