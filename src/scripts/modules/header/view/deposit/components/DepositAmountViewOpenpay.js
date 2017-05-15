import 'thirdparty/openpay.js'
import 'thirdparty/openpay-data.js'

import DepositAmountViewBase from './DepositAmountViewBase';

import './DepositAmountView.scss';
import model from 'sportsbook/model/DepositModel';
import NewOpenPayCardModel from 'sportsbook/model/NewOpenPayCardModel';
import service from 'sportsbook/service/SportsbookRestfulService'
import SelectElement from  'sportsbook/components/SelectElement';
import Form from 'app/components/formElements/forms/Form';
import FormInputWithIconbox from 'app/components/formElements/forms/FormInputWithIconbox';
import {classNames as cx} from 'common/util/ReactUtil';
import LoadingSpinner from 'header/view/components/LoadingSpinner';
import ClabeNumberView from 'header/view/components/ClabeNumberView'
import paymentSlipModel from 'sportsbook/model/PaymentSlipModel';

export default class DepositAmountViewOpenpay extends DepositAmountViewBase {
	constructor(props) {
		super(props);
		_.bindAll(this,
			'onAddNewCard', 'onDeposit', 'onFormSubmit', 'onCardReset', 'onBack',
			'onEdit', 'onCardError', 'isErrorCodeGrouped', 'onDeletePaymentOption', 'translateOpenPayError',
			'getCardToken', 'onGetOptions', 'onAddNewClabe');

		model.set('type', 'openpay');

		this.OpenPay = window.OpenPay;
		this.cardError = null;
		this.newCardModel = new NewOpenPayCardModel();
	}

	componentDidMount() {
		super.componentDidMount();
		model.updateDepositOptions();
		model.on('change:depositOptions', this.onCardReset);
	}

	componentWillUnmount() {
		model.off('change:depositOptions', this.onCardReset);
	}

	onAddNewCard() {
		this.setState({ showCardForm: true, showClabeForm: false });
	}

	onAddNewClabe() {
		this.setState({ showClabeForm: true, showCardForm: false });
	}

	onEdit() {
		model.set('activeAmount', 0);
		this.setState({ status: 'default' });
	}


	onBack() {
		if (!model.getOptionsByType().length) {
			this.onEdit()
		}
		this.setState({ showCardForm: false });
	}

	onCardReset() {
		this.newCardModel = new NewOpenPayCardModel();
		this.setWarningMessage('');
	}

	onDeposit() {
		const that = this;
		if (this.state.depositInProgress) {
			return;
		}
		this.setState({depositInProgress: true});
		const responseUrl = model.get('responseUrl');
		if (responseUrl && this.deviceSessionId && model.get('selectedOption')) {
			service.openPayResponseUrl(responseUrl, model.get('selectedOption'), this.deviceSessionId).then((resp)=> {
				that.setState({depositInProgress: false});
				const success = resp.status && resp.status === 'DEPOSIT_SUCCESS';
				const openpayErrorObj = this.getOpenpayErrorObject(resp);
				if (resp.status === 'DEPOSIT_PENDING' && !!resp.paymentSlip) {
					paymentSlipModel.set(JSON.parse(resp.paymentSlip));
					App.navigate('deposit/spei');
				}
				else if (success) {
					App.navigate('deposit/confirm');
				}
				else if (!!openpayErrorObj) {
					const errorMessage = this.translateOpenPayError(openpayErrorObj.error_code, '');
					App.navigate('deposit/error', {errorMessage});
				}
				else {
					App.navigate('deposit/error');
				}
			});
		}
	}

	onFormSubmit() {
		if (this.state.cardTokenInProgress) {
			return;
		}
		this.setState({cardTokenInProgress: true});
		const hasCard = model.hasCard(this.newCardModel.get('card_number').toString());
		if (hasCard) {
			this.setState({status: 'alreadyRegistered'});
			return;
		}

		this.getCardToken();
	}

	getCardToken() {
		const that = this;
		this.OpenPay.token.create(this.newCardModel.attributes, (res) => {
			const data = res.data;
			service.registerPaymentCard('OPENPAY', JSON.stringify(data), this.deviceSessionId).then((resp)=> {
				if (resp && resp.error) {
					this.onCardError(resp)
				}
				else {
					this.onGetOptions();
				}
			}, this.onCardError);
		}, this.onCardError);
	}

