import { propTypes, defaultProps } from 'sportsbook/model/incidents/types/BasketballProps';
import { classNames as cx } from 'common/util/ReactUtil.js';
import ScoreBoardSimpleClockView from 'app/view/sport/views/event/scoreBoard/ScoreBoardSimpleClockView';

class BasketballView extends React.Component {
  static propTypes = propTypes;
  static defaultProps = defaultProps;

  state = {
    showingMore: false,
    randomBgClass: _.sample(['basketball-1', 'basketball-2', 'basketball-3']),
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
  getQuarterScore(quarter, team) {
    const incidentName = `PERIOD_${quarter}_SCORE`;
    const scoreInc = this.getIncident(incidentName);
    const score = scoreInc.replace('-', ':');
    const scoreArray = score.replace('-', ':').split(':');
    return scoreArray[team - 1];
  }

	/**
	 * @param team
	 * @returns {*}
     */
  getGlobalScore(team) {
    const scoreInc = this.getIncident('SCORE');
    const score = scoreInc.replace('-', ':');
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
        statusString = `${currentPeriod + App.Intl('ordinal_suffix.st')} ${App.Intl('scoreboard.general.quarter')} `;
        break;
      case '2':
        statusString = `${currentPeriod + App.Intl('ordinal_suffix.nd')} ${App.Intl('scoreboard.general.quarter')} `;
        break;
      case '3':
        statusString = `${currentPeriod + App.Intl('ordinal_suffix.rd')} ${App.Intl('scoreboard.general.quarter')} `;
        break;
      case '4':
        statusString = `${currentPeriod + App.Intl('ordinal_suffix.th')} ${App.Intl('scoreboard.general.quarter')} `;
        break;
      default:
        statusString = '';
    }
    const currentPeriodString = this.getIncident('CURRENT_PERIOD');
    if (currentPeriodString.startsWith('END')) {
      statusString = `${statusString} ${App.Intl('scoreboard.general.paused')}`;
    } else { // we know game is active - only show time out's in active periods
      const event = this.props.event;
      if (event.Sync && !event.Sync.get('isTicking')) {
        statusString = `${statusString} ${App.Intl('scoreboard.general.timeout')}`;
      }
    }
		// following status's if set need to overwrite the previous status's set
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


  renderGameStatus() {
    const status = this.getStatus();
    return (
      <div className="game-status">
        <span>{status}</span>
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

    const className = cx('scoreboard-container basketball', randomBgClass);
    return (
      <div className={className}>
        {this.renderGameStatus(event)}
        <div className="scoreboard">
          {this.renderHandsetPlayerNames()}
          <div className="scoreboard-table">
            {this.renderTableTop(event)}
            {this.renderQuartersEllapsedTime()}
            {this.renderTeamScoreBoard(1)}
            {this.renderTableTop(event, 'handset')}
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
  renderHandsetPlayerNames() {
    return (
      <div className="handset-player-names phablet-show">
        <div className="player align-right">{this.team1}</div>
        <div className="player">{this.team2}</div>
      </div>
    );
  }
  renderActiveQuarter(quarter) {
    const activeQuarter = this.getIncident('PERIOD_COUNT');
    const quarterInactive = quarter > activeQuarter;
	    return cx('table-cell', 'align-center', 'darkened-bg', { active: quarter == activeQuarter, inactive: quarterInactive, 'phablet-hide': !this.state.showingMore && activeQuarter != quarter });
  }

	/**
	 * @returns {XML}
     */

  renderTableTop(event, device) {
    const rowClass = cx('table-row table-stats-header', { 'phablet-show': device === 'handset', 'phablet-hide': device != 'handset' });

    return (
      <div className={rowClass}>
        <div className="table-cell phablet-hide" />
        <div className="table-cell main-score">
          <span>{App.Intl('scoreboard.general.total')}</span>
        </div>
        <div className={this.renderActiveQuarter(1, device)}>
          <span>Q1</span>
          {device === 'handset' && this.getTimerOrEmptyCell(1)}
        </div>
        <div className={this.renderActiveQuarter(2, device)}>
          <span>Q2</span>
          {device === 'handset' && this.getTimerOrEmptyCell(2)}
        </div>
        <div className={this.renderActiveQuarter(3, device)}>
          <span>Q3</span>
          {device === 'handset' && this.getTimerOrEmptyCell(3)}
        </div>
        <div className={this.renderActiveQuarter(4, device)}>
          <span>Q4</span>
          {device === 'handset' && this.getTimerOrEmptyCell(4)}
        </div>
      </div>
    );
  }

  getTimerOrEmptyCell(num) {
    const period = this.getIncident('PERIOD_COUNT');
    const currentPeriodString = this.getIncident('CURRENT_PERIOD');
    const quarterEnded = currentPeriodString.startsWith('END');
    const statusCell = text => (
      <div className="table-cell align-center">
        <span className="time quarters">{text}</span>
      </div>
		);
    if (period == num) {
      if (!quarterEnded) {
        return <ScoreBoardSimpleClockView {...this.props} />;
      }
      return statusCell('00:00');
    }
    return statusCell(' ');
  }

	/**
	 * @returns {XML}
     */
  renderQuartersEllapsedTime() {
    const currentPeriodString = this.getIncident('CURRENT_PERIOD');

    return (
      <div className="table-row clock-row phablet-hide">

        <div className="table-cell" />
        <div className="table-cell align-center score-description">
          <span className="total" />
        </div>
        {this.getTimerOrEmptyCell(1)}
        {this.getTimerOrEmptyCell(2)}
        {this.getTimerOrEmptyCell(3)}
        {this.getTimerOrEmptyCell(4)}


      </div>
    );
  }

	/**
	 * teamNumber can be 1 or 2
	 * @param teamNumber
	 * @returns {XML}
     */

  renderTeamScoreBoard(teamNumber) {
    const teamName = this[`team${teamNumber}`];
    const player = teamNumber === 1 ? 'playerA' : 'playerB';
    const rowClass = cx('table-row score-row', player);
    return (
      <div className={rowClass}>

        <div className="table-cell player-name phablet-hide">
          <span>{teamName}</span>
        </div>
        <div className="table-cell main-score-tile">
          <span className="score">{this.getGlobalScore(teamNumber)}</span>
        </div>
        <div className={this.renderActiveQuarter(1)}>
          <span className="score">{this.getQuarterScore(1, teamNumber) != '00' ? this.getQuarterScore(1, teamNumber) : ' '}</span>
        </div>
        <div className={this.renderActiveQuarter(2)}>
          <span className="score">{this.getQuarterScore(2, teamNumber) != '00' ? this.getQuarterScore(2, teamNumber) : ' '}</span>
        </div>
        <div className={this.renderActiveQuarter(3)}>
          <span className="score">{this.getQuarterScore(3, teamNumber) != '00' ? this.getQuarterScore(3, teamNumber) : ' '}</span>
        </div>
        <div className={this.renderActiveQuarter(4)}>
          <span className="score">{this.getQuarterScore(4, teamNumber) != '00' ? this.getQuarterScore(4, teamNumber) : ' '}</span>
        </div>

      </div>
    );
  }
}

BasketballView.displayName = 'BasketballView';

export default BasketballView;
