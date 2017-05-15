import './StepNav.scss';

import { Link } from 'react-router';

class StepNav extends React.Component {
	constructor(props) {
			super(props);
			this.steps = this.steps.bind(this);
	}

	render() {
		return (
			<ul className="c-stepnav">
				{_.map(this.props.children, this.steps)}
			</ul>
		);
	}

	steps(child, index)  {
		return (
			<li key={index}
				className="c-stepnav__step">

				{child.props.to ?
					this.stepContentLink(child, index) :
					this.stepContent(child, index)
				}

			</li>
		);
	}

	stepContentLink(child, index) {
		return (
			<Link
				to={child.props.to}
				className="c-stepnav__link"
				activeClassName="c-stepnav__link--active">

				{this.stepContent(child, index)}

			</Link>
		);
	}

	stepContent(child, index) {
		return (
			<div>
				{this.props.numbered && (
					<span>
						{index + 1}.&nbsp;
					</span>
				)}
				{child}
				{this.props.children.length > index + 1 && (
					<i className="c-stepnav__separator icon-chevron-right"></i>
				)}
			</div>
		);
	}
}

StepNav.defaultProps =  {
	numbered: true,
};

StepNav.propTypes =  {
	children: React.PropTypes.array.isRequired,
	numbered: React.PropTypes.bool,
};

export default StepNav;
