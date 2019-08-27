/**
 * Created by sandip on 1/9/17.
 */
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Events } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { DataAccessService } from '../../services/commons/data.access.service';
import { ServiceContext } from '../../services/commons/context.service';
import { ServiceConstants } from '../../constants/service.constants';
import { AppConstants } from '../../constants/app.constants';
import { PartnerLocationsResponse, PartnerLocationInfo, PartnerLocationsRequest, VouchersInfo, MyVoucherRequest, redeemVoucherRequest } from '../../dto/partners.dto';
import { PartnerInfo, PartnerResponse } from '../../dto/partners.dto';
import { IndustryTypeInfo, IndustryTypeResponse } from '../../dto/partners.dto';
import { CheckinInfo, CheckinRequest } from '../../dto/partners.dto';
import { PageInfo, ServiceErrorInfo } from '../../dto/common.dto';
import { ConfigUtils } from './config.utils';
import { SessionUtils } from './session.utils';
import { UserAddressUtils } from './user-address.utils';
import { ClientUtils } from './client.utils';


@Injectable()
export class PartnerUtils {

    constructor(private events: Events,
        private dataAccessService: DataAccessService,
        private serviceConstants: ServiceConstants,
        private appConstants: AppConstants,
        private translate: TranslateService,
        private configUtils: ConfigUtils,
        private sessionUtils: SessionUtils,
        private userAddressUtils: UserAddressUtils,
        private clientUtils: ClientUtils) {

    }

