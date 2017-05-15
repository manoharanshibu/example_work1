import Widget from 'app/view/widgets/WidgetBase';
import GroupedEventsView from 'app/view/sport/components/GroupedEventsView';
import {Proto} from 'sportsbook/model/factory/EventFactory';
import moment from 'moment';

class SportLiveNowWidget extends React.Component {
	constructor() {
		super();
		this.state = {sport: null};
		this.updateFunction = this.fetch.bind(this);
		this.factory = new Proto();
	}

	/**
	 * Provide the factory update method and return promise
	 * @returns {*}
     */
	fetch() {
		const sport = this.state.sport;
		return new Promise((resolve, reject) => {
			this.factory.fetch(null, sport, null, 0, 80).then((events) => {
				resolve(events);
			});
		})
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const titles = Widget.getTitles('Live Now', moment().format('dddd, MMMM Do YYYY'), this.props);
		const props = Object.assign({}, this.props, titles, {
			updateFunction: this.updateFunction,
			groupBy: 'compId',
			titleBy: 'compName',
			groupEvents: true
		});
		return (
			<GroupedEventsView {...props}/>
		)
	}
}

export default SportLiveNowWidget;
