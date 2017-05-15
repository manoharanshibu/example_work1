import './Breadcrumb.scss';

import {classNames as cx} from 'common/util/ReactUtil.js';
import BetslipToggle from "app/view/components/BetslipToggle";
import OddsDropdown from "app/view/components/breadcrumbs/dropdowns/OddsDropdown";

import {CLOSE_SIDE_BAR, APP_NAVIGATE} from "app/AppConstants";

export default class BreadcrumbView extends React.Component {

	constructor(props) {
		super(props);

		this.handleBreadcrumbScrollToStart = this.scrollBreadcrumbToStart.bind(this);
	}

	componentWillUnmount() {
		App.bus.off(APP_NAVIGATE, this.handleBreadcrumbScrollToStart);
	}

	componentWillMount() {
		App.bus.on(APP_NAVIGATE, this.handleBreadcrumbScrollToStart);
	}

	onNavigate(route) {
		App.bus.trigger(CLOSE_SIDE_BAR);
		App.navigate(route);
	}

	isMobile() {
		return(this.props.viewportWidth <= 991);
	}

	isActivePath(path) {
		const {pathname} = window.location;
		return pathname.indexOf(path) !== -1;
	}

	isString = (input) => typeof input === 'string';

	render() {
		const {breadcrumbs, betslipActive, betslipOpen} = this.props;
		const isHomeIcon = breadcrumbs[0].ref === "home-icon";
		const breadcrumbsClass = cx('c-breadcrumbs', {'c-breadcrumbs-full-width': this.props.fullWidth, 'c-breadcrumbs-burger-off': !this.props.burgerActive});
		const isCasino = this.isActivePath('casino');

		return (
			<div className={breadcrumbsClass}>
				<div className={cx('c-breadcrumbs__section c-breadcrumbs__section--1 is-hidden-lg', {
						'c-breadcrumbs__section--home-icon': isHomeIcon,
						'c-breadcrumbs__section--string': this.isString(breadcrumbs[0])
					}
				)}>
					<div className="c-breadcrumbs__title">
						{breadcrumbs[0]}
					</div>
				</div>

				<div className="c-breadcrumbs__scrolling-list" id="breadcrumb-scrolling-list"> {/* Small screen scroll */}
					{breadcrumbs.length >= 2 &&
						<div
							className={cx('c-breadcrumbs__section c-breadcrumbs__section--2 js-scrolling-list-item',{
									'c-breadcrumbs__section--string': this.isString(breadcrumbs[1]),
									'c-breadcrumbs__section--no-upper-case': App.Config.siteId === 1
								}
							)}
							onClick={this.handleSectionClick.bind(this, 0)}
						>
							{breadcrumbs[1]}
						</div>
					}
					{breadcrumbs.length >= 3 &&
						<div
							className={cx('c-breadcrumbs__section c-breadcrumbs__section--3 js-scrolling-list-item',{
									'c-breadcrumbs__section--string': this.isString(breadcrumbs[2]),
									'c-breadcrumbs__section--no-upper-case': App.Config.siteId === 1
								}
							)}
							onClick={this.handleSectionClick.bind(this, 1)}
						>
							{breadcrumbs[2]}
						</div>
					}
					{breadcrumbs.length >= 4 &&
						<div
							className={cx('c-breadcrumbs__section c-breadcrumbs__section--4 js-scrolling-list-item',{
									'c-breadcrumbs__section--string': this.isString(breadcrumbs[3]),
									'c-breadcrumbs__section--no-upper-case': App.Config.siteId === 1
								}
							)}
							onClick={this.handleSectionClick.bind(this, 2)}
						>
							{breadcrumbs[3]}
						</div>
					}
				</div>

				<div className="u-float-right">
					{!isCasino && App.Globals.isSportsbookAvailable &&
						<OddsDropdown />
					}

					{betslipActive && (
						<BetslipToggle
							betslipOpen={betslipOpen}
							className={"c-betslip-toggle--breadcrumbs is-visible-between-lg-and-xl"}
						/>
					)}
				</div>
			</div>
		);
	};

	handleSectionClick(nthItem) {
		const scrollingList = document.getElementById('breadcrumb-scrolling-list');
		const scrollingListItems = document.getElementsByClassName('js-scrolling-list-item');
		let distance = 0;

		for(let i = 0; i < nthItem; i++) {
			distance = distance + scrollingListItems[i].clientWidth;
		}
		scrollingList.scrollLeft = distance;
	}

	scrollBreadcrumbToStart() {
		const scrollingList = document.getElementById('breadcrumb-scrolling-list');
		if (!scrollingList) {
			return;
		}
		scrollingList.scrollLeft = 0;
	}
}
