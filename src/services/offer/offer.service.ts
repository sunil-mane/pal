import {Injectable} from '@angular/core';
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Observable} from 'rxjs/Rx';
import {Response} from "@angular/http";

@Injectable()
export class OfferService {

    private SERVICE_URL_OFFER_LIST = '/api/Offers';
    private SERVICE_URL_OFFER_GALLERIES = '/api/Offers/Galleries';
    private SERVICE_URL_OFFER_PARTNER_LOCATIONS = '/api/Offers/PartnerLocations';

    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {
    }

    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName) {
            if (serviceName === this.serviceConstants.OFFER_SERVICE_NAME_OFFER_LIST) {
                return this.offerList(serviceContext.requestObject);
            }
            else if (serviceName === this.serviceConstants.OFFER_SERVICE_NAME_GALLERIES) {
                return this.offerGalleries(serviceContext.requestObject);
            }
            else if (serviceName === this.serviceConstants.OFFER_SERVICE_NAME_PARTNER_LOCATIONS) {
                return this.partnerLocations(serviceContext.requestObject);
            }
        }
    }

    offerList(reqData: any): Observable<Response> {

        return this.httpService.postData(this.SERVICE_URL_OFFER_LIST, reqData);
    }

    offerGalleries(reqData: any): Observable<Response> {

        return this.httpService.postData(this.SERVICE_URL_OFFER_GALLERIES, reqData);
    }

    partnerLocations(reqData: any): Observable<Response> {

        return this.httpService.postData(this.SERVICE_URL_OFFER_PARTNER_LOCATIONS, reqData);
    }

}
