import DepositAmountViewBase from './DepositAmountViewBase';

import {launch, close} from 'thirdparty/ilixium.js';
import 'thirdparty/ilixium.css';

import model from 'sportsbook/model/DepositModel';

export default class DepositAmountViewIlixium  extends DepositAmountViewBase {
	constructor(props) {
		super(props);
		this.handleDigesstReceived = ::this.handleDigesstReceived;
		model.set('type', 'ilixium');
	}

	componentDidMount(){
		super.componentDidMount();
		App.socket.on('streaming:depositCompletionUpdate', this.removeIframe);
	}

	componentWillUnmount(){
		super.componentWillUnmount();
		App.socket.off('streaming:depositCompletionUpdate', this.removeIframe);
	}

	/**
	 *
	 */
	removeIframe(data) {
		const completion = data && data.DepositCompletionUpdate;

		if (!completion){
			App.navigate('deposit/error');
			close();
			return;
		}

		const {success, description} = completion;

		const isSuccessful = success || description === 'DEPOSIT_SUCCESS' || description === 'DEPOSIT_PENDING';

		if (isSuccessful) {
			close();
			App.navigate('deposit/confirm');
			return;
		}

		const isCancelled = !success && description === 'CANCELLED';
		if (isCancelled){
			close();
			App.navigate('deposit/amount');
			return;
		}

		// currently getting DEPOSIT_PENDING need view for that, as deposit successful

		close();
		App.navigate('deposit/error');
	}

	handleDigesstReceived(){
		var url = model.get('ilixiumURL');
		var merchantId = model.get('merchantId');
		var merchantRef = model.get('merchantRef');
		var requestKey = model.get('requestKey');
		var digest = model.get('digest');

		launch(url, merchantId, requestKey, digest);

		console.log('handleDigesstReceived..handleDigesstReceived..handleDigesstReceived..');
	}

}
