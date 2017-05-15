import BurgerSection from 'app/view/sideBar/components/BurgerSection';
import { classNames as cx } from 'common/util/ReactUtil';
import eventTree from 'sportsbook/model/EventTreeModel';

export default class CountriesSection extends React.Component {
  constructor(props) {
    super(props);
  }

	// needs rewriting when coutry pages have been set.
  navigate(country) {
    const code = country.get('code').toLowerCase();

    App.navigate(`/${code}`);
  }

	/**
	 * @returns {XML}
	 */
  render() {
    const title = App.Intl('forms.countries');
    const sportProps = {
      title,
      expanded: false,
    };
    return (
      <BurgerSection {...sportProps}>
        {this.renderCountries()}
      </BurgerSection>
    );
  }

	/**
	 * @param comps
	 * @param max
	 * @returns {*}
	 */
  renderCountries(code) {
    const countries = eventTree.getCountries(code);
		// const {countries} = this.state;
    if (!countries.length) return null;

    return _.map(countries.models, (country, index) => {
      const name = country.get('name');
      const isActive = ' is-active'; // needs to be dynamic by checking if your on that country page

      return (
        <li key={index} onClick={this.navigate.bind(this, country)} className={`c-burger-section__item h4${isActive}`}>
          {name.replace(/_/g, ' ')}
        </li>
      );
    }, this);
  }
}
