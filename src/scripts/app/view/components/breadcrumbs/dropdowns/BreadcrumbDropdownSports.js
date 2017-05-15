import BreadcrumbDropdown from 'app/view/components/breadcrumbs/dropdowns/BreadcrumbDropdown.jsx';
import regionalSports from 'sportsbook/model/RegionalSportsModel';

export default class BreadcrumbDropdownSports extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sport: '',
      sports: [],
    };
  }

	/**
	 * Get all the sports
	 */
  componentWillMount() {
    const sports = regionalSports.get('sportsWithEvents');

    if (!sports.length) return;

    const sport = this.props.params.sport || _.first(sports).code;

    this.setState({
      sport,
      sports,
    });
  }

  getHref(code) {
    return `sports/${code}`;
  }

  renderSports() {
    const sportList = [];

    const sports = this.state.sports;
    if (!sports.length) return null;

    _.map(sports, (sport) => {
      const name = App.Intl(`sport.name.${sport.code.toLowerCase()}`);
      const listItem = {
        title: name,
        route: this.getHref(sport.code.toLowerCase()),
      };
      sportList.push(listItem);
    }, this);

    return sportList;
  }

  render() {
    const listItems = this.renderSports();
    return (
      <BreadcrumbDropdown
        listItems={listItems}
        {...this.props}
      />
    );
  }
}
