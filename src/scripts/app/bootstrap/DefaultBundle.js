import Language from 'app/i18n/Language';
import DeferredBase from 'common/system/defer/Deferred.js';

export default class DefaultBundle extends DeferredBase {
  constructor() {
    super('DefaultBundle');
  }

  initialize() {
		// the first uri component is assumed to be the language
    const { pathname } = window.location;
    const normalized = pathname.replace(/^\/+|\/+$/g, '');

		// check for a language
    if (!_.isEmpty(normalized)) {
      const language = normalized.split('/')[0];
			// now we have a potential language code, we need a final
			// check that it is indeed one of our supported languages
      if (App.Config.locales[language]) {
        App.Globals.setLang(language, true);
        if (language === 'es-mx') {
					// load spanish moment locale for baja
          require('moment/locale/es.js');
        }
      }
    }

		// load language resource bundle
    Language.load().then((data) => {
      App.Globals.LOCALE = data;
      this.success();
    });
  }
}
