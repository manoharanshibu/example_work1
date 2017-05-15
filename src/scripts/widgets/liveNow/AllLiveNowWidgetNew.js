import EventsView from 'app/view/sport/components/EventsView';
import Widget from "app/view/widgets/WidgetBase";
import ColapsableContainer from "app/view/sideBar/components/ColapsableContainer";
import { keyMarkets } from 'sportsbook/util/MarketUtil';
import eventTree from 'sportsbook/model/EventTreeModel';
import {Proto} from 'sportsbook/model/factory/EventFactory';

export default class AllLiveNowWidget extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.updateFunction = this.fetch.bind(this);
		this.factory = new Proto();
		this.state = {
			sports: [],
			loading: false,
			eventUid: '',
			events: [],
			sportHash: _.uniqueId(),
			liveEventsBySport: [],
		};
		this.onScheduleChange = ::this.onScheduleChange;
		this.onFetchSuccess = ::this.onFetchSuccess;

	}

	/**
	 *
	 */
	componentDidMount() {
		App.bus.on('schedule:add:inplay', this.onScheduleChange);
		this.fetch();
	}

	componentWillUnmount() {
		App.bus.off('schedule:add:inplay', this.onScheduleChange);
	}

	onScheduleChange() {
		this.setState({sportsHash: _.uniqueId()});
	}

	fetch() {
		// get list of sports that need schedule subscriptions
		const sports = eventTree.getSportsWithEventsToday();
		const newSports = sports.map(s => s.code).sort(this.sort);
		// update subscriptions for new list of sports
		this.subscribe(newSports, this.state.sports, true);
		this.subscribe(this.state.sports, newSports, false);
		this.setState({sports: newSports});

		_.map(newSports, sport => this.fetchLiveEvents(sport));
	}

	sort = (a, b) => {
		// soccer always first
		if (a == 'SOCCER') return -1;
		if (b == 'SOCCER') return 1;
		// otherwise sort alphabetically
		if (a > b) return 1;
		if (a < b) return -1;
		return 0;
	}

	subscribe(newSports, oldSports, add) {
		const sports = newSports.filter(s => !oldSports.includes(s));
		const func = add ? 'add' : 'remove';
		App.subs[func]('schedule', sports);
	}

	fetchLiveEvents(sprt, max = this.MAX_ROWS, multiple = true) {
		this.loading = true;

		const sport = sprt || this.props.sport;
		const markets = keyMarkets(sport, multiple, true);

		this.factory.fetchEvents(sport, 0, max + 1, markets)
			.then(this.onFetchSuccess(sport, max, multiple));
	}

	/**
	 * @param sport
	 * @param max
	 * @param multiple
	 * @returns {function(*)}
	 */
	onFetchSuccess(sport, max, multiple) {
		return ({ events }) => {
			const {liveEventsBySport} = this.state;
			liveEventsBySport.push(events);

			this.setState({
				liveEventsBySport: liveEventsBySport
			});
		};
	}

	renderSport(liveEvents) {
		if(liveEvents[0]) {
			const sport = liveEvents[0].attributes.sport;
			const title = sport === 'SOCCER' ? 'FOOTBALL' : sport;

			return (
				<ColapsableContainer
					key={`colapsable_${sport}`}
					title={title}
				>
					<EventsView events={liveEvents} key={`live_events_${sport}`} sport={sport}
						tilespan="3"
					/>
				</ColapsableContainer>
			);
		} else {
			return null;
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const {liveEventsBySport} = this.state;
		const liveContent = _.map(liveEventsBySport, (liveEvents) => this.renderSport(liveEvents));
		//check length not including null values.
		const liveContentLength = liveContent.filter(function(value) { return !_.isNull(value) }).length;

		if(liveContentLength > 0) {
			return (
				<Widget
					title={"Live Events"}
				>
						{liveContent}
				</Widget>
			);
		}

		return null;
	}
}
