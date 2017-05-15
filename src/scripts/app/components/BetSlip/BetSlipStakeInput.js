import React from 'react';
import { isTouchDevice } from 'app/routes/util/DeviceUtil';

export default class BetSlipStakeInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      typeNumeric: true,
    };
  }

  onKeyDown(event) {
    const charCode = (event.which) ? event.which : event.keyCode;

		// 48 to 57 digits
		// 13 enter
		// 8 backspace
		// 9 tab
		// 46 dot
		// 110 plus symbol
		// 190 dot
		// 188 comma
		// 37 to 40 arrow keys
		// 9 tab
		// 96 to 105 numpad numbers
    const validCharCodes = [8, 9, 13, 37, 38, 39, 40, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
      96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 190, 188];
    if (!validCharCodes.includes(charCode)) {
      event.preventDefault();
    }
  }

  validatePattern(event) {
    let amount = '';
    const val = event.currentTarget.value;
		// const decimalSeparator = this.getDecimalSeparator();
    const patternDot = /\d+(\.\d*)?/;
    const patternComma = /\d+(,\d*)?/;

    const isDotDecimalSeparator = (val.indexOf('.') >= val.indexOf(','));
    const decimalSeparator = isDotDecimalSeparator ? '.' : ',';
    const applicablePattern = isDotDecimalSeparator ? patternDot : patternComma;

    amount = applicablePattern.exec(val) ? applicablePattern.exec(val)[0] : amount;

		// check if entered too many decimals
    if (amount.indexOf(decimalSeparator) > 0) {
      const arr = amount.split(decimalSeparator);
      arr[1] = arr[1].substring(0, 2);
      amount = `${arr[0]}.${arr[1]}`;
    }

    if (parseFloat(amount) >= 1) {
      amount = amount.replace(/^0+/, '');
    }

    const { bet } = this.props;

    if (bet.rejection) {
      const status = bet.rejection.status.toLowerCase();
      if (status === 'min_stake' || status === 'max_stake') {
        bet.rejection = null;
      }
    }

    if (this.isCommaDecimalSeparator() && !isTouchDevice()) {
      amount = amount.replace('.', ',');
    }

    const stake = `${amount}`;
    this.props.onChange(bet, stake);
  }

  getDisplayableStake() {
    let { value } = this.props;

    if (isTouchDevice()) {
      return null;
    }

    if (typeof value === 'string') {
      if (this.isCommaDecimalSeparator()) {
        value = value.replace('.', ',');
      } else {
        value = value.replace(',', '.');
      }
    }


    return { value };
  }

  isCommaDecimalSeparator() {
    const lang = App.Globals.lang;
    const currentLocaleFormat = (0.1).toLocaleString(lang);
    const isLocalSeparatorComma = currentLocaleFormat.includes(',');

		// on touch devices we use type=number, which doesn't accept comma
		// separator because of:
		// https://www.w3.org/TR/html-markup/datatypes.html#common.data.float
    const canHaveComma = isLocalSeparatorComma && !isTouchDevice();
    return !!canHaveComma;
  }

  getDecimalSeparator() {
    return this.isCommaDecimalSeparator() ? ',' : '.';
  }

  render() {
		// To meet the requirements in MB-1949, we need to use the 'text'
		// in non-touch devices, and 'number' in touch devices
		// However,
		// See: https://www.w3.org/TR/html-markup/datatypes.html#common.data.float
    const type = isTouchDevice() ? 'number' : 'text';
    const needsComma = this.isCommaDecimalSeparator() && (type !== 'number');
    const placeholder = needsComma ? '0,00' : '0.00';
    const displayedStake = this.getDisplayableStake();

    return (
      <div>
        <input
          ref="input"
          disabled={this.props.disabled}
          {...displayedStake}
          type={type}
          onChange={::this.validatePattern}
          onKeyDown={::this.onKeyDown}
          placeholder={placeholder}
        />
      </div>
    );
  }
}

BetSlipStakeInput.displayName = 'BetSlipStakeInput';
