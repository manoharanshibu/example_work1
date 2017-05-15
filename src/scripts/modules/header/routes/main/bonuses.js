import { async } from 'app/routes/util/AsyncUtil'
import {
	i18nPath,
	checkAuth
} from 'common/util/RouteUtil'

import BonusesView from 'bundle?lazy&name=[name]!header/view/bonuses/MyBonusesView';

export default {
	path: i18nPath('route.bonuses'),
	getComponent: async(BonusesView),
	onEnter: checkAuth
}
