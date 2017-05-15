import { shallowEqual, classNames as cx } from 'common/util/ReactUtil';
import { slugify } from 'sportsbook/util/SportUtil';
import { TOGGLE_SIDE_BAR, TOGGLE_BET_SLIP, OPEN_CONTACT_CHAT, OPEN_BET_SLIP_HINT } from 'app/AppConstants';
import { Link } from 'react-router';
import BurgerCheckBox from 'app/view/sideBar/components/BurgerCheckBox';


export default class BurgerItem extends React.Component {
  static defaultProps = {
    favouritable: true,
    couponable: true,
    abbr: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      events: 'add remove reset',
      href: this.getHref(props),
    };
  }

	/**
	 * @param props
	 * @returns {*}
	 */
  getHref(props) {
    const comp = props.comp;
    const slug = slugify(comp.get('name'));
    const code = (comp.attributes.code || 'SOCCER').toLowerCase();
    return `sports/${code}/competition/${slug}?id=${comp.id}`;
  }

	/**
	 * @param route
	 */
  onNavigate(e) {
    App.bus.trigger(TOGGLE_SIDE_BAR, e);
  }


	/**
	 * @param nextProps
	 */
  componentWillReceiveProps(nextProps) {
    this.setState({ href: this.getHref(nextProps) });
  }

	/**
	 * @param nextProps
	 * @returns {boolean}
	 */
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps) ||
			nextProps.comp.id != this.props.id;
  }

	/**
	 * @returns {XML}
	 */
  render() {
    const { comp } = this.props;
    const size = this.calculateTotals(comp);
    return (
      <li key={comp.id} className={cx('c-burger-section__item')} >
        <BurgerCheckBox comp={comp} size={size} couponable={this.props.couponable} />
      </li>
    );
  }

	/**
	 * @param comp
	 * @returns {*}
	 */
  getItemName(comp) {
    const parent = comp.get('parent');
    let name = comp.get('name');
    name = name.replace(/_/g, ' ');
    if (parent && this.props.couponable && this.props.abbr) {
      const abbr = parent.get('name').substr(0, 3);
      name = `${name} (${abbr.toUpperCase()})`;
    }
    return name;
  }

	/**
	 * @param comp
	 * @returns {*}
	 */
  calculateTotals(comp) {
    return comp.Children.size();
  }
}

BurgerItem.defaultProps = {
  couponable: true,
};
