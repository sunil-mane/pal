/**
 * Created by sandip on 1/5/17.
 */
import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {Events} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {DataAccessService} from '../../services/commons/data.access.service';
import {ServiceContext} from '../../services/commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {AppConstants} from '../../constants/app.constants';
import {OfferResquest,OfferResponse,OfferInfo} from '../../dto/offers.dto';
import {PageInfo,ServiceErrorInfo} from '../../dto/common.dto';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {SessionUtils} from '../../utils/commons/session.utils';
import {UserAddressUtils} from '../../utils/commons/user-address.utils';


@Injectable()
export class OfferUtils {

    constructor(private events: Events,
                private dataAccessService: DataAccessService,
                private serviceConstants: ServiceConstants,
                private appConstants: AppConstants,
                private translate: TranslateService,
                private configUtils: ConfigUtils,
                private sessionUtils: SessionUtils,
                private userAddressUtils: UserAddressUtils) {

    }

    getRecommendedOfferContext(): Array<OfferInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.recommendedOffers;
        if (!contextObj) {
            contextObj = new Array<OfferInfo>();
        }
        return contextObj;
    }

    saveRecommendedOfferContext(contextObj: Array<OfferInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.recommendedOffers = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaRecommendedOfferContext(): void {
        let contextObj = new Array<OfferInfo>();
        this.saveRecommendedOfferContext(contextObj);
    }

    getFavoriteOfferContext(): Array<OfferInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.favoriteOffers;
        if (!contextObj) {
            contextObj = new Array<OfferInfo>();
        }
        return contextObj;
    }

    saveFavoriteOfferContext(contextObj: Array<OfferInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.favoriteOffers = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaFavoriteOfferContext(): void {
        let contextObj = new Array<OfferInfo>();
        this.saveFavoriteOfferContext(contextObj);
    }

    getNearbyOfferContext(): Array<OfferInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.nearbyOffers;
        if (!contextObj) {
            contextObj = new Array<OfferInfo>();
        }
        return contextObj;
    }

    saveNearbyOfferContext(contextObj: Array<OfferInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.nearbyOffers = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaNearbyOfferContext(): void {
        let contextObj = new Array<OfferInfo>();
        this.saveNearbyOfferContext(contextObj);
    }

    fetchRecommendedOffers(successCallback: any, errorCallback: any): void {

        let recommendedOffers = new OfferInfo();
        recommendedOffers.active = 'Y';
        recommendedOffers.featured = 'Y';
        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo = this.sessionUtils.getMemberInfo();
            recommendedOffers.memberUid = memberInfo.memUID;
        }

        let pageInfo: PageInfo = new PageInfo();
        pageInfo.startIndex = 1;
        pageInfo.endIndex = this.configUtils.getNumOfRecordsForKey(
                                    this.serviceConstants.NO_OF_RECOMMENDED_OFFERS);

        let recommendedOffersRequest = new OfferResquest();
        recommendedOffersRequest.data = recommendedOffers;
        recommendedOffersRequest.pageInfo = pageInfo;

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_OFFER,
            this.serviceConstants.OFFER_SERVICE_NAME_OFFER_LIST,
            recommendedOffersRequest);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: OfferResponse = result.json();
                if (!response) {
                    response = new OfferResponse();
                    response.data = [];
                }
                this.saveRecommendedOfferContext(response.data);
                this.events.publish(this.appConstants.EVENT_RECOMMENDED_OFFERS_CHANGED);
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                if (errorCallback) {
                    let errorInfo: ServiceErrorInfo = error.json();
                    errorCallback(errorInfo);
                }
            });
    }

    fetchFavoriteOffers(successCallback: any, errorCallback: any): void {

        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo = this.sessionUtils.getMemberInfo();
            let recommendedOffers = new OfferInfo();
            recommendedOffers.active = 'Y';
            recommendedOffers.memberUid = memberInfo.memUID;
            recommendedOffers.isFavorite = 'Y';

            let pageInfo: PageInfo = new PageInfo();
            // pageInfo.startIndex = 1;
            // pageInfo.endIndex = this.configUtils.getNumOfRecordsForKey(
            //                             this.serviceConstants.NO_OF_FAVOURITE_OFFERS);

            let recommendedOffersRequest: OfferResquest = new OfferResquest();
            recommendedOffersRequest.data = recommendedOffers;
            recommendedOffersRequest.pageInfo = pageInfo;

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_OFFER,
                this.serviceConstants.OFFER_SERVICE_NAME_OFFER_LIST,
                recommendedOffersRequest);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: OfferResponse = result.json();
                    if (!response) {
                        response = new OfferResponse();
                        response.data = [];
                    }
                    this.saveFavoriteOfferContext(response.data);
                    this.events.publish(this.appConstants.EVENT_FAVORITE_OFFERS_CHANGED);
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
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = this.translate.instant('YOU_ARE_NOT_LOGGED_IN');
                errorCallback(error);
            }
        }
    }

    fetchOffersNearBy(successCallback: any, errorCallback: any): void {

        let geocodes = this.userAddressUtils.getUserAddressContext();
        if (geocodes && (geocodes.length > 0) && geocodes[0].geometry && geocodes[0].geometry.location) {

            let offersByLocation = new OfferInfo();
            offersByLocation.active = 'Y';
            offersByLocation.latitude = geocodes[0].geometry.location.lat;
            offersByLocation.longitude = geocodes[0].geometry.location.lng;
            if (this.sessionUtils.isUserLoggedIn()) {
                let memberInfo = this.sessionUtils.getMemberInfo();
                offersByLocation.memberUid = memberInfo.memUID;
            }

            let pageInfo: PageInfo = new PageInfo();
            pageInfo.startIndex = 1;
            pageInfo.endIndex = this.configUtils.getNumOfRecordsForKey(
                                        this.serviceConstants.NO_OF_NEARBY_OFFERS);

            let offersByLocationRequest = new OfferResquest();
            offersByLocationRequest.data = offersByLocation;
            offersByLocationRequest.pageInfo = pageInfo;

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_OFFER,
                this.serviceConstants.OFFER_SERVICE_NAME_PARTNER_LOCATIONS,
                offersByLocationRequest);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: OfferResponse = result.json();
                    if (!response) {
                        response = new OfferResponse();
                        response.data = [];
                    }
                    this.saveNearbyOfferContext(response.data);
                    this.events.publish(this.appConstants.EVENT_NEARBY_OFFERS_CHANGED);
                    if (successCallback) {
                        successCallback(response);
                    }
                }, (error: Response) => {
                    if (errorCallback) {
                        let errorInfo: ServiceErrorInfo = error.json();
                        errorCallback(errorInfo);
                    }
                });
        }
    }

    fetchAllOffers(startIndex: number,
                   endIndex: number,
                   offerInfo: OfferInfo,
                   successCallback: any,
                   errorCallback: any) {

        let pageInfo: PageInfo = new PageInfo();
        pageInfo.startIndex = startIndex;
        pageInfo.endIndex = endIndex;

        let offersRequest: OfferResquest = new OfferResquest();
        offersRequest.data = offerInfo;
        offersRequest.pageInfo = pageInfo;

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_OFFER,
            this.serviceConstants.OFFER_SERVICE_NAME_OFFER_LIST,
            offersRequest);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: OfferResponse = result.json();
                if (!response) {
                    response = new OfferResponse();
                    response.data = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                if (errorCallback) {
                    let errorInfo: ServiceErrorInfo = error.json();
                    errorCallback(errorInfo);
                }
            });
    }

    fetchOffersPartnerLocation(addressId: number,
                               startIndex: number,
                               endIndex: number,
                               successCallback: any,
                               errorCallback: any) {
        let offersRequestData = new OfferInfo();
        offersRequestData.addressId = addressId;
        offersRequestData.active = 'Y';

        let pageInfo:PageInfo = new PageInfo();
        pageInfo.startIndex = startIndex;
        pageInfo.endIndex = endIndex;

        let offersRequest:OfferResquest = new OfferResquest();
        offersRequest.data = offersRequestData;
        offersRequest.pageInfo = pageInfo;

        let serviceContext:ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_OFFER,
            this.serviceConstants.OFFER_SERVICE_NAME_PARTNER_LOCATIONS,
            offersRequest);

        this.dataAccessService.call(serviceContext)
            .subscribe((result:Response) => {
                let response: OfferResponse = result.json();
                if (!response) {
                    response = new OfferResponse();
                    response.data = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                if (errorCallback) {
                    let errorInfo: ServiceErrorInfo = error.json();
                    errorCallback(errorInfo);
                }
            });
    }

    setOfferAsFavourite(offerId: number, isFav: boolean, successCallback: any, errorCallback: any) {

        let shouldFavRequest = true;
        if (!isFav) {
            const maxLimit = this.configUtils.getNumOfRecordsForKey(this.serviceConstants.NO_OF_FAVOURITE_OFFERS);
            const offers = this.getFavoriteOfferContext();
            shouldFavRequest = (offers.length < maxLimit);
        }
        if (shouldFavRequest) {
            let memberInfo = this.sessionUtils.getMemberInfo();
            let favOfferInfo = new OfferInfo();
            favOfferInfo.offerId = offerId;
            // favOfferInfo.favouriteOfferId = offerId;
            favOfferInfo.memberUid = memberInfo.memUID;
            favOfferInfo.active = isFav ? 'N' : 'Y';

            let pageInfo: PageInfo = new PageInfo();
            let favouriteOffersRequest = new OfferResquest();
            favouriteOffersRequest.data = favOfferInfo;
            favouriteOffersRequest.pageInfo = pageInfo;

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_FAVOURITES,
                this.serviceConstants.FAVOURITES_SERVICE_NAME_SET_OFFERS,
                favouriteOffersRequest);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: OfferResponse = result.json();
                    if (!response) {
                        response = new OfferResponse();
                        response.data = [];
                    }
                    this.fetchOffersNearBy(null, null);
                    this.fetchRecommendedOffers(null, null);
                    this.fetchFavoriteOffers(null, null);
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
            let error: ServiceErrorInfo = new ServiceErrorInfo();
            error.message = this.translate.instant('FAVOURITES_OFFERS_LIMIT_REACHED');
            errorCallback(error);
        }
    }
}
