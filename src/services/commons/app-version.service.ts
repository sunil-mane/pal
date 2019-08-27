/**
 * Created by sandip on 27/09/17.
 */
import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';

declare let cordova: any;
declare let AppVersion: any;

@Injectable()
export class AppVersionService {

    constructor(private platform: Platform) {

    }

    version(): string {
        if ((typeof cordova !== 'undefined') && (this.platform.is('ios') || this.platform.is('android'))) {
            return AppVersion.version;
        }

        return null;
    }

    build(): string {
        if ((typeof cordova !== 'undefined') && (this.platform.is('ios') || this.platform.is('android'))) {
            return AppVersion.build;
        }

        return null;
    }

}
