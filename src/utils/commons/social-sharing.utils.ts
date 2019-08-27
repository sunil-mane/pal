/**
 * Created by C00121 on 11/01/2017.
 */

import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {ServiceContext} from '../../services/commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {DataAccessService} from '../../services/commons/data.access.service';
import {SocialSharingService} from '../../services/commons/social-sharing.service';
import {MessageResponse, ServiceErrorInfo, MessageInfo} from '../../dto/common.dto';

@Injectable()
export class SocialSharingUtils {

    constructor(private socialSharing: SocialSharingService,
                private dataAccessService: DataAccessService,
                private serviceConstants: ServiceConstants){

    }

    share(options: any) {
        //let options = {
        //     message: 'mEngage Sharing', // not supported on some apps (Facebook, Instagram)
        //     //subject: 'mEngage', // fi. for email
        //    //files: ['www/resources/hybrid-flowchart.pdf'], // an array of filenames either locally or remotely
        //    // url: 'https://www.mercator.com/blog/how-evolving-distribution-models-connect-airlines-to-customers-at-a-greater-level',
        //     chooserTitle: 'Goal Achived ' // Android only, you can override the default share sheet title
        //}
        this.socialSharing.share(options,
            (data: any) => {
                // console.log('Social Sharing Response : '+ JSON.stringify(data));
            },
            (error: any) => {
                console.log('Social Sharing Error : '+ JSON.stringify(error));
            });
    }

    generateShareMessage(requestData: MessageInfo,successCallback: any, errorCallback: any) {
      
        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_COMMON,
            this.serviceConstants.COMMON_SERVICE_NAME_MESSAGE_CONTENT,
            requestData);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: MessageResponse = result.json();
                if (!response) {
                    response = new MessageResponse();
                    response.data = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                if (errorCallback) {
                    let errorInfo: ServiceErrorInfo = error.json();
                    errorCallback(errorInfo);
                }
            });
    }

}