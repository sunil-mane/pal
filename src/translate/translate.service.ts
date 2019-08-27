/**
 * Created by anjum on 03/01/17.
 */

import {Http} from '@angular/http';
import {TranslateStaticLoader} from 'ng2-translate';

export function MyTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}
