/**
 * Created by ianrotherham on 07/01/2016.
 */
import betsModel from 'sportsbook/model/domain/BetsModel';
import {BETSLIP_LOADED} from 'app/AppConstants';
import {classNames as cx} from "common/util/ReactUtil";
import {FormattedNumber} from 'react-intl';

import './ClosedBets.scss';

export default class ClosedBets extends React.Component {
	constructor() {
		super();
		_.bindAll(this, 'onLogin', 'renderClosedBets');
		App.session.on('session:loggedin', this.onLogin);

		this.state = {
			closedBets: [],
			showingBets: [],
			betsLength: 0,
			betsToShow: 10
		};

		this.latestBet = ['', ''];
		this.currency = App.session.execute('getCurrency');

		this.onClosedBetsComplete = ::this.onClosedBetsComplete;
	}

	componentDidMount() {
		betsModel.on('bets:closedBetsViewDataComplete', this.onClosedBetsComplete);
	}

	componentWillUnmount() {
		betsModel.off('bets:closedBetsViewDataComplete', this.onClosedBetsComplete);
	}

	onClosedBetsComplete(closedBets) {
		const bets = _.values(closedBets);
		this.setState({
			closedBets: bets,
			showingBets: _.take(bets, this.state.betsToShow),
			betsToShow: 10,
			betsLength: bets.length
		});

		this.forceUpdate();
		App.bus.trigger(BETSLIP_LOADED);
	}

	onLogin() {
		this.setState({betsToShow: 10});

		this.latestBet = ['', ''];
	}

	getTenMoreBets() {
		const bet = this.state.closedBets;
		const index = this.state.betsToShow + 10;

		this.setState({
			betsToShow: index,
			showingBets: _.take(bet, index)
		});
	}



	render() {
		if (_.isEmpty(this.state.closedBets)) {
			return (
				<div className="c-closed-bets__summary">
					<div className="c-closed-bets__summary">
						<i className="icon-info"></i>
            {App.Intl('betslip.no_settled_bets')}
					</div>
				</div>
			);
		} else  {
			return (
				<div className="c-closed-bets">
					<div className="c-closed-bets__summary">
						<i className="icon-info"></i> {App.Intl('betslip.number_of_settled_bets', {num: this.state.betsToShow.toString()})}
					</div>

					<div className="c-closed-bets__body">
						{this.state.showingBets.map(this.renderClosedBets)}
					</div>
					<div className="c-closed-bets__more-button">
						{this.renderMoreButton()}
					</div>
				</div>
			);
		}
	}

	renderClosedBets(bet) {
		if(bet.type === "SINGLE") {
			return this.renderSingleBets(bet);
		} else {
			return this.renderMultipleBets(bet);
		}
	}

	renderSingleBets(bet) {
		const parts = bet.parts,
			indexBet = bet.id,
			betPartRows = [];

		parts.betPart.map((betPart, index) => {
			let oddsValue = parseFloat(betPart.odds.decimal).toFixed(2);

			if (bet.priceFormat === 'FRACTION') {
				oddsValue = betPart.odds.fractional;
			} else if (bet.priceFormat === 'AMERICAN') {
				oddsValue = betPart.odds.american;
			}
			betPartRows.push(this.renderCompactSingles(bet, betPart, oddsValue, index));

		});

		return (
			<div className="c-closed-bets__section" key={indexBet}>
				{betPartRows}
			</div>
		);
	}

	renderCompactSingles(bet, betPart, oddsValue, index) {
		const outcome = bet.displayStatus,
			showWin = (outcome === 'WIN');

		const newLatest = [
			betPart.event.name,
			betPart.market.name
		];

		const groupClassName = cx('c-closed-bets__row', {'c-closed-bets__single-bet-group--won': showWin, 'c-closed-bets__single-bet-group--lost': !showWin});

		const toRender =  (
			<div className={groupClassName} key={index}>
				<header className="c-closed-bets__section-header">
					<h4 className="c-closed-bets__section-title">
						{'SINGLE' + (bet.winType === 'EACH_WAY'
							? ' E/W ' + bet.placementTerms
							: '')}
						<span className="c-closed-bets__single-bet-group-sub-title u-fade u-float-right">
							<span className="c-closed-bets__single-bet-group-sub-title-date">{moment(bet.betTime).format('D MMM YYYY')}</span>&nbsp;
							<span>{moment(bet.betTime).format('h:mm A')}</span>
						</span>
					</h4>
				</header>

				<div className="c-closed-bets__selection-rows">
					<div className="row">
						<span className="strong">
							{betPart.event.name}
						</span>
						&#160;&#160;
						{bet.liveBet && (
							<span>
								({App.Intl('mybets.bet_status.live')})
							</span>
						)}
					</div>

					<div className="u-fade">{betPart.market.name}</div>

					<div className="row">
						<span>{App.Intl('betslip.pick')}:&nbsp;</span>
						<span>
							{betPart.selection.name}&nbsp;
						</span>
						<span className="u-float-right">
							@{parseFloat(oddsValue).toFixed(2)}
						</span>
					</div>
				</div>

				<footer className="c-closed-bets__footer">
					<span className="meta">
						<span className="strong">
							{outcome + ' '}
							{showWin && (<FormattedNumber id="return-{betPart.id}" value={bet.payout} style="currency" currency={bet.stake.currency} />)}
						</span>
					</span>

					<span className="u-float-right">
						<span className="strong">
							{App.Intl('betslip.stake')}&nbsp;
						</span>
						<FormattedNumber id="stake-{bet.id}" value={parseFloat(bet.stake.amount).toFixed(2)} style="currency" currency={bet.stake.currency} />
					</span>
				</footer>
			</div>
		);

		this.latestBet = newLatest;

		return toRender;
	}

