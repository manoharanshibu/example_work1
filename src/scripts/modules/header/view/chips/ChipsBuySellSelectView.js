import {classNames as cx} from 'common/util/ReactUtil';

export default class ChipsBuySellSelectView  extends React.Component {
	constructor(props) {
		super(props);
		_.bindAll(this, 'onBuySellClick');
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
	onBuySellClick(selection, e) {
		this.onNavigate(selection);
	}

	/**
	 *
	 * @param paymentBrand
	 * @returns {*}
	 */
	getButtonState() {
		return cx('btn btn-blue large');
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<div className="deposit-box chips-prompt">
				<div className="row">
					<span className="empty-notice">

					</span>
          <div className="spacer">

					</div>
					<div className={this.getButtonState()}
						 onClick={this.onBuySellClick.bind(this, 'chips/buy')}>
						{App.Intl('chips.view.buy_chips.text')}
					</div>
					<div className={this.getButtonState()}
						 onClick={this.onBuySellClick.bind(this, 'chips/sell')}>
						{App.Intl('chips.view.sell_chips.text')}
					</div>
				</div>
			</div>
		);
	}
}
