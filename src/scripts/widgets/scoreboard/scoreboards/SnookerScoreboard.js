import ScoreboardMethods from 'scoreboard/ScoreboardMethods';
import { Scoreboard, Main, Participants, Stats, Points } from 'scoreboard/ScoreboardComponents';

class SnookerScoreboard extends ScoreboardMethods {

  constructor(props) {
    super(props);
  }

  render() {
    this.participantA = { name: this.props.event.get('participantA'), frameScore: this.getIncident('framesA') };
    this.participantB = { name: this.props.event.get('participantB'), frameScore: this.getIncident('framesB') };

    const { participantA, participantB } = this;

    const bestOf = Number(this.getIncident('setScoreForWin'));
    const calcBestOf = (bestOf * 2) - 1;

    return (
      <Scoreboard sport={'snooker'}>
        <Stats
          items={[App.Intl('scoreboard.general.best_of_frames', { bestOf: calcBestOf })]}
        />
        <Main>
          <Participants
            home={participantA.name}
            away={participantB.name}
          />
          <Points
            primary
            title={App.Intl('scoreboard.general.frames')}
            home={participantA.frameScore}
            away={participantB.frameScore}
          />
        </Main>
      </Scoreboard>
    );
  }
}

export default SnookerScoreboard;
