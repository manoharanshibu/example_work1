import SelectionView from 'app/view/sport/components/SelectionView';
import cache from 'sportsbook/model/MarketCache';
import {classNames as cx} from 'common/util/ReactUtil';
import {isOverUnder, isSpread, isMoneyLine} from 'app/view/sport/views/event/MarketTypes';
import EventInfoView from 'app/view/sport/components/eventStatus/EventInfoView';

import '../MarketsView.scss';

export default class DefaultMarketsView extends React.Component {
	constructor() {
		super();

		// isMobile == 0 -> 543px
		// isDesktop == 544px & bigger (includes tablets etc)
		this.state = {
			isMobile: App.isSmallerThanBreakpoint("sm"),
			isDesktop: !App.isSmallerThanBreakpoint("sm"),
		};
	}


	render() {
		const isSmallScreen = this.state.isMobile;
		const isLargeScreen = this.state.isDesktop;

		const {event} = this.props;
		const selections = this.renderSelections(event);
		const eventNum = event.get('numMarkets') !== 0 ? '+' + event.get('numMarkets') : '';

		const className = cx (
			"c-multi-markets-row c-widget__row"
		);

		return (
			<div key={event.id} className={className}>
				{isLargeScreen && (
					<div classNames="c-multi-markets-row__cell">
						<EventInfoView event={event} />
					</div>
				)}
				<div
					className="u-padding c-multi-markets-row__cell c-multi-markets-row__cell--info-cell c-widget__space-filling-cell"
					onClick={this.props.onShowEvent.bind(this, event)}
				>
					{isSmallScreen && (
						<EventInfoView event={event} eventNum={eventNum} />
					)}
					<div className="c-multi-markets-row__event-info">
						<span className="c-multi-markets-row__name u-active-hover">
							{event.get('participantA')} vs {event.get('participantB')}
						</span>
					</div>
				</div>
				{selections}
				<div
					className="c-multi-markets-row__cell c-multi-markets-row__cell--view-all"
					onClick={this.props.onShowEvent.bind(this, event)}
				>
					<span className="c-multi-markets-row__num-markets">{eventNum}</span>
				</div>
			</div>
		);
	}

	/**
	 * @param event
	 */

	renderSelections(event) {

		const {marketTypes} = this.props;
		const markets = event.Markets.byTypes(marketTypes);
		const sport = event.get('code');

		if (markets.size() === 0) {
			return this.renderEmptySelections(marketTypes, sport);
		}

		return _.reduce(marketTypes, (selections, type, i) => {
			let market = event.Markets.findWhere({type: type});

			if (!market) {
				let numSel = cache.numSelections(sport, type);
				if(isMoneyLine(type)) {
					numSel = 2;
				}
				//TODO: if numsel is 0 set it to 3 to fix the view this is a hack the cache can sometimes be empty this needs fixing if it can be
				if (isOverUnder(type)  || isSpread(type) || /DBLC/.test(type) || numSel === 0) {
					numSel = 3;
				}
				_.times(numSel, () => {
					const key = _.uniqueId();
					selections.push(this.renderEmptyCell(key));
				}, this);
				return selections;
			}

			if (isOverUnder(type) || isSpread(type)) {
				const mostBalancedMarket = event.Markets.getMostBalancedMarket(type);
				market = mostBalancedMarket ? mostBalancedMarket : market;
				selections.push(this.renderLine(market, i));
			}

			if (market) {
				selections = selections.concat(market.Selections.map((selection) => {
					const className = cx(
						'c-multi-markets-row__cell',
						'c-multi-markets-row__cell--selection',
						{'c-widget__fixed-width-cell' : !this.state.isMobile },
						{'c-widget__fixed-width-cell--sm' : this.state.isMobile },
					);
					return (
						<SelectionView key={selection.id} model={selection} justPrice={true} withMarketHeader={false} className={className}/>
					);
				}));
			}
			return selections;
		}, []);
	}

	renderEmptySelections(marketTypes, sport) {
		const className = cx(
			'c-multi-markets-row__cell',
			'c-multi-markets-row__cell--selection',
			{'c-widget__fixed-width-cell' : !this.state.isMobile },
			{'c-widget__fixed-width-cell--sm' : this.state.isMobile },
		);
		return _.map(marketTypes, (type) => {
			let numSel = cache.numSelections(sport, type);

			//TODO: if numsel is 0 set it to 3 to fix the view this is a hack the cache can sometimes be empty this needs fixing if it can be
			if (isOverUnder(type) || isSpread(type) || /DBLC/.test(type) || numSel === 0) {
				numSel = 3;
			}
			return _.times(numSel, () => {
				return <SelectionView key={_.uniqueId()} model="empty" className={className} />;
			}, this);
		});
	}

	/**
	 * @param market
	 * @param i
     */
	renderLine(market) {
		const className = cx('c-multi-markets-row__cell c-multi-markets-row__cell--selection c-widget__fixed-width-cell');
		let line = market.get('lineValue');

		//we don't want to show the +
		line = line.toString().replace("+", "");

		return (
			<div key={_.uniqueId()} className={className}>
				<p className="align--center">{line}</p>
			</div>
		);
	}

	/**
	 * @param key
	 * @param type
	 * @returns {XML}
     */
	renderEmptyCell(key) {
		const className = cx('c-multi-markets-row__cell c-multi-markets-row__cell--selection empty-cell c-widget__fixed-width-cell');
		return (
			<SelectionView key={key} model="empty" className={className} />
		);
	}
};
