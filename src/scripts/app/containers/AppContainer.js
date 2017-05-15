import React, { PropTypes, Component } from 'react';
import IntlContainer from 'app/containers/IntlContainer';

class AppContainer extends Component {
  constructor(props, context) {
    super(props, context);
    const data = localStorage.getItem('locale');
    this.state = JSON.parse(data);
  }

	/**
	 *
	 */
  componentWillMount() {
    App.bus.on('globals:langChanged', () => {
      const data = localStorage.getItem('locale');
      this.setState(JSON.parse(data));
    });
  }

	/**
	 * @returns {XML}
	 */
  render() {
    return (
      <IntlContainer {...this.state}>
        { this.props.children }
      </IntlContainer>
    );
  }
}

AppContainer.contextTypes = {
  history: React.PropTypes.object,
  location: React.PropTypes.object,
};

AppContainer.childContextTypes = {
  history: React.PropTypes.object,
  location: React.PropTypes.object,
};

export default AppContainer;
