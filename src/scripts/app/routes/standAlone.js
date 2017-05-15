import StandAloneView from 'app/view/StandAloneView';

export default {
  component: StandAloneView,
  childRoutes: [
    require('app/routes/standAlone/maintenance'),
    require('app/routes/patternLibrary/patternLibrary'),
  ],
};
