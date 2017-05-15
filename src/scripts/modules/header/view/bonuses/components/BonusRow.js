import {FormattedNumber} from 'react-intl';
import '../MyBonusesView.scss';
import ExtraInfo from './ExtraInfo';
import {classNames as cx} from 'common/util/ReactUtil';

class BonusRow extends React.Component {

	/**
	 * @param array
	 */
	renderDescription() {
		const {bonusTile} = this.props;
		const description = bonusTile.get('description');
		if (!description || !description.length) {
			return null;
		}
		return <div dangerouslySetInnerHTML={{ __html: description[1] }}></div>
	}

	onConditionsClick() {
		const {bonusTile} = this.props;
		const conditionsURL = bonusTile.get('conditionsURL');
		if (!!conditionsURL) {
			App.navigate(conditionsURL);
		}
	}

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		const {activationDate, bonusType, type, blocked, blockedText, bonusTile} = this.props;
		const isHistoric = type === 'historic';
		return (
			<div className={cx('col-12 grid-middle c-bonuses-row', {'is-disabled': blocked})}>
				<div className="col-1_sm-2">
					<div className="c-bonuses__bonus-type">
						{_.titleize(bonusType) + ' bonus' }
					</div>
				</div>
				<div className="col-4_sm-10">
					<h3>{this.props.title || bonusTile.get('title') }</h3>
				</div>
				<div className="col-2_sm-12">
					{!!activationDate &&
					<ExtraInfo  isHistoric={isHistoric} {...this.props}  />}
				</div>
				<div className="col-3_sm-12">
					{ this.props.description || this.renderDescription() }
				</div>
				<div className="col-2_sm-12">
					{ !blocked && this.props.statusBar || '' }
				</div>
				<div className="col-12 grid">

					<div className="col-10 c-bonuses-row__disabled">
						{ blocked && blockedText }
					</div>
					<a className={cx('c-bonuses-row__conditions u-pointer col-2', {'is-hidden': isHistoric})}
					   onClick={::this.onConditionsClick}>
						Conditions
						<i className="icon-chevron-right"></i>
					</a>
				</div>
			</div>
		);
	}
}

export default BonusRow;
