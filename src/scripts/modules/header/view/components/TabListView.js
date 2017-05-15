import {classNames as cx} from 'common/util/ReactUtil';
import {Link} from 'react-router';

export default class TabListView extends React.Component {
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

	renderTabList(){
		// these route definitions and tab titles need to match the routes as defined in AppRouter.
		const routes = ['transactions', 'chips', 'withdraw'];

		const tabTitles = {
			transactions: App.Intl('pea_tab_titles.transactions'),
			chips: App.Intl('pea_tab_titles.chips'),
			withdraw: App.Intl('pea_tab_titles.withdraw'),
		};

		return routes.map((route, index) => {
			let tabSelected = App.isActive(App.normalize(route));
			let toPath;
			switch(route){
				case "transactions":
					toPath = '/transactions';
					tabSelected = App.isActive(App.normalize('transactions/list'));
					break;
				case "chips":
					toPath = '/chips/select';
					break;
				case "withdraw":
					toPath = '/withdraw';
					break;
			}
			let className = cx({'selected': tabSelected});
			return (
				<li key={index} className={className}>
					<Link to={App.normalize(toPath)} activeClassName='selected'>
						{
							tabTitles[route]
						}
					</Link>
				</li>
			);
		});
	}



	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {

		return (
			<div>{this.renderTabList()}</div>
		)
	}
};
