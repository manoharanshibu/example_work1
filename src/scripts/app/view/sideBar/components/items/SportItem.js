import BurgerItem from 'app/view/sideBar/components/BurgerItem';

export default class SportItem extends BurgerItem {
  constructor(props) {
    super(props);
  }

	/**
	 * @param nextProps
	 */
  getHref() {
    const { comp } = this.props;
    const code = comp.get('code');
    return `/${code.toLowerCase()}`;
  }

	/**
	 * @returns {XML}
	 */
  render() {
    const { comp } = this.props;
    return (
      <li key={comp.id} className="c-burger-section__item">
        <Link to={`/${App.Globals.lang}/${this.getHref()}`} onClick={this.onNavigate.bind(this)}>
          <span>{_.titleize(App.Globals.Sport(comp.get('name')))}</span>
        </Link>
      </li>
    );
  }
}
