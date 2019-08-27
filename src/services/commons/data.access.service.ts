import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {ServiceContext} from './context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {MessageContentService} from './message-content.service';
import {SystemQueryService} from './system-query.service';
import {OfferService} from '../offer/offer.service';
import {MenuService} from '../menu/menu.services';
import {ConfigService} from '../configuration/config.service';
import {ProfileService} from '../account/profile.service';
import {WalletService} from '../wallet/wallet.service';
import {MyTargetsService} from '../target/mytargets.service';
import {PartnerService} from '../partners/partner.service';
import {FavouritesService} from '../favourites/favourites.services';
import {IndustryTypesService} from '../industrytypes/industrytypes.services';
import {DeviceService} from './device.service';
import {LocationNotificationService} from '../locationNotification/location-notification.service';
import {Response} from "@angular/http";
import {LovItemService} from "../lovItem/lov-item.service";

/**
 * This class represent entry point for all the service need
 */
@Injectable()
export class DataAccessService {

    constructor(private serviceConstants: ServiceConstants,
                private offerService: OfferService,
                private menuService: MenuService,
                private configService: ConfigService,
                private profileService: ProfileService,
                private walletService: WalletService,
                private myTargetService: MyTargetsService,
                private partnerService:PartnerService,
                private favouritesService:FavouritesService,
                private industryTypesService:IndustryTypesService,
                private deviceService: DeviceService,
                private messageContentService: MessageContentService,
                private systemQueryService: SystemQueryService,
                private lovItemService: LovItemService,
                private locationNotificationService: LocationNotificationService) {
    }

    /**
     * Return Observable to calling after resolving HTTP call
     * @param serviceContext
     * @returns {Observable<Response>}
     */
    call(serviceContext: ServiceContext): Observable<Response> {
        if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT) {
            return this.profileService.call(serviceContext);
        } else if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_WALLET) {
            return this.walletService.call(serviceContext);
        } else if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_GOAL) {
            return this.myTargetService.call(serviceContext);
        } else if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_OFFER) {
            return this.offerService.call(serviceContext);
        } else if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_PARTNER) {
            return this.partnerService.call(serviceContext);
        } else if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_VOUCHER) {
            // if (serviceContext.serviceName === this.serviceConstants.SERVICE_NAME_VOUCHERS) {
            //     return this.partnerService.call(serviceContext);
            // } else if (serviceContext.serviceName === this.serviceConstants.COMMON_SERVICE_NAME_APP_CONFIG) {
            //     return this.configService.call(serviceContext);
            // } 

            return this.partnerService.call(serviceContext);
        } else if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_DEVICE) {
            return this.deviceService.call(serviceContext);
        } else if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_FAVOURITES) {
            return this.favouritesService.call(serviceContext);
        } else if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_LOV_ITEM) {
            return this.lovItemService.call(serviceContext);
        } else if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_LOCATION_NOTIFICATION) {
            return this.locationNotificationService.call(serviceContext);
        } else if (serviceContext.contextName === this.serviceConstants.SERVICE_CONTEXT_NAME_COMMON) {
            if (serviceContext.serviceName === this.serviceConstants.COMMON_SERVICE_NAME_APP_MENU) {
                return this.menuService.call(serviceContext);
            } else if (serviceContext.serviceName === this.serviceConstants.COMMON_SERVICE_NAME_APP_CONFIG) {
                return this.configService.call(serviceContext);
            } else if (serviceContext.serviceName === this.serviceConstants.COMMON_SERVICE_NAME_INDUSTRY_TYPES) {
                return this.industryTypesService.call(serviceContext);
            } else if (serviceContext.serviceName === this.serviceConstants.COMMON_SERVICE_NAME_MESSAGE_CONTENT) {
                return this.messageContentService.call(serviceContext);
            } else if (serviceContext.serviceName === this.serviceConstants.COMMON_SERVICE_NAME_SYSTEM_QUERY) {
                return this.systemQueryService.call(serviceContext);
            }
        }
    }
}
