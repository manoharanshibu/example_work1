import BurgerSection from 'app/view/sideBar/components/BurgerSection';
import CompetitionItem from 'app/view/sideBar/components/items/CompetitionItem';
import CountryItem from 'app/view/sideBar/components/items/OldCountryItem';
import CompetitionFactory from 'sportsbook/model/factory/CompetitionFactory';

export default class CountrySection extends React.Component {
  static propTypes = {
    sport: React.PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.forceRender = ::this.forceRender;
    CompetitionFactory.on('all', this.forceRender);
    CompetitionFactory.fetchSport(this.props.sport);
  }

  onComponentWillUnmount() {
    CompetitionFactory.off('all', this.forceRender);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.sport !== this.props.sport) {
      CompetitionFactory.fetchSport(nextProps.sport);
    }
  }

  forceRender() {
    this.forceUpdate();
  }

  getComps() {
    const comps = _.values(CompetitionFactory.Countries);
    return _.filter(comps, comp =>
            // only display competitions for the current sport
            comp.get('code') === this.props.sport.toLowerCase() &&
            // for some reason the sport is often in the countries list ¯\_(ツ)_/¯
            comp.get('name').toLowerCase().replace(/ /, '_') !== this.props.sport.toLowerCase(),
        );
  }

  render() {
    const countryProps = {
      title: App.Intl('forms.countries'),
      expanded: !App.isMobile(),
    };
    const competitions = this.getComps();
    return (!competitions.length) ? null : (
      <BurgerSection {...countryProps}>
        {this.renderCompetitons(competitions)}
      </BurgerSection>
		);
  }

  renderCompetitons(competitions) {
    return _.map(competitions, competition => <CountryItem key={competition.id} comp={competition} location={this.props.location} />);
  }

}
