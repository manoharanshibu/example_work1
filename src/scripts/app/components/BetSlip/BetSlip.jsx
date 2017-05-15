import './BetSlip.scss';

import betsModel from "sportsbook/model/domain/BetsModel";
import betSlipController from "sportsbook/controller/BetSlipController";
import SingleBetGroup from "./SingleBets/SingleBetGroup";
import CombiBet from "./CombiBet/CombiBet";
import SystemBets from "./SystemBets/SystemBets";
import BetSlipSummary from "./BetSlipSummary/BetSlipSummary";
import PlaceBet from "./PlaceBet/PlaceBet";
import BetSlipConfirmation from "./BetSlipConfirmation/BetSlipConfirmation";
import BetSlipRejection from "./BetSlipRejection/BetSlipRejection";
import OpenBets from "./OpenBets/OpenBets";
import ClosedBets from "./ClosedBets/ClosedBets";
import {classNames as cx} from "common/util/ReactUtil";
import SingleGroupedBet from "./SingleGroupedBet/SingleGroupedBet";
import BetSlipLayout from "sportsbookCms/view/BetSlipLayout";
import Loader from 'app/view/components/LoaderView';
import {TOGGLE_BET_SLIP, BETSLIP_LOADED} from "app/AppConstants";
import CasinoGamesModel from 'sportsbook/model/CasinoGamesModel';

