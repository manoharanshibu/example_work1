/**
 * Created by ianrotherham on 09/09/2015.
 */
import betsModel from "sportsbook/model/domain/BetsModel";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import FormNumericalInput from 'app/components/formElements/forms/FormNumericalInput';
import {classNames as cx} from 'common/util/ReactUtil';

import './SystemBets.scss';

export default class SystemBets extends React.Component {
	constructor() {
		super();

		_.bindAll(this, 'renderSystemBet', 'onInputChange', 'onAddRejectionsToSystemBets', 'updatePriceFormat');
		betsModel.on('bets:addMultipleBet', this.addMultipleBet, this);
		this.state = {
			systemBets: [],
			singleBets: [],
			isSectionVisible: false
		};
	}

	componentDidMount(){
		betsModel.on('bets:addRejections', this.onAddRejectionsToSystemBets);
		App.bus.on('globals:priceFormatChange', this.updatePriceFormat);
	}

	componentWillMount() {
		this.updateState();
	}

	componentWillUnmount() {
		betsModel.off('bets:addRejections', this.onAddRejectionsToSystemBets);
		betsModel.off('bets:addMultipleBet');
		App.bus.off('globals:priceFormatChange', this.updatePriceFormat);
	}

	updatePriceFormat() {
		this.forceUpdate();
	}

	onAddRejectionsToSystemBets(rejectionObj) {

		const collection = rejectionObj.bets;
		let rejectionBets = [];
		for (let i = 0; i < collection.length; i++) {
			const wrapper = collection[i];
			const systemBet = wrapper.bet;
			const selectionMessage = wrapper.reasonCodeForSelection;
			const reasonCode = wrapper.rejectionReason;
			rejectionBets.push(systemBet);

			if (wrapper.type === 'MULTIPLE') {
				const rejection = {
					message: selectionMessage,
					status: reasonCode
				};
				systemBet.rejection = rejection;
				this.updateState();
			}
		}
		//Temp fix to remove unneccesary rejection texts
		_.each(this.state.systemBets, function (systemBet) {
			if (!_.contains(rejectionBets, systemBet))
				systemBet.rejection = null;
		});
	}

	addMultipleBet() {
		this.updateState();
	}

	updateState() {
		const systems = betsModel.getSystemBets();
		const combiBets = betsModel.getStandardCombi(systems);

		let filteredSystems = _.values(systems);

		if (combiBets.length > 0) {
			const combiBet = combiBets[0];
			const betId = combiBet.betId();

			filteredSystems = _.filter(filteredSystems, (system) => {
				return system.betId() !== betId;
			});
		}
		this.setState({systemBets: filteredSystems});
	}

	onShowBankerBets(e) {
		const showBankers = e.currentTarget.checked;
		const singleBets = _.values(betsModel.singleBets);
		for (let i = 0; i < singleBets.length; i++) {
			const single = singleBets[i];
			single.displayBankerBetOption = showBankers;
		}
		betsModel.setCalculateBankerBets(showBankers);
		this.updateState();
	}

	onInputChange(bet, value) {
		const stake = value;
		this.updateStakefromInput(bet, stake);
	}

	updateStakefromInput(bet, stake) {
		betsModel.updateStake(bet, stake);
		this.updateState();
	}

	onToggleVisibility() {
		const visibleSection = !this.state.isSectionVisible;
		betsModel.setCalculateAccumulatorBets(visibleSection);
		this.setState({isSectionVisible: visibleSection});
	}

	includeSystemEachWay(bet) {
		betsModel.includeEachWaySystem(bet);
	}

	excludeSystemEachWay(bet) {
		betsModel.excludeEachWaySystem(bet);
	}

	onEachWayChange(bet, e) {
		const checked = e.currentTarget.checked;
		if (checked)
			this.includeSystemEachWay(bet);
		else
			this.excludeSystemEachWay(bet);

		this.forceUpdate();
	}

