import {FormattedNumber} from 'react-intl';
import service from 'sportsbook/service/ApiService.js';
import '../MyBonusesView.scss';
import BonusRow from './BonusRow';

class BonusBoxAvailable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			flipped: false,
			drawerOpen: false
		};
	}

	/**
	 * @param route
	 */
	onNavigate(route, e) {
		e.preventDefault();
		e.stopPropagation();
		App.navigate(route);
	}

	onPlayNow(bonusCode, event) {
		// If we don't prevent the default the 'Play now' button will send
		// the user to the lobby, which is not what we want.
		event.preventDefault();
		event.stopPropagation();
		service.saveAccountEntitlement(bonusCode)
			.then( ::this.onPlayNowSuccess, ::this.onPlayNowError );

	}

	onPlayNowSuccess() {
		// Triggers a refresh of the bonus list
		if (this.props.updateListAction){
			this.props.updateListAction();
		}
	}


	onPlayNowError(resp) {
		// Placeholder waiting for a spec
		console.warn('errrrrr');
	}



	renderCta() {
		const {isDeposit, campaign, ctaLink, isThereActiveDeposit} = this.props;

		// If there is already an active deposit bonus, no other one can be activated
		const blocked = !!isThereActiveDeposit && isDeposit;
		if(blocked)
			return null;

		let cta =  isDeposit ? 'deposit_now' : 'play_now';
		const translatedCTA = App.Intl(`bonus_tile.${cta}`);
		const {bonusCode} = campaign;
		const pathHandler = this.onNavigate.bind(this, ctaLink);

		const playNowHandler = _.throttle(this.onPlayNow.bind(this, bonusCode), 10000);
		const clickHandler = (cta === 'play_now') ? playNowHandler : pathHandler;

		return (
			<a className="btn btn--orange c-bonuses-row__lastcol--btn" data-ignore
				onClick={clickHandler}>
				{translatedCTA}</a>
		);
	}


	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		const {isDeposit, isThereActiveDeposit} = this.props;
		const statusBar = this.renderCta();
		const blocked = !!isThereActiveDeposit && isDeposit;

		const blockedText =
			<span>
				{App.Intl('bonus_tile.blocked_warning_paragraph1')}
				{App.Intl('bonus_tile.blocked_warning_paragraph2')}
			</span>;

		return (
			<BonusRow  statusBar={statusBar} blocked={blocked} blockedText={blockedText} {...this.props} />
		);
	}
}

export default BonusBoxAvailable;
