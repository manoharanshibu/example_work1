import CompetitionView from "app/components/main/sport/CompetitionView";
import eventTree from "sportsbook/model/EventTreeModel";
import {getParam} from "common/util/Href";

export default class CountryView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {competitions: []};
	}

	/**
	 *
	 */
	fetch() {
		const compId = getParam('id');
		if (!compId) return;

		const country = eventTree.getCompetition(compId);
		if (!country) return;

		eventTree.addAncestors(country);
		this.setState({
			country: country,
			competitions: country.Children,
			loading: false, eventUid: _.uniqueId()
		});
	}

	/**
	 *
	 */
	componentWillMount() {
		this.fetch();
	}

	componentWillReceiveProps(nextProps){
		const {pathname} = nextProps.location;
		const prevPathName = this.props.location.pathname;

		if (pathname !== prevPathName){
			// We have navigated internally to anoter competition and,
			// therefore, we need to fetch the corresponding data.
			this.fetch();
		}
	}

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		const competitions = this.renderCompetitions();
		const country = this.state.country;
		return (
			<div>
				{competitions}
			</div>
		)
	}

	/**
	 * Renders a competition block
	 * @param model
	 * @param index
	 * @returns {XML}
	 */
	renderCompetitions() {
		return _.map(this.state.competitions.models, (comp, index) => {
			const parent = comp.get('parent');
			const subTitle = parent ? parent.get('name') : '';
			const props = {
				id: comp.id,
				addBreadcrumbs: true,
				subTitle: subTitle,
				eventUid: this.state.eventUid,
				headerType: "small"
			};
			return (
				<CompetitionView key={comp.id} {...props} isCountry="true"/>
			)
		});
	}
}
