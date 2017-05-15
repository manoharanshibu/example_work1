import Component from 'common/system/react/BackboneComponent';
import FormInput from 'app/components/formElements/forms/FormInput';
import Form from 'app/components/formElements/forms/Form';
import service from 'sportsbook/service/ApiService';
import ChangePasswordModel from 'pea/model/ChangePasswordModel';
import {password2} from 'common/util/RegEx';

export default class ChangePassword extends Component {

	constructor(props) {
		super(props);
		this.state = {
			submitted: false,
			error: false,
			errorMsg: '',
			serverChecksCompleted: false,
			justChanged: false,
			justSubmitted: false
		};
		this.model = new ChangePasswordModel();
	}

	/**
	 *
	 */
	onSubmit({password, newpassword, confirm}) {


		if (!password2.test(confirm.value) || !password2.test(newpassword.value) || (_.isEmpty(password.value))) {
			if (_.isEmpty(password.value)) {
				this.refs.password.setState({isValid: false, errorMsg: App.Intl('change_password.new_password.error')});

			}

			if (!password2.test(newpassword.value)) {
				this.refs.newpassword.setState({
					isValid: false,
					errorMsg: App.Intl('change_password.new_password.error')
				});

			}

			if (!password2.test(confirm.value)) {
				this.refs.confirm.setState({isValid: false, errorMsg: App.Intl('change_password.new_password.error')});

			}

			return;
		}

		const username = App.session.execute('getUsername');

		service.changePasswordByUsername(username, password.value, newpassword.value)
			.then(resp => {
				if (resp.status && resp.status === 'SUCCESS') {
					this.onSetServerSuccess();
				}
			})
			.catch((resp) => {
				if (resp.Error.code == 'INVALID_CREDENTIALS') {
					this.setState({justSubmitted: true});
					this.refs.password.refs.input.focus();
					this.refs.password.setState({
						isValid: false,
						errorMsg: App.Intl('change_password.wrong_old_password')
					});
				} else {
					this.onSetErrors(resp.Error.value);
				}
			});
	}

	/**
	 * @param errorMsg
	 */
	onSetErrors(errorMsg) {
		this.setState({serverError: errorMsg});
	}

	/**
	 *
	 */
	onSetServerSuccess() {
		this.setState({justChanged: true});
	}

	/**
	 *
	 */
	onPasswordChange() {
		if (!this.state.justSubmitted) {
			this.refs.password.validate();
			if (_.isEmpty(this.refs.password.value())) {
				this.refs.password.setState({isValid: false, errorMsg: App.Intl('change_password.new_password.error')});
			}
		} else {
			this.setState({justSubmitted: false});
		}
	}

	onNewPasswordChange() {
		this.refs.newpassword.validate();
		if (!password2.test(this.refs.newpassword.value())) {
			this.refs.newpassword.setState({isValid: false, errorMsg: App.Intl('change_password.new_password.error')});
		}
	}

	onConfirmPasswordChange() {
		this.refs.confirm.validate();
		if (!password2.test(this.refs.confirm.value())) {
			this.refs.confirm.setState({isValid: false, errorMsg: App.Intl('change_password.new_password.error')});
		}
	}

	/**
	 * @type {{newpassword: *[], oldpassword: *[], confirm: *[]}}
	 */
	validators = {
		password: [
			{rule: val => password2.test(val), error: App.Intl('change_password.new_password.error')},
			{rule: val => this.state.justSubmitted != true, error: App.Intl('change_password.wrong_old_password')}
		],
		newpassword: [
			{rule: val => password2.test(val), error: App.Intl('change_password.new_password.error')},
			{rule: ::this.matchPasswords, error: App.Intl('change_password.not_matching')},
			{rule: ::this.notMatchUsername, error: App.Intl('register.password.error.match_username')}
		],
		confirm: [
			{rule: ::this.matchPasswords, error: App.Intl('change_password.not_matching')}
		]
	};

	/**
	 * Matches the password and password confirmation fields
	 * @param args
	 * @returns {boolean}
	 */
	matchPasswords() {
		const password = this.refs.newpassword.value();
		const confirm = this.refs.confirm.value();
		if (_.isEmpty(password) || _.isEmpty(confirm)) {
			return true;
		}
		return password === confirm;
	}

	/**
	 * Password must not match username
	 * @returns {boolean}
	 */
	notMatchUsername() {
		const password = this.refs.newpassword.value();
		const username = App.session.execute('getUsername');
		if (_.isEmpty(password) || _.isEmpty(username)) {
			return true;
		}
		return password !== username;
	}

	/**
	 * @returns {XML}
	 */
	render() {
		if (this.state.justChanged) {
			return (
				<div className="grid c-change-password">
					<div className="col">
						{App.Intl('change_password.submit.successful')}
					</div>
				</div>
			);
		}

		return (
			<div className="grid c-change-password">
				<div className="col-12">
					<header className="g-account__header">
						<h3>{App.Intl('pea.tabs.password', {})}</h3>
					</header>
					<Form onSubmit={::this.onSubmit} className="c-change-password__form grid" autoComplete="nope">
						{/*We cannot have password validation here due to legacy users not having the
						 same password standards. DO NOT ADD VALIDATION BACK IN HERE!!!
						 Of course, the new password fields should have validation so don't remove
						 from there.*/}

					<div className="col-3_lg-6_md-6_sm-7_xs-12">
						<FormInput ref="password"
							   name="password"
							   type="password" autoComplete="nope"
							   label={App.Intl('change_password.old_password.label')}
							   placeHolder={App.Intl('change_password.old_password.place_holder')}
							   onValidityChange={::this.onPasswordChange}
							   rules={this.validators.password}
							   valueLink={this.bindTo(this.props.model, 'oldPassword')}
							   icon="entypo-lock"
						/>

						<FormInput ref="newpassword"
							   name="newpassword"
							   type="password" autoComplete="nope"
							   label={App.Intl('change_password.new_password.label')}
							   placeHolder={App.Intl('change_password.new_password.place_holder')}
							   onValidityChange={::this.onNewPasswordChange}
							   icon="entypo-lock"
							   rules={this.validators.newpassword}
							   valueLink={this.bindTo(this.props.model, 'newPassword')}
						/>

						<FormInput ref="confirm"
							   name="confirm"
							   type="password" autoComplete="nope"
							   label={App.Intl('change_password.confirm.label')}
							   placeHolder={App.Intl('change_password.confirm.place_holder')}
							   valueLink={this.bindTo(this.props.model, 'confirmPassword')}
							   onValidityChange={::this.onConfirmPasswordChange}
							   icon="entypo-lock"
							   rules={this.validators.confirm}
						/>
					</div>
					<div className="col-12 grid">
						<div className="col-5_lg-6_md-8_sm-10_xs-12 c-change-password">
								{!!this.state.serverError && (
									<div className="error-info">
										<p dangerouslySetInnerHTML={{__html: _.titleize(this.state.serverError)}}>
										</p>
									</div>
								)}
								{App.Intl('change_password.password_allowed_combination')}
							</div>
							<div className="col-12">
							<button className="btn--primary--large"
									type="submit">
								{App.Intl('change_password.submit.label')}
							</button>
						</div>
					</div>
				</Form>
				</div>
			</div>
		);
	}
}
