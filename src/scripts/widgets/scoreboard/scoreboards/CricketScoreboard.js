import ScoreboardMethods from 'scoreboard/ScoreboardMethods';
import { Scoreboard, Main, Participants, Points } from 'scoreboard/ScoreboardComponents';

class CricketScoreboard extends ScoreboardMethods {

  constructor(props) {
    super(props);
  }

  render() {
    this.participantA = {
      name: this.props.event.get('participantA'),
      runs: this.getIncident('runsA'),
      wickets: this.getIncident('wicketsA'),
      overs: `${this.getIncident('oversA')}.${this.getIncident('ballsA') - ((this.getIncident('oversA') - 1) * 6)}`,
    };
    this.participantB = {
      name: this.props.event.get('participantB'),
      runs: this.getIncident('runsB'),
      wickets: this.getIncident('wicketsB'),
      overs: `${this.getIncident('oversB')}.${this.getIncident('ballsB') - ((this.getIncident('oversB') - 1) * 6)}`,
    };

    this.matchInfo = {
      activeTeam: this.getIncident('bat'),
    };

    const { participantA, participantB } = this;
    const { activeTeam } = this.matchInfo;

    return (
      <Scoreboard sport={'circle'}>
        <Main>
          <Participants
            home={participantA.name}
            away={participantB.name}
            serving={activeTeam}
            icon={'circle'}
          />
          <Points
            primary
            title={App.Intl('scoreboard.general.runs_wickets')}
            home={`${participantA.runs}/${participantA.wickets}`}
            away={`${participantB.runs}/${participantB.wickets}`}
          />
          <Points
            primary
            title={App.Intl('scoreboard.general.overs')}
            home={participantA.overs}
            away={participantB.overs}
          />
        </Main>
      </Scoreboard>
    );
  }

}


export default CricketScoreboard;
