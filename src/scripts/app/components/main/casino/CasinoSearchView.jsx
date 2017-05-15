import {getParam} from "common/util/Href";
import CasinoWidget from 'widgets/casino/CasinoWidget';
import CasinoGamesModel from 'sportsbook/model/CasinoGamesModel';
import {CASINO_SEARCH} from "app/AppConstants";

export default class CasinoSearchView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			filteredGames: CasinoGamesModel.getGamesBySearchQuery(getParam('text').toLowerCase()),
		};

		this.setGames = this.setGames.bind(this);
	}

	componentWillMount() {
		App.bus.on(CASINO_SEARCH, ::this.setGames);
		CasinoGamesModel.on('set:games', ::this.setGames)
	}

	componentWillUnmount() {
		CasinoGamesModel.off('set:games', ::this.setGames);
		App.bus.off(CASINO_SEARCH, ::this.setGames);
	}

	/**
	 * @param searchText
	 */
	setGames() {
		const filteredGames = CasinoGamesModel.getGamesBySearchQuery(getParam('text').toLowerCase());
		this.setState({filteredGames});
	}

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		const {filteredGames} = this.state;
		if (!filteredGames || !filteredGames.length) return <p>No result</p>;

		const props = Object.assign({}, this.props, {
			tilespan: 3
		});

		return (
			<CasinoWidget games={filteredGames}/>
		);
	}

}
