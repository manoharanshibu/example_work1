import { propTypes, defaultProps } from 'sportsbook/model/incidents/types/TennisProps';
import { classNames as cx } from 'common/util/ReactUtil.js';

class TennisView extends React.Component {
  static propTypes = propTypes;
  static defaultProps = defaultProps;
  state = {
    showingMore: false,
    notYetStarted: false,
    randomBgClass: this.isMale()
				? _.sample(['tennis-1', 'tennis-clay', 'tennis-grass', 'tennis-hard'])
				: _.sample(['tennis-woman-clay']),
  };

  constructor(props) {
    super(props);
    const event = props.event;
    this.team1 = event.get('participantA');
    this.team2 = event.get('participantB');
  }

  isMale() {
    const { categoryName } = this.props.data.event.attributes;
		// Male-only categories:
    const maleArray = ['atp', 'challenger', 'davis cup', 'itf men'];
    return maleArray.includes(categoryName.toLowerCase());
  }

	/**
	 * quarter is one of the following: 1,2,3,4 team is either 1 or 2.
	 * @param quarter
	 * @param team
	 * @returns {*}
     */
  getSetScore(quarter, team) {
    	const activeQuarter = this.getIncident('PERIOD_COUNT');
    const incidentName = `PERIOD_${quarter}_SCORE`;
    const scoreInc = this.getIncident(incidentName);
    const score = scoreInc.replace('-', ':');
    const scoreArray = score.split(':');
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
    	const advantageText = 'AD';
    const scoreInc = this.getIncident('SCORE');
    const score = scoreInc.replace('-', ':');
    let scoreArray = score.split(':');
	    scoreArray = scoreArray.map(points => points == '50' ? advantageText : points);
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
	 * @returns {Array}
     */
  getMatchTimeForQuarter() {
    const currentPeriodString = this.getIncident('CURRENT_PERIOD');
    let periodTimeRemaining;
    if (currentPeriodString == 'PAUSE') {
      periodTimeRemaining = '0:00';
    } else {
      periodTimeRemaining = this.getIncident('REMAINING_TIME_INPERIOD');
    }

    const currentPeriod = this.getIncident('PERIOD_COUNT');
    const realCurrentPeriod = parseInt(currentPeriod);
    const zeroBasedPeriod = realCurrentPeriod - 1;// need to remove 1 from period to make zero based.
    const realTimes = [' ', ' ', ' ', ' '].map((val, index) => {
      if (index === zeroBasedPeriod) {
        return periodTimeRemaining;
      }
    });

    return realTimes;
  }

	/**
	 *
	 * @returns {status based upon quarter and time remaining for that match  }
	 */
  getStatus() {
    const currentPeriod = this.getIncident('PERIOD_COUNT');
    const tieBreak = this.getIncident('TIE_BREAK');
    let statusString = '';
    switch (currentPeriod) {
      case '1':
        statusString = currentPeriod + App.Intl('game.status.suffix_first');
        break;
      case '2':
        statusString = currentPeriod + App.Intl('game.status.suffix_second');
        break;
      case '3':
        statusString = currentPeriod + App.Intl('game.status.suffix_third');
        break;
      case '4':
        statusString = currentPeriod + App.Intl('game.status.suffix_fourth');
        break;
      case '5':
        statusString = currentPeriod + App.Intl('game.status.suffix_fifth');
        break;
      default:
        statusString = '';
    }
    statusString = `${statusString} ${App.Intl('scoreboard.general.set')} `;
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
	      if (homeServing && teamNumber === 1 && this.getStatus() !== '') {
	        return 'serving';
      } else if (!homeServing && teamNumber === 2 && this.getStatus() !== '') {
	        return 'serving';
	      }
	        return '';
	    };

    	const clazz = cx('player', teamNumber === 1 ? 'align-right' : '', workOutServing());

    return (
      <div className={clazz}>{this[`team${teamNumber}`]}</div>
    );
  }

