export const DEFAULT = 'default';
export const RACING = 'racing';
export const AMERICAN = 'american';

const racing = ['HORSE_RACING', 'GREYHOUNDS']; // condensed
const american = ['AMERICAN_FOOTBALL', 'BASKETBALL', 'BASEBALL'];

export const isRacingSport = sport => resolveSportType(sport) === RACING;

export const isAmericanSport = sport => resolveSportType(sport) === AMERICAN;

export const resolveSportType = (sport) => {
  const uSport = sport.toUpperCase();
  if (_.contains(racing, uSport)) {
    return RACING;
  }

  if (App.Config.siteId === 3 &&
		_.contains(american, uSport)) {
    return AMERICAN;
  }

  return DEFAULT;
};
