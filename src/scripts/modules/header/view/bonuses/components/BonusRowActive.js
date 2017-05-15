import BonusRow from './BonusRow';
import PercentageBar from './PercentageBar';

class BonusBoxActive extends React.Component {
	constructor(props) {
		super(props);
	}

	renderPercentageBar() {
		const { depositGoal, qualifyingStake} = this.props;
		const missingBonus = qualifyingStake;
		const bonusCompletion = depositGoal - missingBonus;
		const completionPercent = depositGoal ? bonusCompletion / depositGoal : 0;
		const currency = App.session.request('currency');
		return (
			<PercentageBar
				percentage={completionPercent}
				complete={bonusCompletion}
				missing={missingBonus}
			/>
		);
	}

	render() {
		const { bonusType } = this.props;
		const isDeposit = bonusType === 'deposit';
		let statusBar = isDeposit && this.renderPercentageBar() || null;
		return (
			<BonusRow  statusBar={statusBar} {...this.props} />
		);
	}
}

export default BonusBoxActive;
