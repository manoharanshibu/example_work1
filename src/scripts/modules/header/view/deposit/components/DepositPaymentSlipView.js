import './DepositPaymentSlipView.scss'
import model from "sportsbook/model/PaymentSlipModel";
import {CURRENCY_SYMBOL_DICT} from 'app/AppConstants';

export default class DepositPaymentSlipView extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var currencySymbol = CURRENCY_SYMBOL_DICT[App.session.execute('getCurrency')] || App.session.execute('getCurrency');
		return (
			<div className="c-deposit-payment-slip">
				<div className="row">
					<div className="inline-element">
						<div className="col-12 ">
							<h3>{App.Intl('deposit.spei.internalbank_transfer')}</h3>
							<p><b>{App.Intl('deposit.spei.payment_due_date')}</b> {moment(model.get('dueDate')).format('DD/MM/YYYY HH:mm')}</p>
						</div>
						<div className="c-deposit-payment-slip__instructions">
							<p><h4>{App.Intl('deposit.spei.bancomer.title')}</h4></p>
							<p>{App.Intl('deposit.spei.bancomer.instruction_1')}</p>
							<p><b>{App.Intl('deposit.spei.bancomer.enter_cie')}</b> {model.get('agreement')}</p>
							<p>{App.Intl('deposit.spei.bancomer.instruction_2')}</p>
							<p><b>{App.Intl('deposit.spei.bancomer.reference')}</b> {model.get('reference')}</p>
							<p><b>{App.Intl('deposit.spei.bancomer.amount_to_pay')}</b> {`${currencySymbol}${model.get('amount')}`}</p>
							<p><b>{App.Intl('deposit.spei.bancomer.description')}:</b> {App.Intl('deposit.spei.bancomer.description.text')}</p>
						</div>
						<div className="c-deposit-payment-slip__instructions">
							<p><h4>{App.Intl('deposit.spei.other_banks.title')}</h4></p>
							<p>{App.Intl('deposit.spei.other_banks.instruction_1')}</p>
							<p><b>{App.Intl('deposit.spei.other_banks.name_of_company')}</b> {model.get('recipientCompany')}</p>
							<p><b>{App.Intl('deposit.spei.other_banks.name_of_bank')}</b> {model.get('recipientBank')}</p>
							<p><b>{App.Intl('deposit.spei.other_banks.clabe')}</b> {model.get('clabe')}</p>
							<p><b>{App.Intl('deposit.spei.other_banks.payment_description')}</b> {model.get('reference')}</p>
							<p><b>{App.Intl('deposit.spei.other_banks.reference')}</b> {model.get('agreement')}</p>
							<p><b>{App.Intl('deposit.spei.other_banks.amount_to_pay')}</b> {`${currencySymbol}${model.get('amount')}`}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
