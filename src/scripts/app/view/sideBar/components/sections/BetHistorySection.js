import BurgerSection from 'app/view/sideBar/components/BurgerSection';
import BurgerItemLite from 'app/view/sideBar/components/BurgerItemLite';

export default class BetHistorySection extends React.Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    isCasino: false,
  }


	// isExpanded() {
	// 	const {pathname} = window.location;
	// 	return this.props.isCasino ? (pathname.indexOf('transactions/casino') !== -1) : (pathname.indexOf('mybets') !== -1);
	// }

  renderBetHistorySections() {
    const items = this.props.isCasino ?
			[{ name: App.Intl('header.user_menu.casino'), route: 'transactions/casino' }] :
			          [{ name: App.Intl('burger_menu.all'), route: 'mybets/all' },
					   { name: App.Intl('burger_menu.open'), route: 'mybets/open' },
					   { name: App.Intl('burger_menu.won'), route: 'mybets/win' },
					   { name: App.Intl('burger_menu.lost'), route: 'mybets/lose' },
					   { name: App.Intl('burger_menu.closed'), route: 'mybets/closed' }];
    return _.map(items, (item, index) => {
      const isOpen = this.props.isCasino ? App.isActive(`transactions/${item.route}`) : App.isActive(`mybets/${item.route}`);
      const activeClass = isOpen ? ' is-open' : '';
      return (
        <BurgerItemLite
          key={item.name}
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
      title: this.props.isCasino ? App.Intl('header.user_menu.casino_bet_history') : App.Intl('header.user_menu.bet_history'),
      expanded: !App.isMobile(),
      noShowMore: true,
    };

    return (
      <BurgerSection {...sportProps}>
        {this.renderBetHistorySections()}
      </BurgerSection>
    );
  }
}
