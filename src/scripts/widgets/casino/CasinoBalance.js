import './CasinoModal.scss';

import sessionModel from "common/model/SessionModel";
import {FormattedNumber} from 'react-intl';

class CasinoBalance extends React.Component {

    constructor(props) {
        super(props);
		this.forceRender = ::this.forceRender;
	}

	componentDidMount() {
		sessionModel.on('change:wallets', this.forceRender, this);
	}

	componentWillUnmount() {
		sessionModel.off('change:wallets', this.forceRender, this);
	}


	forceRender() {
		this.forceUpdate();
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const cashBalance = App.session.execute('getAllAvailable');
		return (
			<div>
				<span className="c-casino-modal__balance">
					<h3>
						<FormattedNumber
							value={cashBalance}
							style="currency"
							currency={App.session.request('currency')}
						/>
					</h3>
				</span>
			</div>
		);
	}
}

export default CasinoBalance;
