import './BurgerSection.scss';

import ShowMoreItem from 'app/view/sideBar/components/items/ShowMoreItem';
import { classNames as cx } from 'common/util/ReactUtil';
import { TOGGLE_SIDE_BAR, BURGER_CLOSE_ALL } from 'app/AppConstants';


export default class BurgerSection extends React.Component {
  static defaultProps = { onExpand: null, onCollapse: null, expanded: true };

  constructor(props) {
    super(props);
    this.state = {
      controlMode: this.props.expanded !== null,
      expanded: !!this.props.expanded,
      maxChildren: 6,
      showAll: this.props.showAll,
      ignoreCollapse: !!this.props.ignoreCollapse,
    };

    this.onClose = ::this.onClose;
    this.onCollapse = ::this.onCollapse;
  }

  componentDidMount() {
    App.bus.on(BURGER_CLOSE_ALL, this.onCollapse);
  }

  componentWillUnmount() {
    App.bus.off(BURGER_CLOSE_ALL, this.onCollapse);
  }

  onCollapse() {
    const { expanded, ignoreCollapse } = this.state;
    if (!!expanded && !ignoreCollapse) {
      this.setState({ expanded: false });
    }
  }
	/**
	 * @param showAll
	 */
  onShowAll(showAll) {
    this.setState({ showAll });
  }

  onClose() {
    if (this.props.closeFunction) {
      this.props.closeFunction();
    }
  }

	/**
	 * @param e
	 * @param className
	 */
  onExpandCollapse(e) {
    e.stopPropagation(); e.preventDefault();
    this.setState({ expanded: !this.state.expanded });

    const { onExpand, onCollapse } = this.props;
    if (!this.state.expanded && onExpand) {
      onExpand();
      return;
    }
    if (this.state.expanded && onCollapse) {
      onCollapse();
      return;
    }
    const expanded = !this.state.expanded;
    this.setState({ expanded });
  }

  getChildTotal(children) {
    let numEvents = 0;
    _.each(children, (child) => {
      if (child.props) {
				// Devensive code
        if (child.props.comp) {
          const comp = child.props.comp;
          numEvents += comp.numEvents;
        }				else if (child.props.events) {
          const events = child.props.events;
          numEvents += events.length;
        }
      }
    });

    return numEvents;
  }

  onNavigate(route) {
    App.bus.trigger(TOGGLE_SIDE_BAR);
    App.navigate(route);
  }

	/**
	 * @returns {XML}
	 */
  render() {
    const { noShowMore, lozenge, noBodyIndent, inplaySection, title, eventCount, children } = this.props;
    if (this.props.linkNoDropDown) {
      return this.renderLinkNoDropDown();
    }

    const expandClass = cx('c-burger-section', 'section', 'u-mobile-indent');
    const iconClass = cx('c-burger-section__title-icon', { 'icon-chevron-down': this.state.expanded, 'icon-chevron-right': !this.state.expanded });
    const numChild = this.state.showAll ? 9999 : this.state.maxChildren;
    const children = (this.props.children && this.props.children.constructor === Array) ? _.first(this.props.children, numChild) : this.props.children;
    const childNumEvents = (!noShowMore) ? this.getChildTotal(children) : 0;
    const addShowAll = (!noShowMore) ? this.props.children && this.props.children.length > this.state.maxChildren : false;
    const isOpen = cx({ ' is-open': this.state.expanded });
    const sectionTotal = eventCount || this.props.children.length || 0;
    const titleClass = cx('c-burger-section__title ', { 'c-burger-section__title--has-lozenge': !_.isUndefined(lozenge) });
    const dropdownClass = cx('g-menu c-burger-section__dropdown ', { 'c-burger-section__dropdown--baja': App.Config.siteId === 1 });
    return (
      <div className={expandClass + isOpen}>
        <div className="c-burger-section__header" onClick={this.onExpandCollapse.bind(this)}>
          <p className={titleClass}>
            {_.titleize(title)}

            {lozenge && (
            <span className="c-burger-section__title-lozenge g-lozenge--secondary">{lozenge}</span>
							)}
            <i className={iconClass} />
          </p>
        </div>
        {this.state.expanded &&
        <div className={cx('c-burger-section__body', { 'c-burger-section__body--no-indent': noBodyIndent })}>
          <ul className={dropdownClass}>
            {children}
            {addShowAll && (
            <ShowMoreItem
              showingByDefault={this.state.maxChildren}
              totalItems={sectionTotal}
              inplaySection={inplaySection}
              showAll={this.state.showAll}
              onShowAll={this.onShowAll.bind(this)}
            />
								)}
          </ul>
        </div>
					}
      </div>
    );
  }

  renderLinkNoDropDown() {
    const expandClass = cx('c-burger-section', 'section');
    const isOpen = cx({ ' is-open': this.state.expanded });
    const titleActiveClass = cx('c-burger-section__title', { 'c-burger-section__title--active': this.state.expanded, 'c-burger-section__title--has-lozenge': !_.isUndefined(this.props.lozenge) });

    return (
      <div className={expandClass + isOpen}>
        {!!this.props.showCloseBtn &&
        <i className="c-burger-section__close icon-close" onClick={this.onClose} />}
        <div className="c-burger-section__no-dropdown-link" onClick={this.onNavigate.bind(this, this.props.linkRoute)}>
          <p className={titleActiveClass}>
            {_.titleize(this.props.title)}

            {this.props.lozenge && (
            <span className="c-burger-section__title-lozenge g-lozenge--secondary">{this.props.lozenge}</span>
						)}
          </p>
        </div>
      </div>
    );
  }
}
