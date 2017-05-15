import { propTypes, defaultProps } from 'sportsbook/model/incidents/types/DartsProps.js';
import ScoreboardMethods from 'scoreboard/ScoreboardMethods';
import { Scoreboard, Main, Participants, Points } from 'scoreboard/ScoreboardComponents';

class DartsScoreboard extends ScoreboardMethods {
  static defaultProps = defaultProps;
  static propTypes = propTypes;

  constructor(props) {
    super(props);
  }

  render() {
    const currentLeg = this.getIncident('currentLeg');
    const playerA = currentLeg.playerA;
    const playerB = currentLeg.playerB;

    this.participantA = {
      name: this.props.event.get('participantA'),
      pointsScore: playerA.points,
      setScore: this.getIncident('playerAScore').sets,
      legScore: this.getIncident('playerAScore').legs,
    };
    this.participantB = {
      name: this.props.event.get('participantB'),
      pointsScore: playerB.points,
      setScore: this.getIncident('playerBScore').sets,
      legScore: this.getIncident('playerBScore').legs,
    };
    this.matchInfo = {
      playerAtOche: this.getIncident('currentLeg').playerAtOche,
    };
    const { playerAtOche } = this.matchInfo;

    const { participantA, participantB } = this;

    return (
      <Scoreboard sport={'darts'}>
        <Main>
          <Participants
            home={participantA.name}
            away={participantB.name}
            serving={playerAtOche}
            icon={'circle'}
          />
          <Points
            primary
            title={App.Intl('scoreboard.general.sets')}
            home={participantA.setScore}
            away={participantB.setScore}
          />
          <Points
            primary
            title={App.Intl('scoreboard.general.legs')}
            home={participantA.legScore}
            away={participantB.legScore}
          />
          <Points
            title={App.Intl('scoreboard.general.points')}
            home={participantA.pointsScore}
            away={participantB.pointsScore}
          />
        </Main>
      </Scoreboard>
    );
  }
}

export default DartsScoreboard;
