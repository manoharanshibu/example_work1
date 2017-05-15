export default class SportsHeaderSection extends React.Component {

  constructor(props) {
    super(props);
    this.forceUpdate = ::this.forceUpdate;
  }

  render() {
    let sport = App.Globals.sport;
    if (sport === 'soccer') {
      sport = 'football';
    }
    const sportTitle = sport.replace(/_/g, ' ');
    return (
      <div className="c-burger-section__sport-header">
        {sportTitle}
      </div>
    );
  }

}
