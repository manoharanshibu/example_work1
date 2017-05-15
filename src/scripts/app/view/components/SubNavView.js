import { classNames as cx } from 'common/util/ReactUtil';
import userModel from 'sportsbook/model/UserPreferencesModel';
import PriorityNav from 'app/components/priority-nav/PriorityNav';
import regionalSports from 'sportsbook/model/RegionalSportsModel';
import { TOGGLE_SIDE_BAR, TOGGLE_BET_SLIP, OPEN_CONTACT_CHAT, OPEN_BET_SLIP_HINT } from 'app/AppConstants';
import { BindGlobal } from 'common/decorators/react-decorators';
import popupWindow from 'app/view/components/PopupWindow';
import ScrollToTop from 'app/view/components/GenericScrollUp';
import { SESSION_CHANGE } from 'common/model/SessionModel.js';

@BindGlobal('sport')
class SubNavView extends React.Component {

  static contextTypes = {
    location: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.handleBetsUpdate = this.onBetsUpdate.bind(this);
    this.openBetSlipHint = this.onOpenBetSlipHint.bind(this);
    this.onChangeSports = this.onChangeSports.bind(this);
    this.onSessionChange = this.onSessionChange.bind(this);
    this.onAddFavourites = this.onAddFavourites.bind(this);

    this.state = {
      favouriteAdded: false,
      priorityLoaded: false,
      betSlipHintActive: false,
			// sports: regionalSports.get('sports'),
      sports: regionalSports.get('sportsWithEvents'),
      sport: this.activeSport(),
      activeBets: 0,
    };
  }

	/**
	 * @param props
	 * @returns {string}
	 */
  activeSport(props = this.props) {
    const newSport = props.sport.toLowerCase();
    const pathname = window.location.pathname;
    const isActive = ~pathname.indexOf(newSport);
    return isActive ? newSport : '';
  }

	/**
	 * @param session
	 */
  onSessionChange() {
    const session = this.getSession();
    this.setState({ loggedIn: !!session });
  }

	// This is an alternative to App.session.monitor which cannot be unlistened
  getSession() {
    const isLoggedIn = App.session.request('loggedIn');
    if (!isLoggedIn) {
      return null;
    }
    return App.session.request('session');
  }


	/**
	 * @param bet
	 */
  onBetsUpdate(numBets) {
    this.setState({ activeBets: numBets });
  }


	/**
	 *
	 */
  onOpenBetSlipHint() {
    this.setState({ betSlipHintActive: true });
    setTimeout(() => {
      this.setState({ betSlipHintActive: false });
    }, 5000);
  }

	/**
	 * Show the sidebar
	 */
  onToggleBurger(e) {
    App.bus.trigger(TOGGLE_SIDE_BAR, e);
  }

	/**
	 * Open chat pop up, showing chat sub-view
	 */
  onShowContactChat() {
    App.bus.trigger(OPEN_CONTACT_CHAT);
  }

	/**
	 * @param e
	 */
  onToggleBetslip(e) {
    App.bus.trigger(TOGGLE_BET_SLIP, e);
  }

  unsetBetSlipHintActive() {
    this.setState({ betSlipHintActive: false });
  }

	/**
	 * @param route
	 */
  onNavigate(route) {
    const burgerIsOpen = this.props.burgerOpen;
    if (burgerIsOpen) {
      App.bus.trigger(TOGGLE_SIDE_BAR);
    }
    App.navigate(route);
  }

  onChangeSports() {
    this.setState({ sports: regionalSports.get('sports') });
  }

  onAddFavourites() {
    this.setState({ favouriteAdded: true });
    this.highlightFavourite();
  }
	/**
	 *
	 */
  componentWillMount() {
    this.onSessionChange();
    App.session.on(SESSION_CHANGE, this.onSessionChange);
    App.bus.on('selectedbets:update', this.handleBetsUpdate);
    App.bus.on(OPEN_BET_SLIP_HINT, this.openBetSlipHint);
    regionalSports.on('change:sports', this.onChangeSports);
  }

	/**
	 *
	 */
  componentWillUnmount() {
    App.session.off(SESSION_CHANGE, this.onSessionChange);
    App.bus.off('selectedbets:update', this.handleBetsUpdate);
    App.bus.off(OPEN_BET_SLIP_HINT, this.openBetSlipHint);
    regionalSports.on('change:sports', this.onChangeSports);
    userModel.Favourites.off('add', this.onAddFavourites);
  }

	/**
	 *
	 */
  componentDidMount() {
    userModel.Favourites.on('add', this.onAddFavourites);
  }

