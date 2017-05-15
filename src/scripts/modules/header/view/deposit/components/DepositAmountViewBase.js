import {classNames as cx} from 'common/util/ReactUtil';
import InputField from 'sportsbook/components/InputField';
import model from 'sportsbook/model/DepositModel';
import {FormattedNumber, FormattedDate} from 'react-intl';
import {CURRENCY_SYMBOL_DICT} from 'app/AppConstants';
import selfExclusionModel from 'sportsbook/model/SelfExclusionModel';
import service from 'sportsbook/service/ApiService';
import {Link} from 'react-router';
import {formatNumber} from 'common/util/CurrencyUtil'
import Component from 'common/system/react/BackboneComponent';

import './DepositAmountView.scss';

export default class DepositAmountView  extends Component {
	constructor(props) {
		super(props);
		_.bindAll(this, 'onAmountChange', 'validateAmount');

		const {routeParams} = this.props;
		const bonusCode = (routeParams && routeParams.bonusCode) || null;
		this.state = {
			activePaymentBrand: 'EMS',
			activeFundType: 'CASH',
			defaultSelectedWallet: true,
			errorMessage: '',
			warningMessage: '',
			warningClass: '',
			allowContinue: false,
			infoBoxOpen: false,
			bonusDetails: null,
			bonusCode: bonusCode,
			bonusRedeemed: false,
			paymentFee:0.01,
			cards: [],
			status: 'default',
			showCardForm: false,
			showClabeForm: false,
			depositInProgress: false,
			cardTokenInProgress: false
		};

		this.currency = App.session.execute('getCurrency');
		model.set('activeAmount', 0);
		this.handleDigesstReceived = ::this.handleDigesstReceived;
	}

	onLogin(){
		//we don't want to inherit the self limit of the previous account
		//if the current doesn't have of its own
		model.clear().set(model.defaults);
	}

	/**
	 * Equivalent to onRender
	 */
	componentDidMount(){
		model.on('digestReceived', this.handleDigesstReceived);

		model.getDepositLimits();

		const {bonusCode} = this.state;

		if (bonusCode){
			this.onRedeemBonus();
		} else {
			this.checkRegBonus();
		}
	}

	componentWillMount(){
		App.session.on('session:loggedin', ::this.onLogin);
	}

	componentWillUnmount(){
		model.off('digestReceived', this.handleDigesstReceived);

		App.session.off('session:loggedin', this.onLogin);
	}

	checkRegBonus(){
		service.getBonusEntitlements('AVAILABLE', true)
			.then(::this.getFirstRegBonus);

	}

	// If there are any registration bonus available, pick the first one and prefill
	getFirstRegBonus(resp){
		const entitlements = resp && resp.Result && resp.Result.entitlements;
		let bonusCode = '';

		if (entitlements){
			const regBonus = entitlements.find( ent => {
				const isRegBonus = !!ent.bonus.registrationBonus;
				const isDepositBonus = !!ent.bonus.depositBonus;
				return (isRegBonus && isDepositBonus);
			});
			if (regBonus){
				bonusCode = regBonus.bonus.bonusCode;
				this.setState({bonusCode}, this.onRedeemBonus);
			}
		}
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.fundType === 'GAMES'){
			this.setState({
				bonusDetails: null,
				bonusCode: null
			});
		}

		const {routeParams} = this.props;
		const newRouteParams = nextProps.routeParams;
		const newBonusCode = (newRouteParams && newRouteParams.bonusCode) || null;

