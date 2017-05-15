import {propTypes, defaultProps} from 'sportsbook/model/incidents/types/AmericanFootballProps.js';
import ScoreboardMethods from 'scoreboard/ScoreboardMethods';
import ScoreBoardClockView from 'scoreboard/ScoreBoardClockView';
import ScoreBoardSimpleClockView from 'scoreboard/ScoreBoardSimpleClockView';
import {Scoreboard, Main, Participants, Stats, Points} from 'scoreboard/ScoreboardComponents';

class AmericanFootballScoreboard extends ScoreboardMethods {

	constructor(props) {
		super(props);

		this.state = {
			backgroundImage: `americanfootball`
		};
	}

	/**
	 * @returns {XML}
	 */
	render() {
		if(this.getIncident('dataExternalFormat') === true){ //BETRADAR
			this.participantA = {
				name: this.props.event.get("participantA"),
				firstQuaterPoints: this.getTeamIncident('PERIOD_1_SCORE', true),
				secondQuaterPoints: this.getTeamIncident('PERIOD_2_SCORE', true),
				thirdQuaterPoints: this.getTeamIncident('PERIOD_3_SCORE', true),
				fourthQuaterPoints: this.getTeamIncident('PERIOD_4_SCORE', true),
				pointsScore: this.getTeamIncident('SET_SCORE', true)
			};
			this.participantB = {
				name: this.props.event.get("participantB"),
				firstQuaterPoints: this.getTeamIncident('PERIOD_1_SCORE', false),
				secondQuaterPoints: this.getTeamIncident('PERIOD_2_SCORE', false),
				thirdQuaterPoints: this.getTeamIncident('PERIOD_3_SCORE', false),
				fourthQuaterPoints: this.getTeamIncident('PERIOD_4_SCORE', false),
				pointsScore: this.getTeamIncident('SET_SCORE', false)
			};
			const currentPeriod = this.getIncident('PERIOD_COUNT')
			this.matchInfo = {
				activeTeam: this.getIncident('SERVING_TEAM') === 'HOME' ? "A" : "B",
				matchStatus: this.getOrdinal(currentPeriod) + ' ' + App.Intl('scoreboard.general.quarter')
			};

		}else{//trader client (internal)
			this.participantA = {
				name: this.props.event.get("participantA"),
				firstQuaterPoints: this.getIncident('firstQuaterPointsA'),
				secondQuaterPoints: this.getIncident('secondQuaterPointsA'),
				thirdQuaterPoints: this.getIncident('thirdQuaterPointsA'),
				fourthQuaterPoints: this.getIncident('fourthQuaterPointsA'),
				pointsScore: this.getIncident('totalPointsA')
			};
			this.participantB = {
				name: this.props.event.get("participantB"),
				firstQuaterPoints: this.getIncident('firstQuaterPointsB'),
				secondQuaterPoints: this.getIncident('secondQuaterPointsB'),
				thirdQuaterPoints: this.getIncident('thirdQuaterPointsB'),
				fourthQuaterPoints: this.getIncident('fourthQuaterPointsB'),
				pointsScore: this.getIncident('totalPointsB')
			};
			this.matchInfo = {
				activeTeam: this.getIncident('ballPosition').ballHoldingNow,
				matchStatus: this.props.incidents.getStatusString()
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
			<Scoreboard sport={'americanFootball'} backgroundImage={this.state.backgroundImage}>
				<Stats items={[
					<ScoreBoardSimpleClockView {...this.props}/>,
					matchStatus
				]}/>
				<Main>
					<Participants
						home={participantA.name}
						away={participantB.name}
						serving={activeTeam}
						icon={'americanfootball'}
					/>
					<Points
						title="Q1"
						home={participantA.firstQuaterPoints}
						away={participantB.firstQuaterPoints}
					/>
					<Points
						title="Q2"
						home={participantA.secondQuaterPoints}
						away={participantB.secondQuaterPoints}
					/>
					<Points
						title="Q3"
						home={participantA.thirdQuaterPoints}
						away={participantB.thirdQuaterPoints}
					/>
					<Points
						title="Q4"
						home={participantA.fourthQuaterPoints}
						away={participantB.fourthQuaterPoints}
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

export default AmericanFootballScoreboard;
