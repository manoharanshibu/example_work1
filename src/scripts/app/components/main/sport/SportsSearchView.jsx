import Widget from "app/view/widgets/WidgetBase";
import service from 'sportsbook/service/ApiService.js';
import cache from 'sportsbook/model/EventCache.js';
import cancelable from "common/util/Cancelable";
import EventsView from "app/view/sport/components/EventsView";
import Title from 'app/components/main/Title';
import OutrightView from 'widgets/outrights/OutrightView';

export default class SportsSearchView extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			searchText: '',
			results: [],
			searching: false,
		};

		this.onSearchSuccess = cancelable.callback(this.onSearchSuccess, this);
		this.onSearchError = cancelable.callback(this.onSearchError, this);
		this.onGetEventSuccess = cancelable.callback(this.onGetEventSuccess, this);
	}

	componentDidMount() {
		this.fetch(this.props.location.query.text.toLowerCase());
	}

	/**
	 *
	 */
	componentWillReceiveProps(nextProps) {
		const searchText = nextProps.location.query.text.toLowerCase();
		if (this.state.searchText !== searchText && searchText) {
			this.fetch(searchText);
		}
	}

	componentWillUnmount() {
		// cancel callback:
		this.onSearchSuccess.cancel();
		this.onSearchError.cancel();
		this.onGetEventSuccess.cancel();
	}

	/**
	 * @param searchText
	 */
	fetch(searchText) {
		this.setState({searchText, searching: true});
		service.searchEvents(null, searchText).then(this.onSearchSuccess, this.onSearchError);
	}

	onSearchSuccess(resp) {
		let results = (resp && resp.Events && resp.Events.event) || [];
		_.each(results, (event) => {
			const cachedEvent = cache.getEvent(event.id);
			if (!cachedEvent) {
				service.getEvent(event.id).then(this.onGetEventSuccess);
			}
		});
		this.setState({results, searching: false});

	}

	onGetEventSuccess(resp) {
		const eventObj = resp && resp.Event;

		if (!eventObj) {
			this.onGetEventError();
		} else {
			cache.updateEvent(eventObj);
			this.forceUpdate();
		}
	}

	onSearchError(resp) {
		this.setState({searching: false});
	}

	sortEvents(events) {
		//split the search results into outright markets and others AKA normal markets.
		const [outrights, others] = _.partition(events, (event) => {
				return (event.attributes.isOutRight === "true");
		});
		return [outrights, others];
	}

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		const {results} = this.state;
		const hasResults = results.length !== 0;
		const searchTitle = (hasResults) ? `Search Results for "${this.state.searchText}"` : `No Search Results for "${this.state.searchText}"`;

		return (
			<Title title={`Search "${this.state.searchText}"`}>
				<div>
					<h2>{searchTitle}</h2>

					{hasResults &&
						this.renderResults()
					}
				</div>
			</Title>
		);
	}

	renderResults() {
		const {results} = this.state;
		if (results.length === 0) return null; // prevent errors from no results

		const eventModels = _.map(results, (event) => {
			return cache.getEvent(event.id);
		});

		const groupedModels = _.groupBy(_.compact(eventModels), (event) => {
			return event.attributes.sport;
		});

		return _.map(groupedModels, (group, key) => {
			const [outrights, others] = this.sortEvents(group);
			const translatedTitle = App.Intl(`sport.name.${key.toLowerCase()}`);
			return (
				<div key={key}>
					<Widget title={translatedTitle}>
						<EventsView events={others} eventUid={_.uniqueId()} sport={key} />
						{this.renderOutrights(outrights)}
					</Widget>
				</div>
			);
		});
	}

	renderOutrights(events) {
		return _.map(events, (event) => {
			return _.map(event.Markets.models, (market) => {
				return <OutrightView key={market.id} market={market} tilespan="3" />;
			});
		});
	}
}
