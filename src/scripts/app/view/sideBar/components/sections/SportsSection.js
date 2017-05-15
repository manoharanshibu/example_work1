import regionalSports from 'sportsbook/model/RegionalSportsModel';
import BurgerSection from 'app/view/sideBar/components/BurgerSection';
import { classNames as cx } from 'common/util/ReactUtil';
import eventTree from 'sportsbook/model/EventTreeModel';
import { BREADCRUMB_CLOSE_ALL_DROPDOWNS, TOGGLE_SIDE_BAR } from 'app/AppConstants';
import { Link } from 'react-router';
import { slugify } from 'sportsbook/util/SportUtil';

export default class SportsSection extends React.Component {
  constructor(props) {
    super(props);

    this.totalEventsOpen = 0;

    this.eventCount = [];
    this.state = {
      sport: '',
      sports: [],
			// countries: [],
      maxSports: 50,
      maxComps: 6,
      countryId: null,
      sportId: null,
      aToZOpen: false,
      sportLeagues: [],
      userInteraction: false,
    };
  }

	/**
	 * Get all the sports
	 */
  componentWillMount() {
    const sports = regionalSports.get('sportsWithEvents');
    if (!sports.length) return null;
    const sport = this.props.params.sport || _.first(sports).code;

    this.setState({
      sport,
      sports,
      userInteraction: false,
    });
  }

	/**
	 * Update sport state when you navigate to to a new page so the
	 * corresponding burger menu item is opened if available
	 */
  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
			// get the current sport for the page we just navigated to
      const currentSport = App.Globals.sport.toUpperCase();
      this.setState({
        sport: currentSport,
      });

			/**
			 * Iterate through the main sports and if none of them match the
			 * current sport open the AtoZ list
			 */
      const maxSports = _.first(this.state.sports, this.state.maxSports);
      let currentInMain = false;
      _.each(maxSports, (sportElement) => {
        if (sportElement.code === currentSport) {
          currentInMain = true;
        }
      });
      this.setState({
        aToZOpen: !currentInMain,
      });
    }
  }

	/**
	 * @param sport
	 */
  onSportExpand(sport) {
    this.setState({
      sport,
      userInteraction: true,
    });
  }

  onNavigate() {
    App.bus.trigger(TOGGLE_SIDE_BAR);
    App.bus.trigger(BREADCRUMB_CLOSE_ALL_DROPDOWNS);
  }

  isActive(name) {
    if (name === 'football') {
      name = 'soccer';
    }
    const sportSlug = this.getHref(name);
    const pathname = this.props.location.pathname;
    return pathname === sportSlug;
  }

	/**
	 * @param nextProps
	 */
  getHref(name) {
    const slug = slugify(name);
    return `/en/${slug}`;
  }

	/**
	 * @param sports
	 * @returns
     */
  renderSportItems(sports) {
    return _.map(sports, (sport, index) => {
      const title = App.Intl(`sport.name.${sport.code.toLowerCase()}`);
      const sportCode = sport.code.toLowerCase();
      const isActive = cx({ 'is-open': this.isActive(sport.name) });

      return (
        <li key={sportCode} className={`c-burger-section__item ${isActive}`}>
          <Link
            to={`/${App.Globals.lang}/sports/${sportCode}`}
            className="c-burger-section__item-link"
            onClick={this.onNavigate.bind(this)}
          >
            {title}
          </Link>
        </li>
      );
    }, this);
  }

	/**
	 * Displays list on matrix prioritised sports, with a maximum of x sports
	 * @returns {XML}
	 */
  renderSports() {
    const maxSports = _.first(this.state.sports, this.state.maxSports);
    const sportList = maxSports;
    let sortedAlphabetically = sportList.slice(0);

    sortedAlphabetically = _.sortBy(sortedAlphabetically, a => a.name);
    return this.renderSportItems(sortedAlphabetically);
  }

	/**
	 * @returns {XML}
	 */
  render() {
    const sportProps = {
      title: App.Intl('header.sports_a_z'),
      expanded: !App.isMobile(),
    };
    return (
      <BurgerSection {...sportProps} aToZ>
        {this.renderSports()}
      </BurgerSection>
    );
  }
}
