import "./BetSlipConfirmation.scss";

/**
 * Created by ianrotherham on 11/09/2015.
 */
import betsModel from "sportsbook/model/domain/BetsModel";
import sessionModel from "common/model/SessionModel";
import whatsMySegmentsModal from "sportsbook/model/WhatsMySegmentModel.js";
import {FormattedNumber} from "react-intl";

import './BetSlipConfirmation.scss';

export default class BetSlipConfirmation extends React.Component {

	constructor() {
		super();

		_.bindAll(this, 'renderAcceptedBetParts', 'renderAcceptedBets', 'onShowConfirmationView', 'onContinueBetting');
		betsModel.on("bets:showConfirmationView", this.onShowConfirmationView.bind(this));
		App.session.on('session:loggedin', this.onLogin.bind(this));

		this.state = {
			acceptedBets: betsModel.acceptedBetsCollection,
			totalStake: 0,
			taxOnBetPercentage: 0,
			taxType: "stake",
			taxableAmount: 0
		};
		this.saveSelections = false;
		this.currency = sessionModel.getCurrency();
	}

	/**
	 * Cleanup
	 */
	componentWillUnmount() {
		betsModel.off('bets:showConfirmationView');
		App.session.off('session:loggedin');
	}

	onLogin() {
		this.currency = sessionModel.getCurrency();
		this.updateState();
	}

	updateState() {
		const taxType = whatsMySegmentsModal.getApplicableTaxType();
		let taxAmount = 0;
		let totalStake = 0;
		let totalStakeExcludingTax = 0;
		let potentialPayout = 0;

		for (let i = 0; i < betsModel.acceptedBetsCollection.length; i++) {
			const betWrapper = betsModel.acceptedBetsCollection[i];
			const totalTaxableStake = parseFloat(betWrapper.stake) - betWrapper.freeBetStake;

			totalStakeExcludingTax += parseFloat(totalTaxableStake);
			totalStake += parseFloat(betWrapper.stake);

			if (betWrapper.isFreeBet === false) {
				potentialPayout += parseFloat(betWrapper.potentialPayout);
			} else {
				//Additional stake added.
				const taxablePotentialPayout = betWrapper.isEachWay === true ? parseFloat(betWrapper.potentialPayout) : parseFloat(betWrapper.totalOdds * totalTaxableStake);
				potentialPayout += taxablePotentialPayout;
			}
		}

		if (taxType === "winnings") {
			taxAmount = potentialPayout;
		} else if (taxType === 'stake') {
			taxAmount = totalStakeExcludingTax;
		}
		const applicableTax = whatsMySegmentsModal.getApplicableTax(taxAmount);
		const totalTaxableAmount = this.calculateTaxableAmount(taxAmount);

		for (let j = 0; j < betsModel.acceptedBetsCollection.length; j++) {
			const betWrapper = betsModel.acceptedBetsCollection[j];
			if (betWrapper.isFreeBet === false) {
				const potentialPayout = parseFloat(betWrapper.potentialPayout);
				const taxableAmount = this.calculateTaxableAmount(potentialPayout);
				betWrapper.potentialPayout = taxType === "winnings"
					? potentialPayout - taxableAmount
					: potentialPayout;
			} else {
				//Additional Stake added FreeBet so we can tax.
				let taxableStake = parseFloat(betWrapper.stake) - betWrapper.freeBetStake;
				let taxedStake = taxableStake;
				if (taxableStake > 0) {
					if (taxType === "stake") {
						taxedStake = parseFloat(this.calculateTaxableAmount(taxableStake));
						taxableStake = taxableStake - taxedStake;
					}
					let taxablePotentialPayout = betWrapper.isEachWay === true ? parseFloat(betWrapper.potentialPayout) : parseFloat(betWrapper.totalOdds * taxableStake);
					const taxableAmount = parseFloat(this.calculateTaxableAmount(taxablePotentialPayout));
					const noneTaxablePotentialPayout = parseFloat(betWrapper.totalOdds * betWrapper.freeBetStake);
					const freeBetPotentialPayout = noneTaxablePotentialPayout - betWrapper.freeBetStake;
					taxablePotentialPayout += freeBetPotentialPayout;
					betWrapper.potentialPayout = taxType === "winnings"
						? taxablePotentialPayout - taxableAmount
						: taxablePotentialPayout;
				}
			}
		}

		this.setState({
			acceptedBets: betsModel.acceptedBetsCollection,
			totalStake: parseFloat(totalStake).toFixed(2),
			taxOnBetPercentage: applicableTax.taxPercentage,
			taxType: taxType,
			taxableAmount: totalTaxableAmount
		});
	}

