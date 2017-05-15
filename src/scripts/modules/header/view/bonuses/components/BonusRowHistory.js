import BonusRow from './BonusRow';
import './BonusRowHistory.scss';

class BonusBoxHistory extends React.Component {


	renderComplete() {
		return (
			<div className="c-complete-box">
					<span className="u-bold">Complete</span>
			</div>
		);
	}

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		let statusBar = this.renderComplete();
		return (
			<BonusRow  statusBar={statusBar} {...this.props} />
		)
	}
}

export default BonusBoxHistory;
