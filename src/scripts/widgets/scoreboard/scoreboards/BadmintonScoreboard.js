import {propTypes, defaultProps} from 'sportsbook/model/incidents/types/AmericanFootballProps.js';
import ScoreboardMethods from 'scoreboard/ScoreboardMethods';
import ScoreBoardClockView from 'scoreboard/ScoreBoardClockView';
import ScoreBoardSimpleClockView from 'scoreboard/ScoreBoardSimpleClockView';
import {Scoreboard, Main, Participants, Stats, Points} from 'scoreboard/ScoreboardComponents';

class BadmintonScoreboard extends ScoreboardMethods {

	constructor(props) {
		super(props);
	}

	getPointsScore(teamA) {
		const {incidents} = this.props;
		const score = incidents.getInternalPointsScore();// we need to convert from 1 to 15 etc(unless tie break)
		const scores = score.replace('-', ':').split(':')
		return teamA ? scores[0] : scores[1]
	}

	/**
	 * @returns {XML}
	 */
	render() {
		if(this.getIncident('dataExternalFormat')){ //BETRADAR or inplay client.
			let scre = this.getTeamIncident('POINT_SCORE', true)
			let scoreA = scre.replace(/50/g, 'A')
			this.participantA = {
				name: this.props.event.get('participantA'),
				pointsScore: scoreA,
				gamesScore: this.getTeamIncident('GAME_SCORE', true)
			};
			let score = this.getTeamIncident('POINT_SCORE', false)
			let scoreB = score.replace(/50/g, 'A')
			this.participantB = {
				name: this.props.event.get('participantB'),
				pointsScore: scoreB,
				gamesScore: this.getTeamIncident('GAME_SCORE', false)
			};
			this.matchInfo = {
				setNumber: this.getIncident('SET_NUMBER'),
				activeTeam: this.getIncident('SERVING_TEAM') === "HOME" ? "A" : "B"
			};
		}else{//trader client (internal)
			this.participantA = {
				name: this.props.event.get('participantA'),
				pointsScore: this.getPointsScore(true),
				gamesScore: this.getIncident('gamesA')
			};
			this.participantB = {
				name: this.props.event.get('participantB'),
				pointsScore: this.getPointsScore(false),
				gamesScore: this.getIncident('gamesB')
			};

			const setNo = 1 + parseInt(this.getIncident('setsA')) +  parseInt(this.getIncident('setsB'));
			this.matchInfo = {
				setNumber: setNo,
				activeTeam: this.getIncident('onServeTeamNow')
			};
		}

		let {
			participantA,
			participantB
		} = this;

		let {
			setNumber,
			activeTeam
		} = this.matchInfo;

		return (
			<Scoreboard sport={'badminton'}>
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

				</Main>
			</Scoreboard>
		)

	}

}
;

export default BadmintonScoreboard;