	/**
	 * @param nextProps
	 * @param nextState
	 * @param nextContext
	 * @returns {boolean}
	 */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return true;
  }

	/**
	 * @param nextProps
	 */
  componentWillReceiveProps(nextProps) {
    this.setState({ sport: this.activeSport(nextProps) });
  }

  highlightFavourite() {
    const that = this;
    setTimeout(() => {
      that.setState({ favouriteAdded: false });
    }, 1000);
  }

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
  render() {
    const { pathname } = this.props.location;
    const isLiveBetting = pathname.includes('live');
    const isPromotions = pathname.includes('promotions');
		// const showSportsNav = !isLiveBetting && !isPromotions;
    const clientId = '2245';
    const locationCode = App.Globals.lang || 'en';
    const popupURL = `https://stats.betradar.com/s4/?clientid=${clientId}&language=${locationCode}`;
    const fav = this.state.favouriteAdded ? 'u-highlight' : 'highlightNot';

    const className = cx({ transition: this.props.headerTransition });
    const menuClass = cx('menu-links drawer-toggle drawer-hamburger', { open: this.props.burgerOpen });
    const flexMenuClass = cx({ 'hide-live': isLiveBetting });

    const navProps = {
      tag: 'div',
      id: 'flex-menu',
      navDropdownLabel: App.Intl('prioritynav.more').toLowerCase(),
      className: cx({ 'hide-nav': isLiveBetting }),
      itemActiveClass: 'is-active',
      navRef: 'list',
      style: { padding: isPromotions ? 0 : '' },
    };

    let subNav = [];

    if (isPromotions) {
      subNav = this.renderPromoFilters(pathname);
    } else if (!isLiveBetting) {
      subNav = this.renderSports(pathname);
    }


    return (
      <div id="sub-nav-container" className="sub-nav-view">
        <div id="sub-nav">
          <div className="container">

            <PriorityNav {...navProps}>
              <button type="button" className={menuClass} onClick={this.onToggleBurger.bind(this)}>
                <span className="sr-only">{App.Intl('header.toggle_navigation')}</span>
                {!isPromotions && <span className="drawer-hamburger-icon" />}
              </button>
              <ul ref="list" className="horizontal-menu text-links">
                {subNav}
              </ul>
            </PriorityNav>

            <ul className="horizontal-menu icon-links phablet-hide">

              {this.state.loggedIn && !isPromotions && (
              <li title={App.Intl('header.favourites')}>
                <a className={fav} onClick={this.onNavigate.bind(this, 'favourites')}>
                  <i className="icon-favorite-border" />
                </a>
              </li>
							)}
              {!isPromotions && (
              <li>
                <a href={popupURL} onClick={popupWindow.bind(this, popupURL)}>
                  <i className="icon-statistics" />
                </a>
              </li>
							)}
              <li>
                <a className="" onClick={this.onShowContactChat.bind(this)}>
                  <span className="sr-only">{App.Intl('header.toggle_help_window')}</span>
                  <i className="icon-support" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container">
          {this.renderBetSlipHint()}
        </div>
      </div>
    );
  }

	/**
	 * Renders the available sports to the nav
	 */
  renderSports() {
    return _.reduce(this.state.sports, (all, sport) => {
      const isActive = this.state.sport === sport.code.toLowerCase();
      const title = App.Intl(`sport.name.${sport.code.toLowerCase()}`);
      if (!(sport.code.indexOf(' ') > -1)) {
        all.push(
          <li key={sport.code} className={cx({ 'is-active': isActive })}>
            <a onClick={this.onNavigate.bind(this, sport.code.toLowerCase())}>{title}</a>
          </li>,
				);
      }
      return all;
    }, []);
  }

  renderPromoFilters(pathname) {
    const promotionsNav = [{
      url: 'promotions/sports',
      title: App.Intl('deposit.label.sports'),
    }, {
      url: 'promotions/casino',
      title: App.Intl('deposit.label.casino'),
    }];

    return promotionsNav.map((nav, index) => (
      <li key={nav.title} className={cx({ 'is-active': pathname.includes(nav.url) })}>
        <a onClick={this.onNavigate.bind(this, nav.url)}>{nav.title}</a>
      </li>
			));
  }

  renderBetSlipHint() {
    const activeClass = cx({ 'is-active': this.state.betSlipHintActive });
    return (
      <ScrollToTop>
        <div id="betslipHint" className={activeClass} onClick={::this.unsetBetSlipHintActive}>
          <i className="icon-expand-less" />
          <p>{App.Intl('header.selection_added_to_betslip')}</p>
        </div>
      </ScrollToTop>
    );
  }
}

export default SubNavView;
