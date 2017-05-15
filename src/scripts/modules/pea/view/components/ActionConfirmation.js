import './ActionConfirmation.scss';

import {classNames as cx} from 'common/util/ReactUtil';

export default class ActionConfirmation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {saved: false, unsaved: false, duration: 2500};
	}

	/**
	 * @param e
	 */
	saved() {
		const {duration} = this.state;
		this.setState({saved: true, unsaved: false});

		this.timerId = _.delay(function() {
			this.setState({saved: false, unsaved: false});
		}.bind(this), duration);
	}

	/**
	 *
	 */
	unsaved() {
		const {duration} = this.state;
		this.setState({saved: false, unsaved: true});

		_.delay(function() {
			this.setState({saved: false, unsaved: false});
		}.bind(this), duration);
	}

	/**
	 *
	 */
	componentWillUnmount() {
		clearTimeout(this.timerId);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const confirmed  = this.state.saved || this.state.unsaved;
		const modalClass = cx('c-action-confirmation__notification', {'is-hidden': !confirmed});

		const successMessage = (
			<div className={modalClass}>
				<div className="c-action-confirmation__notification-inner">
					<span>{App.Intl('action_confirmation.changes_saved')}</span>

					{this.renderSuccessCheckAnimation()}
				</div>
			</div>
		);

		return (
			<div className="c-action-confirmation">
				<div className={this.props.childClass}>
					{this.props.children}
				</div>
				{confirmed && successMessage}
			</div>
		);
	}

	renderSuccessCheckAnimation() {
		return (
			<svg version="1.1" className="c-action-confirmation__success-checkmark" xmlns="http://www.w3.org/2000/svg"
				x="0px" y="0px" width="30px" height="30px" viewBox="0 0 45 45" style={{'enableBackground': 'new 0 0 45 45'}} >
				<g className="c-action-confirmation__success-checkmark-circle" fillRule="evenod" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" strokeMiterlimit="10" strokeDasharray="200" strokeDashoffset="200" fill="none">
					<path d="M39.587,17.532c0.431,1.583,0.661,3.249,0.661,4.968c0,10.424-8.45,18.874-18.874,18.874 S2.5,32.924,2.5,22.5S10.95,3.626,21.374,3.626c4.302,0,8.268,1.439,11.443,3.863" />
				</g>
				<g id="testaniT" className="c-action-confirmation__success-checkmark-delay-tick" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" strokeMiterlimit="10" strokeDasharray="200" strokeDashoffset="200" fill="none">
					<polyline points="14.668,20.697 21.337,27.366 42.5,6.203" />
				</g>
			</svg>
		);
	}
}
