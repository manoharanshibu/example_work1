import './PromotionWidget.scss';

import SelectionView from 'app/view/sport/components/SelectionView';
import {classNames as cx} from 'common/util/ReactUtil';
import cache from "sportsbook/model/EventCache.js";
import service from "sportsbook/service/ApiService.js";
import cancelable from "common/util/Cancelable";
import {PROMO_IMAGE_LOADED} from "app/AppConstants";

export default class CTAPromotion extends React.Component {
	constructor(props, context) {
		super(props, context);

	}

	onBackgroundClick(url, event) {
		event.stopPropagation();
		event.preventDefault();
		if (url.includes('http')) {
			window.open(url);
		}
		else {
			App.navigate(url);
		}
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

	navigateToUrl(url) {
		App.navigate(url);
	}

	render() {
	const {model, isMobile, isLobby, clientWidth, imageUrl, classNames} = this.props,
				{title, subtitle, buttonText, buttonColor, buttonLink, imageURL, type} = model.attributes,
				style = (isLobby && !_.isNull(imageUrl)) ? {backgroundImage: `url('${imageUrl}')`} : {},
				btnColor = !_.isUndefined(buttonColor) ? buttonColor : 'secondary',
				onClickAction = buttonLink ? this.onBackgroundClick.bind(this, buttonLink) : null;

			return (
				<div className={cx(classNames, 'c-promotion-tile--cta-type')} onClick={onClickAction} style={style}>

					{!isLobby && imageURL &&
						<img className="c-promotion-tile__image"
							 width={clientWidth+"px"}
							 src={imageUrl}
							 onClick={this.onLinkClick.bind(this)}
							 onLoad={() => App.bus.trigger(PROMO_IMAGE_LOADED)}
						/>
					}

					<div className="c-promotion-tile__content-overlay">
						{type !== 'imageOnlyCTA' &&
							<div className="c-promotion-tile__content-container">

								{title &&(
									<h1 className={cx('c-promotion-tile__header')}>
										{title}
									</h1>
								)}

								{subtitle && (
									<h2 className="c-promotion-tile__subheader">
										<span>{subtitle}</span>
									</h2>
								)}
							</div>
						}

						{ buttonText && (
							<a className={"c-promotion-tile__button c-promotion-tile__button--" + btnColor}>
								{buttonText}
								<i className="icon-chevron-right u-float-right"></i>
							</a>
						)}

					</div>
				</div>
			);
		}

}
