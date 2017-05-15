import './AppView.scss';

import Title from 'app/components/main/Title';
import Header from "header/Header";
import BurgerMenu from "app/view/sideBar/BurgerMenuView";
import BetSlip from "app/components/BetSlip/BetSlip";
import FooterView from "footer/view/FooterView";
import {NOT_LOGGED_IN_ERROR} from "common/model/SessionModel.js";
import Breadcrumb from "app/view/components/breadcrumbs/Breadcrumb.js";
import betsModel from "sportsbook/model/domain/BetsModel";
import DoubleClick from 'sportsbook/components/tracking/DoubleClick';
import ChatToggle from 'app/view/components/ChatToggle.jsx';
import LoginModal from 'header/view/components/LoginModal';
import PodcastPlayer from 'header/view/components/PodcastPlayer';
import {classNames as cx} from "common/util/ReactUtil";
import SearchField from 'app/view/components/SearchField';

import {
	LOGOUT,
	TOGGLE_SIDE_BAR,
	CLOSE_SIDE_BAR,
	TOGGLE_BET_SLIP,
	CLOSE_BET_SLIP,
	HANDLE_PEA_GO_HOME,
	TRIGGER_RESIZE,
	APP_NAVIGATE,
	SCROLL_TRIGGER,
	SCROLL_TO_TOP,
} from "app/AppConstants";

class AppView extends React.Component {
	static contextTypes = {
		router: React.PropTypes.object
	};



	constructor(props, context) {
		super(props, context);

		this.resizeTimer = null;

		this.startPosition = 0;
		this.scrollLastValue = 0;

		// put App.bus event handlers in here and they will be added and
		// removed on component mount and unmount:
		this.handlers = [
			{ event: LOGOUT,             		  handler: ::this.onLogout },
			{ event: TOGGLE_BET_SLIP,   		  handler: ::this.onToggleBetslip },
			{ event: CLOSE_BET_SLIP,      		handler: ::this.onCloseBetslip },
			{ event: TOGGLE_SIDE_BAR,    		  handler: ::this.onToggleSidebar },
			{ event: CLOSE_SIDE_BAR,     		  handler: ::this.onCloseSidebar },
			{ event: NOT_LOGGED_IN_ERROR,		  handler: ::this.onSessionTimeout },
			{ event: TRIGGER_RESIZE,     		  handler: ::this.onResize },
			{ event: APP_NAVIGATE,       		  handler: ::this.onNavigate },
			{ event: SCROLL_TO_TOP, 					handler: ::this.onScrollToTop },
		];

		const width = document.documentElement.clientWidth;
		this.state = Object.assign({
			viewportHeight: document.documentElement.clientHeight,
			viewportWidth: width,
			fixed: false,
			hideHeader: false,
			betslipOpen: false,
			burgerOpen: false,
			wrapperRelative: false,
			mainContentHeight: 1000,
			viewPortFixed: false,
			isAccount: this.isAccount(),
		}, this.props);

		_.each(this.handlers, ({event, handler}) => App.bus.on(event, handler));

		this.updateChildren();
		this.handleMainContentScroll = _.throttle(::this.handleMainContentScroll, 20);
	}

	/**
	 * checking the window size before mounting prevents an additional rerender on load
	 * @return {Oject}
	 */
	componentWillMount() {
		this.wrapperRelative();
	}

	/**
	 * Adds window scroll listener when mounted
	 */
	componentDidMount() {
		this.setMainContentHeight();
		this.betslipBodyClass();
		this.addMainContentScrollListener();
		if(App.session.request('loggedIn')) {
			betsModel.getBonusEntitlements();
		}
	}

	/**
	 * And removes listener when unmounted
	 */
	componentWillUnmount() {
		_.each(this.handlers, ({event, handler}) => App.bus.off(event, handler));
		this.removeMainContentScrollListener();
	}

	/**
	 * @param nextProps
	 */
	componentWillReceiveProps(nextProps) {
		if (nextProps.location !== this.props.location) {
			this.setState({location: nextProps.location, sport: nextProps.params.sport});
		}
	}

