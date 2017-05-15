import { password2, username as usernameVal } from 'common/util/RegEx';

// Client-specific form validators
//
// Warning! They can be statically exported, because
// App.Intl needs to be evaluated dynamically
const validators = () =>
	 ({
   username: [
				{ 'isLength:1': App.Intl('username.error.missing') },
				{ 'isLength:4': App.Intl('username.error.too_short') },
				{ rule: val => usernameVal.test(val), error: App.Intl('username.error.too_creative') },
   ],

   password: [
				{ 'isLength:1': App.Intl('password.error.missing') },
				{ 'isLength:6': App.Intl('password.error.too_short') },
				{ rule: val => password2.test(val), error: App.Intl('password.error.only_alpha_numeric') },
   ],
 });

export default validators;
