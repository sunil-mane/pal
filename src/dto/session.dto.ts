/**
 * Created by sandip on 1/18/17.
 */
import {ConfigInfo,AppMenu,TermsCondtionsInfo} from './common.dto';
import {LocationNotificationInfo} from './location-notification.dto';
import {OfferInfo} from './offers.dto';
import {PartnerInfo,PartnerLocationInfo} from './partners.dto';
import {MemberInfo,TransactionInfo,VirtualCardInfo,QRCodeInfo} from './account.dto';
import {GoalInfo} from './goal.dto';
import {GeocodeInfo} from './geocode.dto';
import { DefaultConfiguration } from "./configuration.dto";


export class SessionRootInfo {
    defaultConfiguration: DefaultConfiguration;
    configs: Array<ConfigInfo>;
    locationNotifications: Array<LocationNotificationInfo>;
    appTerms: Array<TermsCondtionsInfo>;
    appMenus: Array<AppMenu>;
    recommendedOffers: Array<OfferInfo>;
    favoriteOffers: Array<OfferInfo>;
    nearbyOffers: Array<OfferInfo>;
    featuredPartners: Array<PartnerInfo>;
    favoritePartnerLocations: Array<PartnerLocationInfo>;
    nearbyPartnerLocations: Array<PartnerLocationInfo>;
    memberInfo: MemberInfo;
    targets: Array<GoalInfo>;
    transactions: Array<TransactionInfo>;
    geocodes: Array<GeocodeInfo>;
    virtualCards: Array<VirtualCardInfo>;
    qrCodes: Array<QRCodeInfo>;
    deviceToken: string;
    deviceLanguage: string;
    lastSyncDate: string;
    appVersionNumber: string;
    appVersionCode: string;
    appNotification: string;
    partnerNotification: string;
    userChangedNotificationSettings: string;
    userChangedAppLanguageSettings: string;
}
