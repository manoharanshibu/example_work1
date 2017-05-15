import Component from 'common/system/react/BackboneComponent';
import RangePicker from 'app/components/date/RangePicker';
import TransactionFiltersView from './TransactionFiltersView';
import model from 'sportsbook/model/TransactionsListModel';
import {classNames as cx} from 'common/util/ReactUtil';
import Currency from 'sportsbook/components/Currency';
import Pagination from "app/components/pagination/Pagination";
import TransactionsEmptySearch from "header/view/transactions/components/TransactionsEmptySearch";
import TransactionsNoTransactions from "header/view/transactions/components/TransactionsNoTransactions";
import ShowMoreButton from 'header/view/components/ShowMoreButton';

import {TRIGGER_RESIZE} from "app/AppConstants";

export default class TransactionsListView extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dateRangeOpen: false
		};

		this.moreButtonClicks = 1;

		_.bindAll(this, 'forceRerender', 'onSearchClick', 'onSearchChange', 'onTransactionFiltersChange', 'onShowMore', 'handleResize');

		App.bus.on(TRIGGER_RESIZE, this.handleResize);
	}

	componentDidMount() {
		if (App.Config.siteId === 1) {
			model.set({ excludedTypes: ['REFUND'] });
		}
		model.set({typeFilter: 'all'});
		model.updateTransactionsList();
	}

	componentWillMount() {
		model.on('change', this.forceRerender);
	}

	componentWillUnmount() {
		model.off('change');
		model.clear().set(model.defaults);
		App.bus.off(TRIGGER_RESIZE, this.handleResize);
	}

	handleResize() {
		const searchToken = '';
		model.set({searchToken});
	}

	onDateToggle = (clickType, e) => {
		e.preventDefault();
 		if (clickType === 'clickoutside' && (e.target.className).includes('icon-close')) return false;
 		this.setState({dateRangeOpen: !this.state.dateRangeOpen});
 	};

	/**
	 * @param startDate
	 * @param endDate
	 */
	onDateChange = (startDate, endDate) => {
		endDate = ( endDate === null ) ? moment().endOf('day') : endDate;
		model.set({currentPage: 0});
		this.moreButtonClicks = 1;
		model.setStartAndEnd(startDate, endDate);
	};

	onShowMore(){
		this.moreButtonClicks += 1;

		//the default number of items "per page" for mobile is 5 and we do not
		// have a selector to change this value
		const mobileItemsPerPage = 5;
		model.set({pageLength: mobileItemsPerPage * this.moreButtonClicks});
	}

	onTransactionFiltersChange(option) {
		const options = {
			typeFilter: option,
			currentPage: 0
		};

		model.set(options);
		this.moreButtonClicks = 1;
	}

	onSearchChange(e) {
		const searchToken = e.target.value;
		model.set({searchToken});
	}

	onSearchClick(e) {
 		e.preventDefault();
 		this.searchInput.focus();
 	}

	forceRerender() {
		this.forceUpdate();
	}

	getDateRange() {
		const format = 'DD/MM/YYYY';

		let {startDate, endDate} = model.attributes;
		startDate = moment(startDate);
		endDate = (endDate == null) ? moment().endOf('day') : moment(endDate);

		let dateRange = `${startDate && startDate.format(format)} - ${endDate && endDate.format(format)}`;
		if (!startDate || !endDate) return dateRange;

		let fStartDate = startDate.clone().endOf('day'),
			fEndDate = endDate.clone().endOf('day'),
			difference = 0;

		if ((moment().endOf('day')).isSame(fEndDate)) { // if the end date is today
			[1, 2, 3, 7].forEach(days => {
				let compareDate = fEndDate.clone().subtract(days, 'days'),
					isSame = fStartDate.isSame(compareDate);
				if (isSame) {
					difference = days;
				}
			});
		}

		let textDiff = (difference === 1) ? App.Intl('date_range.last_day') : App.Intl('date_range.last_num_days' , {number:difference.toString()});
		return (difference !== 0) ? textDiff : dateRange;

	}

	translateType(type) {
		const translatedType = App.Intl('transactions.status.' + type.toLowerCase());
		if (translatedType.indexOf('MISSING_TRANSLATION') === -1) {
			return translatedType;
		}
		return type;
	}

	render() {
		const transactions = model.getFilteredPaginatedList();
		const {errorMessage, pageLength, transactionsLength} = model.attributes;
		const totalPages = model.numPages();
		const isMobile = App.isSmallerThanBreakpoint('lg');

		if(errorMessage){
			return this.renderErrorMessage();
		}

		const {currentPage} = model.attributes + 1;
		const showMoreButton = pageLength < transactionsLength;

		return (
			<div className="c-transactions--sports">
				<header className="g-account__header">
					<h3>{App.Intl('header.wallet_menu.transactions', {})}</h3>
				</header>
				{this.renderSubNav()}
				{this.renderTransactionsTable(transactions)}

				{totalPages > 1 && !isMobile &&
					<Pagination
						isPreviousDisabled={model.previousDisabled()}
						isNextDisabled={model.nextDisabled()}
						currentPage={currentPage}
						goPrevPage={model.goPrevPage}
						goNextPage={model.goNextPage}
					/>
				}
				{showMoreButton && isMobile &&
					<ShowMoreButton showMore={this.onShowMore}/>
				}
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderSubNav() {
		const {dateRangeOpen} = this.state;
		const {startDate, endDate, searchToken} = model.attributes;
		const calenderIconClass = dateRangeOpen ? 'icon-close' : 'icon-calendar';
		const dateRange = this.getDateRange();
		const today = moment().endOf('day');
		const filters = App.Config.siteId === 1 ? ['all', 'deposit', 'withdrawal', 'bets', 'bonus'] :  ['all', 'deposit', 'withdrawal', 'bets', 'bonus'];

		return (
			<div className="g-sub-nav u-clearfix" style={{zIndex: '1'}}>
				<div className="g-sub-nav__filter is-hidden-lg">
					<TransactionFiltersView
						onChange={this.onTransactionFiltersChange}
						filters={filters} />
				</div>

				<div className="g-sub-nav__sort">
					<div className="grid-noGutter-spaceBetween">
						<div className="col-3_lg-5_sm-12">
							<span className="g-sub-nav__input-group">
								<button className="c-input-group__btn btn" onClick={this.onDateToggle.bind(this, 'click')}>
									<i className={calenderIconClass}/>
								</button>
								<input
									className="c-input-group__input"
									type="text"
									value={dateRange}
									readOnly
									onClick={this.onDateToggle.bind(this, 'click')}/>
								<RangePicker
									open={dateRangeOpen}
									startDate={startDate}
									endDate={endDate}
									onChange={this.onDateChange}
									onClickOutside={this.onDateToggle.bind(this, 'clickoutside')}
									maxDate={today}
								/>
							</span>
						</div>

						<div className="col-3_lg-5 is-hidden-md">
							<div className="g-sub-nav__input-group u-text-align--right">
								<button className="c-input-group__btn btn"
										onClick={this.onSearchClick}>
									<i className="icon-android-search"/>
								</button>
								<input className="c-input-group__input"
									   type="text"
									   placeholder={App.Intl('mybets.search')}
									   value={searchToken}
									   onChange={this.onSearchChange}
										 ref={(ref) => this.searchInput = ref}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="g-sub-nav__filter is-visible-lg">
					<TransactionFiltersView
						onChange={this.onTransactionFiltersChange}
						filters={filters} />
				</div>
			</div>
		);
	}

	renderTransactionsTable(transactions) {
		const isBaja = App.Config.siteId === 1;
		const {searchToken} = model.attributes;
		const isSearchFilled = !!searchToken;

		const isEmptySearch = isSearchFilled && !transactions.length && !App.isSmallerThanBreakpoint('lg');
		const noTransactions = !isSearchFilled && !transactions.length;

		//for the moment we hide the chips column everywhere
		const columnHide = {
			'all': isBaja ? ['bonus','chips'] : ['status', 'bonus','chips'],
			'bets': ['bonus', 'chips'],
			'deposit': ['bonus', 'chips'],
			'withdrawal': ['bonus', 'chips'],
			'bonus': [ 'status', 'chips' ],
			'chip': [ 'status', 'bonus', 'chips' ]
		};

		return (
			<div className="g-sub-nav__content">
				<div className="u-table c-transactions__table u-table--parent u-table--secondary">
					<div className="u-table-row c-transactions__table-header is-hidden-lg">
						<div className="c-transactions__table-cell u-table-cell"
							style={{width: '140px'}}>{App.Intl('transactions.general.column.date')}</div>
						<div className="c-transactions__table-cell u-table-cell">{App.Intl('transactions.general.column.description')}</div>
						{(columnHide[model.get('typeFilter')]).includes('status') || (
							<div className="u-table-cell" style={{width: '100px'}}>{App.Intl("casino_transactions.column.status")}</div>
						)}
						<div className="c-transactions__table-cell u-table-cell u-text-align--right"
							style={{width: '100px'}}>{App.Intl('transactions.general.column.amount')}</div>
						<div className="c-transactions__table-cell u-table-cell u-text-align--right"
							style={{width: '100px'}}>{App.Intl('transactions.general.column.cash')}</div>
						<div className="c-transactions__table-cell u-table-cell u-text-align--right is-hidden-sm"
							style={{width: '100px'}}>{App.Intl('transactions.general.column.reserved')}</div>
						{(columnHide[model.get('typeFilter')]).includes('chips') || (
							<div className="c-transactions__table-cell u-table-cell u-text-align--right"
								style={{width: '100px'}}>{App.Intl('transactions.general.column.chips')}</div>
						)}
					</div>

					{!isEmptySearch &&
						this.renderTransactionsList(transactions)
					}
				</div>

				{isEmptySearch &&
					<TransactionsEmptySearch searchToken={searchToken} />
				}

				{noTransactions &&
					<TransactionsNoTransactions />
				}
			</div>
		);
	}

	renderTransactionsList(transactions) {
		const isBaja = App.Config.siteId === 1;
		const {typeFilter} = model.attributes;
		return transactions.map((t, index) => {

			let {cashBalance, bonusBalance, amount, date, description, type} = t.attributes;

			if(cashBalance){
				cashBalance = <Currency amount={cashBalance} />;
			}

			if(bonusBalance){
				bonusBalance = <Currency amount={bonusBalance} />;
			}

			amount = <Currency amount={amount} />;
			description = t.getDisplayDescription();
			if (isBaja) {
				type = this.translateType(type);
			}
			type = _.titleize(type.replace(/_/g, " "));

			//for the moment we hide the chips column everywhere
			const columnHide = {
				'all': isBaja ? ['bonus','chips'] : ['status', 'bonus','chips'],
				'bets': ['bonus', 'chips'],
				'deposit': ['bonus', 'chips'],
				'casino': ['bonus', 'chips'],
				'withdrawal': ['bonus', 'chips'],
				'bonus': ['status', 'chips'],
				'chip': ['status', 'bonus', 'chips']
			};

			const translate = string => App.Intl(`transactions.general.column.${string}`);

			return (
				<div className="u-table-row alt-cell-highlight" key={index}>
					<div className="c-transactions__table-cell u-table-cell is-visible-lg">
						{translate('date')+':'} <span>{date}</span> <br/>
						{translate('description')+':'} <span>{t.getDisplayDescription(true)}</span>
					</div>
					<div className="c-transactions__table-cell u-table-cell date-cell is-hidden-lg">
						{date}
					</div>
					<div className="c-transactions__table-cell u-table-cell description-cell is-hidden-lg is-hidden-sm">
						{description  === 'Correction' ? 'Adjustment' : description}
					</div>
					{(columnHide[typeFilter]).includes('status') || (
						<div className="c-transactions__table-cell u-table-cell">
							<span className="is-visible-lg">{App.Intl("casino_transactions.column.status")+ ": "}</span>
							{type}
						</div>
					)}
					<div className="c-transactions__table-cell u-table-cell u-text-align--right is-hidden-sm">
						<span className="is-visible-lg">{translate('amount')+':'}</span>
						{amount}
					</div>
					<div className="c-transactions__table-cell u-table-cell u-text-align--right">
						<span className="is-visible-lg">{translate('cash_balance')+':'}</span>
						{cashBalance}
					</div>
					<div className="c-transactions__table-cell u-table-cell u-text-align--right is-hidden-sm">
						<span className="is-visible-lg">{translate('reserved_balance')+':'}</span>
						{bonusBalance}
					</div>
					{(columnHide[typeFilter]).includes('chips') || (
						<div className="c-transactions__table-cell u-table-cell u-text-align--right">
							<span className="is-visible-lg">{translate('chips')+':'}</span>
							{''}
						</div>
					)}
				</div>

			);
		});
	}

	renderErrorMessage(){
		return (
			<div className="casino-view">
				{this.renderSubNav()}
				<div className="g-sub-nav__content">
					<span className="empty-notice">{App.Intl('transactions.general.server_error')}</span>
					<br/>
				</div>
			</div>);
	}

}

TransactionsListView.displayName = 'TransactionsListView';
