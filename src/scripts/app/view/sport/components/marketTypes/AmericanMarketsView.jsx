import SelectionView from 'app/view/sport/components/SelectionView';
import cache from 'sportsbook/model/MarketCache';
import {classNames as cx} from 'common/util/ReactUtil';
import {isOverUnder, isSpread, isMoneyLine} from 'app/view/sport/views/event/MarketTypes';
import EventInfoView from 'app/view/sport/components/eventStatus/EventInfoView';

import '../MarketsView.scss';

export default class AmericanMarketsView extends React.Component {
	constructor() {
		super();
	}


	render()
	{
		const isSmallScreen = App.isSmallerThanBreakpoint("sm");
		const isLargeScreen = !App.isSmallerThanBreakpoint("sm");
		const {event} = this.props;
		const selections = this.renderSelections(event);
		const eventNum = event.get('numMarkets') !== 0 ? '+' + event.get('numMarkets') : '';
		return (
			<div key={event.id} className="c-american-markets c-multi-markets-row c-widget__row">
				{isLargeScreen && (
					<div className="c-american-markets__container">
						<div classNames="c-multi-markets-row__cell">
							<EventInfoView event={event} />
						</div>
					</div>
				)}
				<div
					className="u-padding c-multi-markets-row__cell c-multi-markets-row__cell--info-cell c-widget__space-filling-cell c-american-markets__container"
					onClick={this.props.onShowEvent.bind(this, event)}
				>
					<div>
						{isSmallScreen && (
							<div className="c-american-markets__container">
								<EventInfoView event={event} />
							</div>
						)}
						<span className="c-multi-markets-row__name u-active-hover">
							{event.get('participantB')}
						</span>
						<span className="c-multi-markets-row__name u-active-hover">
							<br /> @ {event.get('participantA')}
						</span>

						<span className="c-multi-markets-row__num-markets">{eventNum}</span>
					</div>
				</div>
				{selections}
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
					numSel = 1;
				}
				//TODO: if numsel is 0 set it to 3 to fix the view this is a hack the cache can sometimes be empty this needs fixing if it can be
				if (isOverUnder(type)  || isSpread(type) || /DBLC/.test(type) || numSel === 0) {
					numSel = 2;
				}
				_.times(numSel, () => {
					const key = _.uniqueId();
					selections.push(this.renderEmptyCell(key));
				}, this);
				return selections;
			}
			const isOVUN = isOverUnder(type);
			if(isOVUN || isSpread(type)) {
				const mostBalancedMarket = event.Markets.getMostBalancedMarket(type);
				market = mostBalancedMarket ? mostBalancedMarket : market;
				selections.push(this.renderLine(market, i));
			}


			if (market) {
				const swap = !isOVUN;
				const firstSelection  = swap ? market.Selections.models[1] : market.Selections.models[0];
				const secondSelection  = swap ? market.Selections.models[0] : market.Selections.models[1];

					const className = cx('c-multi-markets-row__cell--selection c-multi-markets-row__cell--double c-widget__fixed-width-cell');
					selections.push(
						<div className='c-multi-markets-row__cell c-multi-markets-row__cell--double-wrapper'>
							<SelectionView key={firstSelection.id} model={firstSelection} justPrice={true} withMarketHeader={false} className={className} />
							<SelectionView key={secondSelection.id} model={secondSelection} justPrice={true} withMarketHeader={false} className={className}/>
						</div>
					);
			}
			return selections;
		}, []);
	}

	renderEmptySelections(marketTypes, sport) {
		const className = cx('c-multi-markets-row__cell c-multi-markets-row__cell--selection c-widget__fixed-width-cell');
		return _.map(marketTypes, (type) => {
			let numSel = cache.numSelections(sport, type);

			//TODO: if numsel is 0 set it to 3 to fix the view this is a hack the cache can sometimes be empty this needs fixing if it can be
			if (isOverUnder(type) || isSpread(type) || /DBLC/.test(type) || numSel === 0) {
				numSel = 2;
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
		const className = cx('c-multi-markets-row__cell--selection c-multi-markets-row__cell--double c-widget__fixed-width-cell');
		let line = market.get('lineValue');
		line = line.toString().replace("+", "");

		if(isOverUnder(market.get('type')))
			return (
				<div key={_.uniqueId()} className="c-multi-markets-row__cell c-multi-markets-row__cell--double-wrapper">
					<div  className={className}>
						<p>O {line}</p>
					</div>
					<div className={className}>
						<p>U {line}</p>
					</div>
				</div>
			);

		const plusFirst = line > 0;
		return (
			<div key={_.uniqueId()} className="c-multi-markets-row__cell c-multi-markets-row__cell--double-wrapper">
				<div  className={className}>
					<p>{ `${(!plusFirst ? '+' : '')}${-line}` }</p>
				</div>
				<div  className={className}>
					<p>{ `${(plusFirst ? '+' : '')}${line}` }</p>
				</div>
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
