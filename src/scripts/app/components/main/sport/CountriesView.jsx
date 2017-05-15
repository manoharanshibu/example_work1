import CompetitionView from "app/components/main/sport/CompetitionView";
import eventTree from "sportsbook/model/EventTreeModel";

export default class CountriesView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {countries: []};
	}

	/**
	 *
	 */
	componentWillMount() {
		const countries = eventTree.getCountries();
		const sorted = _.sortBy(countries.models, (country) => {
			return country.get('name');
		});
		this.setState({countries: sorted});
	}

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		const countries = this.renderCountries();
		return (
			<div>
				{countries}
			</div>
		)
	}


	/**
	 * Renders a competition block
	 * @param model
	 * @param index
	 * @returns {XML}
	 */
	renderCountries() {
		return _.map(this.state.countries, (country, index) => {
			const parent = country.get('parent');
			const subTitle = parent ? parent.get('name') : '';
			const props = {
				id: country.id,
				addBreadcrumbs: false,
				subTitle: subTitle,
				eventUid: this.state.eventUid,
				headerType: "small"
			};
			return (
				<CompetitionView key={country.id} {...props}/>
			)
		});
	}
}