	onGetOptions() {
		model.updateDepositOptions();
		this.setState({ status: 'cards', showCardForm: false, showClabeForm: false, cardTokenInProgress: false });
	}

	onCardError(resp) {
		const openpayErrorObject = this.getOpenpayErrorObject(resp);
		let errorObj = openpayErrorObject ? openpayErrorObject : resp && resp.data;

		if (!errorObj) {
			this.setWarningMessage(App.Intl('openpay.card_error'));
			return;
		}

		this.cardError = errorObj;
		if (this.isErrorCodeGrouped(errorObj.error_code)) {
			this.setWarningMessage('');
			this.refs.cardForm.validateForm(true);
		}
		else {
			let className = '';
			const fraudErrors = [3004, 3005];
			if (fraudErrors.indexOf(errorObj.error_code) > -1) {
				className = 'c-deposit-amount__red-warning';
			}
			this.setWarningMessage(this.getCardErrorText(), null, className);
		}
	}

	getOpenpayErrorObject(resp) {
		const isOpenpayError = (resp && resp.error && resp.error.code.indexOf('openpay') > -1);
		if (!isOpenpayError) {
			return null
		}
		const details = resp.error.code.split('.');
		const error_code = parseInt(details[details.length - 1]);
		return { error_code, details: '' };
	}

	onDeletePaymentOption() {
		const selectedOption = model.get('selectedOption')
		service.deletePaymentOption('OPENPAY', selectedOption).then((resp) => {
			if (resp.status && resp.status === 'SUCCESS') {
				model.updateDepositOptions();
			}
			else if (!!resp.error && resp.error.code) {
				if (resp.error.code.indexOf('pending') > -1) {
					this.setWarningMessage(App.Intl('deposit.error.deposit_pending'));
				}
				else if (resp.error.code.indexOf('balance.not.empty') > -1) {
					this.setWarningMessage(App.Intl('deposit.error.balance_not_empty'));
				} else {
					this.setWarningMessage(App.Intl('deposit.error.default_error'));
				}
			}
			else {
				this.setWarningMessage(App.Intl('deposit.error.default_error'));
			}
		});
	}

	onCardDuplicated(add = false) {
		this.onCardReset();
		this.setState({status: 'cards', showCardForm: add});
	}

	isErrorCodeGrouped(errorCode) {
		const that = this;
		return !!Object.keys(that.errorCodes).some((key) => {
			const obj = that.errorCodes[key];
			return obj.indexOf(errorCode) > -1;
		});
	}

	isFieldValid(codes = []) {
		if (!this.cardError) {
			return true;
		}
		const valid = codes.indexOf(this.cardError.error_code) === -1;
		if (!valid) {
			this.cardError = null;
			return false;
		}
		return true;
	}

	getCardErrorText() {
		if (!this.cardError) {
			return ''
		}

		return this.translateOpenPayError(this.cardError.error_code, this.cardError.description);
	}

	translateOpenPayError(error_code, failText) {
		const errorText = App.Intl('openpay.card_error.' + error_code);
		if (errorText.indexOf('MISSING_TRANSLATION') > -1) {
			return failText;
		}
		return errorText;
	}

	isValidAmexCVV() {
		if (this.refs.cardNumber && this.refs.securityCode) {
			const cardNumber = this.refs.cardNumber.value();
			const securityCode = this.refs.securityCode.value();
			const isAmex = /^3[47][0-9]{13}$/.test(cardNumber);
			if (isAmex && securityCode.length !== 4 || !isAmex && securityCode.length !== 3) {
				return false
			}
		}
		return true;
	}

	errorCodes = {
		holder_name: [],
		cvv2: [2006],
		card_number: [2002, 2004, 2007, 2008, 3007, 3009, 3011]
	}

