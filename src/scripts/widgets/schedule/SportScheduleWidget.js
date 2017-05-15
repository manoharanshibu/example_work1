import Widget from 'app/view/widgets/WidgetBase';
import GroupedEventsView from 'app/view/sport/components/GroupedEventsView';
import {Proto} from 'sportsbook/model/factory/EventFactory';

class SportScheduleWidget extends React.Component {
	constructor() {
		super();
		this.updateFunction = this.fetch.bind(this);
		this.factory = new Proto();
	}

	/**
	 * @param max
	 * @param multiple
	 * @returns {*}
	 */
	fetch(max = 8, multiple = false) {
		const sport = App.Globals.sport;
		return new Promise((resolve, reject) => {
			this.factory.fetchSomeEvents(sport, max, max).then((groups) => {
				const all = groups.reduce((events, group) => {
					events = events.concat(group.get('events'));
					return events;
				}, []);
				resolve(all);
			});
		});
	}

	/**
	 *
	 */
	componentDidMount() {
		App.bus.on('schedule:amend', () => {
			this.forceUpdate();
		});
	}

	/**
	 *
	 */
	componentWillUnmount() {
		App.bus.off('schedule:amend');
	}

	/**
	 * @returns {XML}.
	 */
	render() {
		const sport = App.Globals.Sport(this.props.sport, false);
		const sport_translated = App.Intl('sport.name.' + sport.toLowerCase());
		let titles = Widget.getTitles(App.Intl('widgets.schedule_sport.title' , {sport:sport_translated}), App.Intl('widgets.schedule_sport.subtitle' , {sport:sport_translated}), this.props);

		const props = Object.assign({}, this.props, titles, {
			updateFunction: this.updateFunction,
			groupBy: 'compId',
			titleBy: 'compName',
			groupEvents: false
		});
		return (
			<GroupedEventsView {...props}/>
		);
	}
}

export default SportScheduleWidget;
