export default class BuyErrorView extends React.Component {
	constructor(props) {
		super(props);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
				<div className="deposit-box">
					<div className="row">
						<div className="inline-element">
							<br/>
							{this.renderErrorMessage()}
						</div>
					</div>
				</div>
		);
	}

	renderErrorMessage(){

		return (
				<div className="error">
					<h4>{App.Intl('buy_chips.error.not_successful')}
					</h4>
				</div>
			);
	}
}
BuyErrorView.displayName = 'BuyErrorView';
