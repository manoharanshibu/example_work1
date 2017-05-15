import { propTypes, defaultProps } from 'sportsbook/model/incidents/types/VolleyballProps';
import { classNames as cx } from 'common/util/ReactUtil.js';
class BeachVolleyballView extends React.Component {
  static propTypes = propTypes;
  static defaultProps = defaultProps;
  state = {
    showingMore: false,
    notYetStarted: false,
    randomBgClass: _.sample(['beachvolleyball-1', 'beachvolleyball-2']),
  }

  constructor(props) {
    super(props);
    const event = props.event;
    this.team1 = event.get('participantA');
    this.team2 = event.get('participantB');
  }

	/**
	 * quarter is one of the following: 1,2,3,4 team is either 1 or 2
	 * @param quarter
	 * @param team
	 * @returns {*}
     */
  getSetScore(quarter, team) {
    	const activeQuarter = this.getIncident('PERIOD_COUNT');
    const incidentName = `PERIOD_${quarter}_SCORE`;
    const score = this.getIncident(incidentName);
    const scoreArray = score.replace('-', ':').split(':');
    	// Return score only if prev or current set
    if (quarter > activeQuarter) {
      return '';
    }
    return scoreArray[team - 1];
  }

	/**
	 * @param team
	 * @returns {*}
     */
  getGlobalScore(team) {
    const score = this.getIncident('SET_SCORE');
    const scoreArray = score.replace('-', ':').split(':');
    return scoreArray[team - 1];
  }

	/**
	 * Returns current incident value, use the corresponding prop as the default
	 * @param incidentName
	 * @returns {*}
     */
  getIncident(incidentName) {
    return this.props[incidentName];
  }

	/**
	 *
	 * @returns {status based upon quarter and time remaining for that match.  }
	 */
  getStatus() {
    const currentPeriod = this.getIncident('PERIOD_COUNT');
    let statusString = '';
    switch (currentPeriod) {
      case '1':
        statusString = `${currentPeriod + App.Intl('ordinal_suffix.st')} ${App.Intl('scoreboard.general.set')} `;
        break;
      case '2':
        statusString = `${currentPeriod + App.Intl('ordinal_suffix.nd')} ${App.Intl('scoreboard.general.set')} `;
        break;
      case '3':
        statusString = `${currentPeriod + App.Intl('ordinal_suffix.rd')} ${App.Intl('scoreboard.general.set')} `;
        break;
      default:
        statusString = '';
    }
    const tieBreak = this.getIncident('TIE_BREAK');
    if (tieBreak == 'true') {
      statusString = `${statusString}- ${App.Intl('scoreboard.general.tie_break')}`;
    }
		// following status's if set need to overwrite the previous status's set
    const currentPeriodString = this.getIncident('CURRENT_PERIOD');
    if (currentPeriodString == 'POSTMATCH') {
      statusString = App.Intl('scoreboard.general.end');
    }
    if (currentPeriodString == 'INTERRUPTED') {
      statusString = App.Intl('scoreboard.general.interrupted');
    }

    return statusString;
  }

  handleShow() {
    this.setState({ showingMore: !this.state.showingMore });
  }

  renderShowMoreBtn() {
    let amount = 'more';
    if (this.state.showingMore) {
      amount = 'less';
    }
    return <a onClick={this.handleShow.bind(this)}>{App.Intl(`widgets.footer.show_${amount}`)} <i className={`icon-expand-${amount}`} /></a>;
  }

  renderHandsetPlayerNames(teamNumber) {
    	const homeServing = this.props.SERVING_TEAM === 'HOME';

	    const workOutServing = () => {
	      if (homeServing && teamNumber === 1) {
	        return 'serving';
      } else if (!homeServing && teamNumber === 2) {
	        return 'serving';
	      }
	        return '';
	    };

    	const clazz = cx('player', teamNumber === 1 ? 'align-right' : '', workOutServing());

    return (
      <div className={clazz}>{this[`team${teamNumber}`]}</div>
    );
  }

  wonSet(setNumber, team) {
		// For green triangle in top right corner of game divs
    if (_.isNull(team)) return false;
    const opponent = team === 1 ? 2 : 1;
    const incidentName = `PERIOD_${setNumber}_SCORE`;
    const score = this.getIncident(incidentName);
    const scoreArray = score.replace('-', ':').split(':');

    if (scoreArray[team - 1] < 15) { // any score below 15 will automatically mean there are not enough points to have won a set
      return false;
    }
    if (scoreArray[team - 1] < scoreArray[opponent - 1]) { // if score less than opponents set has not been won
      return false;
    }
		// sets 1 , and 2 play to 21 points, if greater or equal to 21 set must be won by two clear points
    const pointsNeededToWinSet = setNumber < 3 ? 21 : 15;
    if (scoreArray[team - 1] >= pointsNeededToWinSet && (scoreArray[team - 1] - scoreArray[opponent - 1]) >= 2) {
      return true;
    }
    return false;

		// all rules should be followed above , but default to false if any issues.
    return false;
  }

