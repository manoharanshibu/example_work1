import './ChatToggle.scss';

export default class ChatToggle extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			chatStatus: null
		}
	}

	componentDidMount() {
		App.bus.on('zopim:status', (status) => {
			this.setState({ chatStatus: status});
		})
	}


	openChat() {
		App.bus.trigger('zopim:show');
	}

	render() {
		
		const { chatStatus } = this.state;
		if (!chatStatus) {
			return null;
		}

		return (
			<div className="c-chat-toggle" onClick={this.openChat.bind(this)}>
				<i className="c-chat-toggle__icon icon-chatbox-working"></i>
				<span>
					{App.Intl('contact_modal.chat_label')}
				</span>
			</div>
		);
	}
}
