import TabListView from 'header/view/components/TabListView';
import MobileBackBtn from 'header/view/components/MobileBackBtn';
import model from 'sportsbook/model/ChipsModel';
import {classNames as cx} from 'common/util/ReactUtil';
// import Breadcrumbs from 'app/view/components/Breadcrumbs';


export default class ChipsView extends React.Component {
	constructor() {
		super();
	}

	/**
	 *
	 * @param amount
	 * @returns {*}
	 */
	renderActive(page) {
		var active = App.isActive(page);
		return cx('inline-element', {active: active});
	}

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		var children = [].concat(this.props.children);
		var childComps = _.map(children, (child, index) => {
			return React.cloneElement(child, {model: model, key: index});
		}, this);
		return (

			<div className="tabs-container chips-buysell">

				{/*TOP MENU START*/}
				<div className="container pos-relative">
					<div className="pea-header tablet-s-hide">
						<span className="h1">
							{_.titleize(App.Intl('header.wallet_menu.chips_buy_sell'))}
						</span>
					</div>
					<MobileBackBtn title={App.Intl('header.wallet_menu.chips_buy_sell')} {...this.props}/>
				</div>
				{/*TOP MENU END*/}
				{/*PAGE START*/}
				<div className="container min-height-restrict">
					<div className="tab-pane">
						<div className="lower-toolbar-padding">
							{childComps}
						</div>
					</div>
				</div>

				{/*PAGE END*/}

			</div>
		);
	}
};
