import './BurgerCheckBox.scss';
import userModel from 'sportsbook/model/UserPreferencesModel';

import {
	SCROLL_TO_TOP,
} from 'app/AppConstants';

class BurgerCheckBox extends React.Component {
  constructor(props) {
    super(props);

    this.onToggleSelected = ::this.onToggleSelected;
    this.onChangeSelected = ::this.onChangeSelected;
    this.onReset = ::this.onReset;
    const selected = userModel.hasCompetition(this.props.comp.id);
    this.state = { selected };
  }

	/**
	 * Fetch the competitions on mount
	 */
  componentDidMount() {
    userModel.Competitions.on('add remove', this.onChangeSelected);
    userModel.Competitions.on('reset', this.onReset);
  }

	/**
	 *
	 */
  componentWillUnmount() {
    userModel.Competitions.off('add remove', this.onChangeSelected);
    userModel.Competitions.off('reset', this.onReset);
  }

	/**
	 *
	 */
  onToggleSelected(e) {
    userModel.toggleCompetition(this.props.comp);
  }

	/**
	 * @param model
	 */
  onChangeSelected(model) {
    const { comp } = this.props;

    if (!model) {
      return;
    }
    if (model.id == comp.id) {
      this.updateState();
    }
  }

  onReset() {
    this.setState({ selected: false });
  }

	/**
	 * @param comp
	 * @returns {*}
	 */
  getItemName(comp) {
    const parent = comp.get('parent');
    let name = comp.get('name');
    name = _.titleize(name.replace(/_/g, ' '));
    if (parent && this.props.couponable && this.props.abbr) {
      const abbr = parent.get('name').substr(0, 3);
      name = `${name} (${abbr.toUpperCase()})`;
    }
    return name;
  }

	/**
	 *
	 */
  updateState() {
    const { comp } = this.props;
    const selected = userModel.hasCompetition(comp.id);
    this.setState({ selected });
    if (selected) {
      App.bus.trigger(SCROLL_TO_TOP);
    }
  }

	/**
	 * @returns {*}
	 */
  render() {
    const styles = { visibility: this.props.couponable ? 'visible' : 'hidden' };
    const { comp } = this.props;
    const id = _.uniqueId();
    return (
      <div className="c-burger-check-box" onClick={this.onToggleSelected}>
        <input id={id} type="checkbox" checked={this.state.selected} style={styles} />
        <label htmlFor={id} className="u-margin--left" style={styles} title={App.Intl('burger_menu.add_to_coupon')} />
        <div className="c-burger-check-box__label-text">{ this.getItemName(comp) }</div>
        <span className="lozenge g-lozenge--primary u-float-right">{ this.props.size }</span>
      </div>
    );
  }
}

BurgerCheckBox.displayName = 'SelectedComp';
BurgerCheckBox.defaultProps = {
  comp: null,
};

export default BurgerCheckBox;
