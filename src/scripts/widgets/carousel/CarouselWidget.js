import './CarouselWidget.scss';

import PromotionWidget from 'promotion/PromotionWidget';
import CarouselTab from './CarouselTab';
import promoCache from 'sportsbook/collection/PromotionsCache';
import Carousel from 'nuka-carousel';
import {classNames as cx} from 'common/util/ReactUtil.js';
import cancelable from "common/util/Cancelable";
import Loader from "app/view/components/LoaderView";
import {TRIGGER_RESIZE, PROMO_IMAGE_LOADED} from "app/AppConstants";

class CarouselWidget extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			loading: true,
			cachedPromos: [],
			currentSlide: 0,
			previousSlide: 0,
			viewportHeight: document.documentElement.clientHeight,
			viewportWidth: document.documentElement.clientWidth,
			arrowsVisible: false
		};
		this.currentSlide = 0;

		_.bindAll(this, 'triggerResize');

		this.onGotPromo = cancelable.callback(this.onGotPromo, this);
		this.onGetPromoError = cancelable.callback(this.onGetPromoError, this);
		this.handlePromotionImageLoaded = cancelable.debounce(this.promotionImageLoaded, 250, this);
        this.mounted = false;

		App.bus.on(TRIGGER_RESIZE, this.triggerResize);
		App.bus.on(PROMO_IMAGE_LOADED, this.handlePromotionImageLoaded);
	}

	componentWillMount(){
		const {slides={}} = this.props;
		const {promotions} = slides;

		if (promotions){
			promotions.forEach( promoId => {
				promoCache.getPromoById(promoId)
					.then( this.onGotPromo, this.onGetPromoError );
			});
		};
	}

	componentDidMount(){
        this.mounted = true;
		//dont start auto sider if there aren't enough slides to slide
		if(this.hasEnoughSlides() && !this.props.isPromotionRow) {
			this.startAutoSlider();
		}
	}

	componentWillUnmount(){
        this.mounted = false;
		this.stopAutoSlider();
		App.bus.off(TRIGGER_RESIZE, this.triggerResize);
		App.bus.off(PROMO_IMAGE_LOADED, this.handlePromotionImageLoaded);

		// prevent debounced fn from firing:
		this.handlePromotionImageLoaded.cancel();
		this.onGotPromo.cancel();
		this.onGetPromoError.cancel();
	}

	promotionImageLoaded() {
		this.setState({loading: false});
	}

	hasEnoughSlides() {
		//if multiple slides to show then a certain number
		//of slides is required to slide.
		if(this.props.multiple) {
			const width = this.state.viewportWidth;
			const {cachedPromos} = this.state;
			// const numberOfPromos = this.getActivePromosInCarousel().length;
			const numberOfPromos = cachedPromos.length;
			if(width < 1300 && numberOfPromos > 1) {
				return true;
			} else if(width < 1700 && numberOfPromos > 2) {
				return true;
			} else if(numberOfPromos > 3) {
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	}

	triggerResize(width, height) {
		this.setState({
			viewportWidth: width,
			viewportHeight: height,
		});
	}

	onGotPromo(promo){
		const {cachedPromos} = this.state;
		const newCachedPromos = cachedPromos.concat(promo.id);
		this.setState({cachedPromos: newCachedPromos});
	}

  onGetPromoError(){
      console.warn('Promo not found');
  }

	goToNextSlide(){
		if (this.carousel){
			const {currentSlide, slideCount} = this.carousel.state;

			if ( (currentSlide + 1) >= slideCount ){
				this.carousel.goToSlide(0);
			} else {
				this.carousel.nextSlide();
			}

			// forceUpdate needed to update the tabs
			this.forceUpdate();
		}
	}

	onSlideSelected( slideIndex ){
		if (this.carousel){
			this.carousel.goToSlide(slideIndex);
			// forceUpdate needed to update the tabs
			this.forceUpdate();

			this.resetAutoSlider();
		}
	}

	startAutoSlider(){
		this.autoslider = window.setInterval( ::this.goToNextSlide, 3000 );
	}

	stopAutoSlider(){
		if (this.autoslider){
			window.clearInterval(this.autoslider);
		}
	}

	resetAutoSlider(){
		if(this.hasEnoughSlides() && !this.props.isPromotionRow) {
			this.stopAutoSlider();
			if (this.scheduledRestart){
				window.clearTimeout(this.scheduledRestart);
			}
			this.scheduledRestart = window.setTimeout( ::this.startAutoSlider, 6000 );
		}
	}

	onMouseEnter(){
		this.stopAutoSlider();
		this.toggleArrows();
	}

	onMouseLeave(){
		this.resetAutoSlider();
		this.toggleArrows();
	}

	toggleArrows() {
		this.setState({arrowsVisible: !this.state.arrowsVisible});
	}

	onSlideChange() {
		if (this.carousel){
			const {currentSlide, slideCount} = this.carousel.state;
			const previousSlide = this.state.previousSlide;

			this.setState({previousSlide: currentSlide});

			if ( (currentSlide + 1) > slideCount){
				this.currentSlide = 0;
			} else {
				if (currentSlide > previousSlide) {
					let difference = currentSlide - previousSlide;
					// add difference rather than +1 for when user jumps from first to last
					this.currentSlide = this.currentSlide + difference;

				} else if (currentSlide < previousSlide) {
					let difference = previousSlide - currentSlide;
					//if difference is more than 1 we've jumped to start
					if(difference > 1) {
						this.currentSlide = 0;
					} else {
						this.currentSlide = this.currentSlide - 1;
					}
				}
			}

			// forceUpdate needed to update the tabs
			this.forceUpdate();
			this.resetAutoSlider();
		}
	}

	slideChangedEvent() {
		this.onSlideChange();
	}

	hasArrows(promoList){
		const {cachedPromos} = this.state;
		return (cachedPromos.length > 3) || this.props.multiple;
	}

	getSlidesToShow() {
		//return a diffent number of slides dependant on screen width.
		const width = this.state.viewportWidth;
		if(width < 1300) {
			return 1;
		} else if(width < 1700) {
			return 2;
		} else {
			return 3;
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const {cachedPromos} = this.state;

		// if (!promoList.length){
		if (!cachedPromos.length){
			return null;
		}

		const slidesToShow = (this.props.multiple) ? this.getSlidesToShow() : 1;

		const promos = this.renderPromos(slidesToShow);
		const hasEnoughSlides = this.hasEnoughSlides();
		const carouselClass = cx('c-carousel col-12',
			{'c-carousel--multiple': this.props.multiple && hasEnoughSlides,
				'c-carousel--multiple-not-enough-slides': !hasEnoughSlides && this.props.multiple}
		);

		return (
			<div className={carouselClass}
				 onMouseEnter={::this.onMouseEnter}
				 onMouseLeave={::this.onMouseLeave}
			>
				<Loader loading={this.state.loading}/>

				<div className="c-carousel__container">
					{hasEnoughSlides && !this.state.loading  &&
					this.renderLeftArrow()
					}
					<Carousel decorators={[]}
							  slidesToShow={slidesToShow}
							  slidesToScroll={1}
							  wrapAround={true}
							  cellSpacing={8}
							  afterSlide={this.slideChangedEvent.bind(this)}
							  dragging={hasEnoughSlides}
							  ref={(ref) => this.carousel = ref}
					>
						{promos}
					</Carousel>

					{!this.props.multiple && !this.state.loading &&
					this.renderTabContainer()
					}

					{hasEnoughSlides && !this.state.loading &&
					this.renderRightArrow()
					}
				</div>
			</div>
		);
	}

	renderLeftArrow(){
		const hasArrows = this.hasArrows();

		if (!hasArrows){
			return null;
		}

		const {cachedPromos} = this.state;
		const currentSlide = this.currentSlide;
		const prevSlide = (currentSlide == 0) ? (cachedPromos.length-1) : (currentSlide - 1);
		const arrowClass = cx('c-carousel__arrow c-carousel__arrow--left', {
			'c-carousel__arrow--multiple c-carousel__arrow--multiple-left': this.props.multiple,
			'c-carousel__arrow--is-visible': this.state.arrowsVisible,
		});

		return (
			<div className={arrowClass}
				 onClick={this.onSlideSelected.bind(this, prevSlide)}>
				<i className="c-carousel__arrow-icon c-carousel__arrow-icon--left icon-chevron-left"></i>
			</div>
		);
	}

	renderRightArrow(){
		const hasArrows = this.hasArrows();

		if (!hasArrows){
			return null;
		}

		const currentSlide = this.currentSlide;
		const {cachedPromos} = this.state;
		const nextSlide = (currentSlide == (cachedPromos.length-1)) ? 0 : (currentSlide + 1);
		const arrowClass = cx('c-carousel__arrow c-carousel__arrow--right', {
			'c-carousel__arrow--multiple  c-carousel__arrow--multiple-right': this.props.multiple,
			'c-carousel__arrow--is-visible': this.state.arrowsVisible,
		});

		return (
			<div className={arrowClass}
				 onClick={this.onSlideSelected.bind(this, nextSlide)}>
				<i className="c-carousel__arrow-icon c-carousel__arrow-icon--right icon-chevron-right"></i>
			</div>
		);
	}

	renderTabContainer() {
		const hasArrows = this.hasArrows();

		const containerClass = (hasArrows) ? 'c-carousel__tabs c-carousel__tabs--has-arrows' : 'c-carousel__tabs';

		if (!this.props.tabs || this.props.tabs === 'none'){
			return null;
		}
		const {cachedPromos} = this.state;
		const numSlides = cachedPromos.length;

		// We don't show a tab when there is only one promo visible
		if (numSlides < 2){
			return null;
		}

		// Create array with promos already cached
		const promoList = cachedPromos.map( promoId => promoCache.get(promoId) );


		return (
			<div className={containerClass}>
				{this.renderTabs(promoList)}
			</div>
		);
	}

	renderTabs(promoList){
		const currentSlide = this.currentSlide;

		let activeTab = currentSlide - 2;

		if (promoList.length > 2 && currentSlide > 2) {
			const marginLeftAnimation = '-'+(activeTab * 33.333) + '%';
		}

		const width = (Number(100 / (promoList.length)).toFixed(2) + '%');

		const tabs = promoList.map( (promo, index) => {

				return (<CarouselTab key={index}
									 selected={currentSlide === index}
									 onSelected={this.onSlideSelected.bind(this, index)}
									 promo={promo}
									 width={width} />);
			}
		);

		return <div className="c-carousel__tabs-container">{tabs}</div>;
	}

	/**
	 * @returns {*}
	 */
	renderPromos() {
		//pass tilespan = 1 if we are rendering multiple slides to get the box mobile layout.
		const {cachedPromos} = this.state;
        return cachedPromos.map( ::this.renderPromo );
    }

    renderPromo(promoId, index) {
			const slidesToShow = (this.props.multiple) ? this.getSlidesToShow() : 1;
			const tilespan = slidesToShow > 1 ? 1 : 3;
        return (
					//wrap promo widget in a grid rather than modify the widget to fix padding
					<div key={index} className="grid">
	          <PromotionWidget
							carouselWidget={true}
							multiple={this.props.multiple}
							tilespan={tilespan}
              id={promoId}
              imageLoaded={this.bouncedForceRerender}
              inCarousel
              layoutType={this.props.layoutType}
	          />
					</div>
	      );
    }
}

CarouselWidget.displayName = 'CarouselWidget';

CarouselWidget.defaultProps = {
	tilespan: 1
};

export default CarouselWidget;