	isMultiWay()
	{
		const {systemBets} = this.state;
		const firstMultiway = systemBets.find(systemBet => {
			return systemBet.multiway || systemBet.name.indexOf('MULTIWAY') != -1;
		})
		return !!firstMultiway;
	}

	renderError(bet) {
		const rejectionObj = bet.rejection;
		return (
			<div className="col-12">
				<div className="c-system-bets__price-change-error">
					{rejectionObj.message}
				</div>
			</div>
		);
	}

	render() {

		if(this.isMultiWay())
			return null;

		let uniqueMarketCount = 0;
		let betsLength = _.values(betsModel.singleBets).length,
			systemBetsLength = _.values(this.state.systemBets).length,
			overrideDisplayOfSystemTab = betsModel.displaySystemTab(),
			hasSystemBets = _.values(this.state.systemBets).length > 0 || overrideDisplayOfSystemTab,
			isVisible = this.state.isSectionVisible,
			clazzName = isVisible
				? "icon-chevron-down"
				: "icon-chevron-left";

		if (overrideDisplayOfSystemTab) {
			uniqueMarketCount = betsModel.getUniqueMarketCount().marketCount;
			if (uniqueMarketCount <= 2) {
				hasSystemBets = false;
			}
		}

		return (hasSystemBets && (
			<div className="c-system-bets">
				<div className="c-system-bets__header" onClick={this.onToggleVisibility.bind(this)}>
					<p className="c-system-bets__title">{App.Intl('betslip.system_bets')}</p>

					<div className="u-float-right">
						<span className="g-lozenge--primary">{systemBetsLength > 0 ? systemBetsLength : uniqueMarketCount}</span>
						<i className={'c-system-bets__icon'+" "+clazzName}></i>
					</div>
				</div>
				{betsLength > 0 && isVisible && (
					<div className="c-system-bets__body">
						<div className="c-system-bets__notice">
							<div>{App.Intl('betslip.bet_not_selected')}</div>
						</div>

						<div className="c-system-bets__banker">
							<input className="c-system-bets__banker-checkbox g-input-field g-input-field--checkbox c-system-bets__banker-input" id="bankers-input" type="checkbox" name="showBankers" checked={betsModel.calculateBankerBets  ? 'checked' : ''} onClick={this.onShowBankerBets.bind(this)}/>
							<label className="c-system-bets__banker-label g-label c-system-bets__banker-label" htmlFor="bankers-input">
								{App.Intl('betslip.show_bankers')}
							</label>
						</div>

						<div>
							<ReactCSSTransitionGroup transitionName="combiBet" transitionEnterTimeout={500} transitionLeaveTimeout={500} transitionAppearTimeout={500} transitionAppear={true}>
								{this.state.systemBets.map(this.renderSystemBet)}
							</ReactCSSTransitionGroup>
						</div>
					</div>
				)}
			</div>
		));
	}

	renderSystemBet(model, index) {
		const systemBet = model;
		const isRejectionError = !_.isUndefined(systemBet.rejection) && !_.isNull(systemBet.rejection);
		return (
			<div key={index} className="grid-noGutter">
				<div className="col-12">
					<FormNumericalInput
						inputClassName="c-system-bets__input"
						disabled={false}
						value={systemBet.stake}
						min="0"
						placeholder="0.00"
						onChange={this.onInputChange.bind(this, systemBet)}
						label={systemBet.name}
						multipleBets={true}
						multipleLabel={'x' + _.values(systemBet.bets).length + ' ' + App.Intl('betslip.bets') + ' '}
						odds={systemBet.getOdds()}
					/>
				</div>

				{systemBet.isEachWayAvailable && (
					<div className="col-12 c-system-bets__each-way">
						<span className="c-system-bets__each-way-label">Each Way</span>
						<input id={"each-way-cb-"+systemBet.betId()} type="checkbox" name="eachWay"
							   checked={systemBet.eachWay}
							   onChange={this.onEachWayChange.bind(this, systemBet)} />
					</div>
				)}
				{isRejectionError && this.renderError(systemBet)}
			</div>
		);
	}

};

SystemBets.defaultProps = {
	collection: []
};
