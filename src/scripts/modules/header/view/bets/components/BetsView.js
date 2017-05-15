import model from 'sportsbook/model/BetHistoryModel';
import HistoryRow from 'header/view/bets/components/HistoryRow';
import BetFiltersView from 'header/view/bets/components/BetFiltersView';
import RangePicker from 'app/components/date/RangePicker';
import {classNames as cx} from 'common/util/ReactUtil';
import {DateRange} from 'react-date-range';
import {BET_HISTORY_NAVIGATE, TRIGGER_RESIZE} from "app/AppConstants";
import Pagination from "app/components/pagination/Pagination";
import TransactionsEmptySearch from "header/view/transactions/components/TransactionsEmptySearch";
import TransactionsNoTransactions from "header/view/transactions/components/TransactionsNoTransactions";
import ShowMoreButton from 'header/view/components/ShowMoreButton';
import { DownloadJsonInXls } from 'app/util/Converters';
const format = 'DD-MM-YYYY HH:mm';

import moment from 'moment';

class LatestBetsView extends React.Component {
	constructor() {
		super();
		this.state = {
			bets: [],
			dateRangeOpen: false,
			searchToken: '',
			itemsPerPage: 5,
			activeFilter: 'ALL'
		};

		this.moreButtonClicks = 1;

		_.bindAll(this, 'onSearchClick', 'onSearchChange', 'onShowMore');

		this.triggerResize = this.handleResize.bind(this);
		this.handleBetHistoryNavigate = this.betHistoryNavigate.bind(this);

		App.bus.on(BET_HISTORY_NAVIGATE, this.handleBetHistoryNavigate);
		App.bus.on(TRIGGER_RESIZE, this.triggerResize);
	}

	/**
	 *
	 */
	componentWillMount() {
		this.setState({searchToken: model.searchToken});
		// model.updateCount(true);
		model.Bets.on('reset sort', () => {
			this.setState({
				bets: model.Bets.models
			});
		});
		this.setActiveFilter();
	}

	/**
	 *
	 */
	componentWillUnmount() {
		App.bus.off(BET_HISTORY_NAVIGATE, this.handleBetHistoryNavigate);
		App.bus.off(TRIGGER_RESIZE, this.triggerResize);

		model.Bets.off();
		model.set({
			currentPage: 0,
			filter: "ALL",
			daysRange: 3,
			moreButtonClicks: 1,
			itemsPerPage: 5
		});
	}

	betHistoryNavigate() {
		this.forceUpdate(() => this.setActiveFilter());
	}

	setActiveFilter() {
		const path = this.props.route.path.toUpperCase();
		this.setState({activeFilter: path, searchToken: ''});
		model.filter = path;
	}

	onDateToggle = (clickType, e) => {
		e.preventDefault();
 		if (clickType === 'clickoutside' && (e.target.className).includes('icon-close')) return false;
 		this.setState({dateRangeOpen: !this.state.dateRangeOpen});
 	};

	onDateClose(event) {
		const originElem = event.target;
		const parentElem = originElem.offsetParent;

		let elementIsRangeControl = $(originElem).hasClass('range-calendar-control');
		elementIsRangeControl = elementIsRangeControl || $(parentElem).hasClass('range-calendar-control');

		// This is needed because otherwise, the clickoutside might close
		// the range picker and  onDateToggle might open it again with same click
		if (elementIsRangeControl){
			return;
		}

		this.setState({dateRangeOpen: false});
	}

	/**
	 * @param startDate
	 * @param endDate
	 */
	onDateChange = (startDate, endDate) => {
		this.moreButtonClicks = 1
		endDate = (endDate == null) ? moment().endOf('day') : endDate;
		model.set({itemsPerPage: this.state.itemsPerPage});
		model.setDates(startDate, endDate);
		let daysRange = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
		model.set({
			daysRange: daysRange
		});
	}

	scrollToTop() {
		this.handleScrollToTop(document.body, 0, 250);
	}

	handleScrollToTop(element, to, duration) {
		if (duration < 0) return;
		var difference = to - element.scrollTop;
		var perTick = difference / duration * 2;

		setTimeout(function () {
			element.scrollTop = element.scrollTop + perTick;
			scrollTo(element, to, duration - 2);
		}, 10);
	}


	/**
	 * @param num
	 */
	onItemsPerPageChange(e) {
		model.itemsPerPage = e.target.value;
		this.setState({itemsPerPage: e.target.value});
		this.onFirstPage();
	}

