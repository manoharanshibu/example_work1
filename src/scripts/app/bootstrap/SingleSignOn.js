import Deferred from 'common/system/defer/Deferred.js';
import model from 'common/model/SessionModel.js';
import MyBetCookie from 'app/bootstrap/MyBetCookie';

export default class SingleSignOn extends Deferred {
  constructor() {
    super('SingleSignOn');
    new MyBetCookie(App);
  }

  initialize() {
    const Cookie = model.Cookie;
    const triedSignOn = Cookie.triedSignOn;
    if (triedSignOn) {
      this.success();
      return;
    }
    Cookie.awaitSSO(this.success);
  }

	/**
	 *
	 */
  success() {
    console.log(`Bootstrap: ${this.name} - Success`);
    this.resolve();
  }
}
