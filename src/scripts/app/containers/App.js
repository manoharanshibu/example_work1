import React from 'react';
import { AppContainer } from 'react-hot-loader';
import { render } from 'react-dom';
import RedBox from 'redbox-react';
import Router from 'app/containers/Router';
import PopupController from 'common/view/popup/PopupController';

import 'sportsbook/controller/BetSlipController';
import 'sportsbook/controller/LocaleController.js';
import 'sportsbook/controller/EventController';
import 'sportsbook/controller/SportsSocketController';
import 'common/controller/subscriptions/SubscriptionController';
import 'common/controller/ApiController';
import 'common/controller/ZopimController';

const rootEl = document.getElementById('body-content');
const popupEl = document.getElementById('modal-content');

const renderApp = function (props) {
  render(<PopupController />, popupEl);
  render(
    <AppContainer errorReporter={RedBox}>
      <Router {...props} />
    </AppContainer>
		, rootEl,
	);
};

App.bus.on('globals:langChanged', () => {
  renderApp({ lang: App.Globals.lang });
});
App.session.on('session:changed', (session) => {
  renderApp({ authenticated: !!session });
});

renderApp({ lang: App.Globals.lang });

if (module.hot) {
  module.hot.accept('app/containers/Router', () => {
    const HotRouter = require('app/containers/Router');
    render(
      <AppContainer errorReporter={RedBox}>
        <HotRouter />
      </AppContainer>,
            rootEl,
        );
  });
}

