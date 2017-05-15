import {TOGGLE_CONTACT} from 'app/AppConstants';

export default class ContactView extends React.Component {
	constructor(props){
		super(props);
	}

	onLivechatOpen(event) {
		event.preventDefault();
		App.bus.trigger(TOGGLE_CONTACT);
		App.bus.trigger('zopim:show');
	}

	render(){
		return(
			<div>
				<h2>
					<a
						href="#"
						onClick={this.onLivechatOpen}
					>
						<i className="icon-support"></i>
						{App.Intl('contact_modal.open_live_chat')}
					</a>
				</h2>
			</div>
		);
	}
}
