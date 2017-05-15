import './BettingKingsWidget.scss';

import Widget from 'app/view/widgets/WidgetBase';
import service from 'sportsbook/service/ApiService';
import {classNames as cx} from 'common/util/ReactUtil';
import {FormattedNumber} from 'react-intl';
import cancelable from 'common/util/Cancelable';

export default class BettingKingsWidget extends React.Component {
	constructor(props){
		super(props);
		this.state = {champions: [], selectedPeriod: 'today', loading: false};
		this.handleUpdateResponse = ::this.handleUpdateResponse;
	}

	/**
	 *
	 */
	fetch() {
		service.getBettingChampions().then(this.updateCallback);
	}

	componentWillMount() {
		this.updateCallback = cancelable.callback(this.handleUpdateResponse, this);
	}

	componentWillUnmount(){
		// cancel any callbacks:
		this.updateCallback.cancel();
	}

	handleUpdateResponse(resp) {
		if (resp && resp.BettingChampions) {
			const champions = resp.BettingChampions.champions;
			champions.sort((a,b) => (b.winnings/b.stake - a.winnings/a.stake));
			this.setState({ champions });
		}
	}

	/**
	 * @param e
	 */
	onChangePeriod(e){
		const selectedPeriod = e.currentTarget.name;
		this.setState({selectedPeriod}, this.fetch);
	}

	/**
	 *
	 */
	componentDidMount(){
		this.fetch();
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const head = this.renderGridHeader();
		const kings = this.renderKings();
		const props = Object.assign({}, this.props, {
			header: this.renderHeader(),
			insideBetslip: this.props.insideBetslip,
			loading: this.state.loading,
			className: 'hero-table'
		});
		const tableClassName = cx('u-table u-table--parent', (this.props.insideBetslip ? 'u-table--secondary': 'u-table--primary'));

		if (this.state.champions.length > 0) {
			return (
				<Widget {...props}>
						<div className={tableClassName}>
							{head}
							{kings}
						</div>
				</Widget>
			);
		} else {
			return null;
		}

	}

	/**
	 * @returns {XML}
	 */
	renderHeader() {
		return (
			<header className="c-widget__header">
				<h3 className="c-widget__title">{this.props.title}</h3>
				<span className="c-widget__subtitle">{this.props.subTitle || ' '}</span>
			</header>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderGridHeader() {
		return (
			<div className="u-table-row header">
				<div className="u-table-cell no-hover u-padding">
					<span className="user-name">{App.Intl('widgets.betting_kings.column.user')}</span>
				</div>
				<div className="u-table-cell thin2 align-center no-hover u-padding">
					<span className="stake">{App.Intl('widgets.betting_kings.column.stake')}</span>
				</div>
				<div className="u-table-cell thin2 align-center no-hover u-padding">
					<span className="profit">{App.Intl('widgets.betting_kings.column.profit')}</span>
				</div>
			</div>
		);
	}

	/**
	 * @returns {Array}
     */
	renderKings() {
		const champions = this.state.champions;
		const rows = champions.map((punter, index) => {
			const {name, stake, winnings, currency} = punter;
			return (
				<div className="u-table-row" key={index}>
					<div className="u-table-cell no-hover u-padding">
						<span className="user-name">{name}</span>
					</div>
					<div className="u-table-cell thin2 align-center no-hover u-padding">
						<span>
							<FormattedNumber value={stake}
								style="currency" currency={currency} />
						</span>
					</div>
					<div className="u-table-cell thin2 align-center no-hover u-padding">
						<span className="highlight">
							<FormattedNumber value={winnings}
								style="currency" currency={currency} />
						</span>
					</div>
				</div>
			);
		});

		return this.padRows(rows);
	}

	/**
	 * @param events
	 * @param min
	 */
	padRows(bts = [], min = 6) {
		let bets = bts.slice();
		let index = 0;
		while (bets.length < min) {
			bets.push(
				<div className="u-table-row" key={index}>
					<div className="u-table-cell align-center no-hover">
						<span className="user-name">&nbsp;</span>
					</div>
					<div className="u-table-cell align-center no-hover">
						<span className="stake">
							&nbsp;
						</span>
					</div>
					<div className="u-table-cell align-center no-hover">
						<span className="winnings">
							&nbsp;
						</span>
					</div>
				</div>
			);
			index++;
		}
		return _.first(bets, 4);
	}

	/**
	 * Render different tabs to select time periods where to list the betting champions from. This functionality is currently disabled
	 * @returns {Array|*}
     */
	renderPeriods(){
		const periods = ['today', 'week', 'month'];
		const selectedPeriod = this.state.selectedPeriod;
		return periods.map(period => {
			const className = cx({'active': (selectedPeriod === period)});
			return (
				<li className={className}>
					<a name={period} onClick={this.onChangePeriod.bind(this)}>{period}</a>
				</li>
			);
		});
	}
}
