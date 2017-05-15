import {classNames as cx} from 'common/util/ReactUtil';

export default class ActionButton extends React.Component {
	static defaultProps = {
		idleText: 'Confirm',
		actioningText: App.Intl('details.save.saving'),
		className: '',
		type: 'submit'
	};

	constructor(props) {
		super(props);
		this.state = {actioning: false};
	}

	/**
	 * @param e
	 */
	confirming() {
		this.setState({actioning: true});
	}

	/**
	 * @param e
	 */
	confirmed() {
		this.setState({actioning: false});
	}

	/**
	 * @returns {XML}
	 */
	render() {
		var buttonText  = this.state.actioning ? this.props.actioningText : this.props.idleText;
		var loaderClass = cx('loader', {'fade': this.state.actioning});
		return (
			<div className='c-button-container'>
				<button className={cx('btn--primary', this.props.className)} type={this.props.type} onClick={this.props.onClick}>{buttonText}</button>
				{/*<div className={loaderClass}>Loading...</div>*/}
			</div>
		);
	}
}