  wonSet(setNumber, teamNumber) {
		// For green triangle in top right corner of game divs
    const periodToCheck = this.props[`PERIOD_${setNumber}_SCORE`];
    const scoreArray = periodToCheck.split(':');
    const a = parseInt(scoreArray[0]);
    const b = parseInt(scoreArray[1]);
    const setTarget = 6;
    const tieBreakCheck = (score1, score2) => (score1 == 7 && score2 < 7);
    const normalWinCheck = (score1, score2) => (score1 >= setTarget && (score1 >= score2 + 2));

    if (teamNumber == 1) {
      return tieBreakCheck(a, b) || normalWinCheck(a, b);
    }
    if (teamNumber == 2) {
      return tieBreakCheck(b, a) || normalWinCheck(b, a);
    }
    return false;
  }

  renderActiveSet(quarter, teamNumber, device = '') {
    const activeQuarter = this.getIncident('PERIOD_COUNT');
    const currentPeriod = this.getIncident('CURRENT_PERIOD');
    const quarterInactive = quarter > activeQuarter;
    return cx(
			'table-cell',
			'align-center',
			'darkened-bg',
      {
        won: this.wonSet(quarter, teamNumber),
        active: quarter == activeQuarter,
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
    let setString = '';

    switch (n) {
      case 1: setString = App.Intl('game.status.suffix_first'); break;
      case 2: setString = App.Intl('game.status.suffix_second'); break;
      case 3: setString = App.Intl('game.status.suffix_third'); break;
      case 4: setString = App.Intl('game.status.suffix_fourth'); break;
      case 5: setString = App.Intl('game.status.suffix_fifth'); break;
      default: break;
    }

    return (<div>{n}{setString} {set}</div>);
  }

	/**
	 * @returns {XML}
     */

  renderTableStats(event, device) {
    const rowClass = cx('table-row table-stats-header', { 'phablet-show': device === 'handset', 'phablet-hide': device != 'handset' });
    const currentPeriod = parseInt(this.getIncident('PERIOD_COUNT'));
    let numOfSetsToRender = parseInt(event.get('bestOf'));
    if (isNaN(numOfSetsToRender) || currentPeriod > 3) {
      numOfSetsToRender = 5;
    }
    const cells = _.times(numOfSetsToRender, (i) => {
      const n = i + 1;
      return (
        <div key={i} className={this.renderActiveSet(n, null, device)}>
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
          <span>{App.Intl('scoreboard.general.game')}</span>
        </div>
        {cells}
      </div>
    );
	 }


	/**
	 * @returns {XML}
     */
  renderQuartersEllapsedTime() {
    const times = this.getMatchTimeForQuarter();
    const timeElem = index => (
      <div className="table-cell align-center">
        <span className="time quarters">{times[index]}</span>
      </div>);

    return (
      <div className="table-row clock-row phablet-hide">
        <div className="table-cell" />
        <div className="table-cell align-center score-description">
          <span className="total" />
        </div>
        {timeElem(0)}
        {timeElem(1)}
        {timeElem(2)}
        {timeElem(3)}
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
	      if (homeServing && teamNumber === 1 && this.getStatus() !== '') {
	        return 'serving';
	      } else if (!homeServing && teamNumber === 2 && this.getStatus() !== '') {
	        return 'serving';
	      }
	        return '';
	    };

	    const rowClass = cx('table-row score-row', player);
	    const playerTitleClass = cx('table-cell player-name phablet-hide with-active-state', workOutServing());
    const currentPeriod = parseInt(this.getIncident('PERIOD_COUNT'));
    const event = this.props.event;
    let numOfSetsToRender = parseInt(event.get('bestOf'));
    if (isNaN(numOfSetsToRender) || currentPeriod > 3) {
      numOfSetsToRender = 5;
    }
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
        {numOfSetsToRender > 3 && this.getStatus() != '' &&
        <div className={this.renderActiveSet(4, teamNumber, '')}>
          <span className="score">{this.getSetScore(4, teamNumber)}</span>
        </div>
				}
        {numOfSetsToRender > 3 && this.getStatus() != '' &&
        <div className={this.renderActiveSet(5, teamNumber, '')}>
          <span className="score">{this.getSetScore(5, teamNumber)}</span>
        </div>
				}
      </div>
    );
  }

	/**
	 * @returns {XML}
     */
  render() {
    const { event } = this.props;
    const activeQuarter = this.getIncident('PERIOD_COUNT');
    const { randomBgClass } = this.state;
    console.log('this.props:', this.props);
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

TennisView.displayName = 'TennisView';

export default TennisView;
