/**
 * Created by sandip on 7/9/17.
 */
import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {ServiceErrorInfo} from '../../dto/common.dto';


declare let cordova: any;

@Injectable()
export class GlobalizationService {

    constructor(private platform: Platform) {

    }

    getPreferredLanguage(successCallback: any, errorCallback: any): void {
        if ((typeof cordova !== 'undefined') && (this.platform.is('ios') || this.platform.is('android'))) {
            (<any>navigator).globalization.getPreferredLanguage(
                (result: any) => {
                    if (successCallback) {
                        successCallback(result.value);
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
    }

}
