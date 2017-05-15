import Loader from "app/view/components/LoaderView";
import BonusRowAvailable from 'header/view/bonuses/components/BonusRowAvailable';
import BonusRowHistory from 'header/view/bonuses/components/BonusRowHistory';
import BonusRowActive from 'header/view/bonuses/components/BonusRowActive';
import React from 'react';

export default class SportBonusTilesView extends React.Component {
	constructor(props) {
		super(props);

		this.onModelChange = ::this.onModelChange;
		this.onSubscribeToModelEvents = ::this.onSubscribeToModelEvents;
		this.onUnsubscribeToModelEvents = ::this.onUnsubscribeToModelEvents;
		this.updateAll = ::this.updateAll;
		this.onPageNavigate = ::this.onPageNavigate;
	}

	componentDidMount() {
		this.onSubscribeToModelEvents(this.props.model);
	}

	componentWillUnmount() {
		this.onUnsubscribeToModelEvents(this.props.model);
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.model !== this.props.model){
			this.onUnsubscribeToModelEvents(this.props.model);
			this.onSubscribeToModelEvents(nextProps.model);
		}
	}

	onSubscribeToModelEvents(model) {
		model.on('change:searchedBonuses change:bonustile', this.onModelChange);
		// model.updateCounters();
	}

	onUnsubscribeToModelEvents(model) {
		model.off('change:searchedBonuses change:bonustile', this.onModelChange);
	}

	onModelChange() {
		this.props.onModelChange();
	}

	onPageNavigate(...rest) {
		this.props.onPageNavigate(...rest);
	}

	updateAll() {
		this.props.model.updateAllBonuses();
	}

	render() {
		const { model, activeTab, queryState, typeFilter} = this.props;
		const searchedBonuses = model.get('searchedBonuses');
		const thereAreBonuses = !!(searchedBonuses && searchedBonuses.length);

		// if the tab is closed display nothing
		if (activeTab == 'closed') {
			return null;
		}

		if (queryState === 'pending' && thereAreBonuses) {
			return (
				<div className="container">
					<Loader loading={true}/>
				</div>
			);
		}

		if (queryState === 'error') {
			return (
				<div className="container">
					<span className="empty-notice">{App.Intl("sports_bonuses.error.connecting_server")}</span>
				</div>
			);
		}
		const translatedActiveTab = App.Intl(`mybonuses.tabs.${activeTab}`);

		// If the there are no bonuses of that kind...
		if (!searchedBonuses.length) {
			return (
				<div className="c-bonuses__empty-container container">
					<span className="empty-notice">{App.Intl("sports_bonuses.message.no_bonuses", {activeTab: translatedActiveTab})}</span>
				</div>
			);
		}

		const isThereActiveDeposit = model.get('isThereActiveDeposit');
		const rowTypes = {
			active: BonusRowActive,
			available: BonusRowAvailable,
			historic: BonusRowHistory
		};

		// We choose which kind of BonusRow to render, based on the current active tab
		const renderRowes =	_.reduce(searchedBonuses, (array, row, index) => {
			const type = row.get('type');
			const CurrentRowType = rowTypes[type];
			// Be careful. 'toJSON' is not exactly the same as 'attributes' here
			let rowAttrs = row.toJSON();
			if ((typeFilter === 'Freebet' && rowAttrs.bonusType !== 'freebet')
				|| (typeFilter === 'Bonuses' && rowAttrs.bonusType !== 'deposit' && rowAttrs.bonusType !== 'release')) {
				return array;
			}
			array.push(<CurrentRowType key={index}
				isThereActiveDeposit={isThereActiveDeposit}
				updateListAction={this.updateAll}
				{...rowAttrs} />);
			return array;
		}, []);

		return (
			<div className="grid">
				{renderRowes}
			</div>
		);
	}
}
