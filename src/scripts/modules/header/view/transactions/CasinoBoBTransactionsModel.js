import apiService from 'sportsbook/service/ApiService.js';
import moment from 'moment';

const startOfToday = moment().subtract(3, 'days').startOf('day');
const endOfToday = moment().endOf('day');

var Model = Backbone.Model.extend({

	defaults: {
		count: 0,
		pageSize: 5,
		currentPage: 1,
		transactions: [],
		fullList: [],
		fromDate: startOfToday,
		toDate: endOfToday,
		typeFilter: 'all',
		lastTrans: '',
		pageLastTransactionIds: [],
		searchToken: ''
	},

	/**
	 *
	 */
	initialize: function(){
		_.bindAll(this, 'getCasinoTransactions', 'getFilteredList', 'goFirstPage', 'goNextPage', 'goPrevPage', 'goLastPage');

	},

	/**
	 *
	 */
	getCasinoTransactions(goingBack) {
		var that = this;
		var nyxAccountId = '';

		const format = 'YYYY-MM-DDTHH:mm:ss';
		var startDate = moment( this.get('fromDate') ).format(format);
		var endDate = moment( this.get('toDate') ).format(format);
		var typeFilter = this.get('typeFilter');
		var lastTrans = this.get('lastTrans') === '' ? null : this.get('lastTrans');
		var maxResults = 101;//just because the biggest pageSize is 100 //this.get('pageSize');
		var isGameTransactions = false;

		if(typeFilter === "all") {
			//typeFilter = "WITHDRAWAL,WITHDRAWPENDING,DEPOSIT,PENDINGFEE,CANCELFEE,CANCELWAGER,WAGER,RESULT,JACKPOT,CORRECTION,BONUSCONVERT,BONUSFORFEIT,BONUSRELEASE";
			typeFilter = "WITHDRAWPENDING,DEPOSIT,WAGER";

		}

		if(typeFilter === "money") {
			typeFilter = "WITHDRAWAL,WITHDRAWPENDING,DEPOSIT,PENDINGFEE,CANCELFEE";
		}

		if(typeFilter === "deposit") {
			typeFilter = "DEPOSIT";
		}

		if(typeFilter === "withdrawal") {
			typeFilter = "WITHDRAWPENDING";
		}

		if(typeFilter === "chip") {
			typeFilter = "WITHDRAWPENDING,DEPOSIT";
		}

		if(typeFilter === "game") {
			isGameTransactions = true;
			typeFilter = "CANCELWAGER,WAGER,RESULT,JACKPOT,CORRECTION";
		}

		if(typeFilter === "bonus") {
			typeFilter = "BONUSCONVERT,BONUSFORFEIT,BONUSRELEASE";
		}
		apiService.getRgsTransactionHistory(nyxAccountId, startDate, endDate, typeFilter, maxResults, lastTrans)
			.then(this.onGotTransactionHistory.bind(this, isGameTransactions), ::this.onError)
	},

	onGotTransactionHistory(isGameTransactions, resp) {
		let transactions = resp.AccountRgsTransactions.transactions;

		if (isGameTransactions) {
			 transactions = _.filter(transactions, t => t.type === 'STAKE' || t.type === 'SETTLEMENT');
		}

		const sortedTransactions = this.sortByTimeAndId(transactions);

		let update = {
			fullList: sortedTransactions,
			transactions: this.getPaginatedList(sortedTransactions),
		};

		if(this.get("currentPage") === 1){
			update.count = resp.AccountRgsTransactions.count;
		}

		this.set(update);

	},

	onError(resp) {
		this.set('errorMessage', true);
		console.warn(`TransactionHistoryError: ${resp}`);
	},

	sortByTimeAndId(transactions) {
		return _.sortBy(transactions, tran => tran.id).reverse();
	},

	// Returns a filtered list
	getFilteredList(list) {
		list = list || this.get('fullList');

		// Filtering by date is done through API requests
		list = this.getFilteredBySearchText(list);

		return list;
	},

	// Returns a filtered and paginated list of transactions
	getPaginatedList: function(transactions){
		var pageLength = this.get('pageSize');
		let currentPage = this.get('currentPage') -1;
		transactions = transactions || this.get('fullList');

		// Sets the page offset
		transactions = _.drop(transactions, pageLength * currentPage);

		this.set("count", transactions.length);

		// Limits the number of results
		transactions = _.take(transactions, pageLength);

		transactions = this.getFilteredBySearchText(transactions);

		return transactions;
	},

	getFilteredBySearchText: function(transactions){
		let searchText = this.get('searchToken');

		transactions = transactions || this.get('fullList');

		if (searchText !== ''){
			transactions = _.filter(transactions, tran => {
				let description = tran.description.toLowerCase().replace(/_/g, " ");
				return (description.indexOf(searchText) !== -1);
			});
		}
		return transactions;
	},

	setStartAndEnd(start, end) {
		this.set({fromDate: start, toDate: end}, {silent: true});
		if (!!start && !!end) {
			this.updateCasinoTransactionsList();
		}
	},

	setStartDate(epoch){
		this.set({fromDate: epoch}, {silent: true});
		if (!!epoch) {
			this.updateCasinoTransactionsList();
		}
	},

	setEndDate(epoch){
		this.set({toDate: epoch}, {silent: true});
		if (!!epoch) {
			this.updateCasinoTransactionsList();
		}
	},

	updateCasinoTransactionsList: function(){
		let loggedIn = App.session.request('loggedIn');

		if (loggedIn){
			this.getCasinoTransactions();
		}
	},

	numPages: function(){
		let fList = this.getFilteredList();

		if (!fList) {
			return 0;
		}

		let numPages = Math.ceil(fList.length / this.get('pageSize'));

		return numPages;
	},

	previousDisabled() {
		if (!this.numPages()) return true
		return this.get('currentPage') === 1
	},

	nextDisabled() {
		if (!this.numPages()) return true
		return this.get('currentPage') === this.numPages()
	},

	scrollToTop: function() {
		this.handleScrollToTop(document.body, 0, 250);
	},

	handleScrollToTop: function(element, to, duration) {
		if (duration < 0) return;
		var difference = to - element.scrollTop;
		var perTick = difference / duration * 2;

		setTimeout(function() {
			element.scrollTop = element.scrollTop + perTick;
			scrollTo(element, to, duration - 2);
		}, 10);
	},

	goPrevPage: function(){
		let page = this.get('currentPage') - 1;

		// If page is zero, it should be one
		page = page || 1;

		this.set('currentPage', page);

		this.set({transactions: this.getPaginatedList()});
	},

	goNextPage: function(e){
		e.stopPropagation();
		let page = this.get('currentPage') + 1;
		page = Math.min(page, this.numPages());

		this.set('currentPage', page);

		this.set({transactions: this.getPaginatedList()});

		if (page == this.numPages()) {
			this.scrollToTop();
		}
	},

	goFirstPage: function(){
		this.set('currentPage', 1);
	},

	goLastPage: function(){
		this.set('currentPage', this.numPages());
		this.scrollToTop();
	},

	setPageLength: function(length){
		this.set({
			pageLength: length,
			currentPage: 1
		});
	}

});

let inst = new Model();
export default inst;
