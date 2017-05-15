import ShowMoreItem from 'app/view/sideBar/components/items/ShowMoreItem';
import CompetitionItem from 'app/view/sideBar/components/items/CompetitionItem';
import BurgerItem from 'app/view/sideBar/components/BurgerItem';
import { slugify } from 'sportsbook/util/SportUtil';
import cx from 'classnames';

export default class CountryItem extends BurgerItem {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, {
      expanded: !!props.expanded,
      maxChildren: 8,
      showAll: false,
    }, this.state);

    this.onExpandCollapse = ::this.onExpandCollapse;
    this.onShowAll = ::this.onShowAll;
  }

  /**
   * @param e
   * @param className
   */
  onExpandCollapse(e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });

    const { onExpand, onCollapse } = this.props;
    if (!this.state.expanded && onExpand) {
      onExpand();
      return;
    }
    if (this.state.expanded && onCollapse) {
      onCollapse();
    }
  }

  /**
   * @param showAll
   */
  onShowAll(showAll) {
    this.setState({ showAll });
  }

  /**
   * @param nextProps
   */
  getHref(props) {
    const comp = props.comp;
    const code = comp.get('code').toLowerCase();
    const slug = slugify(comp.get('name'));
    const sport = slugify(code);
    return `/${sport}/country/${slug}?id=${comp.id}`;
  }

  /**
   * @returns {XML}
   */
  render() {
    const comp = this.props.comp;
    const sportCode = this.props.sportCode;
    const ignoreCountry = sportCode === 'RUGBY_LEAGUE';
    const children = this.renderCompetitions(comp, ignoreCountry);
    const iconClass = this.state.expanded ? 'icon-chevron-down' : 'icon-chevron-right';
    const countryHeaderClass = this.state.expanded ? 'country active' : 'country';
    const total = this.calculateTotals(comp);

    if (ignoreCountry) {
      return (
        <li key={comp.id} className={cx('c-burger-section__item', countryHeaderClass)}>
          { children }
        </li>
      );
    }

    return (
      <li key={comp.id} className={cx('c-burger-section__item', countryHeaderClass)}>
        <a className="c-burger-section__item-link" onClick={this.onExpandCollapse} >
          <i className={iconClass} />
          <span>{ _.titleize(comp.get('name').replace(/_/g, ' ')) }</span>
          <div className="g-lozenge--primary u-float-right">{ total }</div>
        </a>
        { children }
      </li>
    );
  }


  /**
   * @param comp
   * @returns {*}
   */
  renderCompetitions(comp, forceShow) {
    const expanded = this.state.expanded || forceShow;
    if (!expanded || !comp.Children) return null;
    const addShowAll = comp.Children.size() > this.state.maxChildren;
    const children = this.renderChildren(comp);
    return (
      <ul className="g-menu c-burger-section__dropdown">
        { children }
        { addShowAll && (
          <ShowMoreItem
            totalItems={comp.Children.size()}
            showAll={this.state.showAll}
            onShowAll={this.onShowAll}
          />
        ) }
      </ul>
    );
  }

  /**
   * @param Component
   * @param max
   * @returns {*}
   */
  renderChildren(comp) {
    const numChild = this.state.showAll ? 9999 : this.state.maxChildren;
    const children = _.take(comp.Children.models, numChild);
    return _.map(children, (child, index) => <CompetitionItem key={index} comp={child} />, this);
  }

  /**
   * @param comp
   * @returns {*}
   */
  calculateTotals(comp) {
    return comp.Children.reduce((total, comp) => {
      total += comp.get('numEvents');
      return total;
    }, 0, this);
  }
}
