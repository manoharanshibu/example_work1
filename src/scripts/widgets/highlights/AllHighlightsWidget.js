import Widget from 'app/view/widgets/WidgetBase';
import EventsView from 'app/view/sport/components/EventsView';
import EventsFooterView from 'app/view/sport/components/EventsFooterView';
import PriorityNav from 'app/components/priority-nav/PriorityNav';
import {Proto} from 'sportsbook/model/factory/EventFactory';
import {classNames as cx} from 'common/util/ReactUtil';
import moment from 'moment';

class AllHighlightsWidget extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.updateFunction = this.fetch.bind(this);
		this.factory = new Proto();
		this.state = {
			events: [],
			group: null,
			groups: [],
			sport: null,
			loading: false,
			max: 8,
			multiple: false
		};
	}

	/**
	 * @param group
	 */
	onTabClick( group ) {
		this.setState( {
			group: group,
			sport: group.get('sport'),
			events: group.get('events'),
			eventUid: _.uniqueId(),
			loading: false
		} );
	}

	/**
	 *
	 */
	fetchInitial() {
		this.factory.fetchFrontLinks().then((groups) => {
			const group = _.first(groups);
			const events = group && group.get('events');
			this.setState( {
				sport: group && group.get('sport'),
				eventUid: _.uniqueId(),
				events: events,
				groups: groups,
				loading: false,
				group: group
			} );
		});
	}

	/**
	 * @param max
	 * @param multiple
	 * @returns {Promise}
	 */
	fetch(max, multiple) {
		const that = this;
		const sport = this.state.sport;
		const markets = multiple ? App.data.request( 'keyMarkets', sport, 2 ) : null;
		const marketTypes = markets ? markets.join(',') : null;
		this.factory.fetchFrontLinks(sport, marketTypes, max + 1).then((groups) => {
			that.setState({
				group: _.first(groups),
				eventUid: _.uniqueId(),
				multiple: multiple,
				loading: false,
				max: max
			});
		});
	}

	/**
	 *
	 */
	componentDidMount() {
		this.fetchInitial();
	}

	/**
	 * @returns {XML}
     */
	render() {
		// if no groups, don't show widget
		if (!this.state.groups.length) {
			return null;
		}

		const date = moment().format( 'dddd, MMMM Do YYYY' );
		const titles = Widget.getTitles(App.Intl('widgets.highlights.title.highlights'), date, this.props);
		const showEvents = _.first(this.state.events, this.state.max);
		const tabs = this.renderTabs();
		const props = Object.assign({}, this.props, titles, {
			footer: this.renderFooter(),
			loading: this.state.loading,
			headerType: this.props.headerType
		});
		return (
			<Widget {...props}>
				{tabs}
				<EventsView events={showEvents}
							eventUid={this.state.eventUid}
							multiple={this.state.multiple}
							sport={this.state.sport}/>
			</Widget>
		)
	}

	/**
	 * @returns {XML}
	 */
	renderTabs() {
		const tabs = this.renderGroupTabs();
		const navProps = {
			tag: "div",
			className: 'g-tabs-wrapper',
			navDropdownLabel: App.Intl('prioritynav.more').toLowerCase(),
			itemActiveClass: 'active',
			navStyles: {top: 46},
			navRef: 'list'
		}
		return (
			<PriorityNav {...navProps}>
				<ul ref="list" className="tile-tabs">
					{tabs}
				</ul>
			</PriorityNav>
		);
	}

	/**
	 * @returns {*}
	 */
	renderGroupTabs() {
		return _.map( this.state.groups, ( group, i ) => {
			const sport = group.get('sport');
			const className = cx( { active: sport == this.state.sport } );
			const title = App.Intl('sport.name.' + sport.toLowerCase());
			return (
				<li key={i} className={className}>
					<a onClick={this.onTabClick.bind(this, group)}>{_.titleize(title)}</a>
				</li>
			);
		}, this );
	}

	/**
	 * @returns {XML}
	 */
	renderFooter() {
		return (
			<EventsFooterView events={this.state.events}
							  updateFunction={this.updateFunction}
							  sport={this.props.sport}/>
		)
	}
}

export default AllHighlightsWidget;
