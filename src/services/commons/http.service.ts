import { Injectable } from '@angular/core';
import { Http, Response, ResponseOptions, ResponseOptionsArgs, ResponseType } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { TranslateService } from 'ng2-translate';
import { GlobalizationUtils } from '../../utils/commons/globalization.utils';
import { SessionUtils } from '../../utils/commons/session.utils';
import { ServiceErrorInfo, ServiceHeaderInfo } from '../../dto/common.dto';
import { ClientUtils } from "../../utils/commons/client.utils";
import { NetworkService } from "../../services/commons/network.service";
import { ServiceConstants } from '../../constants/service.constants';

@Injectable()
export class CustomHttpService {
    baseUrl: string;
    offlineMessage: string = null;
    constructor(private $http: Http,
        private networkService: NetworkService,
        private translate: TranslateService,
        private globalizationUtils: GlobalizationUtils,
        private sessionUtils: SessionUtils,
        private clientUtils: ClientUtils,
        private serviceConstants: ServiceConstants) {
        this.baseUrl = this.getBaseURL();
    }

    /**
     * Post data to service API
     * @param toURL
     * @param requestData
     * @param headerData
     * @param timeoutPromise
     * @returns {Observable<Response>}
     */
    postData(toURL: string,
        requestData: any,
        headerData?: ServiceHeaderInfo,
        timeoutPromise?: any): Observable<Response> {

        this.updateOfflineMessage();
        // let urlStr = this.getBaseURL() + toURL;
        let urlStr = '';
        if (toURL.indexOf('api/VoucherForRedemption') >= 0
            || toURL.indexOf('api/Vouchers') >= 0 || toURL.indexOf('api/Catalog/CreateRewardBooking') >= 0) {
            urlStr = 'https://uatcis.mercator.com/mercator.crm.api.cisd' + toURL;
        } else {
            urlStr = this.getBaseURL() + toURL;
        }
        if (this.networkService.isOnline()) {

            if (!requestData) {
                requestData = {};
            }

            let requestOptions: any = this.getRequestOptions(headerData, timeoutPromise);

            // console.log('HttpService Request URL:\n' + urlStr);
            // console.log('HttpService header object:\n' + JSON.stringify(headerData));
            // console.log('HttpService request object:\n' + JSON.stringify(requestData));

            return this.$http.post(urlStr, requestData, requestOptions);
        } else {
            return this.getOfflineResponse(urlStr);
        }
    }

    /**
     * Post data to service API
     * @param toURL
     * @param requestData
     * @param headerData
     * @param timeoutPromise
     * @returns {Observable<Response>}
     */
    putData(toURL: string,
        requestData: any,
        headerData?: ServiceHeaderInfo,
        timeoutPromise?: any): Observable<Response> {

        this.updateOfflineMessage();
        let urlStr = this.getBaseURL() + toURL;

        if (this.networkService.isOnline()) {

            if (!requestData) {
                requestData = {};
            }

            let requestOptions: any = this.getRequestOptions(headerData, timeoutPromise);

            // console.log('HttpService Request URL:\n' + urlStr);
            // console.log('HttpService header object:\n' + JSON.stringify(headerData));
            // console.log('HttpService request object:\n' + JSON.stringify(requestData));

            return this.$http.put(urlStr, requestData, requestOptions);
        } else {
            return this.getOfflineResponse(urlStr);
        }
    }

    /**
     * Get data to service API
     * @param toURL
     * @param requestData
     * @param headerData
     * @param timeoutPromise
     * @returns {Observable<Response>}
     */
    getData(toURL: string,
        requestData: any,
        headerData?: ServiceHeaderInfo,
        timeoutPromise?: any): Observable<Response> {
        console.log(toURL + "----" + JSON.stringify(requestData))
        this.updateOfflineMessage();
        let urlStr = '';
        if (toURL.indexOf('api/VoucherForRedemption') >= 0
            || toURL.indexOf('api/Vouchers') >= 0) {
            urlStr = 'https://uatcis.mercator.com/mercator.crm.api.cisd' + toURL;
        } else {
            urlStr = this.getBaseURL() + toURL;
        }
        console.log(urlStr);
        if (this.networkService.isOnline()) {

            if (requestData) {
                let keys = Object.keys(requestData);
                if (keys && (keys.length > 0)) {
                    let separator = '?';
                    for (let index = 0; index < keys.length; index++) {
                        let keyString = keys[index];
                        let keyValue = requestData[keyString];
                        if (keyValue || (keyValue == 0) || (keyValue == false)) {
                            urlStr = urlStr + separator + keyString + '=' + keyValue;
                            separator = '&';
                        }
                    }
                }
            }

            let requestOptions: any = this.getRequestOptions(headerData, timeoutPromise);

            // console.log('HttpService Request URL:\n' + urlStr);
            // console.log('HttpService header object:\n' + JSON.stringify(headerData));

            return this.$http.get(urlStr, requestOptions);
        } else {
            return this.getOfflineResponse(urlStr);
        }
    }

    getBaseURL(): string {
        let baseURL: string = this.baseUrl;
        if (this.clientUtils.isNullOrEmpty(this.baseUrl)) {
            baseURL = this.baseUrl = this.clientUtils.getBaseURL();
        }
        return baseURL;
    }

    getRequestOptions(headerData: ServiceHeaderInfo, timeoutPromise: any): any {

        if (!headerData) {
            headerData = new ServiceHeaderInfo();
        }

        let accessToken = this.sessionUtils.getAccessToken();
        if (accessToken) {
            headerData.Authorization = 'bearer ' + accessToken;
        }

        headerData['Content-Type'] = 'application/json';
        headerData.API_KEY = this.clientUtils.getWebApiKey();
        headerData.language = this.globalizationUtils.getAppLanguage();

        if (!timeoutPromise) {
            timeoutPromise = null;
        }

        return { headers: headerData, timeout: timeoutPromise };
    }

    getOfflineResponse(urlStr: string): Observable<Response> {
        let message = '';
        if (this.offlineMessage) {
            this.updateOfflineMessage();
            message = this.offlineMessage;
        }
        let errorBody: ServiceErrorInfo = new ServiceErrorInfo();
        errorBody.message = message;
        errorBody.code = 503;
        const optionsArgs: ResponseOptionsArgs = {
            body: errorBody,
            status: errorBody.code,
            type: ResponseType.Error,
            url: urlStr
        };
        const responseOptions: ResponseOptions = new ResponseOptions(optionsArgs);
        const response: Response = new Response(responseOptions);
        return Observable.throw(response);
    }

    updateOfflineMessage(): void {
        if (this.offlineMessage == null) {
            this.offlineMessage = this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION');
        }
    }

    /**
     * This will fetch data which reside locally e.g. json file
     * @returns {Observable<any>}
     */
    fetchLocalData(strURL: string): Observable<any> {
        return this.$http.get(strURL).map(res => res.json());
    }

}

