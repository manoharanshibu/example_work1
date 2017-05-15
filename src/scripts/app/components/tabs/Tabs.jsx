import {classNames as cx} from 'common/util/ReactUtil';

import './Tabs.scss';

class Tabs extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: (this.props.activeTab) ? this.props.activeTab : 0
		};
	}

	handleClick(index, event) {
		event.preventDefault();
		this.setState({
			selected: index
		});
	}

	renderTitles() {
		const labels = (child, index) => {
			const activeClass = cx("c-tabs__list-item", {'is-active': this.state.selected === index});
			return (
				<li key={index}
					className={activeClass}>
					<a href="#"
					    className="c-tabs__link"
						onClick={this.handleClick.bind(this, index)}>
						{child.props.label}
					</a>
				</li>
			);
		};
		return (
			<ul className="c-tabs__labels">
				{Object.prototype.toString.call(this.props.children).indexOf('Array') > -1 ? this.props.children.map(labels) : [this.props.children].map(labels)}
			</ul>
		);
	}

	renderContent() {
		return (
			<div className="c-tabs__content">
				{this.props.children[this.state.selected] || this.props.children}
			</div>
		);
	}

	render() {
		return (
			<div className="c-tabs">
				{this.renderTitles()}
				{this.renderContent()}
			</div>
		);
	}
}

Tabs.propTypes =  {
	children: React.PropTypes.oneOfType([
		React.PropTypes.array,
		React.PropTypes.element
	]).isRequired
};

export default Tabs;
