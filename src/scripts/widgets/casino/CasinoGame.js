import './CasinoGame.scss';

import CasinoGamesModel from 'sportsbook/model/CasinoGamesModel';
import CasinoOptionsModel from 'sportsbook/model/CasinoOptionsModel';
import {classNames as cx} from 'common/util/ReactUtil.js';
import CasinoModal from 'widgets/casino/CasinoModal';
import {slugify} from "sportsbook/util/SportUtil";
import {SESSION_CHANGE} from 'common/model/SessionModel.js';
import {FormattedNumber} from 'react-intl';
import service from 'sportsbook/service/ApiService.js';
import {isTouchDevice} from 'app/routes/util/DeviceUtil';
import Ribbon from './Ribbon';

import {OPEN_LOGIN_MODAL} from "app/AppConstants";

class CasinoGame extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cssStyles: {},
            gameData: {},
            gameTypeReal: false,
            loggedIn: App.session.request('loggedIn'),
            isModalOpen: false,
            price: false,
            name: false
        };

        this.onGameClick = this.onGameClick.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onSessionChange = this.onSessionChange.bind(this);
        this.getGameDetails = this.getGameDetails.bind(this);
		this.navigateToGameInfo = ::this.navigateToGameInfo;

        this.model = new CasinoOptionsModel(this.props.options);
	}

    componentDidMount() {
        this.onSessionChange();
    }

    componentWillMount() {
        App.session.on(SESSION_CHANGE, this.onSessionChange);

        this.getGameDetails();
    }

    componentWillUnmount() {
        App.session.off(SESSION_CHANGE, this.onSessionChange);
    }

    // make sure the game shown is current
    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.getGameDetails();
        }
    }

    getGameDetails() {
		const {game} = this.props,
            cssStyles = {},
            name = this.getName(),
            parameters = game.get('parameters');

		const supplier = game.get('supplier');
		let logoUrl = '', bgUrl = '';
		if(App.Config.siteId === 1) {
			bgUrl = `/images/games/baja/${game.get('rgsGameId')}.png`;
		}
		else {
			logoUrl = `/images/games/${supplier.get('rgsCode')}_${game.get('rgsGameId')}_logo.png`;
			bgUrl = `/images/games/${supplier.get('rgsCode')}_${game.get('rgsGameId')}_bg.jpg`;
		}

	    const price = game.get('price');
        cssStyles.backgroundImage = `url(${logoUrl}), url(${bgUrl})`;
        this.setState({cssStyles, price, name});
    }

    onSessionChange() {
		const session = this.getSession();
		this.setState({
			loggedIn: !!session
		});
	}

    // This is an alternative to App.session.monitor which cannot be unlistened
    getSession() {
		const isLoggedIn = App.session.request('loggedIn');
		if (!isLoggedIn) {
			return null;
		}
		return App.session.request('session');
	}

	//get name and if its undefined we return false;
	getName() {
		const {game} = this.props;
		return game.get('name');
	}

    /**
     * Clicking play game or play demo
     * @param  {boolean}    real   are we opening real or demo game?
     * @param  {event}      e      click event
     */
    onGameClick(real, valid, e) {
        if (e) {
            e.stopPropagation();
        }

		if (!valid) {
			return;
		}

        const {game} = this.props;
        const {loggedIn} = this.state;
		const supplier = game.get('supplier');

        // Make sure logged in before playing real game
        if (!loggedIn && real) {
            App.bus.trigger(OPEN_LOGIN_MODAL);
            return;
        }

        this.setState({
            gameTypeReal: real
        });

        let params = {
            rgsCode: supplier.get('rgsCode'),
            rgsGameId: game.get('rgsGameId'),
			price: parseInt(game.get('price')),
			clientType: game.get('clientType'),
            channel: game.get('channel'),
            currency: 'GBP',
            language: 'en',
            playerDetails: true,
            igpCode: 'argyll-bob'
        };

        if (real) {
            params.sessionToken =  App.session.execute('get', 'sessionToken');
        }

        this.openModal(params, real);
    }

	onDepositClick(e) {
		e.stopPropagation();
		App.navigate('deposit');
	}

	/**
	 * Sends the user to the rules page
	 */
	navigateToGameInfo() {
		const { game } = this.props;
		const gameId = game.get('rgsGameId');
		if (gameId) {
			service.getGameRuleByGameName(gameId)
				.then(resp => {
					let rules = resp.GameRules.gameRules[0];
					if (rules) {
						const rulesRoute = App.Config.siteId === 1 ? App.translateRoute('/games/rules') : '/casino/rules';
						App.navigate(`${rulesRoute}`, {}, { rules, gameName: game.get('name') });
					}
				});
		}
	}

    /**
     * open modal, uses parent's modal if multiple games on widget
     * @param  {Object} gameData data for game
     * @param  {Boolean} gameTypeReal we playing demo or for real?
     */
    openModal(gameData, gameTypeReal) {
        if (this.props.openModal) {
            this.props.openModal(gameData, gameTypeReal, this.props.game.get('dimensions'));
        } else {
            this.setState({ isModalOpen: true, gameData });
        }
    }

    closeModal() {
        if (this.props.openModal) {
            this.props.closeModal();
        } else {
            this.setState({ isModalOpen: false });
        }
    }

    /**
     * Only display games if they are available for the current device
     */
    render() {
		const {game} = this.props;
		const isBaja = App.Config.siteId === 1;
		const canUserPlay = CasinoGamesModel.canUserPlay();
        const {image, info} = this.props,
            {cssStyles, price, name, loggedIn} = this.state,
            tileStyles = image ? cssStyles : {},
            showDemoBtn = !isBaja || isBaja && !loggedIn,
            showPrice = isBaja && loggedIn;
		const isLoggedIn = App.session.request('loggedIn');
		const cashBalance = parseInt(App.session.execute('getAllAvailable'));
		const minBalance = price || 0.01;
		const showDepositBtn = isBaja && minBalance > cashBalance && isLoggedIn;
		const realPlayDisabled = !canUserPlay || (App.Config.siteId !== 1 && !game.get('realPlay'));
		const demoPlayDisabled = (App.Config.siteId !== 1 && !game.get('demoPlay'));

		return (
            <div className={cx('c-casino-game', {
								'c-casino-game--game-info-view': !info,
								'c-casino-game--has-rules': isBaja
							})}
                style={tileStyles}
				onClick={this.navigateToGameInfo}
			>

            	{/*
            		to do: needs props to render correct ribbon, current NEW and JACKPOT are enabled, will deafult to green bg with prop text otherwise
            	*/}
            	<Ribbon text="" />

                <div className="c-casino-game__overlay">

	                {name &&
	                    <p className="u-margin--none c-casino-game__title">
	                        {name}
	                        <i className="icon-chevron-right"></i>
	                    </p>
	                }

					<div className={cx('c-casino-game__button-container', {'c-casino-game__button-container--no-balance': showDepositBtn})}>
						<div className={ cx('c-casino-game__play-btn c-casino-game__play-btn--real btn btn--primary btn--full-width btn--no-padding', {'is-disabled': realPlayDisabled}) }
                             onClick={this.onGameClick.bind(this, true, !realPlayDisabled)}
                        >
							{App.Intl('casino.play_now')}&nbsp;
                            {showPrice &&
                                <FormattedNumber
                                    value={price}
                                    style="currency"
                                    currency={App.Globals.LOCALE.formats.number.price.currency}
                                />
                            }
                        </div>

						<div className="c-casino-game__deposit-btn btn btn--secondary btn--full-width btn--no-padding" onClick={this.onDepositClick.bind(this)}>
								{App.Intl('casino.deposit')}&nbsp;
						</div>

                        {showDemoBtn &&
                        <div ref="play-demo" className={ cx('c-casino-game__play-btn btn--dark btn btn--full-width btn--no-padding', {'is-disabled': demoPlayDisabled }) }
                             onClick={this.onGameClick.bind(this, false, !demoPlayDisabled)}
                        >
							{App.Intl('casino.play_demo')}
                        </div>
                        }
                    </div>
                </div>

                {/*
                    CasinoWidget has it's own modal to avoid repetition
                    This is used when the game is shown on it's own, e.g. rules pages
                */}
                {!this.props.openModal && this.state.isModalOpen &&
                    this.renderModal()
                }
            </div>
        );
    }

	renderModal() {
		const {game} = this.props;
		const {gameData, gameTypeReal, isModalOpen} = this.state;
		const dimensions = game.get('dimensions');

		return (
			<CasinoModal
				dimensions={dimensions}
				open={isModalOpen}
				closeFunction={this.closeModal}
                gameData={gameData}
                gameTypeReal={gameTypeReal}
			/>
		);
	}
}

export default CasinoGame;
