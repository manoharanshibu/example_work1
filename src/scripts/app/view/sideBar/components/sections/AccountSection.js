import BurgerSection from 'app/view/sideBar/components/BurgerSection';

export default class SportsSection extends React.Component {
  constructor(props) {
    super(props);
  }

  isActive(path) {
    const { pathname } = window.location;
    return pathname.indexOf(path) !== -1;
  }

  isExpanded() {
    return (this.isActive('overview'));
  }

	/**
	 * @returns {XML}
	 */
  render() {
    const sportProps = {
      title: App.Intl('header.overview.account'),
      linkNoDropDown: true,
      expanded: this.isExpanded(),
      noShowMore: true,
      linkRoute: 'account/overview',
    };

    return (
      <BurgerSection {...sportProps} />
    );
  }
}
