/**
 * Created by anjum on 30/11/16.
 */

import {Injectable} from '@angular/core';
import {LoadingController, Loading} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';


export interface ILoaderParams {
    message?: string;
    time?: number;
    dismissOnPageChange?: boolean
}

@Injectable()
export class McfLoaderService {

    loader: Loading;

    constructor(private loadingCtrl: LoadingController,
                private translate: TranslateService) {
    }

    show(param: ILoaderParams) {
        this.loader = this.loadingCtrl.create({
            content: param.message || this.translate.instant('PLEASE_WAIT'),
            duration: param.time
            // dismissOnPageChange: param.dismissOnPageChange || true
        });

        this.loader.present()
            .then((result: any) => {
                // console.log('Present Loader: ' + JSON.stringify(result));
            }, (error: any) => {
                console.log('Present Loader Failed: ' + JSON.stringify(error));
            });
    }

    hide() {
        if (this.loader) {
            this.loader.dismiss()
                .then((result: any) => {
                    // console.log('Dismiss Loader: ' + JSON.stringify(result));
                    if (result == false) {
                        setTimeout(() => {
                            // console.log('Trying again to dismiss Loader');
                            this.loader.dismiss();
                        }, 1000);
                    }
                }, (error: any) => {
                    console.log('Dismiss Loader Failed: ' + JSON.stringify(error));
                });
        }
    }

}