		if (!routeParams || !routeParams.bonusCode || (routeParams.bonusCode !== newBonusCode)){
			this.setState({bonusCode: newBonusCode});
		}
	}

	onRedeemBonus(event) {
		event && event.preventDefault();
		event && event.stopPropagation();
		let {bonusCode} = this.state;

		bonusCode = (bonusCode || '').trim();

		service.getBonusDetails(bonusCode)
			.then(::this.onGetBonusDetailsSuccess, ::this.onGetBonusDetailsError);
	}

	onCheckBonusActive(resp){
		if(!resp || !resp.Result){
			return 'error';
		}

		let entitlements = resp.Result.entitlements;
		const activeBonus = _.find(entitlements, function(bonus){
			if(bonus.bonus && bonus.bonus.depositBonus){
				return true;
			}
		});

		if(activeBonus){
			this.setState({bonusDetails: 'active'});
		}else{
			service.getBonusEntitlements('AVAILABLE', true)
				.then(::this.onCheckBonusAvailability);
		}
	}

	onCheckBonusAvailability(resp){
		if(!resp || !resp.Result){
			return 'error';
		}

		let bonusAvailable = resp.Result.entitlements;
		let bonus = _.find(bonusAvailable, bonus => bonus.bonus.bonusCode === this.state.bonusCode);

		if(_.isUndefined(bonus)){
			this.setState({bonusDetails: 'used'});
		}else{
			let details = model.get('bonusDetails');
			this.setState({
				bonusDetails: details,
				bonusRedeemed:true
			});
		}
		const activeAmount = model.get('activeAmount');
		this.validateAmount(activeAmount);
	}

	onChangeBonusCode( bonusCode ){
		if(!_.isUndefined(bonusCode)){
			this.refs.bonusCode.value = bonusCode;
			this.setState({
				bonusCode: bonusCode,
				bonusDetails: null
			});
		}
		this.setState({
			bonusRedeemed: false
		});
	}

	onGetBonusDetailsSuccess(resp){
		let bonusDetails = this.getParsedBonusDetails(resp);
		model.set({bonusDetails: bonusDetails});

		if(bonusDetails !== 'error'){
			let fundType = this.state.activeFundType;

			if(fundType === 'GAMES'){
				this.setState({bonusDetails: 'casino'});
				return;
			}else{
				//we first check whether the user has already a bonus active,
				//since only one bonus can be active at a time
				service.getBonusEntitlements('ACTIVE')
					.then(::this.onCheckBonusActive);
				return;
			}

		}
		this.setState({bonusDetails: bonusDetails});
		this.props.onChangeBonusCode && this.props.onChangeBonusCode( this.state.bonusCode );
		const activeAmount = model.get('activeAmount');
		this.validateAmount(activeAmount);
	}

	onGetBonusDetailsError(resp) {
		this.setState({bonusDetails: 'error'});
	}

	onClearBonusCode(){
		this.setState({
			bonusDetails: null,
			bonusCode: null,
			errorMessage: "",
			warningMessage: '',
			warningClass: '',
			bonusRedeemed: false,
			infoBoxOpen: false
		});
		this.refs.bonusCode.value = '';
		this.props.onChangeBonusCode && this.props.onChangeBonusCode( null );
	}

	getParsedBonusDetails(resp){
		if (!resp || !resp.Bonus){
			return 'error';
		}

		const details = resp.Bonus;

		if (!details.depositBonus){
			return 'freebet';
		}
		const currency = this.currency;
		const {depositBonus: bonus, name: bonusName, availableFrom, expires} = details;
		const {bonusFactor, paymentMethods, minimumOdds: minOdds, daysToActivate, daysToFulfill} = bonus;
		let {wageringFactor, maxDeposits, minDeposits} = bonus;
		const toMilliseconds = 24*60*60*1000;

		wageringFactor = wageringFactor.factor;
		const wageringType = wageringFactor.depositAndBonus ? 'Deposit and Bonus' : 'Bonus';
		maxDeposits = _.findWhere(maxDeposits, {currency});
		maxDeposits = (maxDeposits && maxDeposits.amount) || 0;
		minDeposits = _.findWhere(minDeposits, {currency});
		minDeposits = (minDeposits && minDeposits.amount) || 0;

		const daysToActivateInMilliseconds = daysToActivate * toMilliseconds;
		const daysToFulFillInMilliseconds = daysToFulfill * toMilliseconds;

		let date = daysToActivate === 0 ? expires : daysToActivateInMilliseconds + availableFrom;
		date = new Date(date);

		let bonusValidityDate = availableFrom + daysToActivateInMilliseconds;
		bonusValidityDate = daysToFulfill === 0 ? expires : bonusValidityDate + daysToFulFillInMilliseconds;
		bonusValidityDate = new Date(bonusValidityDate);

		const parsedBonus = { bonusFactor, wageringFactor, wageringType, minOdds, daysToFulfill,
			bonusValidityDate, date, maxDeposits, minDeposits, bonusName, paymentMethods };
		return parsedBonus;
	}

	getCurrentBonus(){
		const details = this.state.bonusDetails;
		const {bonusFactor, maxDeposits} = details;
		const deposit = model.get('activeAmount');

		if (!this.isValidBonusSelected()){
			return 0;
		}

		const bonus = bonusFactor * deposit;
		const cappedBonus = Math.min(maxDeposits, bonus);
		return cappedBonus;
	}

	isValidBonusSelected(){
		let details = this.state.bonusDetails;

		// If no valid bonus has been reedemed ('error', 'freebet', ...)
		// or the bonusFactor is zero return false, otherwise true
		return !!(details && details.bonusFactor);
	}

	isBonusCodeEditable(){
		// If a valid bonus code has been entered, don't allow editing the box
		return ((this.props.fundType !== 'GAMES') &&
		!this.isValidBonusSelected());
	}

	getTotalDeposit(){
		return model.get('activeAmount') + this.getCurrentBonus();
	}

	getPaymentFee(grossAmount){
		let fee = this.state.paymentFee;
		return grossAmount * fee;
	}

	getButtonState(amount, defaultType = 'false') {
		let isDefault = defaultType === 'default';
		const activeAmount = model.get('activeAmount');
		return cx('inline-element', 'lozenge', {'active': amount === activeAmount || (isDefault && activeAmount === 0)});
	}

	/**
	 * user updated other amount input field.
	 * NOTE: I had to remove type="number" from the input since was requested to remove the "selector";
	 * to avoid NaN and set 0 as min value I came up with this solution.
	 * @param e
	 */
	onAmountChange(e) {
		if(!_.isUndefined(e)){
			const selectedAmount = formatNumber(e) || 0;
			this.validateAmount(selectedAmount);
			this.refs.otherAmt.value = selectedAmount;

			model.set('activeAmount', selectedAmount);
		}
	}

	addCurrencySymbol(text)
	{
		const currencySymbol = CURRENCY_SYMBOL_DICT[this.currency] || this.currency;

		if(App.Config.siteId === 1)
			return `${currencySymbol}${text}`

		return `${text} ${currencySymbol}`
	}

	/**
	 * user updated other amount input field
	 * @param e
	 */
	validateAmount(e) {
		if(_.isUndefined(e) || e === '')
			return false;

		const amount = parseFloat(e);
		const min = App.Config.siteId === 1 ? 100 : 10;
		const max = App.Config.siteId === 1 ? 5000 : 20000;

		let todayLimit = model.get('canDepositToday');
		let weekLimit = model.get('canDepositWeek');
		let monthLimit = model.get('canDepositMonth');
		let depositRestriction = true;

		if(_.isNull(todayLimit) && _.isNull(weekLimit) && _.isNull(monthLimit)) {
			depositRestriction = false;
		}


		if(amount < min) {
			this.setWarningMessage(App.Intl('select_amount.error_message.valid_amount') + " " + this.addCurrencySymbol(min), false);
			return false;
		}
		else if ((amount >= max)) {
			this.setWarningMessage(App.Intl('select_amount.error_message.valid_amount_under') + " " + this.addCurrencySymbol(max), false);
			return false;
		}

		if(depositRestriction) {
			//TODO: A proper solution needs to be implemented for this workaround

			this.setState({allowContinue: false});

			if(_.isNumber(todayLimit) && (amount > todayLimit)){
				todayLimit = todayLimit < 0 ? 0 : todayLimit;
				const message = `${App.Intl('select_amount.error_message.exceeded_daily_deposit_limit')} ${this.addCurrencySymbol(selfExclusionModel.get('dailyDepositLimit'))}.
					 ${App.Intl('select_amount.error_message.remaining_daily_deposit_limit')} ${this.addCurrencySymbol(todayLimit)}.`;
				this.setWarningMessage(message);
				return false;
			}
			if(_.isNumber(weekLimit) && (amount > weekLimit)){
				weekLimit = weekLimit < 0 ? 0 : weekLimit;
				const message = `${App.Intl('select_amount.error_message.exceeded_weekly_deposit_limit')} ${this.addCurrencySymbol(selfExclusionModel.get('weeklyDepositLimit'))}.
					 ${App.Intl('select_amount.error_message.remaining_weekly_deposit_limit')} ${this.addCurrencySymbol(weekLimit)}.`;
				this.setWarningMessage(message);
				return false;
			}
			if(_.isNumber(monthLimit) && (amount > monthLimit)){
				monthLimit = monthLimit < 0 ? 0 : monthLimit;
				const message = `${App.Intl('select_amount.error_message.exceeded_monthly_deposit_limit')} ${this.addCurrencySymbol(selfExclusionModel.get('monthlyDepositLimit'))}.
					 ${App.Intl('select_amount.error_message.remaining_monthly_deposit_limit')} ${this.addCurrencySymbol(monthLimit)}.`;
				this.setWarningMessage(message);
				return false;
			}
		}

		//let's check the minimum and the maximum deposit when bonus is applied
		if(this.isValidBonusSelected()){
			let details = this.state.bonusDetails;
			let minDeposit = details.minDeposits;
			let maxDeposit = details.maxDeposits;
			let maxBonus = parseFloat(maxDeposit) * parseFloat(details.bonusFactor);

			if(amount < minDeposit){
				const message =  `${App.Intl('deposit.bonus_error.minimum_deposit')} ${this.addCurrencySymbol(minDeposit)}.`
				this.setWarningMessage(message)
				return false;
			}
			if(amount > maxDeposit){
				const message = `${App.Intl('deposit.bonus_error.maximum_deposit')} ${this.addCurrencySymbol(maxDeposit)}
						${App.Intl('deposit.bonus_error.proceeding_bonus_not_applied')} ${this.addCurrencySymbol(maxBonus)}.`;
				this.setWarningMessage(message, true)
				return true;
			}
		}

		this.setWarningMessage('', true);
		return true;
	}

	/**
	 * don't Submit
	 */
	onSubmit(e) {
		e.preventDefault();
	}

	onToggleInfoBox(){
		const infoBoxOpen = !this.state.infoBoxOpen;
		this.setState({infoBoxOpen});
	}

	handleDigesstReceived() {

	}

	setWarningMessage(text, allowContinue = null, style = '') {
		const state = {
			errorMessage: '',
			warningMessage: text,
			warningClass: style,
			cardTokenInProgress: false
		}
		if(allowContinue !== null) {
			state.allowContinue = allowContinue;
		}
		this.setState(state);
	}

	/**
	 * Continue
	 */
	onContinue() {
		const {activeFundType, bonusDetails, bonusCode, bonusRedeemed} = this.state;
		const bonusCodeToUse = bonusRedeemed ? bonusCode : '';

		if(bonusCode != null && bonusCode.length > 0 && !bonusRedeemed){
			this.setState({bonusDetails: 'redeem'});
			return;
		}

		const activeAmount = model.get('activeAmount');

		if (this.validateAmount(activeAmount)){
			model.set({
				activeFundType,
				bonusDetails,
				bonusCode: bonusCodeToUse
			});

			if(!bonusCodeToUse){
				model.set({
					bonusDetails: '',
					bonusCode: ''
				});
			}

			model.deposit(parseFloat(activeAmount),  bonusCode || 0);
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const {status} = this.state;
		if (status === 'cards') {
			return this.renderPayment();
		}
		else if (status === 'alreadyRegistered') {
			return this.renderAlreadyRegistered();
		}

		// If there is no error message we assume the amount is valid
		const {bonusCode, bonusDetails, infoBoxOpen, allowContinue, bonusRedeemed, errorMessage} = this.state;
		let showInfo = infoBoxOpen ? 'block' : 'none',
			extraBonusIcon = infoBoxOpen ? 'icon-chevron-down' : 'icon-chevron-left',
			removeBonusCode = !_.isNull(bonusCode) && bonusCode && bonusCode.length > 3 ? 'inline-block' : 'none',
			btnClass =  cx('btn--primary--large', 'u-margin--top', this.state.allowContinue ? '' : 'disabled'),
			bonusBtn = (this.state.bonusCode === null) ? 'btn--tertiary disabled' : 'btn--quaternary active';
		const redeemButtonStyle = {display: (this.state.bonusRedeemed ? 'none': 'inline-block')};
		//we want the maximum deposit "error" to be shown in black instead of red
		let showError = errorMessage !== '';

		let preventEditBonusCode = !this.isBonusCodeEditable();

		const showRequirementBox = typeof bonusDetails === "object";
		const showToggleBox = showRequirementBox && !_.isNull(bonusDetails);
		return (
			<div className="grid">
				<div className="col-3_lg-4_md-6">
						<form onSubmit={this.onSubmit}>
							<InputField
								ref="otherAmt"
								className="short dark"
								onChange={::this.onAmountChange}
								validate={::this.validateAmount}
								type="text"
								tooltip=""
								validationOnExit={false}
								tooltipHoverEl={false}
								showError={showError}
								label={App.Intl('deposit.how_much')}
								noLabel={false}
								placeHolder=""
								errorMsg={errorMessage}
								style={{borderRight:'0px'}}
								withCurrency={this.renderCurrency()}
							/>

						{App.Config.siteId === 1 && this.renderPresetButtons()}
						{this.renderWarningMessage()}

						<InputField className="short dark bonuscode-box"
									validationOnExit={false}
									onChange={::this.onChangeBonusCode}
									ref="bonusCode"
									value={bonusCode || ''}
									placeHolder=""
									noLabel={false}
									label={App.Intl('deposit.have_a_promotional_code')}
									tooltip=""
									disabled={preventEditBonusCode}
									type="text"
									data-ignore	/>

						<div className="form-section">
							<button className={bonusBtn}
								 data-ignore
								 style={redeemButtonStyle}
								 onClick={::this.onRedeemBonus}>
								{App.Intl('deposit_redeem')}
							</button>
							<button className="btn--quaternary"
								 style={{'cursor' : 'pointer', display: removeBonusCode }}
								 data-ignore
								 onClick={::this.onClearBonusCode}>
								{App.Intl('deposit.delete_bonus')}
							</button>
							{this.renderBonusDetails()}
						</div>
					</form>
					<div>
						{showToggleBox &&
						<div>
							<div>
								<a  href="javascript:void(0)"
									data-ignore
									onClick={::this.onToggleInfoBox}
									className={cx('g-menu__link', this.state.bonusRedeemed ? 'c-deposit-amount__redeemed' : '')}
								>
									{App.Intl('deposit.show_all_requirements')}
									<i className={extraBonusIcon}></i>
								</a>
							</div>

							{showRequirementBox &&
							<div className="pea-info-container"
								 style={{display: showInfo}}>
								{this.renderAllRequirementsBox()}
							</div>}
						</div>
						}

					</div>

					<a className={cx(btnClass, "g-menu__link")}
					   data-ignore
					   style={{cursor: 'pointer'}}
					   onClick={::this.onContinue}>
						{!App.isMobile() ? App.Intl('deposit.links.continue_to_payment_method') : App.Intl('deposit.links.continue_to_payment')}
					</a>
				</div>
			</div>
		);
	}

	renderCurrency(){
		const currencySymbol = CURRENCY_SYMBOL_DICT[this.currency] || this.currency;
		return currencySymbol;
	}

	renderBonusDetails(){
		let bonusDetails = this.state.bonusDetails;

		if (!bonusDetails){
			return null;
		}

		if (bonusDetails === 'error'){
			return this.renderBonusErrorMessage();
		}

		if (bonusDetails === 'freebet'){
			return this.renderFreebetBonusMessage();
		}

		if(bonusDetails === 'used'){
			return this.renderAlreadyUsedBonus();
		}

		if(bonusDetails === 'redeem'){
			return this.renderDoRedeem();
		}

		if(bonusDetails === 'casino'){
			return this.renderErrorBonusForCasino();
		}

		if(bonusDetails === 'active'){
			return this.renderErrorBonusActive();
		}

		return this.renderDepositBonusMessage();
	}

	renderBonusErrorMessage(){
		return (
			<div className="error-box">
				<p>
					{App.Intl('deposit.errors.no_bonus_found_for_that_bonus_code')}
					<br/>
					{App.Intl('deposit.bonus_error.body')}
				</p>
			</div>
		);
	}

	renderWarningMessage(){
		const {warningMessage, warningClass} = this.state;
		let showWarning = warningMessage !== '';
		const className = warningClass !== '' ? warningClass : 'error-box';
		if(showWarning){
			return (
				<div className={className}>
					<p>{warningMessage}</p>
				</div>
			);
		}
	}

	renderFreebetBonusMessage(){
		return (
			<div className="error-box">
				<p>
					{App.Intl('deposit.freebet_bonus_message.body')}
				</p>
			</div>
		);
	}

	renderDepositBonusMessage(){
		let currency = this.currency;
		const {activeAmount} = model.attributes;
		const {bonusDetails} = this.state;
		const {minDeposits, maxDeposits, bonusFactor} = bonusDetails;

		const maxBonus = Number(maxDeposits) * Number(bonusFactor);
		let amount = activeAmount * bonusFactor;

		if(activeAmount < minDeposits){
			amount = 0;
		}
		if(activeAmount > maxDeposits){
			amount = maxBonus;
		}

		if(!!bonusDetails && typeof bonusDetails === "object"){
			let bonusAmount = <FormattedNumber value={amount}
											   style="currency"
											   currency={currency} />;
			return (
				<div className="msg-box">
					<p>{App.Intl("deposit.bonus_amount_redeemed_part1")} {bonusAmount} {App.Intl("deposit.bonus_amount_redeemed_part2")}</p>
				</div>
			);
		}

	}

	renderAlreadyUsedBonus(){
		return (
			<div className="msg-box">
				<p style={{color: 'red'}}>
					{App.Intl('deposit.bonus_used.sentence_one')}
					<br/>
					{App.Intl('deposit.bonus_used.sentence_two')}
				</p>
			</div>
		);
	}

	renderDoRedeem(){
		return (
			<div className="msg-box">
				<p style={{color: 'red'}}>
					{App.Intl('deposit.bonus_error.must_redeem_bonus')}
				</p>
			</div>
		);
	}

	renderAllRequirementsBox(){
		const {lang} = App.Globals;

		const bonus = this.state.bonusDetails;
		if (!!bonus && typeof bonus === "object"){
			const currency = this.currency;
			const {bonusFactor: factor, maxDeposits, date: bonusDate, bonusName, bonusValidityDate} = bonus;
			const {wageringType, wageringFactor, minOdds, daysToFulfill} = bonus;
			const bonusFactor = <FormattedNumber value={factor}
											   style="percent" />;
			const maxBonusAmount = <FormattedNumber value={maxDeposits * factor}
												  style="currency"
												  currency={currency} />;
			const optInDate = <FormattedDate value={bonusDate}
									  day="numeric"
									  month="long"
									  year="numeric" />;
			const validUntilDate = <FormattedDate value={bonusValidityDate}
									  day="numeric"
									  month="long"
									  year="numeric" />;

			const translate = (string, token={}) => App.Intl(`deposit.bonus_message.${string}`, token);

			return(
				<div className="pea-info-box">
					<div className="pea-info-header">
						<h3>{bonusName}</h3>
						<i className="icon-menu-close"
						   data-ignore
						   onClick={::this.onToggleInfoBox}>
						</i>
					</div>
					<p>
						{translate('opt_in_date')} {optInDate} <br/>
					</p>
					<p>
						{translate('factor_explanation.first_part') + ' '}
						{bonusFactor}
						{' ' + translate('factor_explanation.second_part') + ' '}
						{maxBonusAmount}.
					</p>
					<p>
						{translate('valid_until') + ' '}
						{validUntilDate}.
					</p>
					<p>{translate('withdrawal_explanation_with_parms' , {type: wageringType, factor: wageringFactor , minodds: minOdds , days: daysToFulfill})}</p>
				</div>

			);
		}

	}

	renderErrorBonusForCasino(){
		return (
			<div className="msg-box">
				<p style={{color: 'red'}}>
					{App.Intl("deposit.casino_error.bonus_not_available")}
				</p>
			</div>
		);
	}

	renderErrorBonusActive(){
		return (
			<div className="msg-box">
				<p style={{color: 'red'}}>
					{App.Intl('deposit.bonus_error.bonus_active')}
				</p>
			</div>
		);
	}

	renderPayment() {
		return null;
	}

	renderAlreadyRegistered() {
		return null;
	}

	renderPresetButtons() {
		const presets = [100, 150, 200, 300, 500];

		return (
			<div className="c-deposit-amount__preset-button--container u-margin--bottom">
				{presets.map(preset => this.renderPresetButton(preset))}
			</div>
		)
	}

	renderPresetButton(amount) {
		return (
			<div>
			<button className="c-btn--primary" type="button"
					onClick={this.onAmountChange.bind(this,  String(amount))}>
				{this.addCurrencySymbol(amount)}
			</button>
		</div>
		);
	}
}
