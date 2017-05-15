import {classNames as cx} from 'common/util/ReactUtil';
// import Input from 'sportsbook/components/form/Input';
import InputField from 'sportsbook/components/InputField';
import Form from 'app/components/formElements/forms/Form';
import model from 'sportsbook/model/ChipsModel';
import {FormattedNumber} from 'react-intl';
import {CURRENCY_SYMBOL_DICT} from 'app/AppConstants';

export default class ChipsSellView extends React.Component {
	constructor(props) {
		super(props);
		_.bindAll(this, 'getButtonState');

		const balance = App.session.execute('getChipsBalance');
		this.state = {
			activeAmount: '',
			balance: Number(balance),
			errorMsg: ''
		};
	}

	/**
	 * @param route
	 */
	onNavigate(route) {
		App.navigate(route);
	}

	/**
	 * user clicked on Buy or Sell option, redirect them to the appropriate view
	 * @param e
	 */
	onSubmit(e) {
		const amount = this.refs.otherAmt.value;
		var isValid = this.validateAmount(amount);
		if(isValid){//note if invalid , error set in that function - just need to stop server call.
			model.set({amount: amount});
			model.sellChips().then((resp) => {
				this.onNavigate('chips/sellSuccess');
			}).catch((resp) => {
				this.onNavigate('chips/sellError');
			});
		}
	}

	/**
	 * user clicked on pre-defined amount option, store in the model
	 * @param e
	 */
	onAmountChange(amount, e) {
		this.setState({
			activeAmount: Number(amount),
			errorMessage: '',
			warningMessage: ''
		});
		this.validateAmount(amount);
		this.refs.otherAmt.value = Number(amount);
	}

	/**
	 * user updated other amount input field.
	 * NOTE: I had to remove type="number" from the input since was requested to remove the "selector";
	 * to avoid NaN and set 0 as min value I came up with this solution.
	 * @param e
	 */
	onOtherAmountChange(e) {
		let regExp = /\d+(\.\d*)?|\.\d+/;
		if(e === ''){
			this.refs.otherAmt.value = '';
			this.setState({
				activeAmount: 0
			});
		}else if(!_.isUndefined(e)){
			let selectedAmount = parseFloat(regExp.exec(e)?regExp.exec(e)[0] : 0);
    		this.validateAmount(selectedAmount);
			let otherAmt = (regExp.exec(e)?regExp.exec(e)[0] : 0).replace(/[^0-9.]/g, "");
			if(selectedAmount >= 1){
				this.refs.otherAmt.value = otherAmt.replace(/^0+/, '');
			}else{
				this.refs.otherAmt.value = otherAmt;
			}
			this.setState({
				activeAmount: selectedAmount
			});
		}
	}

	/**
	 * @param amount
	 * @returns {*}
	 */
	getButtonState(amount) {
		return cx('inline-element', 'lozenge', (amount == this.state.activeAmount) ? 'active' : '');
	}

	/**
	 * @returns {boolean}
	 */
	validateAmount(e) {
		var regExp = /\d+(\.\d*)?|\.\d+/
		const amount = parseFloat(regExp.exec(e)?regExp.exec(e)[0] : 0);
		if (_.isNaN(amount) || amount < 1) {
			this.setState({
				errorMessage: App.Intl('select_amount.error_message.valid_amount')
			});
			return false;
		}
		if (amount > App.session.execute('getChipsBalance')) {
			this.setState({
				errorMessage: App.Intl('chips_sell.errors.max_chips', {balance: App.session.execute('getChipsBalance')})
			});
			return false;
		}
		this.setState({
			errorMessage: ''
		});
		return true;
	}

	renderCurrency(){
		var currencySymbol = CURRENCY_SYMBOL_DICT[App.session.execute('getCurrency')] || App.session.execute('getCurrency');

		return (
			<span id="currencyValue">{currencySymbol}</span>
		);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		let currency = App.session.execute('getCurrency');
		let chipsBalance = App.session.execute('getChipsBalance');
		let formattedChipsBalance = <FormattedNumber value={chipsBalance} style="currency" currency={currency}/>;
		let btnClass =  cx({
			'btn btn-orange': true,
			'large': true,
			'phablet-block-btn': true,
			'disabled': this.state.errorMessage
		});
		return (
			<Form onSubmit={::this.onSubmit}>
				<div className="deposit-box chips-buysell">
					<div className="row">
						<div className="inline-element">
							<h2>
								{App.Intl('chips.view.current_balance')}&nbsp;
								<span className="highlighted">
									<FormattedNumber
										style="currency"
										value={App.session.execute('getChipsBalance')}
										currency={currency}
									/>
								</span>
							</h2>
						</div>
					</div>
					<div className="row">
						<h4>
							{App.Intl('chips.view.value_to_sell')}
						</h4>
						<div className="inline-element inline-form-element">
							<InputField
								ref="otherAmt"
								className="short dark"
								onChange={this.onOtherAmountChange.bind(this)}
								type="text"
								tooltip={false}
								validationOnExit={false}
								hideError
								tooltipHoverEl={false}
								value=""
								showError={this.state.errorMessage}
								noLabel
								placeHolder=""
								style={{borderRight:'0px'}}
							/>
						</div>

						{this.renderErrorMessage()}

						<div className="tablet-s-block">
							<div
								className={this.getButtonState(10)}
								onClick={this.onAmountChange.bind(this, 10)}
							>
								<FormattedNumber
									value={10}
									style="currency"
									currency={currency}
								/>
							</div>
							<div
								className={this.getButtonState(20)}
								onClick={this.onAmountChange.bind(this, 20)}
							>
								<FormattedNumber
									value={20}
									style="currency"
									currency={currency}
								/>
							</div>
							<div
								className={this.getButtonState(50)}
								onClick={this.onAmountChange.bind(this, 50)}
							>
								<FormattedNumber
									value={50}
									style="currency"
									currency={currency}
								/>
							</div>
							<div
								className={this.getButtonState(100)}
								onClick={this.onAmountChange.bind(this, 100)}
							>
								<FormattedNumber
									value={100}
									style="currency"
									currency={currency}
								/>
							</div>

						</div>
					</div>
					<div className="row">
						<div className="withdrawal-btn">
							<button className={btnClass}
									style={{cursor: 'pointer'}}
									type="submit">
								{App.Intl('chips.view.sell_chips.text')}
							</button>
						</div>
					</div>
				</div>
			</Form>
		);
	}

	renderErrorMessage() {
		if (this.state.errorMessage) {
			return (
				<div className="error-box">
					<p>{this.state.errorMessage}</p>
				</div>
			);
		}
		return false;
	}
}
