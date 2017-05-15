import * as spt from 'sportsbook/model/Sports';
import { classNames as cx } from 'common/util/ReactUtil';


const StatusWrapper = (props) => {
  const { onClick, classNames, children } = props;
  return (
    <div className={classNames} onClick={onClick}>
      {children}
    </div>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const Default = (props) => {
  const { data } = props;
  return (
    <StatusWrapper {...props}>
      {Span('block', data.mins)}
      {Span('block', data.period)}
    </StatusWrapper>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const Soccer = (props) => {
  const { incidents } = props;
  const period = incidents.getPeriod();
  const numMins = incidents.numMins();
  return (
    <StatusWrapper {...props}>
      {Span(cx('block', isInterrupted(period) && 'interrupted'), period)}
      {Span('block', `${numMins}'`)}
    </StatusWrapper>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const Tennis = (props) => {
  const { incidents } = props;
  let setNum, gameScore;
  setNum = 1 + parseInt(incidents.get('setsA')) + parseInt(incidents.get('setsB'));
  gameScore = incidents.getInternalGameScore();

  return (
    <StatusWrapper {...props}>
      {Span('block', `${setNum}. Set`)}
      {Span('block', gameScore)}
    </StatusWrapper>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const Basketball = (props) => {
  const { incidents } = props;

  let quarter;
  if (incidents.get('dataExternalFormat') === false) { // trader client
    quarter = incidents.externalPeriodNum();
  } else { // betradar
    quarter = incidents.periodNum();
  }
  return (
    <StatusWrapper {...props}>
      {Span('block', `Q${quarter}`)}
    </StatusWrapper>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const VolleyBall = (props) => {
  const { incidents } = props;
  let setNum;
  if (incidents.get('dataExternalFormat') === false) { // trader client
    setNum = 1 + parseInt(incidents.get('setsA')) + parseInt(incidents.get('setsB'));
  } else { // betradar
    setNum = incidents.get('PERIOD_COUNT');
  }
  setNum = `${setNum} ${App.Intl('scoreboard.general.set')}`;
  const setScore = incidents.setsScore();
  return (
    <StatusWrapper {...props}>
      {Span('block', setNum)}
      {Span('block', setScore)}
    </StatusWrapper>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const BeachVolleyBall = (props) => {
  const { incidents } = props;
  let setNum;
  if (incidents.get('dataExternalFormat') === false) { // trader client
    setNum = 1 + parseInt(incidents.get('setsA')) + parseInt(incidents.get('setsB'));
  } else { // betradar
    setNum = incidents.get('PERIOD_COUNT');
  }
  setNum = `${setNum} ${App.Intl('scoreboard.general.set')}`;
  const score = incidents.setsScore();
  return (
    <StatusWrapper {...props}>
      {Span('block', `${setNum}`)}
      {Span('block', score)}
    </StatusWrapper>
  );
};

/**
 * @param props
 * @returns {XML}
 * @constructor
 */
export const IceHockey = (props) => {
  const { incidents } = props;
  const periodNum = incidents.periodNum();
  const time = incidents.timeRemaining();
  return (
    <StatusWrapper {...props}>
      {Span('block', periodNum)}
      {Span('block', `${time}'`)}
    </StatusWrapper>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const Handball = (props) => {
  const { data } = props;
  let period;
  if (data.period) {
    period = data.period.replace('P', 'H');
  }

  return (
    <StatusWrapper {...props}>
      {Span('block', data.mins)}
      {Span('block', period)}
    </StatusWrapper>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const AmericanFootball = (props) => {
  const { data } = props;
  return (
    <StatusWrapper {...props}>
      {Span('block', data.period)}
    </StatusWrapper>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const Snooker = (props) => {
  const { data } = props;
  return (
    <StatusWrapper {...props}>
      {Span('block', data.period)}
    </StatusWrapper>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const Cricket = (props) => {
  const { data } = props;
  return (
    <StatusWrapper {...props}>
      {Span('block', data.period)}
    </StatusWrapper>
  );
};

/**
 * @param data
 * @param classNames
 * @returns {XML}
 * @constructor
 */
export const TableTennis = (props) => {
  const { incidents } = props;
  const periodNum = incidents.periodNum();
  return (
    <StatusWrapper {...props}>
      {Span('block', periodNum)}
    </StatusWrapper>
  );
};

/**
 * @param name
 * @param props
 * @param content
 * @returns {XML}
 * @constructor
 */
const Span = (classes, content) => (
  <span className={classes}>{content}</span>
	);

const isInterrupted = str => /interrupted/i.test(str) && 'interrupted';

class StatusFactory {
  static getStatus({ event }) {
    const sport = (event.get('sport') || '').toLowerCase();
    switch (sport) {
      case spt.SOCCER:
        return Soccer;
      case spt.TABLE_TENNIS:
        return TableTennis;
      case spt.TENNIS:
        return Tennis;
      case spt.BASKETBALL:
        return Basketball;
      case spt.VOLLEYBALL:
        return VolleyBall;
      case spt.BEACH_VOLLEYBALL:
        return BeachVolleyBall;
      case spt.ICE_HOCKEY:
        return IceHockey;
      case spt.HANDBALL:
        return Handball;
      case spt.AMERICAN_FOOTBALL:
        return AmericanFootball;
      case spt.SNOOKER:
        return Snooker;
      case spt.CRICKET:
        return Cricket;

      default:
        return Default;
    }
  }
}

export default StatusFactory;
