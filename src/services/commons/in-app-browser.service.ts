/**
 * Created by sandip on 26/03/17.
 */
import {Injectable} from '@angular/core';

declare let cordova: any;

@Injectable()
export class InAppBrowserService {

    constructor() {

    }

    show(url: string): void {
        if (typeof cordova !== 'undefined') {
            let browser = new cordova.InAppBrowser.open(url, "_blank", "location=no");
            browser.show();
        }
    }
}
