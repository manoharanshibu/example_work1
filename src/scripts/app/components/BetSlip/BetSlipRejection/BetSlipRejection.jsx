import './BetSlipRejection.scss';

import betsModel from 'sportsbook/model/domain/BetsModel';
import selectedBets from 'sportsbook/model/bets/SelectedBetsModel.js';
import {Link} from "react-router";

export default class BetSlipRejection extends React.Component {

	constructor() {
		super();
		betsModel.on("bets:addRejections", this.onAddRejections, this);
		selectedBets.on('remove:selection', this.onSelectionClickRemove, this);
		selectedBets.on('bets:selectionLimit', this.onSelectionLimit, this);
		betsModel.on("bets:clearSingleBets", this.onClearSingleBets, this);

		this.state = {
			rejectedBets: [],
			reasonCode: ""
		};
	}

	/**
	 * Cleanup
	 */
	componentWillUnmount() {
		betsModel.off('bets:addRejections');
		selectedBets.off('remove:selection');
		selectedBets.off('bets:selectionLimit', this.onSelectionLimit, this);
		betsModel.off('bets:clearSingleBets');
	}

	onClearSingleBets() {
		this.setState({rejectedBets: [], reasonCode: ""});
	}

	onSelectionClickRemove() {
		if (this.state.status === 'RESTRICTED_PROHIBIT_SINGLES') {
			this.setState({rejectedBets: [], reasonCode: ""});
		}
	}

	onSelectionLimit() {
		const reasonCode = App.Intl('betslip.error.max_selections');
		this.setState({reasonCode: reasonCode, status: "MAX_SELECTIONS"});
		const target = this.refs.betRejection;
		if(target){
			const alignWithTop = false;
			target.scrollIntoView(alignWithTop);
		}

	}

	onAddRejections(rejectedBetsObj) {
		if (!_.isUndefined(rejectedBetsObj)) {
			const betRejections = rejectedBetsObj.bets;
			const reasonCode = rejectedBetsObj.reasonCode;
			const status = rejectedBetsObj.status;

			this.setState({rejectedBets: betRejections, reasonCode: reasonCode, status: status});
		}
	}

	addExtraError(errorCode) {

		let errorMessage;

		switch (errorCode) {
		    case 'INSUFFICIENT_FUNDS':
		    	return (
		    		<span>
		    			&nbsp;Do you want to <Link className="active" to={`/${App.Globals.lang}/deposit/amount`}>deposit money</Link> to your account?
		    		</span>
	    		)
		    break;
		    default:
		        return false;
		}

	}

	render() {
		//TODO: if there is no error but the bet has failed we need some default error message rather than displaying an empty box.
		if (this.state.reasonCode === "") { return null; }

		return (
			<div ref="betRejection" className="c-bet-slip-rejection-view row bet-row error-box error-box--save-selection" >
				{this.state.rejectedBets.length > 0 && (
					<span>
						{App.Intl('betslip.bet_rejected', {
							num: this.state.rejectedBets.length,
							plural: this.state.rejectedBets.length > 1
								? 's'
								: ''
						})}
					</span>
				)}
				<span>{this.state.reasonCode}</span>

				{this.addExtraError(this.state.status)}

			</div>
		);
	}

};

BetSlipRejection.defaultProps = {
	collection: []
};
