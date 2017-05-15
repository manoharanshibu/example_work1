import './CasinoCategoriesSection.scss';

import BurgerSection from 'app/view/sideBar/components/BurgerSection';
import { Link, IndexLink } from 'react-router';
import { TOGGLE_SIDE_BAR } from 'app/AppConstants';
import { classNames as cx } from 'common/util/ReactUtil';

export default class CasinoCategoriesSection extends React.Component {
  getCategories() {
    const navItems = [
      {
        indexLink: true,
        pathName: '',
        iconName: 'all',
        title: App.Intl('casino.all_categories'),
      },
      {
        pathName: 'roulette',
        iconName: 'roulette',
        title: App.Intl('casino.roulette'),
      },
      {
        pathName: 'blackjack',
        iconName: 'blackjack',
        title: App.Intl('casino.blackjack'),
      },
      {
        pathName: 'table',
        iconName: 'table',
        title: App.Intl('casino.table'),
      },
      {
        pathName: 'slots',
        iconName: 'slots',
        title: App.Intl('casino.slots'),
      },
      {
        pathName: 'jackpots',
        iconName: 'jackpots',
        title: App.Intl('casino.jackpots'),
      },
      {
        pathName: 'all',
        iconName: 'all',
        title: App.Intl('casino.all_games'),
      },
      {
        pathName: 'promotions',
        iconName: 'promotions',
        title: App.Intl('casino.promotions'),
      },
    ];
    return navItems;
  }

  renderCategories() {
    const items = this.getCategories();
    return _.map(items, navItem => this.renderCategory(navItem));
  }

  onNavigate(e) {
    App.bus.trigger(TOGGLE_SIDE_BAR, e);
  }

  renderCategory(navItem) {
    const iconClass = cx('c-burger-section__item', `c-burger__icon-${navItem.iconName}`);
    let pathName = '';
    let tag = Link;

    if (navItem.pathName) {
      pathName = `/${navItem.pathName}`;
    }

    if (navItem.indexLink) {
      tag = IndexLink;
    }

    return (
      <li className={iconClass} key={navItem.title}>
        {React.createElement(
					tag,
          {
            to: `/${App.Globals.lang}/casino${pathName}`,
            className: 'c-burger-section__item-link',
            activeClassName: 'active',
            		},
          <div onClick={this.onNavigate.bind(this)}>
            {navItem.title}
          </div>,
				)}
      </li>
    );
  }

  render() {
    const CasinoCategoriesSection = {
      title: App.Intl('burger_menu.categories'),
      expanded: true,
      noShowMore: true,
      showAll: true,
      noBodyIndent: true,
    };

    return (
      <BurgerSection {...CasinoCategoriesSection}>
        {this.renderCategories()}
      </BurgerSection>
    );
  }
}
