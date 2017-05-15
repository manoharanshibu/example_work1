import {propTypes, defaultProps} from 'sportsbook/model/incidents/types/BeachVolleyballProps';
import ScoreboardMethods from 'scoreboard/ScoreboardMethods';
import {Scoreboard, Main, Participants, Stats, Points} from 'scoreboard/ScoreboardComponents';

class BeachVolleyballScoreboard extends ScoreboardMethods {

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
				setsScore: this.getTeamIncident('SET_SCORE', true)
			};
			this.participantB = {
				name: this.props.event.get('participantB'),
				pointsScore: this.getTeamIncident('PERIOD_' + currentPeriod + '_SCORE', false),
				setsScore: this.getTeamIncident('SET_SCORE', false)
			};
			this.matchInfo = {
				matchStatus: this.getPeriodString(currentPeriod , App.Intl('scoreboard.general.set')),
				activeTeam: this.getIncident('SERVING_TEAM') === "HOME" ? "A" : "B"
			};

		}else{//trader client (internal)
			this.participantA = {
				name: this.props.event.get('participantA'),
				pointsScore: this.getIncident('pointsA'),
				setsScore: this.getIncident('setsA')
			};
			this.participantB = {
				name: this.props.event.get('participantB'),
				pointsScore: this.getIncident('pointsB'),
				setsScore: this.getIncident('setsB')
			};

			const setNo = 1 + parseInt(this.getIncident('setsA')) +  parseInt(this.getIncident('setsB'));
			this.matchInfo = {
				matchStatus: this.getPeriodString(setNo , App.Intl('scoreboard.general.set')),
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
			<Scoreboard sport={'beachVolleyball'}>
				<Stats items={[matchStatus]}/>
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
						title={App.Intl('scoreboard.general.sets')}
						home={participantA.setsScore}
						away={participantB.setsScore}
					/>
				</Main>
			</Scoreboard>
		)

	}
}
;

export default BeachVolleyballScoreboard;