	/**
	 *
	 */
	onFirstPage() {
		model.currentPage = 0;
	}

	/**
	 *
	 */
	onPreviousPage() {
		model.currentPage = model.currentPage - 1;
	}

	/**
	 *
	 */
	onNextPage() {
		model.currentPage = model.currentPage + 1;

		if (model.currentPage == model.totalPages - 1) {
			this.scrollToTop();
		}
	}

	/**
	 *
	 */
	onLastPage() {
		model.currentPage = model.totalPages - 1;
		this.scrollToTop();
	}

	onShowMore() {
		this.moreButtonClicks += 1;
		//the default number of items "per page" for mobile is 5 and we do not
		// have a selector to change this value
		let mobileItemsPerPage = 5;
		model.itemsPerPage = mobileItemsPerPage * moreButtonClicks;
	}

	/**
	 * Handles the user's interaction with the bet state filter
	 * @param filter
	 */
	onBetFiltersChange(filter) {
		this.setState({searchToken: ''});
		model.filter = filter;
	}

	onSearchChange(e) {
		const searchToken = e.target.value;
		model.searchToken = searchToken;
	}

	onSearchClick(e) {
		e.preventDefault();
		this.searchInput.focus();
	}

	/**
	 * @param e
	 */
	onExportToExcel(e) {
		const excelArray =  [this.getColumns().map(c => c.name)];
		this.state.bets.forEach((bet, i) => {
				excelArray.push(this.rowGetter(i));
				var currBet = this.state.bets[i].toJSON();
				if(currBet.parts.betPart.length > 1){//for system bets we need to display multiple rows per bet.
					currBet.parts.betPart.forEach((betpart, x) => {
						excelArray.push(this.rowGetterSystemBet(betpart));
					});
				}
			}
		);
		DownloadJsonInXls(JSON.stringify(excelArray), 'Excel Export');
	}

	getColumns() {
		//todo add translations, for additional column names
		return [
			{ key: 'betTime', name: App.Intl('mybets.date_placed', {}, 3)},
			{ key: 'status', name: App.Intl('mybets.status', {}, 3)},
			{ key: 'league', name: App.Intl('mybets.column.league', {}, 3)},
			{ key: 'match', name: App.Intl('mybets.column.match', {}, 3)},
			{ key: 'betType', name: App.Intl('mybets.column.bet_type', {}, 3)},
			{ key: 'myTip', name: App.Intl('mybets.column.my_tip', {}, 3)},
			{ key: 'totalOdds', name: App.Intl('mybets.total_odds', {}, 3)},
			{ key: 'stake', name: App.Intl('mybets.stake', {}, 3)},
			{ key: 'win', name: App.Intl('mybets.column.win', {}, 3)},
			{ key: 'result', name: App.Intl('mybets.result', {}, 3)},
			{ key: 'betslipId', name: App.Intl('mybets.column.slip_id', {}, 3)},
		];
	}

	/**
	 *
	 * @returns {*}
	 */
	rowGetter(index) {
		let thisBet = this.state.bets[index];
		const bet = thisBet.toJSON()
		const betTime = bet.betTime ? moment(bet.betTime).format(format) : '';
		const status = App.Intl('mybets.bet_status.' + this.getExcelStatus(bet));
		const betPart = bet.parts.betPart;
		const latestBetPart		= this.getExcelRowPartToDisplay(betPart);
		const competitionName   = latestBetPart.competition.name;
		const eventName 		= this.getExcelEventNameString(betPart);
		const betTypeMarket 	= this.getExcelBetTypeMarket(bet);
		const betTypeSelection 	= this.getExcelBetTypeSelection(bet);
		const totalOdds  		= bet.totalPrice.toFixed(2);
		const {stake, potentialPayout} = this.getRightStakeAndPayout(bet);
		const displayDateBetResult = latestBetPart.settlementTime ? moment(latestBetPart.settlementTime).format(format):  moment(latestBetPart.eventTime).format(format);
		const betslipId = bet.id;
		return [betTime , status, competitionName , eventName , betTypeMarket , betTypeSelection , totalOdds , stake , potentialPayout, displayDateBetResult, betslipId];
	}

	getExcelStatus(bet){
		const status = bet.displayStatus;
		const settlementType = bet.settlementType;
		//note the following hardcoded elements are translated from the calling code.
		if (!status) {
			return 'unavailable'
		}
		else if (settlementType === 'CASH_OUT') {
			return 'cashout';
		}

		let s = status.toLowerCase();
		switch (s) {
			case 'rejected':
				s = 'unavailable';
				break;
			default:
				break;
		}

		return s;
	}