	/**
	 * Only update component if it has new children specified
	 * @param nextProps
	 * @returns {boolean}
	 */
	componentWillUpdate(nextProps) {
		this.updateChildren(nextProps);
	}

	componentDidUpdate() {
		//TEMP FIX: resubscribe betslip events
		betsModel.onRouteChange();

		this.betslipBodyClass();

		//when router triggers this recalculate height, solves black bar at bottom of pages with no breadcrumbs.
		this.setMainContentHeight();
	}

	onSessionTimeout() {
		window.setTimeout(() => {
			App.navigate();
		}, 3000);
	}

	//because the viewport can get fixed by toggling of the sidebars we need to
	// do some housekeeping when navigating.
	onNavigate() {
		// ensure viewport is unfixed
		this.onCloseSidebar();
		this.onCloseBetslip();
	}

	addMainContentScrollListener() {
		if(App.isMobile()) {
			if(document) {
				document.addEventListener('scroll', this.handleMainContentScroll);
			}
		} else {
			const mainContent = this.mainContent;
			if(mainContent) {
				mainContent.addEventListener('scroll', this.handleMainContentScroll);
			}
		}
	}

	removeMainContentScrollListener() {
		if(document) {
			document.removeEventListener('scroll', this.handleMainContentScroll);
		}

		const mainContent = this.mainContent;
		if(mainContent) {
			mainContent.removeEventListener('scroll', this.handleMainContentScroll);
		}
	}

	// do not remove this it does not scroll the page back to the top
	// .scrollTop returns the scroll distance from the top of the page
	// it has no effect on the scroll position of the page when used like this.
	// https://developer.mozilla.org/en/docs/Web/API/Element/scrollTop
	handleMainContentScroll() {
		if(App.isMobile()) {
			if(window) {
				App.bus.trigger(SCROLL_TRIGGER, window.pageYOffset, this.getScrollDelta(window.pageYOffset));
			}
		} else {
			const mainContent = this.mainContent;
			if(mainContent) {
				App.bus.trigger(SCROLL_TRIGGER, mainContent.scrollTop, this.getScrollDelta(mainContent.scrollTop));
			}
		}
	}

	onScrollToTop() {
		if(App.isMobile()) {
			if(window) {
				window.scrollTo(0,0);
			}
		} else {
			const mainContent = this.mainContent;
			if(mainContent) {
				mainContent.scrollTop = 0;
			}
		}
	}

	getScrollDelta(scroll) {
		const delta = scroll - this.scrollLastValue;

		this.scrollLastValue = scroll;
		return delta;
	}

	/**
	 * Toggles betslip visibility on mobile
	 */
	onToggleBetslip() {
		if ((App.isTablet() || App.isMobile()) && this.state.burgerOpen) {
			this.setState({burgerOpen: false});
		}

		this.setState({
			betslipOpen: !this.state.betslipOpen,
		});

	}

	onCloseBetslip() {
		this.setState({betslipOpen: false});
	}

	/**
	 * Toggles burger visibility on mobile
	 */
	onToggleSidebar() {
		if (App.isMobile() && this.state.betslipOpen) {
			this.setState({betslipOpen: false});
		}

		this.setState({
			burgerOpen: !this.state.burgerOpen,
		});

	}

	onCloseSidebar() {
		this.setState({
			burgerOpen: false,
		});

	}

	fixViewPort() {
		const html = document.documentElement;

		html.style.overflow = "hidden";
		html.style.height = this.state.viewportHeight + "px";
	}

	unFixViewPort() {
		const html = document.documentElement;

		html.style.overflow = "";
		html.style.height = "";
	}

	unFixViewPortDesktop() {
		const html = document.documentElement;

		html.style.overflow = "";
		html.style.height = this.state.viewportHeight + "px";
	}

	/**
	 * Updates the children elements.  If no 'main' element is
	 * specified - ie. it should not be rendered, use it's old value,
	 * so that the component persists across different route changes
	 * @param props
	 */
	updateChildren(props = this.props) {
		this.main = props.main || this.main; // persist old
	}

	/**
	 *  if the size is less than tablet add wrapper relative state
	 */
	wrapperRelative() {
		if (window.innerWidth < 961) {
			this.setState({wrapperRelative: false});
		} else {
			this.setState({wrapperRelative: true});
		}
	}

