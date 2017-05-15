import userModel from "sportsbook/model/UserPreferencesModel";
import CompetitionView from "app/components/main/sport/CompetitionView";

export default class CompetitionsView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			competitions: userModel.Competitions
		};
	}

	/**
	 *
	 */
	componentDidMount() {
		userModel.Competitions.on('update reset', function () {
			this.setState({
				competitions: userModel.Competitions,
				eventUid: _.uniqueId()
			});
		}.bind(this));
	}

	/**
	 *
	 */
	componentWillUnmount() {
		userModel.Competitions.off(null, null, this);
	}

	/**
	 * @param nextProps
	 * @param nextState
	 * @returns {boolean}
	 */
	shouldComponentUpdate(nextProps, nextState) {
		return nextState.eventUid !== this.state.eventUid;
	}

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		return (
			<div>
				{this.renderCompetitions()}
			</div>
		);
	}

	/**
	 * Renders a competition block
	 * @param model
	 * @param index
	 * @returns {XML}
	 */
	renderCompetitions() {
		return _.map(this.state.competitions.models.slice(), (comp, index) => {
			const parent = comp.get('parent');
			const subTitle = parent ? parent.get('name') : '';
			const props = {
				id: comp.id,
				addBreadcrumbs: false,
				subTitle: subTitle,
				eventUid: this.state.eventUid,
				headerType: "small"
			};
			return <CompetitionView key={comp.id} {...props} isCountry={false}  />;
		});
	}
}
