import React from 'react';
import App from './app';
import { shallow } from 'enzyme';

describe('app.test', () => {
  it('should render test component', () => {
    shallow(<App />).hasClass('foo');
  });
});

