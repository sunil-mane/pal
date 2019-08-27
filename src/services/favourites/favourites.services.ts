/**
 * Created by C00121 on 14/12/2016.
 */

import {Injectable} from '@angular/core';
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Observable} from 'rxjs/Rx'
import {Response} from "@angular/http";

@Injectable()
export class FavouritesService{

    private SERVICE_URL_FAV_LOCATIONS = '/api/Favorites/Locations';
    private SERVICE_URL_SET_FAV_OFFER = '/api/Favorites/Offer';
    private SERVICE_URL_SET_FAV_LOCATION = '/api/Favorites/Location';

    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {
    }

    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName) {
            if (serviceName === this.serviceConstants.FAVOURITES_SERVICE_NAME_LOCATIONS) {
                return this.getMyFavLocations(serviceContext.requestObject);
            }else if (serviceName === this.serviceConstants.FAVOURITES_SERVICE_NAME_SET_OFFERS) {
                return this.setOfferAsFavourite(serviceContext.requestObject);
            }else if (serviceName === this.serviceConstants.FAVOURITES_SERVICE_NAME_SET_LOCATION) {
                return this.setLocationAsFavourite(serviceContext.requestObject);
            }
        }
    }

    getMyFavLocations(reqData: any):Observable<Response>{
        return this.httpService.postData(this.SERVICE_URL_FAV_LOCATIONS, reqData);
    }

    setOfferAsFavourite(reqData: any):Observable<Response>{
        return this.httpService.postData(this.SERVICE_URL_SET_FAV_OFFER, reqData);
    }

    setLocationAsFavourite(reqData: any):Observable<Response>{
    return this.httpService.postData(this.SERVICE_URL_SET_FAV_LOCATION, reqData);
}
}
