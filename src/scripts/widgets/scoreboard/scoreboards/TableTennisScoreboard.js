import {propTypes, defaultProps} from 'sportsbook/model/incidents/types/TableTennisProps';
import ScoreboardMethods from 'scoreboard/ScoreboardMethods';
import {Scoreboard, Main, Participants, Stats, Points} from 'scoreboard/ScoreboardComponents';
class TableTennisScoreboard extends ScoreboardMethods {
	constructor(props) {
		super(props);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		if(this.getIncident('dataExternalFormat')){ //BETRADAR
			const currentPeriod = this.getIncident('PERIOD_COUNT')
			this.participantA = {
				name: this.props.event.get('participantA'),
				pointsScore: this.getTeamIncident('PERIOD_' + currentPeriod + '_SCORE', true),
				gameScore: this.getTeamIncident('SET_SCORE', true)
			};
			this.participantB = {
				name: this.props.event.get('participantB'),
				pointsScore: this.getTeamIncident('PERIOD_' + currentPeriod + '_SCORE', false),
				gameScore: this.getTeamIncident('SET_SCORE', false)
			};
			this.matchInfo = {
				matchStatus: this.getPeriodString(currentPeriod , App.Intl('scoreboard.general.game')),
				activeTeam: this.getIncident('SERVING_TEAM') === "HOME" ? "A" : "B"
			};

		}else{//trader client (internal)
			this.participantA = {
				name: this.props.event.get('participantA'),
				pointsScore: this.getIncident('pointsA'),
				gameScore: this.getIncident('gamesA')
			};
			this.participantB = {
				name: this.props.event.get('participantB'),
				pointsScore: this.getIncident('pointsB'),
				gameScore: this.getIncident('gamesB')
			};

			const setNo = 1 + parseInt(this.getIncident('gamesA')) +  parseInt(this.getIncident('gamesB'));
			this.matchInfo = {
				matchStatus: this.getPeriodString(setNo , App.Intl('scoreboard.general.game')),
				activeTeam: this.getIncident('serve')
			};
		}

		let {
			participantA,
			participantB
			} = this;

		let {
			matchStatus,
			activeTeam
			} = this.matchInfo;

		return (
			<Scoreboard sport={'tableTennis'}>
				<Stats items={[matchStatus]}/>
				<Main>
					<Participants
						home={participantA.name}
						away={participantB.name}
						serving={activeTeam}
						icon={'circle'}
					/>
					<Points
						title={App.Intl('scoreboard.general.points')}
						home={participantA.pointsScore}
						away={participantB.pointsScore}
						primary
					/>
					<Points
						title={App.Intl('scoreboard.general.games')}
						home={participantA.gameScore}
						away={participantB.gameScore}
					/>
				</Main>
			</Scoreboard>
		)

	}


};
export default TableTennisScoreboard;
