import {BET_HISTORY_NAVIGATE, TOGGLE_SIDE_BAR} from "app/AppConstants";

export default class BurgerItemLite extends React.Component {

	navigate(route) {
		App.bus.trigger(TOGGLE_SIDE_BAR);
		App.navigate(route);
		if(route.includes('mybets')) {
			App.bus.trigger(BET_HISTORY_NAVIGATE);
		}
	}

	render () {
		return (
			<li key={this.props.index} className={'c-burger-section__item' + this.props.activeClass}
				onClick={this.navigate.bind(this, this.props.item.route)}>
				<a className="c-burger-section__item-link">{this.props.item.name}</a>
			</li>
		);
}
}
