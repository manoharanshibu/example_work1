import cache from 'sportsbook/model/EventCache.js';
import selectedBets from 'sportsbook/model/bets/SelectedBetsModel';
import betsModel from "sportsbook/model/domain/BetsModel";

class BetslipSetterWidget extends React.Component {

	componentDidMount() {
		const { selections } = this.props;
		const eventIds = selections.reduce((ids, s)=> {
			if (ids.indexOf(s.eventId) === -1) {
				ids.push(s.eventId);
			}
			return ids;
		}, [])
		cache.loadEventsById(eventIds).then((events) => this.onEventsReceived(events));
	}

	/**
	 *
	 * @param events
     */
	onEventsReceived(events) {
		betsModel.clearAllBets();
		const { selections, redirect } = this.props;
		selections.forEach((sel) => this.onSelectBet(sel, events));
		if (redirect) {
			App.navigate('');
		}
	}

	/**
	 *
	 * @param sel
	 * @param events
     */
	onSelectBet(sel, events) {
		const event = this.findEventById(sel.eventId, events);
		if (!event) {
			return;
		}

		const selection = event.findSelection(sel.selectionId);
		if (!selection) {
			return;
		}

		selectedBets.toggle(selection);
	}

	/**
	 *
	 * @param id
	 * @param events
	 * @returns event
     */
	findEventById(id, events) {
		return events.find((e) => {return e.get('id') === id});
	}

	/**
	 *
	 * @returns {null}
     */
	render() {
		return null;
	}
}

export default BetslipSetterWidget;
