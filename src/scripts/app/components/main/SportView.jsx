import Layout from "sportsbookCms/view/Layout";

export default (props) => {
	const content = props.children || <Layout col={0} {...props}/>;
	return (
		<div className="dashboard">
			{content}
		</div>
	);
}
