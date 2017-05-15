import './CasinoPromotion.scss';

import {classNames as cx} from 'common/util/ReactUtil';
import cache from "sportsbook/model/EventCache.js";
import service from "sportsbook/service/ApiService.js";
import cancelable from "common/util/Cancelable";
import CasinoGamesModel from 'sportsbook/model/CasinoGamesModel';
import {slugify} from "sportsbook/util/SportUtil";

export default class CasinoPromotion extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
				cssStyles: {},
				game: {},
				name:{}
		};
		this.getGameDetails = this.getGameDetails.bind(this);
	}

	componentDidMount() {
	}

	componentWillMount() {
		this.getGameDetails();
	}

	onLinkClick(e) {
		e.stopPropagation();
		e.preventDefault();
		const target = e.currentTarget.pathname;

		if (target.indexOf('http')) {
			window.location.href = target;
		} else {
			App.navigate(target);
		}
	}

	getGame(casinoID){

		let thisGame;

		const getSuppliers = CasinoGamesModel.get('suppliers');
		const suppliers = _.flatten(getSuppliers.models);

		const gameMatch = _.map(suppliers, (supplier, index) => {
			const supplierGames = _.flatten(supplier.get('games').models);
			_.each(supplierGames, function(supplierGame){
				if(supplierGame.attributes.rgsGameId === casinoID){
					thisGame = supplierGame;
				}
			})

		});

		return thisGame;

	}

	getGameDetails() {

		const game = this.getGame(this.props.casinoID),
					supplier = game.get('supplier'),
					name = game.get('name'),
					cssStyles = {};

		let logoUrl = '', bgUrl = '';

		logoUrl = `/images/games/${supplier.get('rgsCode')}_${game.get('rgsGameId')}_logo.png`;
		bgUrl = `/images/games/${supplier.get('rgsCode')}_${game.get('rgsGameId')}_bg.jpg`;

		cssStyles.backgroundImage = `url(${logoUrl}), url(${bgUrl})`;
		this.setState({cssStyles, name, game});
	}

	navigateToGameInfo() {
		const {name, game} = this.state;
		if (name) {
			const slug = slugify(name);
			const rulesRoute = App.Config.siteId === 1 ? App.translateRoute('/games/rules') : '/casino/rules';
			App.navigate(`${rulesRoute}/${slug}/${game.get('rgsGameId')}`);
		}
	}

	render() {
		const {classNames, model, imageUrl, casinoID} = this.props;
		const {cssStyles} = this.state;

		return (
			<div className={cx(classNames)} style={cssStyles} onClick={this.navigateToGameInfo.bind(this)}>
				<a className={"c-promotion-tile__button c-promotion-tile__button--primary"}>
					Play Now
					<i className="icon-chevron-right u-float-right"></i>
				</a>
			</div>
		);
	}

}
