const Step = props => (
	<div style={props.style} className="c-stepnav__content">
		{props.children}
	</div>
);

Step.propTypes = {
	children: React.PropTypes.oneOfType([
		React.PropTypes.element,
		React.PropTypes.node,
	]).isRequired,
	to: React.PropTypes.string,
};

export default Step;
