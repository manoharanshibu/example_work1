import {classNames as cx} from 'common/util/ReactUtil';

const CarouselTab = (props) => {
	const promo = props.promo;
	const style = Object.assign({}, {width: props.width});
	const classNames = cx('c-carousel__tab', {'is-active': props.selected});

	let titleText = promo.get('title');

	// Set ellipsis based on string length
	let tooLong = 60;
	if (titleText.length >= tooLong) {
		titleText = `${titleText.substr(0, tooLong - 3)}...`;
	}

	return (
		<div className={classNames} style={style} onClick={props.onSelected}>
			{titleText}
		</div>
	);
};

CarouselTab.displayName = 'CarouselTab';

CarouselTab.propTypes = {
	width: React.PropTypes.string
};

export default CarouselTab;
