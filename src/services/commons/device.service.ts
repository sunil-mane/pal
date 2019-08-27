/**
 * Created by C00124 on 22/12/2016.
 */

import {Injectable} from '@angular/core';
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Observable} from '../../../node_modules/rxjs/Rx.d'
import {Response} from "@angular/http";


@Injectable()
export class DeviceService {

    private SERVICE_URL_REGISTER = '/api/Device/Register';

    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {

    }

    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName && (serviceName === this.serviceConstants.DEVICE_SERVICE_NAME_REGISTER)) {
            return this.register(serviceContext.requestObject);
        }
    }

    register(reqData: any): Observable<Response> {

        return this.httpService.postData(this.SERVICE_URL_REGISTER, reqData);
    }
}
