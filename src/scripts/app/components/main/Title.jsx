import ReactTitle from 'react-document-title';

const titleize = str => _.titleize(str.split('_').join(' '));

const Title = props => {
	const baseTitle = App.Config.title;

	let title;

	if (props.exactTitle ) {
		title = props.exactTitle;
	}
	else if (props.title) {
		title = `${titleize(props.title)} | ${baseTitle}`;
	}
	else {
		title = baseTitle;
	}

	return (
		<ReactTitle title={title}>
			{props.children}
		</ReactTitle>
	);
};

Title.propTypes = {
	exactTitle: React.PropTypes.string,
	title: React.PropTypes.string
};

export default Title;