	calculateTaxableAmount(taxAmount) {
		const applicableTax = whatsMySegmentsModal.getApplicableTax(taxAmount);
		if (applicableTax.taxPercentage > 0) {
			const taxPercentage = applicableTax.taxPercentage / 100;
			const taxedPayout = taxAmount * taxPercentage;
			const taxableAmount = parseFloat(taxedPayout).toFixed(2);
			return taxableAmount;
		}
		return 0;
	}

	onShowConfirmationView() {
		this.updateState();
	}

	onContinueBetting() {
		if (!betsModel.saveSelections) {
			betsModel.clearAllBets();
		}
		this.props.onContinueBetting();
	}

	render() {
		return (
			<div className="c-bet-slip-confirmation">
				<div className="c-bet-slip-confirmation__headline">
					<h5 className="c-bet-slip-confirmation__header">
						{this.state.acceptedBets.length !== 1
							? App.Intl('betslip.num_bet_placed_plural', {num: this.state.acceptedBets.length})
							: App.Intl('betslip.num_bet_placed', {num: this.state.acceptedBets.length})}
					</h5>
					<span className="c-bet-slip-confirmation__betId">
						{App.Intl('betslip.ref')}&nbsp;{this.state.acceptedBets['0']
							? this.state.acceptedBets['0'].betSlipId
							: ''}
					</span>
				</div>

				{this.state.acceptedBets.map(this.renderAcceptedBets)}
				<div className="c-bet-slip-confirmation__summary">

						<span className="c-bet-slip-confirmation__left">
							{App.Intl('betslip.total_stake') + ': ' }
						</span>
						<span className="c-bet-slip-confirmation__right">
							<FormattedNumber
								value={parseFloat(this.state.totalStake).toFixed(2)}
								style="currency" currency={this.currency}
							/>

						</span>

				</div>

				<button type="button" className="c-bet-slip-confirmation__button btn--secondary" onClick={this.onContinueBetting.bind(this)}>
					{App.Intl('betslip.bet_again')}
				</button>
			</div>
		);
	}

	renderAcceptedBets(model, index) {
		const betWrapper = model;
		return (
			<div className="c-selection-group" key={index}>
				<div className="c-selection-group__header">
					<span className="c-selection-group__info">
						{betWrapper.type === 'SINGLE'
							? 'SINGLE'
							: betWrapper.name}
						<span className="c-selection-group__date">
							{moment(betWrapper.betTime).format('DD.MM.YYYY')}
						</span>
					</span>
				</div>
				<div className="c-selection-group__summary">
					{betWrapper.betParts.map(this.renderAcceptedBetParts)}
					<span className="c-selection-group__stake">
						{App.Intl('betslip.stake') + ': '}
						<span className="c-selection-group__formatted-number">
							<FormattedNumber
								value={parseFloat(betWrapper.stake - betWrapper.taxOnStakeAmount).toFixed(2)}
								style="currency"
								currency={this.currency}
							/>
						</span>
					</span>
					<span className="c-selection-group__potential-returns">
						{App.Intl('betslip.potential_returns') + ': '}
						<span className="c-selection-group__formatted-number">
							<FormattedNumber
								value={parseFloat(betWrapper.potentialPayout).toFixed(2)}
								style="currency"
								currency={this.currency}
							/>
						</span>
					</span>
				</div>
			</div>
		);
	}

	renderAcceptedBetParts(model, index) {
		const bet = model;

		return (
			<ul className="c-selection-group__list g-menu" key={index}>
				<li className="topRow">
					{bet.betPart.selection.eventName}
				</li>
				<li className="market-odds">
					{bet.betPart.selection.marketName}
				</li>
				<li className="market-odds pull-right">
					{bet.betPart.selection.selectionName}
					@
					<span className="returnVal">{bet.betPart.selection.decimalOdds}</span>
				</li>
			</ul>
		);

	}
}

BetSlipConfirmation.defaultProps = {
	collection: []
};
