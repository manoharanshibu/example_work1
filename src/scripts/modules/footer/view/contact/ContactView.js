import Tabs from "app/components/tabs/Tabs";
import Pane from "app/components/tabs/pane/Pane";
import Modal from "footer/view/contact/components/Modal";
import FaqSection from "footer/view/contact/components/FaqSection";
import ContactDetailsSection from "footer/view/contact/components/ContactDetailsSection";
import {TOGGLE_CONTACT} from "app/AppConstants";
import ScrollArea from 'sportsbook/components/ScrollArea';

export default class ContactView extends React.Component {
	constructor(props){
		super(props);
		this.contactOpen = props.contactOpen;
		this.showChat = props.showChat;
		this.showDetails = props.showDetails;
		this.showFaq = props.showFAQ;

		this.state = {
			activeTab: 0
		}
	}

	/**
	 * Handle when props change, should be because a different sub-view is required or pop up is opened / closed
	 * @param props
	 */
	componentWillReceiveProps(props){
		this.contactOpen = props.contactOpen;
		this.showChat = props.showChat;
		this.showDetails = props.showDetails;
		this.showFaq = props.showFAQ;

		let newActiveTab = (this.showChat || this.showDetails) ? 1 : 0;
		this.setState({activeTab: newActiveTab});
	}

	/**
	 * Blow functions all using triggers to keep track of state at the highest level
	 */


	onClose(){
		App.bus.trigger(TOGGLE_CONTACT);
	}

	render(){
		return (
			<div>
				{this.contactOpen && (
					<Modal
						closeEnabled={true}
						onClose={this.onClose.bind(this)}
						title={App.Intl('contact_modal.primary_title')}
						description={App.Intl('contact_modal.primary_description')}>
						<Tabs activeTab={this.state.activeTab}>
							<Pane label="FAQ" style={{overflow: 'hidden' }} classes={'contact-modal__tabs'}>
								{this.props.viewportWidth >= 737 ? (
										<ScrollArea style={{height: '100%', maxWidth: '500px'}}>
											<FaqSection />
										</ScrollArea>
									) : (
										<FaqSection />
									)
								}
							</Pane>

							<Pane label={App.Intl('contact_modal.pane_label')}>
								<ContactDetailsSection />
							</Pane>
						</Tabs>
					</Modal>
				)}
			</div>
		)
	}
}

// Defaulting to chat tab
