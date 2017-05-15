import Widget from 'app/view/widgets/WidgetBase';
import GroupedEventsView from 'app/view/sport/components/GroupedEventsView';
import moment from 'moment';

const SportHighlightsWidget = (props) => {
	const date = moment().format( 'dddd, MMMM Do YYYY' );
	const sport = App.Globals.Sport(props.sport, false);
	const sport_translated = App.Intl('sport.name.' + sport.toLowerCase());
	const titles = Widget.getTitles(sport_translated + ' ' + App.Intl('widgets.highlights.title.highlights'), date, props);
	props = Object.assign({}, props, titles, {
		groupBy: 'compId',
		titleBy: 'compName',
		groupEvents: true
	});
	return (
		<GroupedEventsView {...props}/>
	);
}

export default SportHighlightsWidget;
