import ClickOutside from 'common/components/ClickOutside.js';
import {classNames as cx} from 'common/util/ReactUtil.js';
import sessionModel from 'common/model/SessionModel';


class CasinoUserDropDownView extends ClickOutside {
	constructor() {
		super();
	}

	/**
	 * @param route
	 */
	onNavigate(route) {
    	this.props.onClose();
		App.navigate(route);
	}

	/**
	 * @param e
	 */
	onMyBonuses(e) {
		this.onNavigate('bonuses/casino');
	}

	/**
	 * @param e
	 */
	onMySettings(e) {
		this.onNavigate('account');
	}

	/**
	 *
	 */
	onLogout() {
        this.props.onLogout();
	}

	goHome(e){
		this.props.onClose();
		let locale = App.Globals.lang;
		App.navigate('/' + locale);
  }

	/**
	 * @returns {XML}
	 */
	render() {
		const className = cx('wallet-dropdown', 'active');
		return (
			<div className={className} onClick={this.handleComponent}>
				<div className="menu-background">
						<div className="btnArea user">
							<div className="btnArea">
							  <ul>
									<li onClick={::this.onMyBonuses}>
										<a style={{cursor: 'pointer'}}>{App.Intl('header.casino_menu.my_bonuses')}</a>
									</li>
									<li onClick={::this.onMySettings}>
										<a style={{cursor: 'pointer'}}>{App.Intl('header.casino_menu.settings')}</a>
									</li>
									<li onClick={::this.onLogout}>
										<a style={{cursor: 'pointer'}}>{App.Intl('header.casino_menu.logout')}</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				  <a className="clear-nav-home-btn" onClick={::this.goHome}>&nbsp;</a>
			</div>
		);
	}
}

export default CasinoUserDropDownView;
