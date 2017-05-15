import BurgerSection from 'app/view/sideBar/components/BurgerSection';
import BurgerItemLite from 'app/view/sideBar/components/BurgerItemLite';

export default class SportsSection extends React.Component {
  constructor(props) {
    super(props);
  }

  navigate(route) {
    App.navigate(`bonuses/${route}`);
  }

  isExpanded() {
    const { pathname } = window.location;
    return pathname.indexOf('bonuses') !== -1;
  }

  renderWallet() {
    const items = [{ name: 'Sports', route: 'Sports' }, { name: 'Casino', route: 'Casino' }];
    return _.map(items, (item, index) => {
      const isOpen = App.isActive(`bonuses/${item.route}`);
      const activeClass = isOpen ? ' is-open' : '';
      return (
        <BurgerItemLite
          index={index}
          activeClass={activeClass}
          item={item}
        />
      );
    }, this);
  }

	/**
	 * @returns {XML}
	 */
  render() {
    const sportProps = {
      title: App.Intl('burger_menu.bonuses'),
      expanded: this.isExpanded(),
      noShowMore: true,
    };

    return (
      <BurgerSection {...sportProps}>
        {this.renderWallet()}
      </BurgerSection>
    );
  }
}
