import './ColapsableContainer.scss';

import {classNames as cx} from "common/util/ReactUtil";

class ColapsableContainer extends React.Component {
	static propTypes = {
		expanded: React.PropTypes.bool,
		title: React.PropTypes.string.isRequired,
	}

	static defaultProps = {
		expanded: false,
	};

	constructor( props ) {
		super( props );

		this.state = {
			expanded: this.props,
		}

		this.toggle = ::this.toggle
	}

	toggle() {
		this.setState({expanded: !this.state.expanded});
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const {expanded} = this.state;
		const icon = expanded ? 'icon-chevron-down c-colapsable-container__icon--expanded' : 'icon-chevron-right';

		return (
			<section className="c-colapsable-container">
				<div className="c-colapsable-container__header" onClick={this.toggle}>
					<i className={'c-colapsable-container__icon ' + icon}></i>
					{this.props.title}
				</div>
				{expanded && (
					<div className="c-colapsable-container__body">
						{this.props.children}
					</div>
				)}
			</section>
		);
	}
}

export default ColapsableContainer;