	validators = {
		holder_name: [
			{ 'isLength:4': App.Intl('openpay.name_of_owner.error.invalid') },
			{rule: this.isFieldValid.bind(this, this.errorCodes.holder_name), error: ::this.getCardErrorText}
		],
		cvv2: [
			{ 'isLength:3:4': App.Intl("openpay.cvv2.error.invalid_length") },
			{rule: ::this.isValidAmexCVV, error: App.Intl('openpay.cvv2.error.amex')},
			{rule: this.isFieldValid.bind(this, this.errorCodes.cvv2), error: ::this.getCardErrorText}
		],
		card_number: [
			{ 'isLength:15:16': App.Intl("openpay.card_number.error.invalid_length") },
			{rule: this.isFieldValid.bind(this, this.errorCodes.card_number), error: ::this.getCardErrorText}
		]
	};

	renderPayment() {
		const { showCardForm, showClabeForm } = this.state;
		const depositOptions = model.get('depositOptions');

		return (
			<div className="grid">
				{ showClabeForm &&
				<ClabeNumberView model={model} onGetOptions={this.onGetOptions}  deposit />}
				{ showCardForm && this.renderNewCardForm()}
				{ !showCardForm && !showClabeForm && this.renderDeposit(depositOptions)}
				<div className="col-12">{this.renderWarningMessage()}</div>
			</div>
		);
	}

	renderDeposit() {
		const depositOptions = model.get('depositOptions');
		const cards = model.getOptionsByType('CARD');
		const hasAccount = model.hasAccount();
		const {depositInProgress} = this.state;
		return (
			<div className="col-12">
				<div className="c-deposit-amount__container">
					<label>{App.Intl('openpay.amount')}</label>
					<h3 className="u-margin--left">${model.get('activeAmount')} </h3>
					<button className="btn--tertiary disabled u-margin--left"
							type="button" onClick={ this.onEdit }>
						{App.Intl('openpay.change')}
					</button>
				</div>
				{this.renderPaymentOptions()}
				{!hasAccount &&
				<button className="btn--primary c-deposit-amount__btn-newcard"
						type="button" onClick={ this.onAddNewClabe }>
					{App.Intl('deposit.openpay.btn_new_clabe')}
				</button>}
				{cards.length < 3 &&
				<button className="btn--primary c-deposit-amount__btn-newcard"
						type="button" onClick={ this.onAddNewCard }>
					{App.Intl('openpay.btn_new_card')}
				</button>}
				{!!depositOptions.length &&
				<button className={cx({'btn--secondary': !depositInProgress, 'btn--lighter-gray': depositInProgress})}
						type="button" onClick={	this.onDeposit }>
					<div className="c-deposit-amount__button-contents">
						{App.Intl('openpay.btn_deposit')}
						{depositInProgress &&
						<div className="u-margin--left">
							<LoadingSpinner/>
						</div>}
					</div>
				</button>}
			</div>
		)
	}

	renderPaymentOptions() {
		const depositOptions = model.get('depositOptions');
		if (!depositOptions.length) {
			return null;
		}
		return (
			<div className="c-deposit-amount__container">
				<SelectElement className="option" ref="depositOptions"
							   label={ App.Intl('openpay.select_card_or_clabe.label') }
							   hideError={false}
							   valueLink={this.bindTo(model, 'selectedOption')}>
					{_.map(depositOptions, this.renderPaymentOption)}
				</SelectElement>
				<button className="c-btn--primary u-margin--left" type="button"
						onClick={this.onDeletePaymentOption}>
					{App.Intl('openpay.delete')}
				</button>
			</div>
		)
	}

	renderPaymentOption(card, i) {
		return <option key={i} value={card.id}>{card.displayName}</option>;
	}

