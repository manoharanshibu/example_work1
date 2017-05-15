import './DepositConfirmView.scss';

import model from 'sportsbook/model/DepositModel';
import {FormattedNumber, FormattedDate} from 'react-intl';
import DoubleClick from 'sportsbook/components/tracking/DoubleClick';
import VeTracking from 'sportsbook/components/tracking/VeTracking';
import getBalanceCommand from 'sportsbook/command/GetBalanceCommand.js'
import sessionModel from "common/model/SessionModel";

export default class DepositConfirmView  extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			updateBalance: false,
			cashBalance: parseFloat(App.session.execute('getAllAvailable')).toFixed(2),
			currency: App.session.execute('getCurrency')
		};

		this.updateBalances =:: this.updateBalances;
	}

	componentDidMount(){
		sessionModel.on('change:wallets', this.updateBalances, this);
		getBalanceCommand();
	}

	componentWillUnmount() {
		this.mounted = false;
		sessionModel.off('change:wallets', this.updateBalances, this);
	}

	updateBalances(){
		let cashBalance = parseFloat(App.session.execute('getAllAvailable')).toFixed(2);
		let currency = App.session.execute('getCurrency');
		this.setState({
			cashBalance: cashBalance,
			currency: currency
		});
	}

	/**
	 * @returns {XML}
	 */

     onNavigateHome(){
		const cookie = Cookies.get('redirect');
		if (cookie) {
			const path = cookie.path;
			window.location.href = path;
			Cookies.remove('redirect');
			return;
		}
        App.navigate('/');
     }

	getParamsFromUrl(){
		//example: https://sportsbook-demo.amelco.co.uk/en/deposit/confirm?deposit=50&depositFee=0&bonus=0
		const {location} = this.props;
		const depositAmount = location.query.deposit || 0;
		const depositFee = location.query.depositFee || 0;
		const bonusDepAmount = location.query.bonus || 0;

		return {depositAmount, depositFee, bonusDepAmount};
	}

	/**
	 * In case the deposit amount exceeds the max deposit amount permitted for a bonus
	 * 	we want just to apply the max bonus amount.
	* */

	getBonusAmount(){
		let bonus = model.get('bonusDetails');
		let amount, maxBonusAmount;
		if(bonus){
			amount = model.get('activeAmount') * Number(bonus.bonusFactor);
			maxBonusAmount = bonus.maxDeposits * bonus.bonusFactor;
		}else{
			return 'None added';
		}

		if(amount > maxBonusAmount){
			return maxBonusAmount;
		}else{
			return amount;
		}

	}

	render() {
        let bonus = model.get('bonusDetails');
		let currency = this.state.currency;
		//in case the payment method is Paypal we pass parameters through the url
		let {depositAmount, depositFee, bonusDepAmount} = this.getParamsFromUrl();

		let bonusContent = bonus ? this.renderBonusMessage() : '';
		let bonusDepositAmount = bonusDepAmount === 0 ? this.getBonusAmount() : bonusDepAmount;
		let bonusAmount = isNaN(bonusDepositAmount) ? App.Intl('deposit.bonus.none_added') : <FormattedNumber value={bonusDepositAmount} style="currency" currency={currency} /> ;
		let trackingCat = 'beton00';
		let firstTimeDeposit = model.get('firstDeposit');
		let twitterTrackPid = 'nv66p';


		// TODO check if first time dep
		if (firstTimeDeposit) {
			trackingCat = 'beton0';
			twitterTrackPid = 'nv66k';
		}

		return (
			<div className="c-deposit-confirm">
            	<DoubleClick type="depos0" cat={trackingCat} qty={1} cost={model.get('activeAmount') || depositAmount} trackOnLoggedIn={true} twitterTrackPid={twitterTrackPid} />
            	<VeTracking params="journeycode=A96D2208-B587-418B-B145-D39C1505BA52" />
				<div className="grid">
					<h3 className="col-12 c-deposit-confirm__header"><i className="c-deposit-confirm__large-icon icon-check"></i> {App.Intl('deposit.deposit_successful')}</h3>
					<div className="col-6_md-12">
					    <p>{App.Intl('deposit.links.deposit') + ':'}
							<span className="u-float-right">
								<FormattedNumber value={model.get('activeAmount') || depositAmount} style="currency" currency={currency} />
							</span></p>

						<p>{App.Intl('deposit.payment_fee') + ' '} (<FormattedNumber value={0} style="percent" />):
							<span className="u-float-right">
								<FormattedNumber value={depositFee} style="currency" currency={currency} />
							</span></p>

						<p>{App.Intl('deposit.bonus') + ':'} <span className="u-float-right">{bonusAmount}</span></p>
						    {bonusContent}

						<div className="c-deposit-confirm__totals"><p>{App.Intl('deposit.total_paid_amount')}
							<span className="u-float-right">
								<FormattedNumber value={model.get('activeAmount') || depositAmount} style="currency" currency={currency} />
							</span></p>

							<p>{App.Intl('deposit.your_new_cash_balance')} <span className="u-float-right"><FormattedNumber value={this.state.cashBalance} style="currency" currency={currency} /></span></p>

							<div className="btn--black"
	    					style={{cursor: 'pointer'}}
	    					onClick={this.onNavigateHome.bind(this)}>{App.Intl('deposit.links.continue_betting')}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderBonusMessage(){
		let currency = this.state.currency;
		let bonus = model.get('bonusDetails');
		let bonusFactor = <FormattedNumber value={bonus.bonusFactor} style="percent" />;
		let maxBonusAmount = <FormattedNumber value={bonus.maxDeposits * bonus.bonusFactor} style="currency" currency={currency} />;
		let date = <FormattedDate value={bonus.date} day="numeric" month="long" year="numeric" />;

		return (
			<div className="msg-box">
				<p>
					{App.Intl('deposit.bonus_message.factor_explanation.first_part') + ' '}
					{bonusFactor}
					{' ' + App.Intl('deposit.bonus_message.factor_explanation.second_part') + ' '}
					{maxBonusAmount}.
				</p>
				<p>
					{App.Intl('deposit.bonus_message.valid_until') + ' '}
					{date}.
				</p>
				<p>{App.Intl('deposit.bonus_message.withdrawal_explanation_with_parms' , {factor: bonus.wageringFactor , minodds:bonus.minOdds , days: bonus.daysToFulfill})}</p>
			</div>
		);
	}
}

DepositConfirmView.displayName = 'DepositConfirmView';
