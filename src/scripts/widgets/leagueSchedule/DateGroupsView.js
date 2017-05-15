import React from 'react';
import {classNames as cx} from 'common/util/ReactUtil';
import EventsView from "app/view/sport/components/EventsView";

import {
	TRIGGER_RESIZE,
} from 'app/AppConstants';

export default class DateGroupsView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			viewportWidth: document.documentElement.clientWidth
		};

		this.onEventChanged = ::this.onEventChanged;
		this.triggerResize = this.onResize.bind(this);

		App.bus.on(TRIGGER_RESIZE, this.triggerResize);
	}

	componentWillUnmount() {
		App.bus.off(TRIGGER_RESIZE, this.triggerResize);
	}

	onResize(width) {
		this.setState({viewportWidth: width});
		this.forceUpdate();
	}

	onEventChanged(){
		if (this.props.onEventChanged){
			this.props.onEventChanged();
		}
		this.forceUpdate();
	}

	parseCompDateGroups(comps)
	{
		const mergedGroup = [];
		comps.forEach(comp => {
			this.parseDateGroups(comp.models, mergedGroup, true);
		})
		return this.setGroupInitialExpansion(mergedGroup);
	}

	// group events based on their dates, after the nth date all events
	// will be added to the same group
	parseDateGroups(events, mergedGroup, comps = false){
		if (!events){
			return;
		}

		const displayedEvents = events.filter( ev => !!ev.get('displayed') );

		// This should come from AppConstants, but it might break clients
		// that haven't set up the constant
		const maxGroups = this.props.maxNumGroups;
		let groupedEvents = mergedGroup || [];

		displayedEvents.forEach( event => {
			const eventTime = event.get('eventTime');
			// All events hapenning in the same day should belong to same group
			const eventDate = moment(eventTime).startOf('day').valueOf();
			const hasExpectedDate =  group => (group.eventDate === eventDate);
			const groupWithSameDate = groupedEvents.find(hasExpectedDate);

			if (groupWithSameDate){
				// Add event to an existing group
				groupWithSameDate.events.push(event);
			} else {
				// If we've reached the maximum number of groups,
				// add the event to the last group
				if (groupedEvents.length === maxGroups){
					groupedEvents[maxGroups-1].events.push(event);
				} else {
					// Otherwise, create a new group for the event
					groupedEvents.push({
						eventUid: _.uniqueId(),
						eventDate, events: [event]
					});
				}
			}
		});

		if(comps)
			return;

		return this.setGroupInitialExpansion(groupedEvents);
	}

	// populates an array with info on whether each of the dateGroups passed,
	// should be expanded by default to ensure we are displaying at least
	// MIN_NUM_EVENTS_TO_DISPLAY upfront
	setGroupInitialExpansion(dateGroups){
		const MIN_NUM_EVENTS_TO_DISPLAY = 8;
		let totalDisplayCount = 0;

		dateGroups.forEach( group => {
			const shouldBeExpanded = (totalDisplayCount < MIN_NUM_EVENTS_TO_DISPLAY);
			const displayedEvents = group.events.filter( ev => !!ev.get('displayed') );
			const count = displayedEvents.length;
			totalDisplayCount += count;
			group.expanded = shouldBeExpanded;
		});

		// We ensure that the reference to the array is changed, so that
		// setting the state will force React to rerender
		const newDateGroups = dateGroups.map( x => x );
		return newDateGroups;
	}

	getCompetitionGroups(events)
	{
		const groups = [];
		events.forEach(event =>
		{
			const group = groups.find(g => {
				return g.id === event.get('compId')
			})
			if(group)
				group.events.push(event);
			else
				groups.push({id: event.get('compId'), events: [event]});
		});
		return groups;
	}

	render(){
		const { isRacing } = this.props;
 		return isRacing ? this.renderAll() : this.renderSingle();
	}

	renderSingle()
	{
		const {events, leagueId, sport, tilespan} = this.props;

		if (!events || !events.length){
			return null;
		}

		const dateGroups = this.parseDateGroups( events );
		const groupRows = dateGroups.map((dateGroup, index) =>{
			const {events} = dateGroup;
			const row = [
				this.renderDateGroupHeader(dateGroup, dateGroups, index),
				<span key="sub-arrow" className="g-arrow g-arrow--sub-header"></span>,
				<EventsView key="eventsView" events={events} eventUid={_.uniqueId()} sport={sport} tilespan={tilespan} />
			];
			return row;
		});

		return (
			<div key={leagueId} className="c-league-schedule__group">
				{_.map(groupRows, (row) => {
					return row;
				})}
			</div>
		);
	}


	renderAll()
	{
		const { comps, sport, tilespan } = this.props;

		if (!comps || !comps.length){
			return null;
		}

		const dateGroups = this.parseCompDateGroups(comps);
		const groupRows = dateGroups.map((dateGroup, index) =>{
			const {events} = dateGroup;
			const compGroups = this.getCompetitionGroups(events);
			const row = [
				this.renderDateGroupHeader(dateGroup, dateGroups, index),
				<span key="sub-arrow" className="g-arrow g-arrow--sub-header"></span>,
				compGroups.map(group => {
						return	<EventsView key={group.id} events={group.events} eventUid={group.id} sport={sport}
										tilespan={tilespan}/>
					})
			];
			return row;
		});

		return (
			<div className="c-league-schedule__group">
				{_.map(groupRows, (row) => {
					return row;
				})}
			</div>
		);
	}

	renderDateGroupHeader(group, allgroups,  index){


		const {events, expanded, eventUid} = group;
		const today = App.Intl('transactions.column.date_today');
		const tomorrow = App.Intl('transactions.column.date_tomorrow');
		const future = App.Intl('widgets.general.future_matches');

		const date = moment(group.eventDate).calendar(null, {
					sameDay: `[${today}]`,
					nextDay: `[${tomorrow}]`,
					sameWeek: 'dddd Do',
					nextWeek: 'dddd Do',
					sameElse: `[${future}]`
				});

		const isLastGroup = (index === (allgroups.length-1) && index>1);
		const futureMatches = App.Intl('widgets.general.future_matches');
		const displayDate = isLastGroup ? futureMatches : date;

		const displayedEvents = events.filter( ev => !!ev.get('displayed') );
		const count = displayedEvents.length;
		const isExpandedClass = expanded ? ' is-expanded' : '';
		const lozengeClass = cx('g-lozenge--primary', {'g-lozenge--is-active': expanded});

		return (
				<div key={_.uniqueId(eventUid)}
				  className={"c-outrights-view__header c-events-view__group-header" + isExpandedClass}>
					<div className="g-header-with-arrow">
						{displayDate}
					</div>
					<div className={lozengeClass}>{count}</div>
				</div>
		);
	}
}

DateGroupsView.defaultProps = {
	maxNumGroups: 3
};

DateGroupsView.displayName = 'DateGroupsView';
