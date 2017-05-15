import {propTypes, defaultProps} from 'sportsbook/model/incidents/types/BasketballProps';
import ScoreboardMethods from 'scoreboard/ScoreboardMethods';
import ScoreBoardSimpleClockView from 'scoreboard/ScoreBoardSimpleClockView';
import {Scoreboard, Main, Participants, Stats, Points} from 'scoreboard/ScoreboardComponents';

class BasketballScoreboard extends ScoreboardMethods {

	constructor(props) {
		super(props);
	}

	/**
	 *
	 * @returns {XML}
	 */
	render() {
		if (this.getIncident('dataExternalFormat') === true) { //BETRADAR
			this.participantA = {
				name: this.props.event.get("participantA"),
				firstQuarterPoints: this.getTeamIncident('PERIOD_1_SCORE', true),
				secondQuarterPoints: this.getTeamIncident('PERIOD_2_SCORE', true),
				thirdQuarterPoints: this.getTeamIncident('PERIOD_3_SCORE', true),
				fourthQuarterPoints: this.getTeamIncident('PERIOD_4_SCORE', true),
				pointsScore: this.getTeamIncident('SCORE', true)
			};
			this.participantB = {
				name: this.props.event.get("participantB"),
				firstQuarterPoints: this.getTeamIncident('PERIOD_1_SCORE', false),
				secondQuarterPoints: this.getTeamIncident('PERIOD_2_SCORE', false),
				thirdQuarterPoints: this.getTeamIncident('PERIOD_3_SCORE', false),
				fourthQuarterPoints: this.getTeamIncident('PERIOD_4_SCORE', false),
				pointsScore: this.getTeamIncident('SCORE', false)
			};
			const currentPeriod = this.getIncident('PERIOD_COUNT')
			this.matchInfo = {
				activeTeam: this.getIncident('SERVING_TEAM') === 'HOME' ? "A" : "B",
				matchStatus: this.getPeriodString(currentPeriod , App.Intl('scoreboard.general.quarter'))
			};

		} else {//trader client (internal)
			this.participantA = {
				name: this.props.event.get("participantA"),
				firstQuarterPoints: this.getIncident('firstQuarterPointsA'),
				secondQuarterPoints: this.getIncident('secondQuarterPointsA'),
				thirdQuarterPoints: this.getIncident('thirdQuarterPointsA'),
				fourthQuarterPoints: this.getIncident('fourthQuarterPointsA'),
				pointsScore: this.getIncident('pointsA')
			};
			this.participantB = {
				name: this.props.event.get("participantB"),
				firstQuarterPoints: this.getIncident('firstQuarterPointsB'),
				secondQuarterPoints: this.getIncident('secondQuarterPointsB'),
				thirdQuarterPoints: this.getIncident('thirdQuarterPointsB'),
				fourthQuarterPoints: this.getIncident('fourthQuarterPointsB'),
				pointsScore: this.getIncident('pointsB')
			};
			const currentPeriod = this.getIncident('matchPeriod')
			this.matchInfo = {
				activeTeam: this.getIncident('ballPosition').ballHoldingTeam,
				matchStatus: this.getStandardMatchPeriodString(currentPeriod , App.Intl('scoreboard.general.quarter'))
			};
		}

		let {
			activeTeam,
			matchStatus
			} = this.matchInfo;

		let {
			participantA,
			participantB
			} = this;

		return (
			<Scoreboard sport={'basketball'}>
				<Stats
					//primary={
					//	<ScoreBoardSimpleClockView {...this.props}/>
					//	}
					items={[
						'',
						matchStatus
					]}
				/>
				<Main>
					<Participants
						home={participantA.name}
						away={participantB.name}
						serving={activeTeam}
					/>
					<Points
						title="Q1"
						home={participantA.firstQuarterPoints}
						away={participantB.firstQuarterPoints}
					/>
					<Points
						title="Q2"
						home={participantA.secondQuarterPoints}
						away={participantB.secondQuarterPoints}
					/>
					<Points
						title="Q3"
						home={participantA.thirdQuarterPoints}
						away={participantB.thirdQuarterPoints}
					/>
					<Points
						title="Q4"
						home={participantA.fourthQuarterPoints}
						away={participantB.fourthQuarterPoints}
					/>
					<Points
						primary
						title={App.Intl('scoreboard.general.score')}
						home={participantA.pointsScore}
						away={participantB.pointsScore}
					/>

				</Main>
			</Scoreboard>
		)
	}
}
;

 export default BasketballScoreboard;
