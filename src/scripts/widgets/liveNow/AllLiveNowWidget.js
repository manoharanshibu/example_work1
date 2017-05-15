import GroupedEventsView from 'app/view/sport/components/GroupedEventsView';
import {Proto} from 'sportsbook/model/factory/EventFactory';

export default class AllLiveNowWidget extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.updateFunction = this.fetch.bind(this);
		this.factory = new Proto();
		this.state = {sports: [], loading: false, eventUid: '', events: []};
	}

	/**
	 *
	 */
	fetch() {
		return new Promise((resolve, reject) => {
			this.factory.fetchSomeEvents(null, 0, 80).then((groups) => {
				const events = _.reduce(groups, (all, group) => {
					const evts = group.get('events');
					return all.concat(evts);
				}, []);
				this.setState({
					eventUid: _.uniqueId(),
					loading: false,
					sports: groups,
					events: events
				});
				resolve(events);
			});
		});
	}

	/**
	 *
	 */
	componentDidMount() {
		this.fetch();
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const props = Object.assign({}, this.props, {
			title: this.props.title,
			subTitle: this.props.subTitle,
			updateFunction: this.updateFunction,
			groupEvents: true,
			groupBy: 'code',
			titleBy: 'code'
		});
		return (
			<GroupedEventsView {...props}/>
		);
	}
}
