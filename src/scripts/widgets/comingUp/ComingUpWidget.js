import './ComingUpWidget.scss';

import Widget from 'app/view/widgets/WidgetBase';
import {Proto} from 'sportsbook/model/factory/EventFactory';
import GroupedEventsView from 'app/view/sport/components/GroupedEventsView';

class ComingUpWidget extends React.Component {
	static defaultProps = {
		tilespan: 1
	};

	constructor(props, context) {
		super(props, context);
		this.factory = new Proto();
		this.updateFunction = this.fetch.bind(this);

		const {sport, initialNbrEvents} = props;
		const override = !_.isEmpty(sport) && sport != 'NONE';

		this.state = {
			initialNbrEvents: initialNbrEvents,
			sport: override ? sport : App.Globals.sport,
		};
	}

	/**
	 *
	 */
	fetch() {
		const {sport} = this.state;
		const numberOfMarkets = !App.isMobile() ? 3 : 1;
		const keyMarkets = App.data.request('keyMarkets', sport, numberOfMarkets);
		return new Promise((resolve, reject) => {
			this.factory.fetch(keyMarkets.join(','), sport, -1, 80, 0, 80).then((events) => {
				resolve(events);
			});
		});
	}

	render() {
		const {sport, initialNbrEvents} = this.state;
		const translated = App.Intl('sport.name.' + sport.toLowerCase());

		const titles = Widget.getTitles('Coming Up', App.Intl('widgets.comingup_sport.subtitle' , {sport:translated}), this.props);
		const props = Object.assign({}, this.props, titles, {
			updateFunction: this.updateFunction,
			initialRows: initialNbrEvents
		});

		return (
			<GroupedEventsView {...props}/>
		);
	}

}

export default ComingUpWidget;
