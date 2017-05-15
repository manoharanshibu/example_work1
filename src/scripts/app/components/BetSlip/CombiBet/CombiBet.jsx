/**
 * Created by ianrotherham on 09/09/2015.
 */
import betsModel from "sportsbook/model/domain/BetsModel";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import FormNumericalInput from 'app/components/formElements/forms/FormNumericalInput';
import {classNames as cx} from 'common/util/ReactUtil';

import './CombiBet.scss';

export default class CombiBet extends React.Component {
	constructor() {
		super();
		_.bindAll(this, 'renderCombiBet', 'onInputChange', 'addSingleBet', 'removeSingleBet', 'addMultipleBet', 'onAddRejectionsToCombiBets');

		this.state = {
			combiBets: [],
			singleBets: [],
			isSectionVisible: true
		};

		this.addMultipleBet = ::this.addMultipleBet;
		this.addSingleBet = ::this.addSingleBet;
		this.onClearSingleBets = ::this.onClearSingleBets;
		this.removeSingleBet = ::this.removeSingleBet;
	}

	componentDidMount(){
		betsModel.on('bets:addRejections', this.onAddRejectionsToCombiBets);
		betsModel.on('bets:addMultipleBet', this.addMultipleBet);
		betsModel.on('bets:addSingleBet', this.addSingleBet);
		betsModel.on('bets:clearSingleBets', this.onClearSingleBets);
		App.bus.on('bets:removeSingleBet', this.removeSingleBet);
		betsModel.setCalculateAccumulatorBets(true);
	}

	componentWillMount() {
		this.updateState();
	}

	componentWillUnmount(){
		betsModel.off('bets:addRejections', this.onAddRejectionsToCombiBets);
		betsModel.off('bets:addMultipleBet', this.addMultipleBet);
		betsModel.off('bets:addSingleBet', this.addSingleBet);
		betsModel.off('bets:clearSingleBets', this.onClearSingleBets);
		App.bus.off('bets:removeSingleBet', this.removeSingleBet);
	}

	onAddRejectionsToCombiBets(rejectionObj) {

		const collection = rejectionObj.bets;

		for (let i = 0; i < collection.length; i++) {
			const wrapper = collection[i];
			const systemBet = wrapper.bet;
			const selectionMessage = wrapper.reasonCodeForSelection;
			const reasonCode = wrapper.rejectionReason;

			if (wrapper.type === 'MULTIPLE') {
				const rejection = {
					message: selectionMessage,
					status: reasonCode
				};
				systemBet.rejection = rejection;
				this.updateState();
			}
		}
	}

	onClearSingleBets() {
		this.updateState();
	}

	removeSingleBet() {
		this.updateState();
	}

	addSingleBet() {
		this.updateState();
	}

	addMultipleBet() {
		this.updateState();
	}

	updateState() {
		const systems = betsModel.getSystemBets();
		const filteredMultipleArray = betsModel.getStandardCombi(systems);

		this.setState({combiBets: filteredMultipleArray});
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
		this.setState({
			isSectionVisible: !this.state.isSectionVisible
		});
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
		const {combiBets} = this.state;
		const firstMultiway = combiBets.find(combiBet => {
			return combiBet.multiway || combiBet.name.indexOf('MULTIWAY') != -1;
		})
		return !!firstMultiway;
	}

	renderError(bet) {
		const rejectionObj = bet.rejection;
		return (
			<div className="col-12">
				<div className="c-combi-bets__price-change-error">
					{rejectionObj.message}
				</div>
			</div>
		);
	}

	render() {

		if(this.isMultiWay())
			return null;

		const betsLength = _.values(betsModel.singleBets).length;
		const combiBetsLength = _.values(this.state.combiBets).length;
		const hasCombiBets = _.values(this.state.combiBets).length > 0;
		const isVisible = this.state.isSectionVisible;
		const iconClass = isVisible ? "icon-chevron-down" : "icon-chevron-left";
		return (hasCombiBets && (
			<div className="c-combi-bets">
				<div className={cx('c-combi-bets__header', {'is-hidden': (betsLength === 0)})} onClick={this.onToggleVisibility.bind(this)}>
					<p className="c-combi-bets__title">{App.Intl('betslip.combi_bets')}</p>


					<div className="u-float-right">
						<span className="g-lozenge--primary">{combiBetsLength}</span>
						<i className={cx('c-combi-bets__icon', iconClass)}></i>
					</div>
				</div>

				<div className={cx('c-combi-bets__body', {'is-hidden': (betsLength === 0 || !isVisible)})}>
					<ReactCSSTransitionGroup transitionName="combiBet" transitionEnterTimeout={500} transitionLeaveTimeout={500} transitionAppearTimeout={500} transitionAppear={true}>
						{this.state.combiBets.map(this.renderCombiBet)}
					</ReactCSSTransitionGroup>
				</div>
			</div>
		));
	}

	renderCombiBet(model, index) {
		const systemBet = model;
		const isRejectionError = !_.isUndefined(systemBet.rejection) && !_.isNull(systemBet.rejection);
		return (
			<div key={index} className="c-combi-bets__bet">

				<FormNumericalInput
					inputClassName="c-combi-bets__input"
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

				<div className="col-12 c-combi-bets__each-way" style={{"display" : systemBet.isEachWayAvailable == true ? 'block' : 'none'}}>
					<span className="c-combi-bets__each-way-label">Each Way</span>
					<input id={"each-way-cb-"+systemBet.betId()} type="checkbox" name="eachWay"
						   checked={systemBet.eachWay}
						   onChange={this.onEachWayChange.bind(this, systemBet)} />
				</div>
				{isRejectionError && this.renderError(systemBet)}
			</div>
		);
	}

};

CombiBet.displayName = 'CombiBet';

CombiBet.defaultProps = {
	collection: _.values(betsModel.singleBets)
};
