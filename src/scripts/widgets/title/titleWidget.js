import './titleWidget.scss';

const titleWidget = props => {
	const {title, tag} = props;
	if (!title || title === "") return null;
	const Component = `h${tag}`;

	return (
		<div className="c-title-widget col-12">
			<Component className="c-title-widget__title">{title}</Component>
		</div>
	);
};

export default titleWidget;
