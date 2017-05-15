import BurgerItem from 'app/view/sideBar/components/BurgerItem';
import { slugify } from 'sportsbook/util/SportUtil';

export default class CompetitionItem extends BurgerItem {

  getHref() {
    const { comp } = this.props;
    const code = comp.get('code').toLowerCase();
    const slug = slugify(comp.get('name'));
    return `sports/${code}/competition/${slug}?id=${comp.id}`;
  }

	/**
	 * @param comp
	 * @returns {*}
	 */
  calculateTotals() {
    const { comp } = this.props;
    return comp.get('numEvents');
  }

  getItemName(comp) {
    let name = comp.get('name');
    name = name.replace(/_/g, ' ');
    return name;
  }
}