	renderMultipleBets(bet) {
		const parts = bet.parts,
			indexBet = bet.id,
			betPartRows = [],
			outcome = bet.displayStatus,
			showWin = (outcome === 'WIN');


		parts.betPart.map((betPart, index) => {
			const result = betPart.resultType,
			win = (result === 'WIN'),
			betPartClassName = cx('c-closed-bets__single-bet-group-info', {'c-closed-bets__single-bet-group-info-won': win, 'c-closed-bets__single-bet-group-info-lost': !win});

			betPartRows.push(
				<li key={index} className={betPartClassName}>
					<div className="c-closed-bets__single-bet-group-info-inner">
						<div className="topRow">
							<span className="c-closed-bets__single-bet-group-info-sport">{betPart.sport.name}
							</span>{/*TODO here should go the sport icon instead of text*/}
							<div>
								{betPart.event.name}
							</div>
							<span className="row u-fade">
								{betPart.market.name}
							</span>
						</div>
						<div className="market-odds">
							<span className="c-closed-bets__single-bet-group-info-pick">{App.Intl('betslip.pick')}:&nbsp;</span>
							<span className="c-closed-bets__single-bet-group-info-selection">
								{betPart.selection.name}&nbsp;
							</span>
						</div>

						<div className="summary-span">
							<span className="meta">
								<span className="strong">
									{betPart.resultType + ' '}
								</span>
							</span>
						</div>
					</div>
				</li>
			);
		});


		const groupClassName = cx('c-closed-bets__row c-closed-bets__single-bet-group', {'c-closed-bets__row c-closed-bets__single-bet-group--won': showWin, 'c-closed-bets__row c-closed-bets__single-bet-group--lost': !showWin});
		return (
			<div className="c-closed-bets__section" key={indexBet}>
				<div className={groupClassName}>
					<header className="c-closed-bets__section-header">
						<h4 className="c-closed-bets__section-title">
							{bet.type}&nbsp;
							<span className="c-closed-bets__single-bet-group-sub-title u-fade u-float-right">
								<span className="c-closed-bets__single-bet-group-sub-title-date">{moment(bet.betTime).format('D MMM YYYY')}</span>&nbsp;
								<span>{moment(bet.betTime).format('h:mm A')}</span>
							</span>
						</h4>
					</header>

					<ul className="g-menu">
						{betPartRows}
					</ul>

					<div className="c-closed-bets__total-odds">
						{App.Intl('betslip.total_odds')}:&nbsp;
						<span className="returnVal">
							{parseFloat(bet.totalWinningOdds).toFixed(2)}
						</span>
					</div>

					<footer className="c-closed-bets__footer">
						<span className="meta">
							<span className="strong">
								{outcome + ' '}
								{showWin && (<FormattedNumber id="return-{betPart.id}" value={bet.payout} style="currency" currency={bet.stake.currency} />)}
							</span>
						</span>

						<span className="u-float-right">
							<span className="strong">
								{App.Intl('betslip.stake')}&nbsp;
							</span>
							<FormattedNumber id="stake-{bet.id}" value={parseFloat(bet.stake.amount).toFixed(2)} style="currency" currency={bet.stake.currency} />
						</span>
					</footer>
				</div>
	      </div>
		);
	}

	renderMoreButton() {
		if (this.state.betsLength > 10 && this.state.betsLength - this.state.betsToShow > 0) {
			return (
				<a className="c-btn--primary--full-width" onClick={this.getTenMoreBets.bind(this)}>
					{App.Intl('betslip.more')}
				</a>
			);
		} else {
			return null;
		}
	}
};
