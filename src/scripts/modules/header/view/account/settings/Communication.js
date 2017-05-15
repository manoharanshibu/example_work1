import model from 'sportsbook/model/CommunicationModel';
import ActionConfirmation from 'pea/view/components/ActionConfirmation';
import CustActionButton from 'pea/view/components/CustActionButton';

class Communication extends React.Component {
    constructor() {
        super();
    }

	onToggleCheckbox(value, e){
		const isChecked = e.currentTarget.checked;
		model.set(value, isChecked);
	}

	onSubmit(e){
		e.preventDefault();
		this.refs.confirmButton.confirming();
		model.saveDetails().then(::this.onServerCallFinished);
	}

	componentDidMount(){
		model.on('change', () => {
			this.forceUpdate();
		});
	}

	componentWillUnmount(){
		model.memo.reset();
		model.off('change');
	}

	/**
	 *
	 */
	onServerCallFinished(){
		this.refs.confirmButton.confirmed();
		if (model.serverErrorArray.length > 0) {
			App.bus.trigger('popup:notification', {title: "ERROR", content: App.Intl('register.errors.problems_encountered_saving')});
		} else {
			this.refs.confirmation.saved();
		}
	}



	renderCheckbox (id, type, name) {
		const value = model.get(type);
        return (
            <div>
				<p>
                <label htmlFor={id} className="radio-label big">
                    <input 	id={id}
						   	type="checkbox"
						   	checked={value}
                           	onChange={this.onToggleCheckbox.bind(this, type)}/>&nbsp;&nbsp;&nbsp;&nbsp;
                    {_.titleize(App.Intl(`communication.checkbox.${name}`))}
                </label>
				</p>
            </div>
        );
    }

    renderSubheader (str) {
        return (
            <p className="u-fade">{App.Intl(`communication.subheader.${str}`)}:</p>
        );
    }

    /**
     * @returns {XML}
     */
    render() {
        return (
        <div className="grid-noGutter">
          <div className="col-12">
            <header className="g-account__header">
              <h3>{App.Intl('header.overview.communication')}</h3>
            </header>
          </div>
  				<ActionConfirmation ref='confirmation'>
            <div className="grid-noGutter">
    					<div className="col-12">
    						<p className="u-margin--none u-bold">{App.Intl("communication.header.contact_me")}:</p>
              </div>
              <div className="col-4">
    						<div className="form-section">
    							{this.renderSubheader('exclusive_offers')}
    							{this.renderCheckbox('checkbox-email', 'offersEmail', 'email')}
    							{this.renderCheckbox('checkbox-mail', 'offersSnailMail', 'mail')}
    							{this.renderCheckbox('checkbox-phone', 'offersPhone', 'phone')}
    							{this.renderCheckbox('checkbox-sms-exc', 'offersSms', 'sms')}
    						</div>
              </div>
              <div className="col-6">
    						<div className="form-section">
    							{this.renderSubheader('regular_info')}
    							{this.renderCheckbox('checkbox-newsletter', 'infoNewsletter', 'newsletter')}
    							{this.renderCheckbox('checkbox-sms-reg', 'infoSms', 'sms')}
    						</div>
              </div>
              <div className="col-12 u-margin--top">
    						<div className="form-section">
    							<div className='button-container'>
    								<CustActionButton ref='confirmButton'
    												  type="submit"
    												  className='btn--large'
    												  idleText={App.Intl('details.save.button')}
    												  onClick={::this.onSubmit}
    								/>
    							</div>
    						</div>
    					</div>
            </div>
  				</ActionConfirmation>
        </div>
      );
    }
}

export default Communication;