	/**
	 * @param e
	 */
	onResize(width, height) {
		// console.warn('width x height', `${width} x ${height}`);
		this.setState({viewportHeight: height, viewportWidth: width});

		this.setMainContentHeight();
		if(!App.isMobile()) {
			this.unFixViewPortDesktop();
		}

		//on resize update the event listner to make,
		//sure we are watching the current scrollable section
		this.removeMainContentScrollListener();
		this.addMainContentScrollListener();
	}

	setMainContentHeight() {
		const header = document.getElementById('js-header-measure');

		if (header) {
			const headerHeight = header.clientHeight;
			const windowHeight = this.state.viewportHeight;
			const mainContentHeight = windowHeight - headerHeight;

			if (this.state.mainContentHeight !== mainContentHeight) {
				this.setState({mainContentHeight: mainContentHeight});
			}
		}
	}

	onLogout() {
		App.session.execute('logout');
		App.navigate();
	}


	//check the route directly after the language code.
	isParentRoute(routes) {
		const {pathname} = window.location;
		let routeActive = routes.some(route => {
			const splitPathname = pathname.split('/');
			if(splitPathname[2] === route)
				return true;
		}, this);

		return routeActive;
	}

	isBetslipActive() {
		if (!App.Globals.isSportsbookAvailable)
			return false;

		return this.isParentRoute(['sports', 'events', 'live', 'promotions', 'race-cards', 'competitions']) || App.isHome();
	}

	isAccount() {
		const accountPages = [
			'account',
			'mybets',
			'transactions',
			'deposit',
			'withdraw',
			'bonuses'
		];
		return accountPages.some(page => this.isActivePath(page));
	}

	isCasino() {
		return !this.isActivePath('transactions') && this.isActivePath('casino') || !this.isActivePath('transactions') && App.isActive('games');
	}

	isActivePath(path) {
		const {pathname} = window.location;
		if(App.Config.siteId === 1) {
			path = App.translateRoute(path)
		}
		return pathname.indexOf(path) !== -1;
	}

	isLg() {
		return this.state.viewportWidth >= 992 && this.state.viewportWidth < 1366;
	}