	getExcelEventNameString(betPart) {
		if (betPart.length === 1) {
			return betPart[0].event.name;
		}

		let returnString = '';

		for (let i = 0; i < betPart.length; i++) {
			returnString = returnString + betPart[i].event.name + ', ';
		}
		return returnString;
	}

	getExcelRowPartToDisplay(betPart) {
		if(betPart.length === 1){
			return betPart[0];
		}else{
			//for system bets we need to store and return the latest betpart so we can display the greatest betpart eventTime
			let latestBetPart = betPart[0];
			for (let j = 1; j < betPart.length; j++) {
				if(betPart[j].eventTime > latestBetPart.eventTime){
					latestBetPart = betPart[j];
				}
			}
			return latestBetPart;
		}
	}

	getExcelBetTypeMarket(row) {
		if (row.type === 'SINGLE') {
			return row.parts.betPart[0].market.name.toString();
		}

		return row.type.replace(/_/g, " ");
	}

	getExcelBetTypeSelection(row) {
		if (row.type === 'SINGLE') {
			return row.parts.betPart[0].selection.name;
		}

		return row.type.replace(/_/g, " ");
	}

	/**
	 * Depending on where taxes are applied we get back
	 * a different amount for stake and potential payout
	 * @param: row
	 * */

	getRightStakeAndPayout(row){
		let stake = row.stake.amount,
			potentialPayout = row.potentialPayout,
			isFreebet = row.freeBet;

		if(!isFreebet){
			if(row.taxOnStakeAmount){
				stake -= row.taxOnStakeAmount;
			}else if(row.taxOnStakePcnt){
				stake *= (100 - row.taxOnStakePcnt)/100;
			}

			potentialPayout = stake * row.totalPrice;

			if(row.taxOnReturnsPcnt){
				potentialPayout *= (100 - row.taxOnReturnsPcnt)/100;
			}
		}else{
			potentialPayout -= stake;
		}

		potentialPayout = potentialPayout.toFixed(2);

		return {stake, potentialPayout};
	}

	rowGetterSystemBet(betPart) {
		const status = this.getExcelBetpartResultToDisplay(betPart.resultType.toString());
		const competitionName   = betPart.competition.name;
		const eventName 		= betPart.event.name;
		const marketName        = betPart.market.name;
		const selectionName		= betPart.selection.name;
		const totalOdds  		= betPart.odds.decimal;
		const displayDateBetResult =  moment(betPart.eventTime).format(format);
		return['' , status , competitionName , eventName , marketName , selectionName , totalOdds , '' , '',  displayDateBetResult, '', '']
	}


	getExcelBetpartResultToDisplay(resultType) {
		if (resultType === 'NOT_SET') return App.Intl("mybets.bet_status.pending");

		return _.titleize(resultType.replace('_', ' '));
	}



	getDateRange() {
		let {startDate, endDate} = model.attributes;
		endDate = (endDate === null) ? moment().endOf('day') : endDate;

		let dateRange = `${startDate && startDate.format('DD/MM/YYYY')} - ${endDate && endDate.format('DD/MM/YYYY')}`;
		if (!startDate || !endDate) return dateRange;

		let fStartDate = startDate.clone().endOf('day'),
			fEndDate = endDate.clone().endOf('day'),
			difference = 0;

		if ((moment().endOf('day')).isSame(fEndDate)) { // if the end date is today
			_.each([1, 2, 3, 7], function (days) {
				let compareDate = fEndDate.clone().subtract(days, 'days'),
					isSame = fStartDate.isSame(compareDate);
				if (isSame) {
					difference = days;
				}
			});
		}

		let textDiff = (difference === 1) ? App.Intl('date_range.last_day') : App.Intl('date_range.last_num_days', {number: difference.toString()});
		return (difference !== 0) ? textDiff : dateRange;

	}


	handleResize(width) {
		model.filter = '';
	}

