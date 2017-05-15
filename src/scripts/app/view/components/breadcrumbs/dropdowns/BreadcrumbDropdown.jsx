import './BreadcrumbDropdown.scss';

import {Link} from "react-router";
import {clickOutside} from 'common/decorators/react-decorators';

@clickOutside('onClickOutside')
export default class BreadcrumbDropdown extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			expanded: false,
			iconExpanded: false,
		};
	}

	toggleDropdown(open) {
		this.setState({expanded: open});
	}

	isActive(route) {
		let {pathname} = this.props.location;

		//if the route has an id passed on the end of it we need to remove it to check if the route is the active route.
		if(route.indexOf('?id') !== -1) {
			const n = route.indexOf('?id');
			route = route.substring(0, n != -1 ? n : s.length);
		}
		return pathname.indexOf(route) !== -1;
	}

	handleTouchStart(hasChildren, e) {
		e.preventDefault();
		if (hasChildren) {
			this.setState({iconExpanded: !this.state.iconExpanded});
			this.toggleDropdown(!this.state.expanded);
		}
	}

	/**
	 * @param e
	 */
	onClickOutside() {
		if(!this.props.justDropdown) {
			this.toggleDropdown(false);
			this.setState({iconExpanded: false});
		}
	}

	handleMouseLeave() {
		this.toggleDropdown(false);
	}

	handleMouseEnter(hasChildren) {
		if (!hasChildren) {
			return null;
		}
		this.toggleDropdown(true);
	}

	isMobile() {
		return(this.props.viewportWidth <= 991);
	}

	handleItemClick(route, e) {
		e.preventDefault();
		e.stopPropagation();
		route = route.split('?id=');
		const [ routeBase, routeId ] = route;
		App.navigate(routeBase, {id: routeId});
		this.setState({iconExpanded: false, expanded: false});
	}

	navigateToActiveItem() {
		let activeItem = null;
		this.props.listItems.forEach(item => {
			if(this.isActive(item.route)) {
				activeItem = item;
			}
		});

		if(activeItem !== null) {
			App.navigate(`/${activeItem.route}`);
		}

		this.toggleDropdown(false);
	}

	render() {
		if (!this.props.listItems) return null;
		const hasChildren = this.props.listItems.length > 1; //if it only has 1 it will be active and is not displayed.
		const dropChevronClass = this.state.iconExpanded ? 'icon-chevron-up' : 'icon-chevron-down';

		return (
			<div className="c-breadcrumb-dropdown"
				onMouseEnter={this.handleMouseEnter.bind(this, hasChildren)}
				onMouseLeave={this.handleMouseLeave.bind(this)}
				onClick={this.navigateToActiveItem.bind(this)}
			>
				<div className="c-breadcrumb-dropdown__title" onTouchStart={this.handleTouchStart.bind(this, hasChildren)}>
					<span className="c-breadcrumb-dropdown__title-text">{this.getDropdownTitle()}</span>
					{hasChildren && (
						<i className={'c-breadcrumb-dropdown__title-icon ' + dropChevronClass}></i>
					)}
				</div>
				{this.state.expanded && (
					<div className="c-breadcrumb-dropdown__menu">
						<ul className="g-menu">
							{this.renderDropdownItems(this.props.listItems)}
						</ul>
					</div>
				)}
			</div>
		);
	}

	getDropdownTitle() {
		const changeFromTo = {
			'settings': 'My Account'
		};

		let { dropdownTitle } = this.props;
		// Dropdown title obviously shouldn't be an array. For now, if it is, just get the actual title from the array:
		if (_.isArray(dropdownTitle)) {
			dropdownTitle = dropdownTitle[0];
		}

		const normalisedDropdownTitle = dropdownTitle.toLowerCase();
		const keysArray = Object.keys(changeFromTo);

		if (keysArray.includes(normalisedDropdownTitle)) {
			return changeFromTo[normalisedDropdownTitle];
		} else {
			return dropdownTitle;
		}
	}

	renderDropdownItems(items) {
		let itemsSortedAlphabetically = items.slice(0);
		itemsSortedAlphabetically = _.sortBy(itemsSortedAlphabetically, function(a) {
		    return a.title;
		});

		return _.map(itemsSortedAlphabetically, (item) => {
			if(this.isActive(item.route)) {return null;}
			const route = `/${App.Globals.lang}/${item.route}`;
			return (
				<li key={item.title} className="c-breadcrumb-dropdown__item">
					<a className="c-breadcrumb-dropdown__link" onClick={this.handleItemClick.bind(this, route)}>
						<span>{item.title}</span>
					</a>
				</li>
			);
		}, this);
	}
}
