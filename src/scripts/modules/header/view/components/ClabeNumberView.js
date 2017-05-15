import './ClabeNumberView.scss';
import FormNumericalInput from 'app/components/formElements/forms/FormNumericalInput';
import service from 'sportsbook/service/SportsbookRestfulService';
import {classNames as cx} from 'common/util/ReactUtil';

class ClabeNumberView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			account: [0, 0, 0, 0],
			banks: [],
			validatedClabeNumber: ''
		}
		this.onForceRender = ::this.onForceRender;
		this.onRegisterClabe = ::this.onRegisterClabe;
		this.onSuccess = ::this.onSuccess;
	}

	componentDidMount() {
		const { model} = this.props;
		model.on('change:selectedPaymentMethod', this.onForceRender);
	}

	componentWillUnmount() {
		const { model} = this.props;
		model.off('change:selectedPaymentMethod', this.onForceRender);
	}

	onForceRender() {
		this.forceUpdate();
	}

	onChange(limit, index, value) {
		const { account } = this.state;
		if (value.length === limit) {
			if (index < 3) {
				const ref = `num${(index + 2)}`;
				const nextInput = this.refs[ref];
				nextInput.refs.wrapper.numericalInput.focus();
			}
			account[index] = value;
			this.validateAccountNumber(account);
		}
	}

	onDeleteClabe(id) {
		if (this.props.onDeletePaymentOption) {
			this.props.onDeletePaymentOption(id);
		}
	}

	validateAccountNumber(account) {
		if (account[0].length === 3 && account[1].length === 3 &&
			account[2].length === 11 && account[3].length === 1) {
			const clabeNumber = account[0] + account[1] + account[2] + account[3];
			if (this.props.onSetBankAccount) {
				this.props.onSetBankAccount(clabeNumber);
			} else
			{
				this.setState({validatedClabeNumber: clabeNumber})
			}
		}
	}

	onRegisterClabe() {
		const { validatedClabeNumber } = this.state;
		service.registerClabe('OPENPAY', validatedClabeNumber).then(this.onSuccess);
	}

	onSuccess() {
		if (!!this.props.onGetOptions) {
			this.props.onGetOptions();
		}
	}

	render() {
		if (App.Config.siteId !== 1)
			return null;

		const {validatedClabeNumber} = this.state;
		const isDeposit = !!this.props.deposit;
		const bankAccounts = isDeposit ? this.props.model.getOptionsByType('ACCOUNT') : this.props.model.get('withdrawalOptions');
		if (!bankAccounts) {
			return null;
		}
		else if (bankAccounts.length > 0) {
			return this.renderBankAccount(bankAccounts);
		}

		return (
			<div className="form-section">
				<div>
					<p> {App.Intl('withdraw_to_account.clabe_number')} </p>
					<div className="grid">
						<div className="c-clabe-number-view col-12">
							<FormNumericalInput name="num1"
												ref="num1"
												type="text"
												placeholder="XXX"
												maxLength={3}
												onChange={this.onChange.bind(this, 3, 0)}
							/>
							<FormNumericalInput name="num2"
												ref="num2"
												type="text"
												placeholder="XXX"
												maxLength={3}
												onChange={this.onChange.bind(this, 3, 1)}
							/>
							<FormNumericalInput name="num3"
												ref="num3"
												type="text"
												placeholder="XXXXXXXXXXX"
												maxLength={11}
												onChange={this.onChange.bind(this, 11, 2)}
							/>
							<FormNumericalInput name="num4"
												ref="num4"
												type="text"
												placeholder="X"
												maxLength={1}
												onChange={this.onChange.bind(this, 1, 3)}
							/>
						</div>
						<div className="col-12">
							{isDeposit &&
							<button className={cx('btn--primary ', {'disabled': !validatedClabeNumber})}
									type="button" onClick={ this.onRegisterClabe }>
								{'Add'}
							</button>}
						</div>
					</div>
				</div>
			</div>
		)
	}

	renderBankAccount(bankAccounts) {
		const account = bankAccounts[0];
		if (!account) {
			return null;
		}
		return (
			<div>
				<p> {App.Intl('withdraw_to_account.clabe_number')} </p>
				<h3>{account.displayName}</h3>
				<button className="c-btn--no-padding  c-btn--primary u-margin--bottom" type="button"
						onClick={this.onDeleteClabe.bind(this, account.id)}>
					{App.Intl('withdraw_to_account.delete_clabe')}
				</button>
			</div>
		)
	}
}

export default ClabeNumberView;
