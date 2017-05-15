import 'config/plugins';

import config from 'config/configuration';
import { browserHistory } from 'react-router';
import globals from 'sportsbook/Globals.js';
import Radio from 'common/system/radio/Radio';
import resolver from 'app/bootstrap/DomainResolver';
import BootStrapper from 'common/system/bootstrap/BootStrapper';
// import {iovation} from "common/util/IovationUtil";
import { leadingSlashes as slashes } from 'common/util/RegEx';
import { props } from 'common/decorators/react-decorators';
import Language from 'app/i18n/Language';
// import {developersWarn} from "common/util/AppUtil.js";
import 'sportsbook/controller/AffiliatesController';
import cancelable from 'common/util/Cancelable';
import { ROUTE_NOT_FOUND, APP_NAVIGATE, TRIGGER_RESIZE } from 'app/AppConstants';
import PageTracking from 'app/components/tracking/PageTracking';
import { ROUTES_TO_TRANSLATE } from 'app/i18n/RoutesToTranslate';

@props({
  boot: [
    'SingleSignOn',
    'DefaultBundle',
    'GetSegmentData',
    'GetRootLadder',
    'GetSportData',
  ],
})

class Application {
  constructor() {
    this.subs 	 = Radio.channel('subscriptions'); // SubscriptionController
    this.session = Radio.channel('session'); // SessionModel
    this.socket = Radio.channel('socket'); // SocketService
    this.data = Radio.channel('data'); // SportDataModel
    this.bus 	 = Radio.channel('bus'); // General event bus
    this.init();

    this.pageTracking = new PageTracking();
    this.handleResize = cancelable.debounce(this.onResize, 250, this);
    window.addEventListener('resize', this.handleResize);
  }

	/**
	 * Initialize the app
	 */
  init() {
    _.bindAll(this, 'start');
    window.App = this;

    this.Config = config;
    this.Urls = resolver.init(config, this);
    this.Globals = new globals();

    this.bus.on(ROUTE_NOT_FOUND, ::this.routeNotFound);

		// default language for Baja
    if (this.Config.siteId === 1) {
      App.Globals.setLang('es-mx', true);
    }

    this.prestart();
  }

	/**
	 * kick the boot sequence off
	 */
  prestart() {
		// console.log('App: PreStart');
    BootStrapper.boot(this.boot, true)
			.then(this.start);
  }

	/**
	 * On start kick off the views
	 */
  start(mods) {
    require.ensure([], (require) => {
      require('app/containers/App');
    });
  }

	/**
	 *   on debounced resize of window trigger an event that contains the width and height of window
	 *	 so that the various views dont have individual events.
	 */
  onResize() {
    App.bus.trigger(TRIGGER_RESIZE, document.documentElement.clientWidth, document.documentElement.clientHeight);
  }

	/**
	 * Shortcut for navigating to specified route. Routes are normalized to have a leadingSlash.
	 *
	 * Example: App.navigate(string, object, object)
	 * query strings must be passed as an object and not with the route property
	 */
  navigate(pathName = '', query = {}, state = null) {
    const route = this.normalize(pathName);
    const i18nRoute = this.translateRoute(route);
    browserHistory.push({ pathname: i18nRoute, query, state });

    const mainContent = document.getElementById('main-content');
    if (mainContent !== null) {
      mainContent.scrollTop = 0;
    }

    App.bus.trigger(APP_NAVIGATE);
  }

	/**
	 * @param pathName
	 * @returns {*}
	 */
  translateRoute(pathName, lang = App.Globals.lang) {
    const noLang = Language.remove(pathName);
    const dotNotation = noLang.replace(/\//, '.');
    if (_.isEmpty(dotNotation)) return `/${App.Globals.lang}`;
    const i18n = `route.${dotNotation}`;

    if (ROUTES_TO_TRANSLATE.indexOf(i18n) === -1) {
      return pathName;
    }
    return `/${App.Intl(i18n, { lang: App.Globals.lang }, 1)}`;
  }

  routeNotFound() {
    browserHistory.replace({ pathname: 'not-found', query: {}, state: {} });
  }

	/**
	 * @param pathName
	 * @returns {*}
     */
  isActive(path, contains = false) {
    const route = this.normalize(path);
    const { pathname } = window.location;
    if (path === 'live' || contains) {
      return pathname.indexOf(route) !== -1 || pathname.indexOf(App.translateRoute(route)) !== -1;
    }
    return pathname == route || App.translateRoute(route) === pathname;
  }

	/**
	 * @returns {boolean}
     */
  isHome() {
    const { location: { pathname } } = window;
    const path = pathname.replace(/^\/+|\/+$/i, '');
    const { lang } = App.Globals;

		// BB-600 redirect to Lobby when Argyll create content
		// return path === `${App.Globals.lang}/home`;
		//
		// /home set in redzone skin, not yet in bob
    const homeRoutes = [
      '',
      '/',
      '/home',
    ];

    return homeRoutes.some(route => path === `${lang}${route}`);
  }

	/**
	 * Normalizes a path to include lang code
	 * @param pathName
	 * @returns {*}
     */
  normalize(pathName) {
    pathName = Language.remove(pathName);
    const path = pathName.replace(slashes, '');
    const parts = [App.Globals.lang];
    if (!_.isEmpty(path)) {
      parts.push(path);
    }
    return `/${parts.join('/')}`;
  }

	/**
	 *
	 * @param breakpoint
	 * @returns {boolean}
	 */
  isSmallerThanBreakpoint(breakpoint, customWidth)	{
    const width = document.documentElement.clientWidth;
    switch (breakpoint)		{
      case 'sm': if (width <= 544) { return true; } break; // Small screen / phone
      case 'md': if (width <= 768) { return true; } break; // Medium screen / tablet
      case 'lg':	if (width <= 991) { return true; } break; // Large screen / desktop
      case 'xl': if (width <= 1366) { return true; } break; // Extra large screen / wide desktop
      case 'xxl':	if (width <= 2140) { return true; } break; // Largest screns
      case 'custom': if (width <= customWidth) { return true; } break; // custom width
    }

    return false;
  }

  isMobile() {
    return this.isSmallerThanBreakpoint('lg');
  }

  isTablet() {
    return !this.isSmallerThanBreakpoint('lg') && this.isSmallerThanBreakpoint('xl');
  }

}

const inst = new Application();
export default inst;
