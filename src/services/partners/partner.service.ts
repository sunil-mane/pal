/**
 * Created by C00121 on 05/12/2016.
 */

import {Injectable} from '@angular/core';
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Observable} from '../../../node_modules/rxjs/Rx.d'
import {Response} from "@angular/http";

@Injectable()
export class PartnerService{

    private SERVICE_URL_PARTNERS_BY_LOCATION = '/api/Partner/Locations';
    private SERVICE_URL_FEATURED_PARTNERS = '/api/Partner/Featured';
    private SERVICE_URL_LOCATION_CHECKIN = '/api/Checkin';
    private SERVICE_URL_VOUCHERS = '/api/VoucherForRedemption';
    private SERVICE_URL_MYVOUCHERS = '/api/Vouchers';
    private SERVICE_URL_REDEEM_VOUCHERS = '/api/Catalog/CreateRewardBooking';

    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {
    }

    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName) {
            if (serviceName === this.serviceConstants.PARTNER_SERVICE_NAME_NEARBY_PARTNERS) {
                return this.getPartnersNearBy(serviceContext.requestObject);
            }else if (serviceName === this.serviceConstants.PARTNER_SERVICE_NAME_FEATURED_PARTNERS) {
                return this.getFeaturedPartners(serviceContext.requestObject);
            }else if (serviceName === this.serviceConstants.PARTNER_LOCATION_SERVICE_NAME_CHECK_IN) {
                return this.locationCheckIn(serviceContext.requestObject);
            }else if(serviceName === this.serviceConstants.SERVICE_NAME_VOUCHERS) {
                return this.getVouchers(serviceContext.requestObject);
            }else if(serviceName === this.serviceConstants.SERVICE_NAME_MYVOUCHER) {
                return this.getMyVouchers(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.SERVICE_NAME_REDEEM_VOUCHER) {
                return this.redeemVoucher(serviceContext.requestObject);
            }
        }
    }

    getPartnersNearBy(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_PARTNERS_BY_LOCATION, reqData);
    }

    locationCheckIn(reqData: any):Observable<Response>{
        return this.httpService.postData(this.SERVICE_URL_LOCATION_CHECKIN, reqData);
    }

    getFeaturedPartners(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_FEATURED_PARTNERS, reqData);
    }

    getVouchers(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_VOUCHERS, reqData);
    }
    getMyVouchers(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_MYVOUCHERS, reqData);
    }
    redeemVoucher(reqData: any): Observable<Response> {
        return this.httpService.postData(this.SERVICE_URL_REDEEM_VOUCHERS, reqData);
    }

}