  renderActiveSet(quarter, teamNumber, device = '') {
    const activeQuarter = this.getIncident('PERIOD_COUNT');
    const currentPeriodString = this.getIncident('CURRENT_PERIOD');
    let isGameInActiveSet = true;
    if (currentPeriodString == 'POSTMATCH' || currentPeriodString.startsWith('END')) {
      isGameInActiveSet = false;// as game ended
    }

    const quarterInactive = quarter > activeQuarter;
    return cx(
			'table-cell',
			'align-center',
			'darkened-bg',
      {
        won: this.wonSet(quarter, teamNumber),
        active: quarter == activeQuarter && isGameInActiveSet,
        inactive: quarterInactive,
        prev: quarter < activeQuarter,
        'phablet-hide': !this.state.showingMore && activeQuarter != quarter,
      },
		);
  }

  renderGameStatus() {
    const status = this.getStatus();
    return (
      <div className="game-status">
        <span>{status}</span>
      </div>
    );
  }

  getSetText(n) {
    const set = App.Intl('scoreboard.general.set');
    let ordinal = '';

    switch (n) {
      case 1: ordinal = App.Intl('ordinal_suffix.st'); break;
      case 2: ordinal = App.Intl('ordinal_suffix.nd'); break;
      case 3: ordinal = App.Intl('ordinal_suffix.rd'); break;
      default: break;
    }

    return (<div>{n}<sup>{ordinal}</sup> {set}</div>);
  }

	/**
	 * @returns {XML}
     */

  renderTableStats(event, device) {
    const rowClass = cx('table-row table-stats-header', { 'phablet-show': device === 'handset', 'phablet-hide': device != 'handset' });

    const cells = _.times(3, (i) => {
      const n = i + 1;
      return (
        <div className={this.renderActiveSet(n, null, device)}>
          {this.getSetText(n)}
        </div>
      );
    });
    return (
      <div className={rowClass}>
        <div className="table-cell phablet-hide">
          {/* empty cell for small screens */}
        </div>
        <div className="table-cell main-score">
          <span>{App.Intl('scoreboard.general.sets')}</span>
        </div>
        {cells}
      </div>
    );
	 }

  showAccordingly(num) {
    const { showingMore } = this.state;
    const activeQuarter = this.getIncident('PERIOD_COUNT');

    if (showingMore) {
      return cx('score phablet-show');
    } else if (!showingMore && num === activeQuarter) {
      return cx('score phablet-show');
    }
    return cx('score phablet-hide');
  }

	/**
	 * teamNumber can be 1 or 2
	 * @param teamNumber
	 * @returns {XML}
     */

  renderTeamScoreBoard(teamNumber) {
    const activeQuarter = this.getIncident('PERIOD_COUNT');
    const teamName = this[`team${teamNumber}`];
    const player = teamNumber === 1 ? 'playerA' : 'playerB';
    	const homeServing = this.props.SERVING_TEAM === 'HOME';

	    const workOutServing = () => {
	      if (homeServing && teamNumber === 1) {
	        return 'serving';
	      } else if (!homeServing && teamNumber === 2) {
	        return 'serving';
	      }
	        return '';
	    };

	    const rowClass = cx('table-row score-row', player);
	    const playerTitleClass = cx('table-cell player-name phablet-hide with-active-state', workOutServing());

    return (
      <div className={rowClass}>
        <div className={playerTitleClass}>
          <span>{teamName}</span>
        </div>
        <div className="table-cell main-score-tile">
          <span className="score">{this.getGlobalScore(teamNumber)}</span>
        </div>
        <div className={this.renderActiveSet(1, teamNumber, '')}>
          <span className="score">{this.getSetScore(1, teamNumber)}</span>
        </div>
        <div className={this.renderActiveSet(2, teamNumber, '')}>
          <span className="score">{this.getSetScore(2, teamNumber)}</span>
        </div>
        <div className={this.renderActiveSet(3, teamNumber, '')}>
          <span className="score">{this.getSetScore(3, teamNumber)}</span>
        </div>
      </div>
    );
  }

	/**
	 * @returns {XML}
     */
  render() {
    const { event } = this.props;
    const { randomBgClass } = this.state;

    const className = cx('scoreboard-container tennis-volleyball-beach', randomBgClass);
    return (
      <div className={className}>
        {this.renderGameStatus(event)}
        <div className="scoreboard">
          <div className="handset-player-names phablet-show">
            {this.renderHandsetPlayerNames(1)}
            {this.renderHandsetPlayerNames(2)}
          </div>
          <div className="scoreboard-table">
            {this.renderTableStats(event)}
            {this.renderTeamScoreBoard(1)}
            {this.renderTableStats(event, 'handset')}
            {this.renderTeamScoreBoard(2)}
          </div>
        </div>
        {/* SHOW MORE BUTTON */}
        {/* <div className="more-toggle mobile-show" style={{ display: this.state.notYetStarted ? 'none' : 'initial' }}>*/}
        <div className="more-toggle mobile-show" style={{ visibility: this.getStatus() === '' ? 'hidden' : 'visible' }}>
          {this.renderShowMoreBtn()}
        </div>
      </div>
    );
  }
}

BeachVolleyballView.displayName = 'BeachVolleyballView';

export default BeachVolleyballView;
