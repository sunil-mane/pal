/**
 * Created by C00121 on 11/01/2017.
 */

import {Injectable} from '@angular/core';
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Observable} from 'rxjs/Rx'
import {Response} from "@angular/http";

@Injectable()
export class MessageContentService{

    private SERVICE_URL_MESSAGE_CONTENT = '/api/Common/MessageContent';

    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {
    }

    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName) {
            if (serviceName === this.serviceConstants.COMMON_SERVICE_NAME_MESSAGE_CONTENT) {
                return this.getMessageContent(serviceContext.requestObject);
            }
        }
    }

    getMessageContent(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_MESSAGE_CONTENT, reqData);
    }
}