import betsModel from 'sportsbook/model/domain/BetsModel.js';
import Layout from './Layout';

export default class BetSlipLayout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			shouldDisplay: true
		}
	}

	componentDidMount() {
		betsModel.on('all', () => {
			this.setState({
				shouldDisplay: this.shouldDisplay()
			});
		})
	}

	componentWillUnmount() {
		betsModel.off();
	}

	shouldDisplay() {
		return betsModel.selectionCount === 0 || !!this.props.activeMiniGame;
	}

	render() {
		return this.state.shouldDisplay ? <Layout {...this.props} /> : null;
	}
}