	renderNewCardForm() {
		const {cardTokenInProgress} = this.state;
		let months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
		return (
			<Form className="col-12 grid" ref="cardForm" onSubmit={this.onFormSubmit} validateOnChange={true} resetOnInvalid={true}>
				<div className="col-12">
					<h3>{App.Intl('openpay.new_card')}</h3>
				</div>
				<div className="col-3_lg-6_md-6_sm-7_xs-12">
					<FormInputWithIconbox ref="nameOfOwner"
										  name="nameOfOwner"
										  focus={true}
										  valueLink={this.bindTo(this.newCardModel, 'holder_name')}
										  placeHolder={App.Intl('openpay.holder_name.placeholder')}
										  rules={this.validators.holder_name}
										  label={App.Intl('openpay.holder_name.label')}
										  tooltipHoverEl
										  errorAsTooltipOnMobile
										  blockLabel
										  tooltipMobileCloseBtn
										  tooltipMobileNavigate
										  icon="query-icon"
										  resetOnInvalid={true}
										  maxLengh="16"
					/>
					<FormInputWithIconbox ref="cardNumber"
										  name="cardNumber"
										  focus={true}
										  valueLink={this.bindTo(this.newCardModel, 'card_number')}
										  placeHolder={App.Intl('openpay.card_number.placeholder')}
										  rules={this.validators.card_number}
										  label={App.Intl('openpay.card_number.label')}
										  tooltipHoverEl
										  errorAsTooltipOnMobile
										  blockLabel
										  tooltipMobileCloseBtn
										  tooltipMobileNavigate
										  numbersOnly
										  icon="query-icon"
										  maxLength="16"
										  resetOnInvalid={true}
					/>
				</div>
				<div className="col-12 grid">
					<label className="col-12">{App.Intl('openpay.expiration_date.label')}</label>
					<div className="col-1_lg-2_md-2_sm-2_xs-4">
						<div className="c-deposit-amount__container">
							<SelectElement label={App.Intl('openpay.expiration_month.label')}
										   hideError={false}
										   valueLink={this.bindTo(this.newCardModel, 'expiration_month')}
							>
								{months.map((month) => {return <option key={month} value={month}>{month}</option>;})}
							</SelectElement>
							<div className="u-margin--left">
								<SelectElement label={App.Intl('openpay.expiration_year.label')}
											   hideError={false}
											   valueLink={this.bindTo(this.newCardModel, 'expiration_year')}
								>
									{this.renderYears()}
								</SelectElement>
							</div>
							</div>
						<FormInputWithIconbox ref="securityCode"
											  name="securityCode"
											  focus={true}
											  valueLink={this.bindTo(this.newCardModel, 'cvv2')}
											  placeHolder={App.Intl('openpay.securityCode.placeholder')}
											  rules={this.validators.cvv2}
											  label={App.Intl('openpay.securityCode.label')}
											  tooltipHoverEl
											  errorAsTooltipOnMobile
											  blockLabel
											  tooltipMobileCloseBtn
											  tooltipMobileNavigate
											  numbersOnly
											  icon="query-icon"
											  maxLength="4"
						/>
					</div>
				</div>
				<div className="col-12">
					<button
						className="btn--primary"
						type="button"
						onClick={ this.onBack }
					>
						{App.Intl('openpay.back')}
					</button>
					<button id="newCardBtn"
							className={cx('u-margin--left', {'btn--secondary': !cardTokenInProgress, 'btn--lighter-gray': cardTokenInProgress})}
							type="submit">
						<div className="c-deposit-amount__button-contents">
							<div>{ App.Intl('openpay.register') }</div>
							{cardTokenInProgress &&
							<div className="u-margin--left">
								<LoadingSpinner/>
							</div>}
						</div>
					</button>
				</div>
			</Form>
		)
	}

	renderYears() {
		const currentYear = moment().format('YY');

		const years = [];
		for (let i = currentYear; i < 99; i++) {
			years.push(<option key={i} value={i}>{i}</option>)
		}
		return years;
	}

	renderAlreadyRegistered() {
		return (
			<div className="grid">
				<div className="col-12">
					<h3>{ App.Intl('openpay.card_already_registered') }</h3>
				</div>
				<div className="col-12">
					<button className="btn--secondary" onClick={::this.onCardDuplicated}>
						<div>{ App.Intl('openpay.continue_with_registered_card') }</div>
					</button>
				</div>
				<div className="col-12">
					<a onClick={this.onCardDuplicated.bind(this, true)}>{ App.Intl('openpay.continue_with_new_registration') }</a>
				</div>
			</div>
		);
	}

	handleDigesstReceived() {
		this.setState({ status: 'cards' });
		const merchantId = model.get('merchantId');
		const publicKey = model.get('merchantPublicKey')
		//let sandbox = model.get('sandbox');
		let sandbox = false;
		const url = model.get('url');
		// hackfix
		if (url.indexOf('sandbox') > -1) {
			sandbox = true;
		}

		this.OpenPay.setId(merchantId);
		this.OpenPay.setApiKey(publicKey);
		this.OpenPay.setSandboxMode(sandbox);
		this.deviceSessionId = this.OpenPay.deviceData.setup();
	}
}
