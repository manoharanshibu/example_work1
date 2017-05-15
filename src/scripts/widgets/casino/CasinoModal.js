import "./CasinoModal.scss";

import Modal from 'react-modal';
import deviceModel from 'sportsbook/model/DeviceModel'
import {classNames as cx} from 'common/util/ReactUtil';
import getBalanceCommand from 'sportsbook/command/GetBalanceCommand.js'
import CasinoBalance from './CasinoBalance';

 // const CasinoModal = props => {
class CasinoModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			usesIframe: false,
			loading: true,
			src: null
		};

		this.onClose = ::this.onClose;
		// creates IE compatible event handler
		const eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
		const eventer = window[eventMethod];
		const messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

		// listen to message from child window
		eventer(messageEvent, ::this.onModalCallback , false);
	}


	componentWillMount() {
		const {gameData, gameTypeReal} = this.props;

		if (deviceModel.get('device') === 'PC') {
			this.setState({ usesIframe: true });
		}

		if (App.Config.siteId === 1) {
			const gamePage = gameTypeReal ? '/' : '/demo.html';
			const game = `${App.Urls.domain}/gamelauncher${gamePage}?game=${gameData.rgsGameId}&price=${gameData.price}`;
			this.setState({ src: game });
		}
        App.bus.on('CASINO:MODAL:CLOSE', this.props.closeFunction);
	}

	componentWillUnmount() {
		App.bus.off('CASINO:MODAL:CLOSE', this.props.closeFunction);
	}

	componentDidMount() {
		const {closeFunction, gameData, gameTypeReal} = this.props;
		const {usesIframe, src} = this.state;

		// Baja games don't need this
		// TODO: better way to handle different game providers
		if (App.Config.env.BrandId === "1") {
			if (!usesIframe) {
				window.open(src, 'scrollbars=no,menubar=no,height=600,width=800,resizable=yes,toolbar=no,status=no');
				closeFunction();
			}
			return;
		}

		let name;
		const api = gameTypeReal ? 'getRgsGameLaunchReal' : 'getRgsGameLaunchDemo',
			form = document.createElement('form'),
			node = document.createElement('input');

		form.action = `${App.Urls.api}/${api}`;
		form.setAttribute('method', 'post');

		// open in a new window on mobile, iframe on bigger screens
		if (!usesIframe) {
			let windowName = _.uniqueId();
			form.target = `formresult${windowName}`;
			window.open('about:blank', `formresult${windowName}`, 'scrollbars=no,menubar=no,height=600,width=800,resizable=yes,toolbar=no,status=no');
		} else {
			form.target = 'casinoGame';
		}

		for (name in gameData) {
			node.name  = name;
			node.value = gameData[name].toString();
			form.appendChild(node.cloneNode());
		}

		// attach the hidden form
		form.style.display = 'none';
		document.body.appendChild(form);

		form.submit();

		// then remove it when we're done
		document.body.removeChild(form);

		// we're done with the modal now the window is open on mobile
		if (!usesIframe) {
			closeFunction();
		}
	}

	onModalCallback(e){
		const {closeFunction} = this.props;
		if(!e || !e.data) {
			closeFunction();
			return;
		}
		switch(e.data.toLowerCase())
		{
			case 'refreshbalance':
				if (App.session.request('loggedIn')) {
					getBalanceCommand();
				}
				break;
			case 'history':
				closeFunction();
				App.navigate('transactions/casino');
				break;
			case 'insufficient_funds':
				closeFunction();
				App.navigate('deposit');
				break;
			default:
				closeFunction();
				break;
		}
	}

	onClose() {
		const { gameTypeReal} = this.props;

		if ( App.Config.siteId !== 1 || !gameTypeReal ) {
			const { closeFunction } = this.props;
			closeFunction();
		}
		else {
			//sending message to the iframe to finish the game and close
			const iframe = this.refs.casinoGame;
			if (iframe) {
				const iframeContent = (iframe.contentWindow || iframe.contentDocument);
				iframeContent.postMessage('finishGame', '*');
			}
		}
	}

	render() {
		const { gameData } = this.props;
		const fixed = gameData.rgsCode === 'isoftbet';
		const isFullScreen = gameData.rgsCode === 'betman';

		const {
				closeFunction,
				dimensions,
				open
			} = this.props,
			{
				src,
				usesIframe
			} = this.state;

		if (!open) {
			return null;
		}

		if (!usesIframe) {
			return null;
		}

		// only render the modal and iframe on larger devices
		return (
			<Modal
				className={cx('c-casino-modal__inner', {'c-casino-modal__inner--full-screen': isFullScreen})}
				overlayClassName="c-casino-modal"
				isOpen={open}
				onRequestClose={this.onClose}
			>
				{isFullScreen && <CasinoBalance />}
				<div className={cx('c-casino-modal__close-button', {'c-casino-modal__close-button--fixed': fixed, 'c-casino-modal__close-button--full-screen': isFullScreen})}
					 onClick={this.onClose}>
					<i className="icon-close"></i>
				</div>
				<iframe
					name="casinoGame"
					ref="casinoGame"
					frameBorder="0"
					className="c-casino-modal__iframe"
					width={dimensions.width}
					height={isFullScreen ? '100%' : dimensions.height}
					src={src}
					scrolling={ isFullScreen ? 'yes' : 'no' }
					allowFullScreen="true"
				></iframe>
			</Modal>
		);
	}
};

export default CasinoModal;
