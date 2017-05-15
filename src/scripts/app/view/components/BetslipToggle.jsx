import './BetslipToggle.scss';
import {classNames as cx} from 'common/util/ReactUtil';
import betsModel from "sportsbook/model/domain/BetsModel";

export default class BetslipToggle extends React.Component {

	constructor(props) {
		super(props);

		this.onUpdateTotaltotalBets = this.updateTotaltotalBets.bind(this);

		this.state = {
			totalBets: _.values(betsModel.singleBets).length
		};
	}

	componentDidMount() {
		betsModel.on('bets:updateTotalNumberOfBets', this.onUpdateTotaltotalBets);
		betsModel.on('bets:clearSingleBets', this.onUpdateTotaltotalBets);
	}

	componentWillUnmount() {
		betsModel.off('bets:updateTotalNumberOfBets', this.onUpdateTotaltotalBets);
		betsModel.off('bets:clearSingleBets', this.onUpdateTotaltotalBets);
	}

	updateTotaltotalBets() {

		const count = _.values(betsModel.singleBets).length;

		if(count != this.state.totalBets){
			this.setState({betJustAdded: true})
			setTimeout(() => {
				this.setState({betJustAdded:false})
			}, 300);
			this.setState({totalBets: _.values(betsModel.singleBets).length});
		}
	}

	betSlipToggle() {
		App.bus.trigger('betslip:toggle');
	}

	renderBetslipIcon() {
		const totalBets = this.state.totalBets;

		return (
			<span className="c-betslip-toggle__closed" onClick={this.betSlipToggle.bind(this)}>
				<span
					className={cx(
						"c-betslip-toggle__lozenge--closed",
						"c-betslip-toggle__lozenge",
						"g-lozenge--danger",
						{"u-pulsate": this.state.betJustAdded}
					)}
				>{totalBets}</span>
				<i className="c-betslip-toggle__icon--closed c-betslip-toggle__icon icon-document-text"></i>
			</span>
		);
	}

	render() {
		return (
			<div className={cx("c-betslip-toggle", this.props.className)}>
				{this.renderBetslipIcon()}
			</div>
		);
	}
}
