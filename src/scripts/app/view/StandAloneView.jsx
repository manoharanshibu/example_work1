import HeaderView from 'header/HeaderViewLite';
import FooterView from 'footer/view/FooterViewLite';
import {classNames as cx} from 'common/util/ReactUtil';
import ContactView from 'footer/view/contact/ContactView';
import Loader from 'app/view/components/LoaderView';

import {
	TOGGLE_CONTACT,
	OPEN_CONTACT_CHAT,
	OPEN_CONTACT_FAQ,
	OPEN_CONTACT_DETAILS,
	TRIGGER_RESIZE,
} from 'app/AppConstants';

class StandAloneView extends React.Component {
	constructor(props, context) {
		super(props, context);

		// put App.bus event handlers in here and they will be added and
		// removed on component mount and unmount:
		this.handlers = [
			{ event: TRIGGER_RESIZE,       handler: ::this.onResize },

			//Register chat pop up and sub-view triggers:
			{ event: TOGGLE_CONTACT,       handler: ::this.onToggleContact },
			{ event: OPEN_CONTACT_CHAT,    handler: ::this.onOpenContactChat },
			{ event: OPEN_CONTACT_FAQ,     handler: ::this.onOpenContactFAQ },
			{ event: OPEN_CONTACT_DETAILS, handler: ::this.onOpenContactDetails }
		];

		this.state = {
			stickyFooterHeight: '',
			viewportWidth: document.documentElement.clientWidth
		};

		_.each(this.handlers, ({event, handler}) => App.bus.on(event, handler));
	}

	whiteStyle() {
		const routes = ['deposit'];
		const active =  _.some(routes, route => {
			return this.props.location.pathname.includes(route);
		});
		return active;
	}

	activePage(page){
		return this.props.location.pathname.includes(page);
	}

	/**
	 * Toggle contact pop up open state, and default to the chat tab
	 */
	onToggleContact() {
		this.setState({
			contactOpen: !this.state.contactOpen,
			betslipOpen: false,
			showContactChat: true,
			showContactFAQ: false,
			userMenuOpen: false,
			walletMenuOpen: false,
			showContactDetails: false
		});
	}

	/**
	 * Open the contact pop up, show chat
	 */
	onOpenContactChat() {
		this.setState({
			contactOpen: true,
			showContactChat: true,
			showContactFAQ: false,
			showContactDetails: false,
			betslipOpen: false
		});
	}

	/**
	 * Open the contact pop up, show faq
	 */
	onOpenContactFAQ() {
		this.setState({
			contactOpen: true,
			showContactChat: false,
			showContactFAQ: true,
			showContactDetails: false,
			betslipOpen: false
		});
	}

	/**
	 * Open the contact pop up, show details
	 */
	onOpenContactDetails() {
		this.setState({
			contactOpen: true,
			showContactChat: false,
			showContactFAQ: false,
			showContactDetails: true,
			betslipOpen: false
		});
	}

	componentDidMount() {
		this.stickyFooter();
	}

		/**
     * And removes listener when unmounted
     */
	componentWillUnmount() {
		_.each(this.handlers, ({event, handler}) => App.bus.off(event, handler));
	}


	onResize(width, height) {
		this.setState({viewportHeight: height, viewportWidth: width});
		this.stickyFooter();
	}

	stickyFooter() {
		let minBodyHeight = window.innerHeight;
		const header = document.getElementById('header');
		const footer = document.getElementById('site-footer');

		if (header && footer) {
			minBodyHeight = minBodyHeight - header.clientHeight;

			minBodyHeight = minBodyHeight - footer.clientHeight;
			this.setState({stickyFooterHeight: minBodyHeight});
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const {children} = this.props;
		const classNames = this.classNames();

		return (
			<div id="stand-alone-view" className={classNames.wrapper}>
				<div id="header">
					<HeaderView {...this.props}/>
				</div>

				<div ref="main" id="main-container" className={classNames.main}>
					<div className="container-wrapper" style={{minHeight: this.state.stickyFooterHeight + 'px'}}>
						<div className="container">
							<div>
								{children}
							</div>
						</div>
					</div>
				</div>

				<ContactView
					contactOpen={this.state.contactOpen}
					showChat={this.state.showContactChat}
					showFAQ={this.state.showContactFAQ}
					showDetails={this.state.showContactDetails}
					viewportWidth={this.state.viewportWidth}
				/>
				<Loader loading={false} color="light"/>
				<footer id="site-footer" className="site-footer">
					<FooterView/>
				</footer>
			</div>
		);
	}

	/**
	 * @returns {{wrapper, main}}
     */
	classNames() {
		return {
			wrapper: cx({
				'register-page': this.activePage('register'),
				'login-page': this.activePage('login'),
				'white-bg': this.whiteStyle(),
			}),
			main: cx({
				'fixed': false,
				'transition': false
			})
		}
	}
}

export default StandAloneView;