	/**
	 * @returns {XML}
	 */
	render() {
		let {currentPage} = model.attributes;
		currentPage = currentPage + 1;
		const itemsPerPage = model.get("itemsPerPage");
		const totalBets = model.get("totalBets");
		const totalPages = model.get("totalPages");
		const isMobile = App.isSmallerThanBreakpoint('lg');
		const showMoreButton = itemsPerPage < totalBets;
		return (
			<div>
				{this.renderSubNav()}
				{this.renderContent()}
				{totalPages > 1 && !isMobile &&
					<Pagination
						isPreviousDisabled={model.previousDisabled}
						isNextDisabled={model.nextDisabled}
						currentPage={currentPage}
						goPrevPage={::this.onPreviousPage}
						goNextPage={::this.onNextPage}
					/>
				}

				{showMoreButton && isMobile &&
					<ShowMoreButton showMore={this.onShowMore} />
				}
			</div>
		);
	}

	/**
	 * @returns {XML}
	 * Store:
	 * {!noBets &&
	 * 	...
	 * }
	 */
	renderSubNav() {
		const {dateRangeOpen} = this.state;
		const {startDate, endDate, searchToken} = model.attributes;
		const calenderIconClass = dateRangeOpen ? 'icon-close' : 'icon-calendar';
		const dateRange = this.getDateRange();
		const today = moment().endOf('day');
		const noBets = !this.state.bets.length;
		const isMobile = App.isSmallerThanBreakpoint('lg');
		const exportBtnClasses = cx(
			"col-4_lg-4_md-4_sm-4_xs-12",
			"u-text-align--right",
			{ "u-invisible" : noBets }
		);

		return (
			<div className="g-sub-nav u-clearfix" style={{zIndex: '1'}}>
				<div className="g-sub-nav__filter">
					<BetFiltersView
									activeFilter={this.state.activeFilter}/>
				</div>
				<div className="g-sub-nav__sort">
					<div className="grid-noGutter">
						<div className="col-4_lg-4_md-4_sm-4_xs-12">
							<div className="g-sub-nav__input-group c-sub-nav-item c-sub-nav-item--first">
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

							</div>
						</div>
						<div className="col-4_lg-4_md-4_sm-4_xs-12">
							<div className="g-sub-nav__input-group u-text-align--right c-sub-nav-item">
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
						{ !noBets &&
							<div className={ exportBtnClasses }>
								<div className="g-sub-nav__input-group c-sub-nav-item c-sub-nav-item--last">
									<button id="exportBtn"
											className="c-input-group__export-btn btn"
											data-ignore="true"
											style={{cursor: 'pointer'}}
											onClick={this.onExportToExcel.bind(this)}>
										{App.Intl('mybets.export_to_excel', {}, 3)}
										<i className="export-icon icon-chevron-right"/>
									</button>
								</div>
							</div>
						}
					</div>
				</div>
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderContent() {
		return (
			<div className={'g-sub-nav__content'}>
				{this.renderBets()}
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderBets() {
		const {searchToken} = model.attributes;
		const isSearchFilled = !!searchToken;
		const isEmptySearch = isSearchFilled && !this.state.bets.length && !App.isSmallerThanBreakpoint('lg');

		const noBets = !isSearchFilled && !this.state.bets.length;

		return (
			<div>
				<table className="u-table u-table--parent u-table--fixed u-table--secondary">
					<tbody>
						<tr className="u-table-row c-mybets__table-header c-history-row is-hidden-md">
							<td className="u-table-cell ">
								{App.Intl('mybets.status', {}, 3)}
							</td>
							<td className="u-table-cell c-history-row__event-cell">
								{App.Intl('mybets.match', {}, 3)}
							</td>
							<td className="u-table-cell">
								{App.Intl('mybets.bet_type', {}, 3)}
							</td>
							<td className="u-table-cell ">
								{App.Intl('mybets.total_odds', {}, 3)}
							</td>
							<td className="u-table-cell ">
								{App.Intl('mybets.stake_win', {}, 3)}
							</td>
							<td className="u-table-cell ">
								{App.Intl('mybets.result', {}, 3)}
							</td>
							<td className="u-table-cell more u-text-align--right">
								{App.Intl('mybets.more', {}, 3)}
							</td>
						</tr>
						{!isEmptySearch &&
							this.renderRows()
						}
					</tbody>
				</table>

				{isEmptySearch &&
					<TransactionsEmptySearch searchToken={searchToken} />
				}

				{noBets &&
					<TransactionsNoTransactions />
				}
			</div>
		);
	}

	/**
	 * @returns {Array}
	 */
	renderRows() {
		return _.map(this.state.bets, (bet, index) => {
			return <HistoryRow key={index} row={bet.toJSON()} {...this.props}/>
		});
	}
}

export default LatestBetsView;