export default class BetSlip extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			betSlipState: 'SINGLES',
			showDefaultBetState: true,
			showAcceptedBetsState: false,
			showRejectedBetsState: false,
			showOpenBetsState: false,
			showClosedBetsState: false,
			validatingBet: false,
			betslipOpen: false,
			totalBets: _.values(betsModel.singleBets).length,
			loading: false,
		};

		this.loggedIn = App.session.request('loggedIn');

		_.bindAll(this, 'onShowDefaultBetSlip');

		this.handlers = [
			{ event: 'bets:showConfirmationView',         handler: ::this.onShowConfirmationView,    entity: betsModel },
			{ event: 'bets:showRejectionView',            handler: ::this.onShowRejectionView,       entity: betsModel },
			{ event: 'bets:clearSingleBets',              handler: ::this.onClearSingleBets,         entity: betsModel },
			{ event: 'bets:showDefaultView',              handler: ::this.onShowDefaultBetSlip,      entity: betsModel },
			{ event: 'bets:updateTotalNumberOfBets',      handler: ::this.onUpdateTotalNumberOfBets, entity: betsModel },
			{ event: 'bets:showOpenBetsForMobile',        handler: ::this.onShowOpenBetsForMobile,   entity: betsModel },
			{ event: 'bets:removeSuspendedRejectionInfo', handler: ::this.onRemoveRejectionInfo,     entity: betSlipController },
			{ event: 'session:changed',                   handler: ::this.onSessionChange,           entity: App.session },
			{ event: 'betslip:removeLoader',              handler: ::this.onRemoveLoader,            entity: App.bus },
			{ event: 'betslip:addLoader',                 handler: ::this.onAddLoader,               entity: App.bus },
			{ event:  BETSLIP_LOADED, 					  handler: ::this.betslipLoaded, 			 entity: App.bus }
		];
	}

	/**
	 *
	 */
	componentDidMount() {
		_.each(this.handlers, ({event, handler, entity}) => entity.on(event, handler));
	}

	/**
	 *
	 */
	componentWillUnmount() {

		if (!!CasinoGamesModel.get('activeMiniGame')) {
			CasinoGamesModel.set('activeMiniGame', null);
		}

		_.each(this.handlers, ({event, handler, entity}) => entity.off(event, handler));

		// clear down the old bets
		betsModel.validateSaveSelections();
		betsModel.confirmationViewVisible = false;
	}

	/**
	 *
	 */
	onSessionChange() {
		this.loggedIn = App.session.request('loggedIn');
		this.onShowDefaultBetSlip();
	}

	onContinueBetting() {
		betsModel.validateSaveSelections();
		this.onShowDefaultBetSlip();
	}

	onContinueOpenBets() {
		betsModel.validateSaveSelections();
		this.onShowOpenBetsView();
	}

	onBetSlipTabClick() {
		betsModel.validateSaveSelections();
		this.onShowDefaultBetSlip();
	}

	onOpenBetsTabClick() {
		if (this.loggedIn) {
			this.onShowOpenBetsView();
			this.setState({loading: true});
		}
	}

	onClosedBetsTabClick() {
		if (this.loggedIn) {
			this.onShowClosedBetsView();
			this.setState({loading: true});
		}
	}

	onCloseBetslip(){
		App.bus.trigger(TOGGLE_BET_SLIP);

		if(this.state.showAcceptedBetsState) {
			this.onContinueBetting();
		}
	}

	onRemoveRejectionInfo() {
		if (this.state.showRejectedBetsState) {
			this.onShowDefaultBetSlip();
		}
	}

	betslipLoaded() {
		this.setState({loading: false});
	}

	/**
	 *
	 */
	onShowDefaultBetSlip() {
		betsModel.confirmationViewVisible = false;
		this.setState({
			showDefaultBetState: true,
			showOpenBetsState: false,
			showClosedBetsState: false,
			showAcceptedBetsState: false,
			showRejectedBetsState: false,
		});
	}

	/**
	 *
	 */
	onShowOpenBetsView() {
		if (this.loggedIn) {
			betsModel.validateSaveSelections();
			betsModel.confirmationViewVisible = false;
			this.setState({
				showOpenBetsState: true,
				showClosedBetsState: false,
				showDefaultBetState: false,
				showAcceptedBetsState: false,
				showRejectedBetsState: false
			});
			betsModel.getOpenBets();
		}
	}

	onShowClosedBetsView() {
		if (this.loggedIn) {
			betsModel.validateSaveSelections();
			betsModel.confirmationViewVisible = false;
			this.setState({
				showClosedBetsState: true,
				showOpenBetsState: false,
				showDefaultBetState: false,
				showAcceptedBetsState: false,
				showRejectedBetsState: false
			});
			betsModel.getClosedBets();
		}
	}

	/**
	 *
	 */
	onShowRejectionView() {
		betsModel.confirmationViewVisible = false;
		this.setState({
			showDefaultBetState: true,
			showRejectedBetsState: true,
			showAcceptedBetsState: false,
			showOpenBetsState: false,
			showClosedBetsState: false,
		}, () => {
			this.jumpToFirstRejectionError();
		});
	}

	/**
	 *
	 */
	onShowConfirmationView() {
		window.scrollTo(0, 0);
		this.setState({
			showAcceptedBetsState: true,
			showDefaultBetState: false,
			showOpenBetsState: false,
			showClosedBetsState: false,
			showRejectedBetsState: false,
		});
	}

	onShowOpenBetsForMobile() {
		this.onContinueOpenBets();
	}

	/**
	 *
	 */
	onClearSingleBets() {
		this.onShowDefaultBetSlip();
	}

	/**
	 * @param totalBets
	 */
	onUpdateTotalNumberOfBets(totalBets) {
		if (totalBets === 0) {
			this.onShowDefaultBetSlip();
		} else {
			if (!betsModel.singlesHasRejection && this.state.showRejectedBetsState) {
				this.onShowDefaultBetSlip();
			}
		}
	}

	onRemoveLoader() {
		this.setState({validatingBet: false});
	}

	onAddLoader() {
		this.setState({validatingBet: true});
	}

	jumpToFirstRejectionError() {
		const $errors = [].slice.call(document.getElementsByClassName('error'));
		const $errorBoxes = [].slice.call(document.getElementsByClassName('error-box'));
		const $allErrors = [].concat($errors, $errorBoxes);
		const $visibleErrors = _.filter($allErrors, (el) => {
			const style = window.getComputedStyle(el);
			return style.display !== 'none';
		});

		const $firstError = _.first($visibleErrors);

		if ($firstError) {
			const rect = $firstError.getBoundingClientRect();
			const top = rect.top + window.pageYOffset;
			const newPosition = top - (window.innerHeight / 2);

			// This looks wrong, but it works...

			// scroll into view:
			// (doesn't work on desktop view -- hidden under header)
			$firstError.parentElement.scrollIntoView();

			// centre element where possible:
			// (doesn't work on mobile view -- cannot scroll div)
			window.scrollTo(0, newPosition);
		}
	}

	toggleBetslip() {
		this.setState({betslipOpen: !this.state.betslipOpen});
	}

	onConfirmClearAll() {
		this.setState({confirmClearAll: true});
	}

	onCancelClearAll() {
		this.setState({confirmClearAll: false});
	}

	onClearAll() {
		if (betsModel.placeBetInProgress === true) {
			return;
		}
		betsModel.clearAllBets();
		this.setState({confirmClearAll: false});
	}

	onShowBetPriceWarnings(){
		this.scrollTop();
	}

	scrollTop(){
		// this.refs.sideBar.scrollTop = 0;
	}

	/**
	 * @returns {XML}
 	 */
	render() {
		return (
			<div ref="sideBar" id="betslip-sidebar" className={cx({'open': this.props.open})} style={this.state.sidebarStyle}>
				<div ref="betSlip" className="c-bet-slip">
					{this.renderBetSlip()}
				</div>
			</div>
		);
	}

	getTotalBets() {
		return _.values(betsModel.singleBets);
	}

	/**
	 * @returns {XML}
	 */
	renderBetSlip() {
		const totalBets = this.getTotalBets().length;
		const hasBets = totalBets > 0;
		const showAcceptedBets = this.state.showAcceptedBetsState ? 'block' : 'none';
		const showRejectedBets = this.state.showRejectedBetsState ? 'block' : 'none';

		let betslipContainerHeight = this.props.mainContentHeight;
		if(this.state.showDefaultBetState & this.loggedIn) { betslipContainerHeight = betslipContainerHeight - 40; }
		if(this.state.showRejectedBetsState) { betslipContainerHeight = betslipContainerHeight - 100; }

		return (
			<div>
				<div>
					{this.loggedIn && (
						<ul className={cx('g-menu c-bet-slip__tabs grid--noGutter', {'c-bet-slip__tabs--open-closed': (this.state.showOpenBetsState || this.state.showClosedBetsState)})}>
							<li className={cx('c-bet-slip__tab col-4', {'c-bet-slip__tab--betslip-active': this.state.showDefaultBetState})}>
								<a className="c-bet-slip__tab-inner c-bet-slip__tab-inner--betslip g-menu__link" onClick={::this.onBetSlipTabClick}>
									{App.Intl('betslip.tabs.betslip')}
								</a>
							</li>

							<li className={cx('c-bet-slip__tab col-4', {'c-bet-slip__tab--open-active': this.state.showOpenBetsState})}>
								<a className="c-bet-slip__tab-inner c-bet-slip__tab-inner--open g-menu__link" onClick={::this.onOpenBetsTabClick}>
									{App.Intl('betslip.tabs.open_bets')}
								</a>
							</li>

							<li className={cx('c-bet-slip__tab col-4', {'c-bet-slip__tab--closed-active': this.state.showClosedBetsState})}>
								<a className="c-bet-slip__tab-inner c-bet-slip__tab-inner--closed g-menu__link" onClick={::this.onClosedBetsTabClick}>
									{App.Intl('betslip.tabs.closed_bets')}
								</a>
							</li>
						</ul>
					)}
				</div>

				<div className="c-bet-slip__loading-container">
					<Loader loading={this.state.loading} color="dark"/>

					{this.state.showDefaultBetState && (
						<div className="c-bet-slip__bet-info grid--noGutter--equalHeight">
							<div className="col-4">
								<a className="c-bet-slip__number-of-bets" onClick={::this.onBetSlipTabClick}>
									{App.Intl('betslip.selections')} <span className="c-bet-slip__tab-lozenge g-lozenge--primary">{totalBets}</span>
								</a>
							</div>

							{hasBets && (
								<div className="col-8">
									<a className="c-bet-slip__clear-bets" onClick={this.onClearAll.bind(this)}>
										<span className="c-bet-slip__tab-lozenge g-lozenge--outline">
											{App.Intl('betslip.reset_slip')}
										</span>
									</a>
								</div>
							)}
						</div>
					)}

					<div className="c-bet-slip__rejection" style={{display: showRejectedBets}}>
						<BetSlipRejection />
					</div>

					<div className="c-bet-slip__container" style={{height: betslipContainerHeight + 'px'}}>
						{
							this.renderDefault(totalBets, hasBets)
						}

						<div style={{display: showAcceptedBets}}>
							<BetSlipConfirmation onContinueBetting={::this.onContinueBetting} />
						</div>

						{this.state.showOpenBetsState && (
							<OpenBets />
						)}

						{this.state.showClosedBetsState && (
							<ClosedBets />
						)}

						{this.state.validatingBet && (
							<div className="c-bet-slip__error-cover"></div>
						)}

						<div className="c-bet-slip__widgets">
								<BetSlipLayout col={2} listen={true} location={this.props.location} open={true} activeMiniGame={CasinoGamesModel.get('activeMiniGame')}
									insideBetslip={true} />
						</div>
						<div className="c-bet-slip__bottom-spacer">	</div>
					</div>
				</div>
			</div>
		);
	}

	renderSelections() {
		if (this.getTotalBets().length > 0) {
			return ([
				<div className="c-bet-slip__singles">
					<SingleBetGroup />
				</div>,
				<div className="c-bet-slip__multiples">
					<SingleGroupedBet />
					<CombiBet />
					<SystemBets />
				</div>
			]);
		} else {
			return null;
		}
	}

	renderSummary() {
		return (
			<div className="c-bet-slip__summary">
				<BetSlipSummary />
			</div>
		);
	}

	renderDefault(totalBets, hasBets) {
		const showDefault = this.state.showDefaultBetState ? 'block' : 'none';
		return (
			<div className="c-bet-slip__body" style={{display: showDefault}}>
				{this.state.confirmClearAll && (
					<div className="c-bet-slip__error-box">
						<p>{App.Intl('betslip.error.clear_all')}</p>
						<button className="c-bet-slip__error-btn c-btn--black"
								onClick={this.onCancelClearAll.bind(this)}>{App.Intl('forms.cancel')}</button>
						<button className="c-bet-slip__error-btn c-btn--black"
								onClick={this.onClearAll.bind(this)}>{App.Intl('betslip.delete_all')}</button>
					</div>
				)}

				{this.renderSelections()}
				{this.renderSummary()}

				<PlaceBet validatingBet={this.state.validatingBet}/>
			</div>
		);
	}
}
