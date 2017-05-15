import FooterView from "footer/view/FooterViewLite";
import {classNames as cx} from "common/util/ReactUtil";

class StandAloneView extends React.Component {
	constructor(props, context) {
		super(props, context);
	}

	whiteStyle() {
		const routes = ['deposit'];
		const white =  _.some(routes, route => {
			return this.props.location.pathname.includes(route);
		});
		return white;
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const {children} = this.props;
		const classNames = this.classNames();

		return (
			<div id="stand-alone-view-simple" className={classNames.wrapper}>
				<div ref="main" className={classNames.main}>
					{children}
					<footer className="site-footer">
						<FooterView/>
					</footer>
				</div>
			</div>
		);
	}

	/**
	 * @returns {{wrapper, main}}
     */
	classNames() {
		return {
			wrapper: cx({
				'register-page': false,
				'login-page': false,
				'white-bg': this.whiteStyle(),
			}),
			main: cx({
				'fixed': false,
				'transition': false
			})
		}
	}
}

export default StandAloneView;
