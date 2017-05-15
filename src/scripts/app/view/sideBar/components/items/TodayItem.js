export default class TodayItem extends React.Component {
  constructor(props) {
    super(props);

    this.onNavigateToToday = ::this.onNavigateToToday;
  }

  onNavigateToToday(e) {
    e.stopPropagation();
    e.preventDefault();
    const { sport } = this.props;
    const toSport = sport.toLowerCase();
    App.navigate(`sports/${toSport}/today`);
  }

  render() {
    const { sport, numEvents } = this.props;
    const translatedSportName = App.Intl(`sport.name.${sport}`);
    const label = App.Intl('mybets.todays_sport', { sport: translatedSportName });

	// needs to fix the horse racing display
    if (!numEvents) {
      return null;
    }

    return (
      <li className="section-header burger-todays">
        <a className="c-burger-section__item-link" onClick={this.onNavigateToToday}>
          <span>{ label }</span>
          <div className="g-lozenge--primary u-float-right">{ numEvents }</div>
        </a>
      </li>
    );
  }
}
