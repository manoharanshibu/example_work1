import './PromotionWidget.scss';

import SelectionView from 'app/view/sport/components/SelectionView';
import {classNames as cx} from 'common/util/ReactUtil';
import cache from "sportsbook/model/EventCache.js";
import service from "sportsbook/service/ApiService.js";
import cancelable from "common/util/Cancelable";

export default class SportsPromotion extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.onGotEvent = cancelable.callback(this.onGotEvent, this);
		this.onGotEventError = cancelable.callback(this.onGotEventError, this);

		this.fetchEvent();
	}

	componentDidMount() {
		this.fetchEvent();
	}

	componentWillUnmount() {
		this.onGotEvent.cancel();
		this.onGotEventError.cancel();
	}

	fetchEvent() {
		const {model} = this.props;
		const {eventId} = model.attributes;
		service.getEvent(eventId).then(this.onGotEvent, this.onGotEventError);
	}

	onGotEvent(resp) {
		const {Event} = resp;
		cache.updateEvent(Event);
	}

	onGotEventError() {
		console.log('Sports promo, cant find event')
	}

	getSportPromoBG(event) {
		const {imageUrl} = this.props;

		if(imageUrl)
			return imageUrl;

		let url = "";
		switch(event.get('sport'))
		{
			case 'AMERICAN_FOOTBALL':
				url =   '/images/sports/american-football.jpg';
				break;
			case 'HORSE_RACING':
				url =   '/images/sports/horse-racing.jpg';
				break;
			case 'GOLF':
				url =   '/images/sports/golf.jpg';
				break;
			case 'TENNIS':
				url =   '/images/sports/tennis.jpg';
				break;
			default:
				url =  '/images/sports/promo-sports-bg.jpg';
				break;
		}
		return url;
	}

	onShowEvent(model, e) {
		e.stopPropagation();
		const sport = model.get('code').toLowerCase();
		const inplay = model.get('inplay');
		const path = inplay ? `sports/${sport}` : `sports/${sport}`;
		const full = `/${path}/event/${model.slugify()}`;
		App.navigate(full, {id: model.id});
	}

	render() {
		const {promoClasses, model, isLobby, imageUrl} = this.props;
		const isMobile = document.documentElement.clientWidth < 768;
    const {eventId} = model.attributes;
		const event = cache.getEvent(eventId);
		if (!event || !event.Markets.length) {
			return null;
		}

		const getImageUrl = this.getSportPromoBG(event);
		const time = moment(event.get('eventTime'));
		const {title, subtitle, detail} = model.attributes;

		const image = getImageUrl;
		const style = !_.isNull(image) ? {backgroundImage: `url('${image}')`} : {};

		const imageClasses = _.isNull(imageUrl) ? 'without-image' : 'with-image';
		return (
			<div className={cx('c-promotion-tile--market-style', promoClasses, imageClasses)} style={style}>
				<div className={cx('c-promotion-tile__content-overlay c-promotion-tile__content-overlay--markets',
								  {'c-promotion-tile__content-overlay--carousel': this.props.carouselWidget,
							  	   'c-promotion-tile__content-overlay--is-mobile': isMobile
							   	  })}>

					<div className="c-promotion-tile__selections-information">
					{(title) ?
						<div>
							<span className={cx('u-bold c-promotion-tile--market-style__date')}>{time.format('D MMM HH:mm')}</span><br/>
							<h1 className="c-promotion-tile--market-style__title">{title}</h1>
						</div>
						:
							<div>
								<span className={cx('u-bold c-promotion-tile--market-style__date')}>{time.format('D MMM HH:mm')}</span><br/>
								<h1 className="c-promotion-tile--market-style__title">
									{event.get('name')}
								</h1>
							</div>
					}
					</div>
					{this.renderMarkets()}
				</div>
			</div>
		);
	}

	renderMarkets() {
		const {isLobby, model} = this.props;
    const {eventId, markets} = model.attributes;
		const event = cache.getEvent(eventId);

		if (!event) {
			return null;
		}

		const selectionsDiv = _.map(markets, (market) => {
			const srcMarket = event.Markets.get(market.marketId);

			if (!srcMarket) {
				return null;
			}

			const selections = _.filter(srcMarket.Selections.models, function (a) {
				return _.find(market.selectionIds, (b) => String(b) === a.get('id'));
			});

			return selections.map((selection) => {
				const classNames = cx('u-table-cell c-promotion-tile--market-style__selection-view');
				const selectionName = selection.get('name').slice(0,19)+(selection.get('name').length>12?"...":"");
				return (
					<div key={selection.id} className="col-12" >
						<SelectionView className={classNames} model={selection} customName={selectionName} tag="div"/>
					</div>
				);
			}, this);

		});

		return (
			<div className="c-promotion-tile--market-style__selections">
				<div className="c-promotion-tile--market-style__selections-text"  onClick={this.onShowEvent.bind(this, event)}>
						Popular Markets
						<span className="c-promotion-tile--market-style__more-number g-lozenge">
							+ {event.get('numMarkets')}&nbsp; More
						</span>
				</div>

				<div className="grid grid--noGutter">
					{selectionsDiv}
				</div>
			</div>
		);

	}
}