	//to move the chat button when the betslip is active over the main content a class
	//was needed on the body tag as the button is a third part widget outside of the appview.
	betslipBodyClass() {
		const body = document.body;
		const betslipActive = this.isBetslipActive();
		if(betslipActive) {
			$(body).addClass('betslip-is-active');
		} else if (!betslipActive) {
			$(body).removeClass('betslip-is-active');
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const isSidebarOpen = this.state.burgerOpen || this.state.betslipOpen;
		const {pathname} = this.props.location;
		const isSportView = pathname != App.normalize('/') && pathname != App.normalize('sports');
		const bodyStyle = {
			zIndex: '10',
			position: 'relative',
		};

		const getMainHeight = () => {
			if(!App.isMobile()) {
				return this.state.mainContentHeight + 'px';
			} else {
				return 'auto';
			}
		};

		const headerHeightPx = () => {
			const headerHeightPx = 56;
			if (App.isMobile()) {
				return headerHeightPx;
			} else {
				return 0;
			}
		};

		// TODO: viewPortFixed needs to update when the screen size is changed. currently, site is unscrollable if you change between views
		const mainContentStyle = {
			height: getMainHeight(),
			overflow: (this.state.viewPortFixed) ? 'hidden' : '',
			marginTop: headerHeightPx()
		};

		//needs logic to stop the betslip being displayed anywhere that is not betting;
		const isCasino = this.isCasino();
		const isAccount = this.isAccount();
		const betslipActive = this.isBetslipActive();
		const burgerMenuIsStatic = (!betslipActive);
		const burgerActive = !this.isParentRoute(['login', 'register', 'passwordForgot', 'not-found']) && (App.Globals.isSportsbookAvailable || isCasino || isAccount || App.Config.siteId === 1 && App.isMobile());
		const breadcrumbActive = !this.isParentRoute(['login', 'register', 'passwordForgot', 'not-found']);

		const burgerClass = cx('c-sidebar--burger', 'u-smooth-mobile-scroll', {'burger--is-open': this.state.burgerOpen || App.isTablet()});
		const betslipClass = cx('c-sidebar--bet-slip', 'u-smooth-mobile-scroll', {'is-open': this.state.betslipOpen});

		const containerClass = cx(
			'c-app',
			{'c-app--casino': isCasino},
			{'sidebar-is-open': this.state.betslipOpen || this.state.burgerOpen},
			{'sidebar-is-closed': !this.state.betslipOpen && !this.state.burgerOpen},
			{'burger-is-static': burgerMenuIsStatic},
			{'no-breadcrumb': !breadcrumbActive},
		);

		const mainContentClass = cx(
			'c-main-content',
			'u-smooth-mobile-scroll',
			{'c-main-content__accounts-view': isAccount},
			{'c-main-content--casino': isCasino}
		);

		const displayTracking = App.isHome() ? (<DoubleClick type="retar0" cat="beton0" />) : null;


		const getBurgerStyle = () => {
			if (!App.isMobile()) {
				let height = this.state.mainContentHeight - headerHeightPx();
				//at large breakpoint breadcrumb is full width so height of breadcrumb is deducted.
				if(this.isLg()) {
					height = height - 40;
				}

				return {
					height: height + 'px'
				};
			}
		};

		const getBetslipStyle = () => {
			const addNegativeMargin = true;
			let negativeMarginOnTopOfBetslipPx = 0;
			if (addNegativeMargin) {
				// 40 is a hack it adds the height of the negative margin on the top of the betslip
				negativeMarginOnTopOfBetslipPx = 40;
			}
			if (App.isMobile()) {
				return {
					height: this.state.mainContentHeight + negativeMarginOnTopOfBetslipPx - headerHeightPx() + 'px'
				};
			}
		};

		return (
			<Title>
				<div className={containerClass} ref={(ref) => this.app = ref}>
					{displayTracking}

					<div className="c-app__header-container" id="js-header-measure">
						<Header
							id="header"
							viewportHeight={this.state.viewportHeight}
							viewportWidth={this.state.viewportWidth}
							betslipOpen={this.state.betslipOpen && betslipActive}
							burgerMenuIsStatic={burgerMenuIsStatic}
							betslipActive={betslipActive}
							burgerActive={burgerActive}
							breadcrumbActive={breadcrumbActive}
							{...this.props}
						/>

						{!this.state.burgerOpen && App.isMobile() && this.isCasino() &&
						<SearchField key="burgerMenuSearchFieldCasino" casino />}

						<div className="o-container c-nav-filters">
							{breadcrumbActive && (
								<div className="o-container__content">
									<Breadcrumb
										model={null}
										content={this.props}
										burgerActive={burgerActive}
										burgerMenuIsStatic={burgerMenuIsStatic}
										betslipActive={betslipActive}
										betslipOpen={this.state.betslipOpen}
										viewportWidth={this.state.viewportWidth}
										isSportView={isSportView}
										{...this.props}
									/>
								</div>
							)}
						</div>
					</div>

					<div className="c-app__grid grid-noGutter-noWrap" style={bodyStyle} >

						{burgerActive &&
								<BurgerMenu
									burgerClass={burgerClass}
									burgerStyle={getBurgerStyle()}
									burgerOpen={this.state.burgerOpen}
									viewportWidth={this.state.viewportWidth}
									isAccount={isAccount}
									isCasino={this.isCasino()}
									isSportView={isSportView}
									{...this.props}
								/>
						}
						<div
							className={mainContentClass}
							id="main-content"
							style={mainContentStyle}
							ref={(ref) => this.mainContent = ref}
						>
							{this.main}
							<FooterView />
						</div>

						{betslipActive &&
							<div className={betslipClass}>
								<BetSlip
									open={this.state.betslipOpen}
									viewportHeight={this.state.viewportHeight}
									viewportWidth={this.state.viewportWidth}
									mainContentHeight={this.state.mainContentHeight}
									{...this.props}
								/>
							</div>
						}
					</div>

					<ChatToggle />
					<LoginModal />

					{App.isMobile() &&
						<PodcastPlayer/>
					}
				</div>
			</Title>
		);
	}
}

export default AppView;
