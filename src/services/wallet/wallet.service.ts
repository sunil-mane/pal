/**
 * Created by C00121 on 05/01/2017.
 */

import {Injectable} from '@angular/core';
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Observable} from '../../../node_modules/rxjs/Rx'
import {Response} from "@angular/http";

@Injectable()
export class WalletService{

    private SERVICE_URL_VIRTUAL_CARD = '/api/Account/Wallet';
    private SERVICE_URL_QR_CODE = '/api/Common/QRCode';

    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {
    }


    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName) {
            if (serviceName === this.serviceConstants.WALLET_SERVICE_NAME_VIRTUAL_CARD) {
                return this.getVirtualCardData(serviceContext.requestObject);
            }else if (serviceName === this.serviceConstants.WALLET_SERVICE_NAME_QR_CODE) {
                return this.getQRCodeData(serviceContext.requestObject);
            }
        }
    }

    getVirtualCardData(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_VIRTUAL_CARD, reqData);
    }

    getQRCodeData(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_QR_CODE, reqData);
    }

}