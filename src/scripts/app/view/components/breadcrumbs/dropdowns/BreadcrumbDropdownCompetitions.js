import BreadcrumbDropdown from 'app/view/components/breadcrumbs/dropdowns/BreadcrumbDropdown.jsx';
import eventTree from 'sportsbook/model/EventTreeModel';
import { slugify } from 'sportsbook/util/SportUtil';

export default class BreadcrumbDropdownCompetitions extends React.Component {
  constructor(props) {
    super(props);
  }

  getHref(comp) {
    const code = comp.get('code').toLowerCase();
    const slug = slugify(comp.get('name'));
    return `sports/${code}/country/${slug}?id=${comp.id}`;
  }

  renderCompetitions(code) {
    const competitionsList = [];

    const competitions = eventTree.getCountries(code);
    if (!competitions.length) return null;

    _.map(competitions.models, (comp) => {
      const name = comp.attributes.name;
      const listItem = {
        title: name,
        route: this.getHref(comp),
      };
      competitionsList.push(listItem);
    }, this);

    return competitionsList;
  }

  render() {
    const listItems = this.renderCompetitions();
    return (
      <BreadcrumbDropdown
        listItems={listItems}
        {...this.props}
      />
    );
  }
}
