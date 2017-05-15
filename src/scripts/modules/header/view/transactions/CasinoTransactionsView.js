import Component from 'common/system/react/BackboneComponent';
import RangePicker from 'app/components/date/RangePicker';
import TransactionFiltersView from './TransactionFiltersView';
//import model from 'sportsbook/model/CasinoTransactionsModel';
import model from './CasinoBoBTransactionsModel';
import {classNames as cx} from 'common/util/ReactUtil';
import {FormattedNumber} from 'react-intl';
import Pagination from "app/components/pagination/Pagination";
import TransactionsEmptySearch from "header/view/transactions/components/TransactionsEmptySearch";
import TransactionsNoTransactions from "header/view/transactions/components/TransactionsNoTransactions";
import ShowMoreButton from 'header/view/components/ShowMoreButton';

import {TRIGGER_RESIZE} from "app/AppConstants";

export default class CasinoTransactionsView  extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dateRangeOpen: false,
			itemsPerPage: 5,
		};

		this.moreButtonClicks = 1;

		_.bindAll(this, 'onSearchClick', 'onSearchChange', 'onTransactionFiltersChange', 'onShowMore', 'handleResize');
		App.bus.on(TRIGGER_RESIZE, this.handleResize);
	}

	/**
	 *
	 */
	componentDidMount(){
		var that = this;

		model.set({typeFilter: 'game'});
		model.set({lastTrans: ''});
		model.getCasinoTransactions();

		model.on('change', () => {
			that.forceUpdate();
		});
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

	forceRerender() {
		this.forceUpdate();
	}

	 onDateToggle = (clickType, e) => {
		 e.preventDefault();
		 if (clickType === 'clickoutside' && (e.target.className).includes('icon-close')) return false;
		 this.setState({dateRangeOpen: !this.state.dateRangeOpen});
	 };

	/**
	 * @param startDate
	 * @param endDate.
	 */
	onDateChange = (startDate, endDate) => {
		model.setStartAndEnd(startDate, endDate);
		model.set({currentPage : 1, pageSize: this.state.itemsPerPage});
		this.moreButtonClicks = 1;
	}

	onShowMore(){
		this.moreButtonClicks += 1;
		//the default number of items "per page" for mobile is 5 and we do not
		// have a selector to change this value
		let mobileItemsPerPage = 5;
		model.set({pageSize: mobileItemsPerPage * this.moreButtonClicks});
		model.getCasinoTransactions();
	}

	getDateRange() {
		let {toDate, fromDate} = model.attributes;
		toDate = (toDate === null) ? moment().endOf('day') : toDate;
		let dateRange = `${fromDate && fromDate.format('DD/MM/YYYY')} - ${toDate && toDate.format('DD/MM/YYYY')}`;
		if (!fromDate || !toDate) return dateRange;

		let fStartDate = fromDate.clone().endOf('day'),
			fEndDate = toDate.clone().endOf('day'),
			difference = 0;

		if ((moment().endOf('day')).isSame(fEndDate)) { // if the end date is today
			_.each([1, 2, 3, 7], function(days) {
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

	onTransactionFiltersChange(option) {
		let options = {typeFilter: option};
		model.set(options);
		this.moreButtonClicks = 1;
		model.getCasinoTransactions();
	}

	onSearchChange(e) {
 		const searchToken = e.target.value;
 		model.set({searchToken});
 	}

	onSearchClick(e) {
		e.preventDefault();
		this.searchInput.focus();
	}

	/**
	 *
	 * @param transactions.
	 * @returns {Array}
	 */
	renderTransactionsRows(transactions) {
		let currentFilter = model.get('typeFilter');
		const currency = App.session.execute('getCurrency')

		return _.map(transactions, function(t, index) {

			let now = new Date(),
				timestampFromId,
				yearFromId,
				date,
				timestampDateIsValid = true;

			timestampFromId = parseInt(t.id.slice(0, 8));
			yearFromId = parseInt(timestampFromId.toString().slice(0, 4));

			if(yearFromId < 2014 ||
				yearFromId > now.getFullYear()){
				timestampDateIsValid = true;
			}

			if(timestampDateIsValid) {
				date = moment(timestampFromId, 'YYYYMMDD').calendar(null, {
					sameElse: 'DD.MM.YYYY hh:mm',
					lastWeek: 'DD.MM.YYYY hh:mm',
					sameDay: '[Today]',
					nextDay: '[Tomorrow]',
					lastDay: '[Yesterday]'
				});
			} else {
				date = App.Intl('casino_transactions.no_date_available');
			}

			if(date === 'Today')
				date = App.Intl("transactions.column.date_today");
			else if(date === 'Tomorrow')
				date = App.Intl("transactions.column.date_tomorrow");
			else if (date === 'Yesterday')
				date = App.Intl("transactions.column.date_yesterday");

			const isGeneralColumn = currentFilter !== "bonus" && currentFilter !== "game";
			const isBonusColumn =  currentFilter === "bonus";
			const isGameColumn =  currentFilter === "game";

			const id = t.id.replace("gpgameid=", "");
			//we want to show WITHDRAWAL
			const type = t.type.replace(/PENDING/g, "AL").toLowerCase();
			const amount = <FormattedNumber value={t.amount} style="currency" currency={currency} />;
			const balBonus = <FormattedNumber value={t.balBonus} style="currency" currency={currency} />;
			const balCash = <FormattedNumber value={t.balCash} style="currency" currency={currency} />;
			const deltaCash = <FormattedNumber value={t.deltaCash} style="currency" currency={currency} />;
			const deltaBalance = <FormattedNumber value={t.cashBalance} style="currency" currency={currency} />;
			const deltaType = t.amount < 0 ? App.Intl("casino_transactions.column.type_wager") : App.Intl("casino_transactions.column.type_result");
			const deltaMiles = <FormattedNumber value={t.deltaMiles} style="currency" currency={currency} />;
			const deltaBonus = <FormattedNumber value={t.deltaBonus} style="currency" currency={currency} />;
			const balMileage = <FormattedNumber value={t.balMileage} style="currency" currency={currency} />;

			return (
				<div className="u-table-row" key={index}>
					<div className="u-table-cell is-hidden-md">
						{date}
					</div>
					{isGeneralColumn && <div className="u-table-cell is-visible-md">
						<span>{t.id}</span> - <span>{App.Intl(`casino_transactions.column.type_${type}`) || type}</span>
					</div>}
					{isGeneralColumn && <div className="u-table-cell is-hidden-md">
						{App.Intl(`casino_transactions.column.type_${type}`) || type}
					</div>}
					{isGeneralColumn && <div className="u-table-cell">
						<span className="is-visible-md">{App.Intl('casino_transactions.column.amount')}:</span>
						{amount}
					</div>}
					{isGeneralColumn && <div className="u-table-cell">{balCash}</div>}
					{isGeneralColumn && <div className="u-table-cell">{balBonus}</div>}

					{isBonusColumn && <div className="u-table-cell">`${t.description} ${id} ${App.Intl(`casino_transactions.column.type_${type}`) || type}`</div>}
					{isBonusColumn && <div className="u-table-cell">{amount}</div>}
					{isBonusColumn && <div className="u-table-cell">{balBonus}</div>}

					{isGameColumn && <div className="u-table-cell">{id} - {t.status}</div>}
					{isGameColumn && <div className="u-table-cell">{deltaType}</div>}
					{isGameColumn && <div className="u-table-cell">{amount}</div>}
					{isGameColumn && <div className="u-table-cell">{deltaBalance}</div>}
					{/*isGameColumn && <div className="u-table-cell">Chip Result? {deltaMiles}</div>*/}
					{/*isGameColumn && <div className="u-table-cell">Bonus Stake {deltaBonus}</div>*/}
					{/*isGameColumn && <div className="u-table-cell">Bonus Result {balMileage}</div>*/}

				</div>
			);
		});
	}

	/**
	 *
	 * @param transactions
	 * @returns {XML}
	 */
	renderTransactionsTable(transactions){
		const currentFilter = model.get('typeFilter');
		const {searchToken} = model.attributes;
		const isSearchFilled = !!searchToken;

		const noTransactions = !searchToken && !transactions.length;
		const isEmptySearch = isSearchFilled && !transactions.length && !App.isSmallerThanBreakpoint('lg');

		return (
			<div className="g-sub-nav__content">
				<div className="u-table c-transactions__table u-table--parent u-table--secondary">
						{this.renderGenericColumn(currentFilter)}
						{this.renderGameColumn(currentFilter)}
						{this.renderBonusColumn(currentFilter)}

						{!isEmptySearch && !noTransactions &&
							this.renderTransactionsRows(transactions)
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

	/**
	 * this method render columns for all, deposit, withdrawal and chips
	* */
	renderGenericColumn(filter){
		if(filter !== "bonus" && filter !== "game")
			return (
			<div className="u-table-row c-transactions__table-header is-hidden-lg">
				<div className="c-transactions__table-cell u-table-cell" style={{width: '140px'}}>{App.Intl('casino_transactions.column.transactionTime')}</div>
				<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl('casino_transactions.column.type')}</div>
				<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl('casino_transactions.column.amount')}</div>
				<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl('casino_transactions.column.balance_cash')}</div>
				<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl('casino_transactions.column.balance_bonus')}</div>
			</div>
		);
	}

	/**
	 * this method render columns for game
	 * */
	renderGameColumn(filter){
		if(filter === "game"){
			return (
				<div className="u-table-row c-transactions__table-header is-hidden-lg">
					<div className="c-transactions__table-cell u-table-cell" style={{width: '140px'}}>{App.Intl('casino_transactions.column.date')}</div>
					<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl("casino_transactions.column.type")}</div>
					<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl("casino_transactions.column.status")}</div>
					<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl("casino_transactions.column.amount")}</div>
					<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl("casino_transactions.column.balance_cash")}</div>
				</div>
			);
		}
	}

	/**
	 * this method render columns for bonus
	 * */
	renderBonusColumn(filter){
		if(filter === "bonus"){
			return (
				<div className="u-table-row c-transactions__table-header is-hidden-lg">
					<div className="c-transactions__table-cell u-table-cell" style={{width: '140px'}}>{App.Intl('casino_transactions.column.date')}</div>
					<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl("casino_transactions.column.type")}</div>
					<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl("casino_transactions.column.amount")}</div>
					<div className="c-transactions__table-cell u-table-cell" style={{width: '100px'}}>{App.Intl("casino_transactions.column.bonus_amount")}</div>
				</div>
			);
		}
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
		const filters = ['game'];

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
										open={this.state.dateRangeOpen}
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

	/**
	 * @returns {XML}
	 */
	render() {
		const transactions = model.getPaginatedList();
		const {currentPage, pageSize, fullList} = model.attributes;
		const totalPages = model.numPages();

		const isMobile = App.isSmallerThanBreakpoint('lg');
		const showMoreButton = pageSize < fullList.length;

		return (
			<div className="c-transactions--casino">
				<header className="g-account__header">
					<h3>{App.Intl('header.user_menu.casino_bet_history', {})}</h3>
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
}
