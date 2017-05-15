import {FormattedNumber} from 'react-intl';

export default class DepositPaymentView  extends React.Component {
	constructor(props) {
		super(props);
	}

	onNavigateToPrevious(){
		App.navigate('deposit/amount');
	}

    render(){
        const backBtnText = App.Intl('deposit.links_back_to_amount');
        let secureText = App.Intl('deposit.payments_are_secure_and_encrypted');

      return (
        <div className="deposit-box">
            {/*<p><strong>{App.Intl('deposit.select_your_payment_method')}</strong></p>

            <p>{secureText}</p>

			<a className="text-link tablet-s-show" href="javascript:void(0)" onClick={this.onNavigateToPrevious.bind(this)} style={{margin: '15px 0 15px 0', display: 'block'}}><i className="icon-chevron-left"></i>{backBtnText}</a>*/}
        </div>
		);
    }

}
