import Component from 'common/system/react/BackboneComponent';
import service from 'sportsbook/service/ApiService';
import model from 'pea/model/PersonalDetailsModel';

export default class DepositNotAllowedView  extends Component {
	constructor(props) {
		super(props);

		_.bindAll(this, 'onSendConfEmailSuccess', 'onSendConfEmailError', 'resendConfirmationEmail');
	}

	/**
	 * @returns {XML}
	 */
	render() {
		var location = this.props.location;
		var hasEmailState = location.state && location.state.hasOwnProperty('emailSent');
		var isEmailSent = hasEmailState && location.state.emailSent;
		var message = App.Intl("deposit.account_restricted");

		if (isEmailSent){
			return this.renderEmailSent();
		}

		return ( <div className="row">{message}</div>);
	};

	resendConfirmationEmail(){
		var email = model.get('email');

		service.resendEmailConfirmationCode(email)
			.then( this.onSendConfEmailSuccess, this.onSendConfEmailError );
	}

	onSendConfEmailSuccess(resp){
		if(resp.Result && resp.Result.status === 'SUCCESS'){
			this.setState({ errorMsg: '' });

			App.bus.trigger('popup:notification', {
				title: App.Intl("register.titles.confirm"),
				content: <p style={{lineHeight: 'initial'}}>{App.Intl("register.new_confirmation_email_sent")}</p>
			});
		} else {
			this.onSendConfEmailError();
		}
	}

	onSendConfEmailError(){
		App.bus.trigger('popup:notification', {
			title: App.Intl("register.titles.confirm"),
			content: <p style={{lineHeight: 'initial'}}>{App.Intl("register.server_error.resending_confirmation_email")}</p>
		});
	}


	renderEmailSent(){
		return (
			<div>
				<div className="row">
					{App.Intl("deposit.verification_required_before_deposit")}
				</div>
				<div className="row">
					<button className="btn btn-blue"
						style={{float: 'none'}}
						type="button"
						onClick={this.resendConfirmationEmail}>{App.Intl("register.resend_confirmation_email")}</button>
				</div>
			</div>
		);
	}
}
