import './CasinoWidget.scss';

import CasinoOptionsModel from 'sportsbook/model/CasinoOptionsModel';
import CasinoGamesModel from 'sportsbook/model/CasinoGamesModel';
import CasinoGame from 'widgets/casino/CasinoGame';
import CasinoModal from 'widgets/casino/CasinoModal';
import {classNames as cx} from 'common/util/ReactUtil.js';
import {Link} from 'react-router';
import getBalanceCommand from 'sportsbook/command/GetBalanceCommand.js'

class CasinoWidget extends React.Component {

	constructor(props) {
		super(props);

		this.model = this.props.options ? new CasinoOptionsModel(this.props.options) : null;
		const {attributes} = this.model;

		this.state = {
			gameData: {},
			gameDimensions: {
				height: '100%',
				width: '100%'
			},
			gameName: 'Game name',
            gameTypeReal: false,
			isCasinoMain: this.isCasinoMain(),
			limit: 6,
			isModalOpen: false,
			filteredGames: this.model ? CasinoGamesModel.getGamesByFilter(attributes) : []
		};

		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);

	}

	componentWillMount() {
		if (!this.props.games) {
			CasinoGamesModel.on('set:games', ::this.updateGames)
		} else {
			this.addPropGames();
		}
	}

	componentWillUnmount() {
		if (!this.props.games) {
			CasinoGamesModel.off('set:games', this.updateGames)
		}
	}

	updateGames() {
		this.model = new CasinoOptionsModel(this.props.options);

		if (!this.isIndividual()) {
			const {attributes} = this.model;
			const filteredGames = CasinoGamesModel.getGamesByFilter(attributes);
			this.setState({filteredGames});
		}
		else {
			this.forceUpdate();
		}
	}

	addPropGames(){
		const games = this.props.games;

		if (games) {
			this.model = new CasinoOptionsModel();
			this.model.set('individualGames', games);
			return;
		}
	}

	isCasinoMain(){
		const reguex = new RegExp('/casino' + '$');

		if (window.location.pathname.match(reguex) !== null) {
			return true;
		}

		return false;
	}

	isIndividual() {
		return this.props.games || this.model.get('gamesType') === 'INDIVIDUAL';
	}

	openModal(gameData, gameTypeReal, gameDimensions) {
		this.setState({ isModalOpen: true, gameData, gameTypeReal, gameDimensions });
	}

	closeModal() {
		if (App.session.request('loggedIn')) {
			getBalanceCommand();
		}
		this.setState({ isModalOpen: false });
	}

	getTitleUrl(isSub) {

		const category = this.model.get('category') === 'slot' ? 'slots' : this.model.get('category');

		if (isSub && this.props.suburl) {
			return this.props.suburl;
		} else if (!isSub && this.props.url) {
			return this.props.url;
		} else if (!this.isIndividual() && this.model.get('category')) {
			return `/en/casino/${category}`;
		} else {
			return '/en/casino/all';
		}
	}

	getCasinoStyleClassName (blockClassName) {
		const {style} = this.props.options;

		switch (style) {
			case 'HIGHLIGHTED':
				return `${blockClassName}--highlighted`;
			default:
				return `${blockClassName}--normal`;
		}
	}

	render() {
		const {isCasinoMain, filteredGames} = this.state;
		const {title} = this.props;
		const isBaja = App.Config.siteId === 1;
		const isIndividual = this.isIndividual();
		let renderGames = null;

		if (this.props.games) {
			renderGames = this.renderPropGames();
		}
		else if (isIndividual) {
			renderGames = this.renderIndividual();
		}
		else {
			renderGames = this.renderFiltered();
		}

		let gamesCount = 0;

		// how many games do we have? let's not forget the other suppliers!
		if (isIndividual) {
			gamesCount = this.model.get('individualGames').length
		}

		if (filteredGames.length) {
			gamesCount = filteredGames.getGameCount();
		}

		if (gamesCount <= 0) {
			return null;
		}
		// not displaying games count for now as number was incorrect

		return (
			<div className={cx("col-12 c-casino-widget", this.getCasinoStyleClassName('c-casino-widget'), {'c-casino-widget__baja' : App.Config.siteId === 1})}>

				<div
					className={cx("grid-noGutter c-casino-widget__row", this.getCasinoStyleClassName('c-casino-widget__row'))}>
					{isBaja && title &&
					<div className="c-casino-widget__tile col-2_lg-3_sm-12">
						<div className="c-casino-widget__category-info c-casino-widget__category-info-baja">
							<h3 className="u-margin--none">
								{title}
							</h3>
						</div>
					</div>}
					{!isBaja && isCasinoMain && title &&

						<Link to={this.getTitleUrl(false)} className="c-casino-widget__link col-12">
							<div>
								<h3 className="c-casino-widget__category-title u-margin--none">
									{title}
								</h3>

								{!isIndividual &&
								<p className="u-margin--none c-casino-widget__category-all-events">
									View All {gamesCount} <i className="icon-chevron-right"></i>
								</p>
								}
							</div>
						</Link>

					}

					{renderGames}
				</div>

				{this.state.isModalOpen && this.renderModal()}
			</div>
		);
	}

	/*
		CasinoWidget has it's own modal to avoid repetition from each game
	*/
	renderModal() {
		const {gameData, gameDimensions, gameTypeReal, isModalOpen} = this.state;

		return (
			<CasinoModal
				closeFunction={this.closeModal}
				dimensions={gameDimensions}
				gameData={gameData}
				gameTypeReal={gameTypeReal}
				open={isModalOpen}
			/>
		);
	}

	renderPropGames() {
		const games = this.props.games;

		return _.map(games, (game, index) => {
			return this.renderGame(index, game);
		});
	}

	renderIndividual() {

		if(!CasinoGamesModel.get('suppliers'))
			return null;

		return _.map(this.model.get('individualGames'), (game, index) => {
			const supplier = CasinoGamesModel.findSupplierByCode(game.rgsCode);
			if(!supplier)
				return false;

			const g = supplier.get('games').findGameById(game.rgsGameId);
			return this.renderGame(index, g);
		});
	}

	renderFiltered() {
		const {limit, filteredGames} = this.state;
		let games = {};

		if (!filteredGames.length) {
			return null;
		}

		if (this.isCasinoMain()) {
			const gameList = filteredGames.models.reduce((games, supplier) => {
				return games.concat(supplier.get('games').models);
			}, []).slice(0, limit);
			return _.map(gameList, (game, index) => {
				return this.renderGame(index, game);
			});
		}

		// render all games returned
		return _.map(filteredGames.models, (gameList) => {
			games = gameList.get('games').models;
			return _.map(games, (game, index) => {
				return this.renderGame(index, game);
			});
		});
	}

	/**
	 * Only display games if they are available for the current device
	 * fitered in model
	 */
    renderGame(index, game) {
		// double check game is valid (individually added games may not be suitable for device)
        if (!game) {
            return null;
        }
		const clazz = cx('col-2_lg-3_sm-4_xs-6', {
			'c-casino-widget__row--tile-container-filtered' : this.state.isCasinoMain
		});
		return (
			<div key={index} className={clazz}>
				<CasinoGame game={game} image={true} info={true} openModal={this.openModal} closeModal={this.closeModal} />
			</div>
		);
	}
}

CasinoWidget.defaultProps = {
	options: {},
};

export default CasinoWidget;
