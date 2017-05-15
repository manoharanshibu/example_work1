import BurgerSection from 'app/view/sideBar/components/BurgerSection';
import BurgerItemLite from 'app/view/sideBar/components/BurgerItemLite';

export default class SportsSection extends React.Component {
  constructor(props) {
    super(props);
  }

  renderTransactions() {
    const items = [{ name: App.Intl('deposit.label.sports'), route: 'transactions/sports' }, { name: App.Intl('deposit.label.casino'), route: 'transactions/casino' }];
    return _.map(items, (item, index) => {
      const isOpen = App.isActive(`transactions/${item.route}`);
      const activeClass = isOpen ? ' is-open' : '';
      return (
        <BurgerItemLite
          key={index}
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
      title: App.Intl('burger_menu.transactions'),
      expanded: !App.isMobile(),
      noShowMore: true,
    };

    return (
      <BurgerSection {...sportProps}>
        {this.renderTransactions()}
      </BurgerSection>
    );
  }
}
