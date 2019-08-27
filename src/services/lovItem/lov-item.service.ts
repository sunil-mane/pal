/**
 * Created by sandip on 05/10/2017.
 */

import {Injectable} from '@angular/core';
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Observable} from 'rxjs/Rx'
import {Response} from "@angular/http";

@Injectable()
export class LovItemService {

    private SERVICE_URL_LOV_ITEM_SECURITY_QUESTIONS = '/api/LovItem/GetSecurityQuestions';
    private SERVICE_URL_LOV_ITEM_COUNTRY = '/api/LovItem/GetCountryLov';
    private SERVICE_URL_LOV_ITEM_STATE = '/api/LovItem/GetStateLov';
    private SERVICE_URL_LOV_ITEM_CITY = '/api/LovItem/GetCityLov';
    private SERVICE_URL_LOV_ITEM_NAME_SUFFIX = '/api/LovItem/GetNameSuffixLov';

    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {
    }

    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName) {
            if (serviceName === this.serviceConstants.LOV_ITEM_SERVICE_NAME_SECURITY_QUESTIONS) {
                return this.getSecurityQuestions(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.LOV_ITEM_SERVICE_NAME_COUNTRY) {
                return this.getCountryLov(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.LOV_ITEM_SERVICE_NAME_STATE) {
                return this.getStateLov(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.LOV_ITEM_SERVICE_NAME_CITY) {
                return this.getCityLov(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.LOV_ITEM_SERVICE_NAME_NAME_SUFFIX) {
                return this.getNameSuffixLov(serviceContext.requestObject);
            }
        }
    }

    getSecurityQuestions(reqData: any): Observable<Response> {
        return this.httpService.getData(this.SERVICE_URL_LOV_ITEM_SECURITY_QUESTIONS, reqData);
    }

    getCountryLov(reqData: any): Observable<Response> {
        return this.httpService.getData(this.SERVICE_URL_LOV_ITEM_COUNTRY, reqData);
    }

    getStateLov(reqData: any): Observable<Response> {
        return this.httpService.getData(this.SERVICE_URL_LOV_ITEM_STATE, reqData);
    }

    getCityLov(reqData: any): Observable<Response> {
        return this.httpService.getData(this.SERVICE_URL_LOV_ITEM_CITY, reqData);
    }

    getNameSuffixLov(reqData: any): Observable<Response> {
        return this.httpService.getData(this.SERVICE_URL_LOV_ITEM_NAME_SUFFIX, reqData);
    }
}