    getFeaturedPartnerContext(): Array<PartnerInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.featuredPartners;
        if (!contextObj) {
            contextObj = new Array<PartnerInfo>();
        }
        return contextObj;
    }

    saveFeaturedPartnerContext(contextObj: Array<PartnerInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.featuredPartners = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearFeaturedPartnerContext(): void {
        let contextObj = new Array<PartnerInfo>();
        this.saveFeaturedPartnerContext(contextObj);
    }

    getFavoritePartnerLocationContext(): Array<PartnerLocationInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.favoritePartnerLocations;
        if (!contextObj) {
            contextObj = new Array<PartnerLocationInfo>();
        }
        return contextObj;
    }

    saveFavoritePartnerLocationContext(contextObj: Array<PartnerLocationInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.favoritePartnerLocations = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearFavoritePartnerLocationContext(): void {
        let contextObj = new Array<PartnerLocationInfo>();
        this.saveFavoritePartnerLocationContext(contextObj);
    }

    getNearbyPartnerLocationContext(): Array<PartnerLocationInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.nearbyPartnerLocations;
        if (!contextObj) {
            contextObj = new Array<PartnerLocationInfo>();
        }
        return contextObj;
    }

    saveNearbyPartnerLocationContext(contextObj: Array<PartnerLocationInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.nearbyPartnerLocations = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearNearbyPartnerLocationContext(): void {
        let contextObj = new Array<PartnerLocationInfo>();
        this.saveNearbyPartnerLocationContext(contextObj);
    }

    fetchFeaturedPartners(successCallback: any, errorCallback: any): void {

        this.fetchPartnersByCode(null, 'P', successCallback, errorCallback);
    }

    fetchPartnersByCode(partnerCode: string, partnerType: string, successCallback: any, errorCallback: any): void {

        let requestData = new PartnerInfo();
        if (partnerCode) {
            requestData.partnerCode = partnerCode;
        }
        if (partnerType) {
            requestData.partnerType = partnerType;
        }
        requestData.partnerActive = 'Y';
        requestData.isMengage = 'Y';
        requestData.start = 1;
        requestData.end = this.configUtils.getNumOfRecordsForKey(
            this.serviceConstants.NO_OF_FEATURED_PARTNERS);

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_PARTNER,
            this.serviceConstants.PARTNER_SERVICE_NAME_FEATURED_PARTNERS,
            requestData);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: PartnerResponse = result.json();
                if (!response) {
                    response = new PartnerResponse();
                    response.data = [];
                }
                if (!partnerCode) {
                    this.saveFeaturedPartnerContext(response.data);
                    this.events.publish(this.appConstants.EVENT_FEATURED_PARTNERS_CHANGED);
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

    fetchFavoritePartnerLocations(successCallback: any, errorCallback: any): void {

        if (this.sessionUtils.isUserLoggedIn()) {

            let memberInfo = this.sessionUtils.getMemberInfo();
            let requestData = new PartnerLocationInfo();
            requestData.memberUid = memberInfo.memUID;
            requestData.isFavorite = 'Y';
            requestData.active = 'Y';

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_PARTNER,
                this.serviceConstants.PARTNER_SERVICE_NAME_NEARBY_PARTNERS,
                requestData);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: PartnerLocationsResponse = result.json();
                    if (!response) {
                        response = new PartnerLocationsResponse();
                        response.data = [];
                    }
                    this.saveFavoritePartnerLocationContext(response.data);
                    this.events.publish(this.appConstants.EVENT_FAVORITE_PARTNER_LOCATIONS_CHANGED);
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

    fetchAllPartners(startIndex: number,
        endIndex: number,
        searchKey: string,
        industryTypeCode: string,
        successCallback: any,
        errorCallback: any) {

        let requestData = new PartnerInfo();
        // requestData.partnerCode = '';
        // requestData.partnerType = '';
        requestData.partnerName = searchKey;
        requestData.industryType = industryTypeCode;
        requestData.partnerActive = 'Y';
        requestData.isMengage = 'Y';
        requestData.start = startIndex;
        requestData.end = endIndex;

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_PARTNER,
            this.serviceConstants.PARTNER_SERVICE_NAME_FEATURED_PARTNERS,
            requestData);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: PartnerResponse = result.json();
                if (!response) {
                    response = new PartnerResponse();
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

    fetchPartnerLocationsNearBy(successCallback: any, errorCallback: any): void {

        let geocodes = this.userAddressUtils.getUserAddressContext();
        if (geocodes && (geocodes.length > 0) && geocodes[0].geometry && geocodes[0].geometry.location) {

            let requestData = new PartnerLocationInfo();
            requestData.active = 'Y';
            requestData.latitude = geocodes[0].geometry.location.lat;
            requestData.longitude = geocodes[0].geometry.location.lng;
            requestData.start = 1;
            requestData.end = this.configUtils.getNumOfRecordsForKey(
                this.serviceConstants.NO_OF_NEARBY_PARTNER_STORES);

            if (this.sessionUtils.isUserLoggedIn()) {
                let memberInfo = this.sessionUtils.getMemberInfo();
                requestData.memberUid = memberInfo.memUID;
            }

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_PARTNER,
                this.serviceConstants.PARTNER_SERVICE_NAME_NEARBY_PARTNERS,
                requestData);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: PartnerLocationsResponse = result.json();
                    if (!response) {
                        response = new PartnerLocationsResponse();
                        response.data = [];
                    }
                    this.saveNearbyPartnerLocationContext(response.data);
                    this.events.publish(this.appConstants.EVENT_NEARBY_PARTNER_LOCATIONS_CHANGED);
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
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = this.translate.instant('YOU_ARE_NOT_LOGGED_IN');
                errorCallback(error);
            }
        }
    }

    fetchAllPartnerLocations(startIndex: number,
        endIndex: number,
        searchKey: string,
        successCallback: any,
        errorCallback: any) {

        let requestData = new PartnerLocationInfo();
        requestData.active = 'Y';
        requestData.searchString = searchKey;
        requestData.start = startIndex;
        requestData.end = endIndex;

        let geocodes = this.userAddressUtils.getUserAddressContext();
        if (geocodes && (geocodes.length > 0) && geocodes[0].geometry && geocodes[0].geometry.location) {
            requestData.latitude = geocodes[0].geometry.location.lat;
            requestData.longitude = geocodes[0].geometry.location.lng;
        }

        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo = this.sessionUtils.getMemberInfo();
            requestData.memberUid = memberInfo.memUID;
        }

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_PARTNER,
            this.serviceConstants.PARTNER_SERVICE_NAME_NEARBY_PARTNERS,
            requestData);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: PartnerLocationsResponse = result.json();
                if (!response) {
                    response = new PartnerLocationsResponse();
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

    fetchAllVouchers(startIndex: number,
        endIndex: number,
        searchKey: string,
        successCallback: any,
        errorCallback: any) {

        let requestData = new VouchersInfo();
        requestData.searchKey = searchKey;
        // requestData.start = startIndex;
        // requestData.end = endIndex;

        if (this.sessionUtils.isUserLoggedIn()) {
            // let memberInfo = this.sessionUtils.getMemberInfo();
            // requestData.memberUid = memberInfo.memUID;
        }

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_VOUCHER,
            this.serviceConstants.SERVICE_NAME_VOUCHERS,
            requestData);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: PartnerLocationsResponse = result.json();
                if (!response) {
                    response = new PartnerLocationsResponse();
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

    fetchMyVouchers(data:any, successCallback: any, errorCallback: any) {
        let requestData = new MyVoucherRequest();
        if (data == 'N')
            requestData.utilized = 'N';
        let memberInfo = this.sessionUtils.getMemberInfo();
        if (this.sessionUtils.isUserLoggedIn()) {
            requestData.personId = memberInfo.personId;
            requestData.activeCardNumber = memberInfo.activeCardNo;
        }
        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_VOUCHER,
            this.serviceConstants.SERVICE_NAME_MYVOUCHER,
            requestData);
        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: any = result.json();
                if (!response) {
                    response = new PartnerLocationsResponse();
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
    redeemVouchers(voucher: any, successCallback: any, errorCallback: any) {
        let requestData = new redeemVoucherRequest();
        requestData.partnerCode = voucher.partnerCode;
        requestData.activityDate = new Date();
        requestData.numberOfActivityUnits = 1;
        requestData.isQuoteOnly = 'N';
        requestData.activityIdentifier = voucher.activityCode;
        requestData.activityType = voucher.activityType
        let memberInfo = this.sessionUtils.getMemberInfo();
        if (this.sessionUtils.isUserLoggedIn()) {
            requestData.activeCardNo = memberInfo.activeCardNo;
        }
        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_VOUCHER,
            this.serviceConstants.SERVICE_NAME_REDEEM_VOUCHER,
            requestData);
        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: any = result.json();
                if (!response) {
                    response = new PartnerLocationsResponse();
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
    saveMyVouchers(contextObj: any): void {
        let rootContext: any = this.sessionUtils.getRootContext();
        rootContext.myvouchers = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }
    getMyVouchersContext(): any {
        let rootContext: any = this.sessionUtils.getRootContext();
        let contextObj = rootContext.myvouchers;
        if (!contextObj) {
            contextObj = new Array<any>();
        }
        return contextObj;
    }
    fetchAllIndustryTypes(successCallback: any, errorCallback: any) {

        let requestData = new IndustryTypeInfo();
        requestData.active = 'Y';
        requestData.partnerActive = 'Y';
        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_COMMON,
            this.serviceConstants.COMMON_SERVICE_NAME_INDUSTRY_TYPES,
            requestData);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: IndustryTypeResponse = result.json();
                if (!response) {
                    response = new IndustryTypeResponse();
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

    setLocationAsFavourite(addressId: number, isFav: boolean, successCallback: any, errorCallback: any) {

        if (this.sessionUtils.isUserLoggedIn()) {
            let shouldFavRequest = true;
            if (!isFav) {
                const maxLimit = this.configUtils.getNumOfRecordsForKey(
                    this.serviceConstants.NO_OF_FAVOURITE_PARTNER_STORES);
                const locations = this.getFavoritePartnerLocationContext();
                shouldFavRequest = (locations.length < maxLimit);
            }
            if (shouldFavRequest == true) {
                let memberInfo = this.sessionUtils.getMemberInfo();
                let favLocationInfo = new PartnerLocationInfo();
                favLocationInfo.addressId = addressId;
                favLocationInfo.memberUid = memberInfo.memUID;
                favLocationInfo.active = (isFav == true) ? 'N' : 'Y';

                let pageInfo: PageInfo = new PageInfo();
                let requestData = new PartnerLocationsRequest();
                requestData.data = favLocationInfo;
                requestData.pageInfo = pageInfo;

                let serviceContext: ServiceContext = new ServiceContext(
                    this.serviceConstants.SERVICE_CONTEXT_NAME_FAVOURITES,
                    this.serviceConstants.FAVOURITES_SERVICE_NAME_SET_LOCATION,
                    requestData);

                this.dataAccessService.call(serviceContext)
                    .subscribe((result: Response) => {
                        let response: PartnerLocationsResponse = result.json();
                        if (!response) {
                            response = new PartnerLocationsResponse();
                            response.data = [];
                        }
                        this.fetchPartnerLocationsNearBy(null, null);
                        this.fetchFavoritePartnerLocations(null, null);
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
                    let error: ServiceErrorInfo = new ServiceErrorInfo();
                    error.message = this.translate.instant('FAVOURITES_LOCATIONS_LIMIT_REACHED');
                    errorCallback(error);
                }
            }
        }
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = this.translate.instant('YOU_ARE_NOT_LOGGED_IN');
                errorCallback(error);
            }
        }
    }


    fetchPartnerByLocations(offerId: number,
        partnerCode: string,
        start: number,
        end: number,
        successCallback: any,
        errorCallback: any): void {

        let requestData = new PartnerLocationInfo();
        requestData.active = 'Y';
        requestData.start = start;
        requestData.end = end;

        if (offerId) {
            requestData.offerId = offerId;
        }

        if (partnerCode) {
            requestData.partnerCode = partnerCode;
        }

        let geocodes = this.userAddressUtils.getUserAddressContext();
        if (geocodes && (geocodes.length > 0) && geocodes[0].geometry && geocodes[0].geometry.location) {
            requestData.latitude = geocodes[0].geometry.location.lat;
            requestData.longitude = geocodes[0].geometry.location.lng;
        }

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_PARTNER,
            this.serviceConstants.PARTNER_SERVICE_NAME_NEARBY_PARTNERS,
            requestData);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: PartnerLocationsResponse = result.json();
                if (!response) {
                    response = new PartnerLocationsResponse();
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

    locationCheckIn(addressId: number, successCallback: any, errorCallback: any) {

        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo = this.sessionUtils.getMemberInfo();
            let checkinInfo = new CheckinInfo();
            checkinInfo.memberUid = memberInfo.memUID;
            checkinInfo.addressId = addressId;
            checkinInfo.active = 'Y';

            let checkInRequest = new CheckinRequest();
            checkInRequest.data = checkinInfo;

            let serviceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_PARTNER,
                this.serviceConstants.PARTNER_LOCATION_SERVICE_NAME_CHECK_IN,
                checkInRequest);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: PartnerLocationsResponse = result.json();
                    if (!response) {
                        response = new PartnerLocationsResponse();
                        response.data = [];
                    }
                    this.fetchPartnerLocationsNearBy(null, null);
                    this.fetchFavoritePartnerLocations(null, null);
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

    shouldCheckin(lastCheckInTime: string): boolean {
        if (!this.clientUtils.isNullOrEmpty(lastCheckInTime)) {
            let diffMinutes: number = Math.abs(this.clientUtils.getDateTimeDiff(lastCheckInTime)) / 60;
            let configTimeInterval: number = this.configUtils.getNumOfRecordsForKey(
                this.serviceConstants.CHECKIN_TIME_INTERVAL);
            return (diffMinutes > configTimeInterval);
        }
        return true;
    }

}
