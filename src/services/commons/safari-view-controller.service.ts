/**
 * Created by sandip on 09/03/17.
 */
import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {ServiceErrorInfo} from '../../dto/common.dto';

declare let cordova: any;
declare let SafariViewController: any;

export class SafariViewControllerOptions {
    url?: string;
    hidden?: boolean;
    toolbarColor?: string;
    animated?: boolean;
    showDefaultShareMenuItem?: boolean;
    enterReaderModeIfAvailable?: boolean;
    tintColor?: string;
    transition?: string;
}

@Injectable()
export class SafariViewService {

    constructor(private platform: Platform) {

    }

    isAvailable(callback: any): void {
        if ((typeof cordova !== 'undefined') && (this.platform.is('ios') || this.platform.is('android'))) {
            SafariViewController.isAvailable(
                (available: boolean) => {
                    if (callback) {
                        callback(available);
                    }
                });
        }
        else {
            if (callback) {
                callback(false);
            }
        }
    }

    show(option: SafariViewControllerOptions, successCallback: any, errorCallback: any): void {
        this.isAvailable((available: boolean) => {
            if (available) {
                SafariViewController.show(option,
                    (result: any) => {
                        if (successCallback) {
                            successCallback(result);
                        }
                    }, (error: any) => {
                        if (errorCallback) {
                            errorCallback(error);
                        }
                    });
            } else {
                if (errorCallback) {
                    let error = new ServiceErrorInfo();
                    error.message = 'Platform does not support';
                    errorCallback(error);
                }
            }
        });
    }

    hide(successCallback: any, errorCallback: any) {
        this.isAvailable((available: boolean) => {
            if (available) {
                SafariViewController.hide(
                    (result: any) => {
                        if (successCallback) {
                            successCallback();
                        }
                    }, (error: any) => {
                        if (errorCallback) {
                            errorCallback(null);
                        }
                    });
            } else {
                if (errorCallback) {
                    let error = new ServiceErrorInfo();
                    error.message = 'Platform does not support';
                    errorCallback(error);
                }
            }
        });
    }

}
