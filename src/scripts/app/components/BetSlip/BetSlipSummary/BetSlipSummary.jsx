import './BetSlipSummary.scss';

import betsModel from 'sportsbook/model/domain/BetsModel';
import sessionModel from 'common/model/SessionModel';
import whatsMySegmentsModal from 'sportsbook/model/WhatsMySegmentModel.js';
import betSlipController from 'sportsbook/controller/BetSlipController';
import {classNames as cx} from "common/util/ReactUtil";
import {FormattedNumber} from 'react-intl';

export default class BetSlipSummary extends React.Component {
	constructor() {
		super();

		const taxType = whatsMySegmentsModal.getApplicableTaxType();

		_.bindAll(this, 'onUpdateTotalNumberOfBets', 'updateState', 'onLogin');
		betsModel.on('bets:updateTotalNumberOfBets', this.onUpdateTotalNumberOfBets, this);
		betsModel.on('bets:updateEstimatedReturns', this.onUpdateEstimatedReturns, this);
		App.session.on('session:loggedin', this.onLogin.bind(this));

		// When the betslip is initialized the totalStake is 0
		const applicableTax = whatsMySegmentsModal.getApplicableTax(0);

		this.state = {
			totalBets: 0,
			potentialReturns: 0,
			totalStake: 0,
			totalOdds: 0,
			taxOnBetPercentage: applicableTax.taxPercentage,
			taxType: taxType,
			taxableAmount: betsModel.getTaxableAmount(taxType)
		};

		this.currency = sessionModel.getCurrency();
	}

	componentWillMount() {
		this.updateState();
	}

	componentWillUnmount() {
		betsModel.off('bets:updateTotalNumberOfBets');
		betsModel.off('bets:updateEstimatedReturns');
		App.session.off('session:loggedin');
	}

	onLogin() {
		this.currency = sessionModel.getCurrency();
		this.updateState();
	}

	updateState() {
		let taxAmount = 0;
		const totalStake = betsModel.totalStake();
		const taxType = whatsMySegmentsModal.getApplicableTaxType();
		const taxableAmount = betsModel.getTaxableAmount(taxType);
		const potentialReturns = betsModel.estimatedReturns();
		let totalOdds = betsModel.totalOdds();
		if (isNaN(totalOdds)) {
			totalOdds = 0;
		}
		if (taxType === "winnings") {
			taxAmount = potentialReturns;
		} else if (taxType === 'stake') {
			taxAmount = totalStake;
		}
		const applicableTax = whatsMySegmentsModal.getApplicableTax(taxAmount);

		this.setState({
			totalBets: betsModel.getTotalNumberOfBets(),
			potentialReturns: taxType === "winnings"
				? potentialReturns - taxableAmount
				: potentialReturns,
			totalStake: totalStake,
			totalOdds: totalOdds,
			taxOnBetPercentage: applicableTax.taxPercentage,
			taxType: taxType,
			taxableAmount: taxableAmount,
			saveSelections: betsModel.saveSelections
		});
	}

	/**
	 * @param e
	 */
	onSaveSelections(e) {
		betsModel.saveSelections = e.currentTarget.checked;
		this.updateState();
	}

	onUpdateTotalNumberOfBets() {
		this.updateState();
	}

	onUpdateEstimatedReturns() {
		this.updateState();
	}

	onPriceInfoChange(e) {
		switch (e.target.value) {
			case 'ACCEPT_NO_ODDS_CHANGES':
				betSlipController.priceChangeState = 'ACCEPT_NO_ODDS_CHANGES';
				break;
			case 'ACCEPT_HIGHER_ODDS':
				betSlipController.priceChangeState = 'ACCEPT_HIGHER_ODDS';
				break;
			case 'ACCEPT_ALL_ODDS':
				betSlipController.priceChangeState = 'ACCEPT_ALL_ODDS';
				betSlipController.removeAllPriceChanges();
				break;
			default:
				betSlipController.priceChangeState = 'ACCEPT_NO_ODDS_CHANGES';
				break;
		}
		this.forceUpdate();
	}

	render() {
		const isEmpty = _.values(betsModel.singleBets).length === 0;
		const summaryClass = cx('c-betslip-summary', {'c-betslip-summary--is-empty' : isEmpty});

		return (

			<div className={summaryClass}>
				{!isEmpty &&(
					<div>
						<div className="c-betslip-summary__section c-betslip-summary__section--accept">
							<span>
								{App.Intl('betslip.accept')}
							</span>
							<span>
								{this.renderPriceChangeOptions()}
							</span>
						</div>

						<div className="c-betslip-summary__section">
							<span>
								{App.Intl('betslip.number_of_bets')}
							</span>
							<span className="c-betslip-summary__amount">
								{this.state.totalBets}
							</span>
						</div>

						<div className="c-betslip-summary__section">
							<span>
								{App.Intl('betslip.total_stake')}
							</span>
							<span className="c-betslip-summary__amount">
								<FormattedNumber value={this.state.totalStake} style="currency" currency={this.currency}/>
							</span>
						</div>

						<div className="c-betslip-summary__section c-betslip-summary__section--potential-winnings">
							<span>
								{App.Intl('betslip.potential_winnings')}
							</span>
							<span className="c-betslip-summary__amount">
								<FormattedNumber value={parseFloat(this.state.potentialReturns).toFixed(2)} style="currency" currency={this.currency}/>
							</span>
						</div>
						{/*
 						{_.values(betsModel.singleBets).length === 0
 							? ''
 							: this.saveBetsView()}
 						*/}

					</div>
				)}


				<span className={cx('c-betslip-summary__empty-notice', {'is-hidden': _.values(betsModel.singleBets).length !== 0})}>
					{App.Intl('betslip.bet_not_selected')}
				</span>
				<div className="c-betslip-summary__error-box is-hidden">
					<p>{App.Intl('betslip.error.exceed_maximum_winnings')}</p>
					<button>{App.Intl('betslip.set_stake_to_max')}</button>
				</div>
			</div>
		);
	}

	renderPriceChangeOptions() {
		return (
			<select className="g-select-field c-betslip-summary__price-change-options" value={ betSlipController.priceChangeState } defaultValue={'ACCEPT_NO_ODDS_CHANGES'} onChange={this.onPriceInfoChange.bind(this)}>
				<option value="ACCEPT_NO_ODDS_CHANGES">{App.Intl('betslip.no_odds_changes')}</option>
				<option value="ACCEPT_HIGHER_ODDS">{App.Intl('betslip.higher_odds')}</option>
				<option value="ACCEPT_ALL_ODDS">{App.Intl('betslip.all_odds')}</option>
			</select>
		);
	}

	/**
	 * @returns {XML}
	 */
	saveBetsView() {
		return (
			<div className="col-12">
				<label className="g-label">
					<input type="checkbox" className="g-input-field g-input-field--checkbox c-betslip-summary__checkbox" checked={this.state.saveSelections} name="saveSelections" onClick={this.onSaveSelections.bind(this)}/>
					Save Selections
				</label>
			</div>
		);
	}

};

BetSlipSummary.defaultProps = {
	collection: []
};
