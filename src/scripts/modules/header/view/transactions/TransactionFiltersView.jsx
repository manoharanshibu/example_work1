import {classNames as cx} from 'common/util/ReactUtil';
import model from 'sportsbook/model/BetHistoryModel';
import PriorityNav from 'app/components/priority-nav/PriorityNav';

class TransactionFiltersView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			filters: this.props.filters,
			filter: this.props.filters[0],
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

		this.props.onChange(filter);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return this.renderTabs();
	}

	/**
	 * @returns {*}
	 */
	renderTabs() {
		let tabs = this.renderFilters();
		if ( tabs ) {
			const navProps = {
				tag: 'div',
				className: 'g-tabs-wrapper g-tabs-wrapper',
				navDropdownLabel: App.Intl('prioritynav.more').toLowerCase(),
				itemActiveClass: 'active',
				navStyles: {top: 46},
				navRef: 'transactionFilterList',
				lozenge: false,
				allowOneItem: true,
				isSelectBox: App.isMobile(),
				onChange: this.onFilterClick.bind(this),
			};

			return (
				<PriorityNav {...navProps}>
					<ul ref="transactionFilterList" className="g-menu--horizontal--tabs">
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

			let title;
			if(filter == 'bonus'){//we have mulitple bonus declarations , so have to add minor workaround to pick up correct title.
				title = App.Intl(`mybets.bet_status.static.${filter}`);
			}else{
				title = App.Intl(`mybets.bet_status.${filter}`);
			}
			// overide the missing translation text ending up on the page, it logs an error to console anyway.
			if (title.indexOf('Missing_translation') > -1) {
				title = _.titleize(filterName);
			}
			let active = this.state.filter === filter;

			return (
				<li key={filter} className={cx({'active': active})} data-name={title} data-value={filter}>
					<a className="g-menu__link" onClick={this.onFilterClick.bind(this, filter)}>
						{title}
					</a>
				</li>
			);
		}, this);
	}
}

TransactionFiltersView.propTypes = {
	filters: React.PropTypes.array
};

export default TransactionFiltersView;
