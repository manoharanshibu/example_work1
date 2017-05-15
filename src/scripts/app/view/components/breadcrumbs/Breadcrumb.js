import { classNames as cx } from 'common/util/ReactUtil.js';
import BreadcrumbDropdownAccount from 'app/view/components/breadcrumbs/dropdowns/BreadcrumbDropdownAccount';
import BreadcrumbDropdownCompetitions from 'app/view/components/breadcrumbs/dropdowns/BreadcrumbDropdownCompetitions';
import BreadcrumbDropdownSports from 'app/view/components/breadcrumbs/dropdowns/BreadcrumbDropdownSports';
import BreadcrumbDropdownCasino from 'app/view/components/breadcrumbs/dropdowns/BreadcrumbDropdownCasino';
import BreadcrumbView from 'app/view/components/breadcrumbs/BreadcrumbView.jsx';
import layout from 'sportsbookCms/model/LayoutFactory';
import { Link } from 'react-router';

export default class Breadcrumb extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const breadcrumbs = this.getLocationArray();
    return (
      <BreadcrumbView
        breadcrumbs={breadcrumbs}
        betslipOpen={this.props.betslipOpen}
        betslipActive={this.props.betslipActive}
        burgerActive={this.props.burgerActive}
        fullWidth={this.props.fullWidth}
        isSportView={this.props.isSportView}
      />
    );
  }

  normalizeUrlName(name) {
    name = name.replace(/_/g, ' ');
    name = name.replace(/-/g, ' ');
    (name === 'soccer') ? name = 'football' : null;
    return name;
  }

  renderHomeLink(baseRoute = false) {
    const { isSportView } = this.props;
    let route = (baseRoute) ? `/${App.Globals.lang}/${baseRoute}` : `/${App.Globals.lang}`;
    if (App.Config.siteId === 1) {
      route = App.translateRoute(route);
    }
    return (
      <Link to={route} className="c-breadcrumbs__link" onClick={e => e.stopPropagation()} ref="home-icon">
        <div><i className="c-breadcrumbs__home-icon icon-home" /></div>
      </Link>
    );
  }

  getPathNameArray() {
    let { pathname } = this.props.content.location;

		// strip any information of the end of the pathname
    if (pathname.indexOf('?') > -1) {
      pathname = pathname.split('?').shift();
    }
    if (pathname.indexOf('#') > -1) {
      pathname = pathname.split('#').shift();
    }

    return pathname.split('/').slice(2);
  }

  getLocationArray() {
    const { pathname } = this.props.content.location;
    const language = App.Globals.lang;
    const pathnameArray = this.getPathNameArray();

		// BB-600 redirect to Lobby when Argyll create content
		// if (_.isEmpty(pathnameArray) || pathname === "/en/home") { // /en
    if (_.isEmpty(pathnameArray) || pathname === `/${language}` || pathname === `/${language}/`) { // /en
      return [(this.renderHomeLink()), (App.Config.siteId !== 1 && <BreadcrumbDropdownSports key={1} dropdownTitle={App.Intl('sub_nav.links.all_sports')} {...this.props} />)];
    }

		// About alan
    if (pathname.includes('about-alan')) {
      return [(this.renderHomeLink()), App.Intl('top_nav.links.about_alan.label')];
    }

		// Account related:
    if (App.isActive('account/overview')) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.overview.overview')} {...this.props} />),
      ];
    }

    if (App.isActive('account/details')) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.user_menu.settings')} {...this.props} />),
        App.Intl('header.overview.my_details'),
      ];
    }

    if (App.isActive('account/password')) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.user_menu.settings')} {...this.props} />),
        App.Intl('header.overview.change_password'),
      ];
    }

    if (App.isActive('account/documents')) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.user_menu.settings')} {...this.props} />),
        App.Intl('header.overview.account_verification'),
      ];
    }

    if (App.isActive('account/exclusions')) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.user_menu.settings')} {...this.props} />),
        App.Intl('header.overview.account_Exclusions'),
      ];
    }

    if (App.isActive('account/communication')) {
      return [
				(this.renderHomeLink('account/communication')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.user_menu.settings')} {...this.props} />),
        App.Intl('header.overview.communication'),
      ];
    }

		// If its not a specxific account page just render generic account
    if (App.isActive('account')) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.user_menu.settings')} {...this.props} />),
      ];
    }

    if (App.isActive(App.Intl('header.wallet_menu.deposit').toLowerCase(), true)) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.user_menu.wallet')} {...this.props} />),
        App.Intl('header.deposit'),
      ];
    }

    if (App.isActive(App.Intl('header.wallet_menu.withdrawal').toLowerCase(), true)) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.user_menu.wallet')} {...this.props} />),
        App.Intl('header.wallet_menu.withdrawal'),
      ];
    }

    if (App.isActive('transactions/casino')) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.wallet_menu.transactions')} {...this.props} />),
        App.Intl('header.user_menu.casino'),
      ];
    }

    if (App.isActive('transactions/sports')) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.wallet_menu.transactions')} {...this.props} />),
        App.Config.siteId === 1 ? App.Intl('header.user_menu.casino') : App.Intl('deposit.label.sports'),
      ];
    }

    if (App.isActive('mybets', true)) {
      return [
				(this.renderHomeLink('account/overview')),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.user_menu.my_bets')} {...this.props} />),
        App.Intl('header.user_menu.bet_history'),
      ];
    }

    if (App.isActive('games/rules')) {
      return [
				(this.renderHomeLink()),
				(<BreadcrumbDropdownAccount key={1} dropdownTitle={App.Intl('header.user_menu.casino')} {...this.props} />),
        App.Intl('header.user_menu.rules'),
      ];
    }

		// Bets related:

    if (pathname.includes('promotions') && !pathname.includes('casino/promotions')) {
      return [(this.renderHomeLink()), App.Intl('casino.promotions')];
    }

    if (pathname.includes(`/${language}/sports/`)) {
      let sport = pathname.split('/');

      if (sport.length === 4) {
        sport = sport[3];
        sport = this.normalizeUrlName(sport);

        return [this.renderHomeLink(), (
          <BreadcrumbDropdownSports key={1} dropdownTitle={sport} {...this.props} />
				)];
      }
      const countryOrCompetition = pathname
					.replace(/-/g, ' ')
					.match(/[^/]*$/); // Everything after last index of '/'

      let sport = pathname.split('/');
      sport = sport[3];
      sport = this.normalizeUrlName(sport);

      return [this.renderHomeLink(),
					(<BreadcrumbDropdownSports key={1} dropdownTitle={sport} {...this.props} />),
					(<BreadcrumbDropdownCompetitions key={2} dropdownTitle={countryOrCompetition} {...this.props} />),
      ];
    }

		// casino breadcrumbs
    if (pathnameArray[0] === 'casino') {
      const sectionArray = pathname.split('/');
      let casinoSection = sectionArray[3];

			// if we are on the home All Categories is default
      if (_.isUndefined(casinoSection)) {
        casinoSection = App.Intl('casino.all_categories');
      }

      casinoSection = this.normalizeUrlName(casinoSection);

			// rules pop open
      if (casinoSection === 'rules') {
        const gameName = this.props.location.state.gameName;
        return [this.renderHomeLink('casino'),
					(<BreadcrumbDropdownCasino key={1} dropdownTitle={App.Intl('casino.all_games')} {...this.props} />),
					(`${gameName} rules`),
        ];
      }

			// user has searched
      if (casinoSection === 'search') {
				// using widnow location as it's more accurate, props seem to get out of sync when searching
        const searchTerm = window.location.href.split('=').pop();

				// Remove %20 etc
        const tidiedSearchTerm = searchTerm.replace(/%\d{2}|[+]/g, ' ');

        return [this.renderHomeLink('casino'),
					(<BreadcrumbDropdownCasino key={1} dropdownTitle="all games" {...this.props} />),
					(`${tidiedSearchTerm}`),
        ];
      }

      return [this.renderHomeLink('casino'), (<BreadcrumbDropdownCasino key={1} dropdownTitle={casinoSection} {...this.props} />)]; // casino base case
    }

    if (App.Config.siteId === 1 && pathnameArray.length >= 1)		{
      return [this.renderHomeLink(), layout.title];
    }		else if (pathnameArray.length === 1) {
      const title = pathnameArray[0].replace(/-/g, ' ');
      return [this.renderHomeLink(), title];
    }

    return [this.renderHomeLink()]; // Base case
  }
}
