import ScoreboardMethods from 'scoreboard/ScoreboardMethods';
import { Scoreboard, Main, Participants, Stats, Points } from 'scoreboard/ScoreboardComponents';

class TennisScoreboard extends ScoreboardMethods {

  constructor(props) {
    super(props);
  }

  getPointsScore(teamA) {
    const { incidents } = this.props;
    const score = incidents.getInternalPointsScore();
    const scores = score.replace('-', ':').split(':');
    return teamA ? scores[0] : scores[1];
  }

  render() {
    this.participantA = {
      name: this.props.event.get('participantA'),
      pointsScore: this.getPointsScore(true),
      gamesScore: this.getIncident('gamesA'),
      setsScore: this.getIncident('setsA'),
    };
    this.participantB = {
      name: this.props.event.get('participantB'),
      pointsScore: this.getPointsScore(false),
      gamesScore: this.getIncident('gamesB'),
      setsScore: this.getIncident('setsB'),
    };

    const setNo = 1 + parseInt(this.getIncident('setsA')) + parseInt(this.getIncident('setsB'));
    this.matchInfo = {
      setNumber: setNo,
      activeTeam: this.getIncident('onServeTeamNow'),
    };

    const { participantA, participantB } = this;

    const { setNumber, activeTeam } = this.matchInfo;

    return (
      <Scoreboard sport={'tennis'}>
        <Stats
          items={[
            `${this.getOrdinal(setNumber)} ${App.Intl('scoreboard.general.set')}`,
          ]}
        />
        <Main>
          <Participants
            home={participantA.name}
            away={participantB.name}
            serving={activeTeam}
            icon={'tennis'}
          />
          <Points
            title={App.Intl('scoreboard.general.points')}
            home={participantA.pointsScore}
            away={participantB.pointsScore}
            primary
          />
          <Points
            title={App.Intl('scoreboard.general.games')}
            home={participantA.gamesScore}
            away={participantB.gamesScore}
          />
          <Points
            title={App.Intl('scoreboard.general.sets')}
            home={participantA.setsScore}
            away={participantB.setsScore}
          />


        </Main>
      </Scoreboard>
    );
  }

}


export default TennisScoreboard;
