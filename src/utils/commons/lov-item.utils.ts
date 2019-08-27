/**
 * Created by sandip on 10/05/17.
 */
import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {Events} from 'ionic-angular';
import {SecurityQuestionLov, CountryLov, StateLov, CityLov, NameSuffixLov} from '../../dto/lov-item.dto';
import {ServiceErrorInfo} from '../../dto/common.dto';
import {DataAccessService} from '../../services/commons/data.access.service';
import {ServiceContext} from '../../services/commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {AppConstants} from '../../constants/app.constants';


@Injectable()
export class LovItemUtils {

    constructor(private events: Events,
                private appConstants: AppConstants,
                private dataAccessService: DataAccessService,
                private serviceConstants: ServiceConstants) {

    }

    getSecurityQuestions(successCallback: any, errorCallback: any): void {

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_LOV_ITEM,
            this.serviceConstants.LOV_ITEM_SERVICE_NAME_SECURITY_QUESTIONS,
            null);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: Array<SecurityQuestionLov> = result.json();
                if (!response) {
                    response = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }

    getCountryLov(successCallback: any, errorCallback: any): void {

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_LOV_ITEM,
            this.serviceConstants.LOV_ITEM_SERVICE_NAME_COUNTRY,
            null);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: Array<CountryLov> = result.json();
                if (!response) {
                    response = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }

    getStateLov(countryCode: string, successCallback: any, errorCallback: any): void {

        if (countryCode) {
            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_LOV_ITEM,
                this.serviceConstants.LOV_ITEM_SERVICE_NAME_STATE,
                {countryCode: countryCode});

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: Array<StateLov> = result.json();
                    if (!response) {
                        response = [];
                    }
                    if (successCallback) {
                        successCallback(response);
                    }
                }, (error: Response) => {
                    let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                    if (error) {
                        errorInfo = error.json();
                        errorInfo.code = error.status;
                    }
                    if (errorCallback) {
                        errorCallback(errorInfo);
                    }
                    if (errorInfo.code == 401) {
                        this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                    }
                });
        } else {
            if (errorCallback) {
                errorCallback(null);
            }
        }
    }

    getCityLov(countryCode: string, successCallback: any, errorCallback: any): void {

        if (countryCode) {
            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_LOV_ITEM,
                this.serviceConstants.LOV_ITEM_SERVICE_NAME_CITY,
                {countryCode: countryCode});

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: Array<CityLov> = result.json();
                    if (!response) {
                        response = [];
                    }
                    if (successCallback) {
                        successCallback(response);
                    }
                }, (error: Response) => {
                    let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                    if (error) {
                        errorInfo = error.json();
                        errorInfo.code = error.status;
                    }
                    if (errorCallback) {
                        errorCallback(errorInfo);
                    }
                    if (errorInfo.code == 401) {
                        this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                    }
                });
        } else {
            if (errorCallback) {
                errorCallback(null);
            }
        }
    }

    getNameSuffixLov(successCallback: any, errorCallback: any): void {

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_LOV_ITEM,
            this.serviceConstants.LOV_ITEM_SERVICE_NAME_NAME_SUFFIX,
            null);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: Array<NameSuffixLov> = result.json();
                if (!response) {
                    response = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }
}
