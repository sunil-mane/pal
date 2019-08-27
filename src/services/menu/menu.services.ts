/**
 * Created by C00121 on 24/11/2016.
 */

import {Injectable} from '@angular/core';
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Observable} from 'rxjs/Rx'
import {Response} from "@angular/http";

@Injectable()
export class MenuService{

    private SERVICE_URL_MENU = '/api/Common/AppMenu';

    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {
    }

    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName) {
            if (serviceName === this.serviceConstants.COMMON_SERVICE_NAME_APP_MENU) {
                return this.getAppMenu(serviceContext.requestObject);
            }
        }
    }

    getAppMenu(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_MENU, reqData);
    }
}
