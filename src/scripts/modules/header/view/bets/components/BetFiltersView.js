import {classNames as cx} from 'common/util/ReactUtil';
import model from 'sportsbook/model/BetHistoryModel';
import PriorityNav from 'app/components/priority-nav/PriorityNav';
import {BET_HISTORY_NAVIGATE} from "app/AppConstants";

class BetFiltersView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			filters: props.filters,
			filter: this.props.activeFilter,
			mobileInitClick: false,
		};
	}

	/**
	 * @param filter
	 */
	onFilterClick(filter) {
		this.setState({filter: filter}, () => {
			const {onChange} = this.props;
			onChange && onChange(filter);
		});

		model.set({
			"currentPage": 0,
			"searchToken": ""
		});
		this.navigate(filter.toLowerCase());
	}

	navigate(route) {
		App.navigate(('mybets/') + route);
		App.bus.trigger(BET_HISTORY_NAVIGATE);
	}

	componentWillReceiveProps() {
		this.setState({
			filter : this.props.activeFilter,
		});
	}

	/**
	 * @returns {*}
	 */
	render() {
		const tabs = this.renderFilters();

		if ( tabs ) {
			const navProps = {
				tag: 'div',
				className: 'g-tabs-wrapper',
				navDropdownLabel: App.Intl('prioritynav.more').toLowerCase(),
				itemActiveClass: 'active',
				navStyles: {top: 46},
				navRef: 'list',
				lozenge: false,
				isSelectBox: App.isMobile(),
				onChange: this.onFilterClick.bind(this),
			};

			return (
				<PriorityNav {...navProps}>
					<ul ref="list" className="g-menu--horizontal--tabs">
						{tabs}
					</ul>
				</PriorityNav>
			);
		}
		return null;
	}

	/**
	 * @returns {Array}
	 */
	renderFilters() {
		return _.map(this.props.filters, (filter) => {
			const filterName = filter.toLowerCase();
			const title = App.Intl(`mybets.bet_status.${filterName}`);
			const active = this.state.filter === filter;

			return (
				<li key={filter} className={cx('g-sub-nav__filter__tab', {'active': active})} data-name={title} data-value={filter}>
					<a className="g-menu__link" onClick={this.onFilterClick.bind(this, filter)}>
						{title}
					</a>
				</li>
			);
		});
	}
}

BetFiltersView.propTypes = {
	filters: React.PropTypes.array
};

BetFiltersView.defaultProps = {
	filters: ['ALL', 'OPEN', 'WIN', 'LOSE', 'CLOSED']
};

export default BetFiltersView;
