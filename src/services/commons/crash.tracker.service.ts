/**
 * Created by sandip on 10/04/17.
 */
import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';


declare let cordova: any;

@Injectable()
export class CrashTrackerService {

    constructor(private platform: Platform) {

    }

    sendCrash(logMessage: string): void {
        if (logMessage &&
            (typeof cordova !== 'undefined') &&
            (this.platform.is('ios') || this.platform.is('android'))) {

            (<any>window).fabric.Crashlytics.addLog(logMessage);
            (<any>window).fabric.Crashlytics.sendCrash();
        }
    }

    sendNonFatalCrash(logMessage: string, errorMessage?: string): void {
        if (logMessage &&
            (typeof cordova !== 'undefined') &&
            (this.platform.is('ios') || this.platform.is('android'))) {

            (<any>window).fabric.Crashlytics.addLog(logMessage);
            if (!errorMessage) {
                errorMessage = 'Error message';
            }
            (<any>window).fabric.Crashlytics.sendNonFatalCrash(errorMessage);
        }
    }

}
