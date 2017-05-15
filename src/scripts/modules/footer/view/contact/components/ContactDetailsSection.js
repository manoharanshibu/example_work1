import {TOGGLE_CONTACT} from 'app/AppConstants';
import zopim from 'common/controller/ZopimController'

export default class ContactView extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			chatStatus: zopim.status
		};
	}

	componentDidMount() {
		App.bus.on('zopim:status', (status) => {
			this.setState({ chatStatus: status});
		})
	}

	onLivechatOpen(event) {
		event.preventDefault();
		if (this.state.chatStatus == 'offline') return false;
		App.bus.trigger(TOGGLE_CONTACT);
		App.bus.trigger('zopim:show');
	}

	render() {
		var emailLink = 'mailto:' + App.Intl('contact_modal.email_section.email_address');
		const chatColor = (this.state.chatStatus == 'online') ? "green" : (this.state.chatStatus == 'away') ? "yellow" : "red";
		const chatText = (this.state.chatStatus == 'online') ? App.Intl('footer.live_chat.online') : (this.state.chatStatus == 'away') ? App.Intl('footer.live_chat.away') : App.Intl('footer.live_chat.offline');
		const chatClass = (this.state.chatStatus == 'online' || this.state.chatStatus == 'away') ? "link" : "link disabled";

		return (
			<div className="contact-details-section">
				<h2>
					{App.Intl('contact_modal.email_section.title')}
				</h2>
				<a href={emailLink}>
					{App.Intl('contact_modal.email_section.display_text')}
				</a>
				<h2 className="paddingTop">
					{App.Intl('contact_modal.telephone.title')}
				</h2>
				<p className="hide">
					{App.Intl('contact_modal.telephone.opening_times')}
				</p>
				<p className="no-margin">
					{App.Intl('contact_modal.telephone.number')}
				</p>
				{/*<h2 className="paddingTop">
					{App.Intl('contact_modal.fax.title')}
				</h2>
				<p className="no-margin">
					{App.Intl('contact_modal.fax.number')}
				</p>*/}
				<h2 className="paddingTop">
					<a
						href="#"
						onClick={this.onLivechatOpen.bind(this)}
						className={chatClass}
					>
						<i className="icon-support"></i>
						{App.Intl('contact_modal.open_live_chat')} - <span className={'status ' + chatColor}>{chatText}</span>
					</a>
				</h2>
			</div>
		);
	}
}
