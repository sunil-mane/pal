/**
 * Created by sandip on 1/16/17.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx'
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Response} from "@angular/http";

@Injectable()
export class LocationNotificationService {

    private SERVICE_URL = '/api/PushNotification/Local';

    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {
    }

    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName) {
            if (serviceName === this.serviceConstants.LOCATION_NOTIFICATION_SERVICE_NAME_GET) {
                return this.getLocationNotifications(serviceContext.requestObject);
            }
        }
    }

    getLocationNotifications(reqData: any): Observable<Response> {
        return this.httpService.getData(this.SERVICE_URL, reqData);
    }
}
