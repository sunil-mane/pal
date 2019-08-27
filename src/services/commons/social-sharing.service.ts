/**
 * Created by C00121 on 10/01/2017.
 */

import {Injectable} from '@angular/core';


@Injectable()
export class SocialSharingService {


    constructor() {
    }

    share(options: any, onSuccess: any, onError: any): void  {
        // console.log('SocialSharing plugin call : ');
        if ((<any>window).plugins && (<any>window).plugins.socialsharing){
            (<any>window).plugins.socialsharing.shareWithOptions(options,onSuccess, onError);
        } else if (onError) {
            onError(null);
        }
    }

}
