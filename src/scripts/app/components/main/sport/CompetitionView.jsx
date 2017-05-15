import './CompetitionView.scss';

import Widget from "app/view/widgets/WidgetBase";
import EventsView from "app/view/sport/components/EventsView";
import EventsFooterView from "app/view/sport/components/EventsFooterView";
import eventTree from "sportsbook/model/EventTreeModel";
import {Proto} from "sportsbook/model/factory/EventFactory";
import {getParam} from "common/util/Href";
import OutrightsWidget from 'outrights/OutrightsWidget';
import {MAX_NUM_AUTOMATIC_ROWS_FOR_WIDGETS, MAX_TILESPAN_FOR_WIDGETS, ROUTE_NOT_FOUND} from "app/AppConstants";
import cancelable from "common/util/Cancelable";
import Title from 'app/components/main/Title';
import {classNames as cx} from "common/util/ReactUtil";

class CompetitionView extends React.Component {
	static defaultProps = {
		addBreadcrumbs: true,
		headerType: 'large',
		isCountry: false,
		sport: App.Globals.sport
	};

	constructor(props, context) {
		super(props, context);
		this.updateFunction = this.fetch.bind(this);
	    this.onFetch = cancelable.callback(this.onFetch, this);

		const {multiple=true} = this.props;

		this.state = {events: [], loading: false, max: 8, multiple};

		this.numRows = MAX_NUM_AUTOMATIC_ROWS_FOR_WIDGETS;
		// If the widget spans all columns, use the custom maxRows value
		if (this.props.tilespan === MAX_TILESPAN_FOR_WIDGETS && this.props.maxRows){
			this.numRows = this.props.maxRows;
		}
	}

	/**
	 * @param max
	 * @param multiple
	 */
	fetch(max = 99, multiple = true) {
		const compId = this.props.id || getParam('id');
		//need to set it here
		this.setState({compId});

		const comp = eventTree.getCompetition(compId);

	    if (!comp) {
			return App.bus.trigger(ROUTE_NOT_FOUND);
	    }

		const sport = eventTree.getSportForNode(comp.id);
		this.setState({loading: true, sport: sport}, () => {
			// const markets = multiple ? App.data.request('keyMarkets', sport, 2) : [];
			const markets = App.data.request('keyMarkets', sport, multiple ? 3 : 1);
		    this.factory.fetchCompetition(compId, markets.join(','), sport)
			.then((events) => this.onFetch(events, max, multiple, compId, comp));
		});
	}

    onFetch(events, max, multiple, compId, comp) {

	this.setState({
	    loading: false,
	    eventUid: _.uniqueId(),
	    multiple: multiple,
	    events: events,
	    compId: compId,
	    comp: comp,
	    max: max
	});
    }

	/**
	 *
	 */
	componentWillMount() {
		this.factory = new Proto();
		this.fetch();
	}

    componentWillUnmount() {
	this.onFetch.cancel();
    }

	/**
	 *
	 */
	componentWillUpdate() {
		const compId = this.props.id || getParam('id');
		if (this.state.compId !== compId && compId) {
			this.fetch();
		}
	}

	componentWillReceiveProps(nextProps){
		const {multiple} = nextProps;
		if (multiple && multiple !== this.state.multiple){
			this.setState({multiple});
		}
	}

    isCompetition() {
        const URLparams = this.props;
        if(URLparams.location) {
            if (URLparams.location.pathname.indexOf('competition')) {
                return true;
            }
        }
        return false;
    }

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		const {comp, events, loading, max, sport} = this.state;
		if (!comp) return (null);
		const numMarkets = events ? _.size(events) : 0;
		const sub = (numMarkets > 0) ? `${numMarkets} Event${numMarkets === 1 ? '' : 's'}` : '';
		const titles = Widget.getTitles(comp.get('name'), sub, this.props);

		const compNameLowerCase = comp.get('name').toLowerCase();
		const outrightTitle = (compNameLowerCase.indexOf('outright') > -1  || compNameLowerCase.indexOf('outright') > -1 ) ? comp.get('name') : comp.get('name') + ' outrights';//TODO: translation
		const outrightsTitles = Widget.getTitles(outrightTitle, sub, this.props);
		const showEvents = _.first(events, max);
		const hasEvents = showEvents.length > 0;

		const props = Object.assign({}, this.props, titles, {
			loading: loading,
			footer: this.renderFooter(),
			headerType: this.props.headerType,
			toFavourite: comp,
			tilespan: 3,
			className: 'c-competition-view',
			frame: hasEvents,
			noBorderBody: !hasEvents
		});

		const outrightsProps = Object.assign({}, this.props, outrightsTitles, {
			footer: this.renderFooter(),
			headerType: this.props.headerType,
			toFavourite: comp,
			path: comp.get('id').toString(), //pass comp id as path to filter outrights
			tilespan: 3,
			className: cx('c-competition-view__outrights', {'c-competition-view__outrights--no-events': !hasEvents}),
		});

		return (
			<div className="grid">
				{hasEvents && (
				    <Title title={`${comp.get('name')} - ${sport}`}>
						<Widget {...props}>
							<EventsView events={showEvents}
										eventUid={this.state.eventUid}
										breadcrumbs={comp}
										favourite={comp}
										sport={sport}
										tilespan="3"/>

							{showEvents.length < events.length && (
								<EventsFooterView events={this.state.events}
												  updateFunction={this.updateFunction}/>
							)}
						</Widget>
				    </Title>
				)}

				<OutrightsWidget {...outrightsProps} isCountry={this.props.isCountry} sport={sport} />
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderFooter() {
		return (
			<div/>
		);
	}
}

export default CompetitionView;
