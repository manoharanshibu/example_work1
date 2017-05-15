import BurgerSection from 'app/view/sideBar/components/BurgerSection';
import CountryItem from 'app/view/sideBar/components/items/CountryItem';
import eventTree from 'sportsbook/model/EventTreeModel';
import BurgerItemLite from 'app/view/sideBar/components/BurgerItemLite';

export default class NewSportsSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sports: [],
    };
  }

  /**
   * Get all the sports
   */
  componentWillMount() {
    const sports = eventTree.getSports();
    sports.forEach((sport) => {
      sport.translated = App.Intl(`sport.name.${sport.code}`);
    });

    this.setState({ sports });
  }

  /**
   * @returns {*}
   */
  renderAtoZSports() {
    const { sports } = this.state;
    const allSports = _.sortBy(sports, spt => spt.translated);

    const aToZSports = allSports.map((sport, index) => {
      const title = App.Intl(`sport.name.${sport.code.toLowerCase()}`);
      const sportProps = {
        title,
        eventCount: eventTree.sportEvents(sport.code),
        expanded: false,
      };

      const showAllProps = {
        index: sport.code,
        item: {
          name: `All ${title}`,
          route: `sports/${sport.code.toLowerCase()}`,
        },
      };

      return (
        <BurgerSection key={sport.code} {...sportProps}>
          <BurgerItemLite {...showAllProps} />
          {this.renderCountries(sport.code)}
        </BurgerSection>
      );
    }, this);

    return aToZSports;
  }

  /**
   * @param code
   * @returns {*}
   */
  renderCountries(code) {
    const countries = eventTree.getCountriesByWeightedCompetitions(code);
    if (!countries.length) return null;

    return countries.map((country, index) => {
      const props = {
        key: index,
        comp: country,
        sportCode: code,
      };
      return <CountryItem key={index} {...props} />;
    }, this);
  }

  /**
   * @returns {XML}
   */
  render() {
    const aToZSports = this.renderAtoZSports();
    return (
      <BurgerSection title="A-Z" expanded={false}>
        {aToZSports}
      </BurgerSection>
    );
  }
}
