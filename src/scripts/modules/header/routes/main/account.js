import { async } from 'app/routes/util/AsyncUtil'
import {
	i18nIndexRoute,
	checkAuth,
	i18nPath,
} from 'common/util/RouteUtil';

import OverviewView from 'bundle?lazy&name=[name]!header/view/account/settings/OverviewView'
import MyDetailsView from 'bundle?lazy&name=[name]!header/view/account/settings/MyDetailsView'
import DocumentsView from 'bundle?lazy&name=[name]!header/view/account/settings/DocumentsView'
import SelfExclusionView from 'bundle?lazy&name=[name]!header/view/account/settings/SelfExclusionView'
import Communication from 'bundle?lazy&name=[name]!header/view/account/settings/Communication'
import ChangePasswordView from 'bundle?lazy&name=[name]!header/view/account/settings/ChangePasswordView'

export default {
	path: i18nPath('route.account'),
	indexRoute: i18nIndexRoute('route.account.details'),
	onEnter: checkAuth,
	getChildRoutes(next, cb) {
		cb(null, [
			{
				path: i18nPath('route.account.overview'),
				getComponent: async(OverviewView)
			}, {
				path: i18nPath('route.account.details'),
				getComponent: async(MyDetailsView)
			}, {
				path: i18nPath('route.account.documents'),
				getComponent: async(DocumentsView)
			}, {
				path: i18nPath('route.account.exclusions'),
				getComponent: async(SelfExclusionView)
			}, {
				path: i18nPath('route.account.communication'),
				getComponent: async(Communication)
			}, {
				path: i18nPath('route.account.password'),
				getComponent: async(ChangePasswordView)
			}, {
				path: i18nPath('route.account.overview'),
				getComponent: async(OverviewView)
			}]);
	}
};
