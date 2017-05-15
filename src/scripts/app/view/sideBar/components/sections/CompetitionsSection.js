import BurgerSection from 'app/view/sideBar/components/BurgerSection';
import CompetitionItem from 'app/view/sideBar/components/items/CompetitionItem';
import eventTree from 'sportsbook/model/EventTreeModel';
import SportsHeaderSection from 'app/view/sideBar/components/sections/SportsHeaderSection';

export default class HighlightsSection extends React.Component {
  constructor() {
    super();
  }

  renderCompetitons(competitions) {
    return _.map(competitions, competition => (
      <CompetitionItem key={competition.id} comp={competition} />
		));
  }

	/**
	 * @returns {XML}
	 */
  render() {
    const countries = eventTree.getCompetitions();
    const competitions = _.reduce(countries, (acc, country) => {
      const competition = country.get('competition');
      return competition ? acc.concat(country.get('competition')) : acc;
    }, []);

    if (!competitions.length) return null;

    const competitionProps = {
      title: App.Intl('competitions'),
      expanded: !App.isMobile(),
    };
    return (
      <div>
        <SportsHeaderSection key={1} sport={App.Globals.sport} />
        <BurgerSection {...competitionProps} >
          {this.renderCompetitons(competitions)}
        </BurgerSection>
      </div>
    );
  }
}
