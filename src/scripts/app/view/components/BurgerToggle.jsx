import './BurgerToggle.scss';

import {CLOSE_SIDE_BAR, TOGGLE_SIDE_BAR, TOGGLE_BET_SLIP, APP_NAVIGATE} from "app/AppConstants";

export default class BurgerToggle extends React.Component {

	constructor(props) {
		super(props);

		this.burgerToggle = this.burgerToggle.bind(this);

		this.handlers = [
			{ event: TOGGLE_BET_SLIP,   		  handler: ::this.uncheckIcon },
			{ event: TOGGLE_SIDE_BAR,    		  handler: ::this.toggleIconCheck },
			{ event: CLOSE_SIDE_BAR,     		  handler: ::this.uncheckIcon },
			{ event: APP_NAVIGATE, 						handler: ::this.uncheckIcon },
		];

		this.state = {isChecked: false};
	}

	componentDidMount() {
		_.each(this.handlers, ({event, handler}) => App.bus.on(event, handler));
	}

	componentWillUnmount() {
		_.each(this.handlers, ({event, handler}) => App.bus.off(event, handler));
	}

	toggleIconCheck() {
		const chk = this.state.isChecked;
		this.setState({isChecked: !chk});
	}

	uncheckIcon() {
		this.setState({isChecked: false});
	}

	burgerToggle() {
		App.bus.trigger('sidebar:toggle');
	}

	render() {
		return (
			<div className="c-burger-toggle is-visible-lg" onClick={this.burgerToggle.bind(this)}>
				{this.renderSpinningIcon()}
			</div>
		);
	}

	renderSpinningIcon() {
		return (
			<div className="c-burger-toggle__spinner">
			  <input type="checkbox" checked={this.state.isChecked} id="spinner-form"/>

			  <label htmlFor="spinner-form" className="spinner-label">
			    <div className="spinner-label__spinner diagonal part-1"></div>
			    <div className="spinner-label__spinner horizontal"></div>
			    <div className="spinner-label__spinner diagonal part-2"></div>
			  </label>
			</div>
		);
	}
}
