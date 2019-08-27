import {Injectable} from '@angular/core';

@Injectable()
export class ServiceConstants {

    //App Configuration
    public NO_OF_NEARBY_OFFERS: string = 'NO_OF_NEARBY_OFFERS';
    public NO_OF_SPECIAL_OFFERS: string = 'NO_OF_SPECIAL_OFFERS';
    public NO_OF_RECOMMENDED_OFFERS: string = 'NO_OF_RECOMMENDED_OFFERS';
    public NO_OF_FAVOURITE_OFFERS: string = 'NO_OF_FAVOURITE_OFFERS';
    public NO_OF_NEARBY_PARTNER_STORES: string = 'NO_OF_NEARBY_PARTNER_STORES';
    public NO_OF_FEATURED_PARTNERS: string = 'NO_OF_FEATURED_PARTNERS';
    public NO_OF_FAVOURITE_PARTNER_STORES: string = 'NO_OF_FAVOURITE_PARTNER_STORES';
    public NO_OF_RECENT_TRANSACTIONS: string = 'NO_OF_RECENT_TRANSACTIONS';
    public NO_OF_INDUSTRY_TYPES: string = 'NO_OF_INDUSTRY_TYPES';
    public NO_OF_TARGETS: string = 'NO_OF_TARGETS';
    public CHECKIN_TIME_INTERVAL: string = 'CHECKIN_TIME_INTERVAL';
    public PAGINATION_LIMIT: string = 'PAGINATION_LIMIT';
    public PAGINATION_NO_OF_RECORDS: string = 'PAGINATION_NO_OF_RECORDS';
    public NO_OF_LOCAL_NOTIFICATIONS_PER_DEVICE: string = 'NO_OF_LOCAL_NOTIFICATIONS_PER_DEVICE';
    public SORTING_ORDER_FOR_OFFERS: string = 'SORTING_ORDER_FOR_OFFERS';
    public SORTING_ORDER_FOR_PARTNERS: string = 'SORTING_ORDER_FOR_PARTNERS';
    public SORTING_ORDER_FOR_LOCATIONS: string = 'SORTING_ORDER_FOR_LOCATIONS';
    public RANGE_FOR_REGION_TRACKING: string = 'RANGE_FOR_REGION_TRACKING';
    public BULK_DATA_SYNC_INTERVAL: string = 'BULK_DATA_SYNC_INTERVAL';
    public USER_LOCATION_LATITUDE: string = 'USER_LOCATION_LATITUDE';
    public USER_LOCATION_LONGITUDE: string = 'USER_LOCATION_LONGITUDE';
    public BASE_URL_DEV: string = 'BASE_URL_DEV';
    public BASE_URL_TEST: string = 'BASE_URL_TEST';
    public BASE_URL_PROD: string = 'BASE_URL_PROD';
    public GUEST_USER_TEXT_EN: string = 'GUEST_USER_TEXT_EN';
    public GUEST_USER_TEXT_ES: string = 'GUEST_USER_TEXT_ES';
    public ENROLMENT_URL_EN: string = 'ENROLMENT_URL_EN';
    public ENROLMENT_URL_ES: string = 'ENROLMENT_URL_ES';
    public FORGOT_PASSWORD_URL_EN: string = 'FORGOT_PASSWORD_URL_EN';
    public FORGOT_PASSWORD_URL_ES: string = 'FORGOT_PASSWORD_URL_ES';
    public REGISTRATION_URL_EN: string = 'REGISTRATION_URL_EN';
    public REGISTRATION_URL_ES: string = 'REGISTRATION_URL_ES';
    public TERMS_CONDITIONS_URL_EN: string = 'TERMS_CONDITIONS_URL_EN';
    public TERMS_CONDITIONS_URL_ES: string = 'TERMS_CONDITIONS_URL_ES';
    public PRIVACY_POLICY_URL_EN: string = 'PRIVACY_POLICY_URL_EN';
    public PRIVACY_POLICY_URL_ES: string = 'PRIVACY_POLICY_URL_ES';
    public OFFLINE_MSG_EN: string = 'OFFLINE_LOGIN_MESSAGE_EN';
    public OFFLINE_MSG_ES: string = 'OFFLINE_LOGIN_MESSAGE_ES';
    public CONTACT_URL_EN: string = 'CONTAC_EN';
    public CONTACT_URL_ES: string = 'CONTACT_ES';
    public LANGUAGE_CODES: string = 'LANGUAGES';
    public VC_HIDE_EXPIRY_DATE: string = 'VC_HIDE_EXPIRY_DATE';
    public APP_BACKGROUND_IMAGE_URL: string = 'APP_BACKGROUND_IMAGE_URL';
    public LOGIN_CARD_IMAGE_URL: string = 'LOGIN_CARD_IMAGE_URL';
    public SHOW_VC_EXPIRY: string = 'SHOW_VC_EXPIRY';
    public FORCE_UPDATE: string = 'FORCE_UPDATE';
    public ANDROID_VERSION: string = 'ANDROID_VERSION';
    public IOS_VERSION: string = 'IOS_VERSION';
    public UPDATE_MSG_EN: string = 'UPDATE_MSG_EN';
    public UPDATE_MSG_ES: string = 'UPDATE_MSG_ES';


    //Service Names
    public SERVICE_CONTEXT_NAME_ACCOUNT: string = 'account';
    public SERVICE_CONTEXT_NAME_GOAL: string = 'goal';
    public SERVICE_CONTEXT_NAME_WALLET: string = 'wallet';
    public SERVICE_CONTEXT_NAME_OFFER: string = 'offer';
    public SERVICE_CONTEXT_NAME_PARTNER: string = 'partner';
    public SERVICE_CONTEXT_NAME_COMMON: string = 'common';
    public SERVICE_CONTEXT_NAME_FAVOURITES: string = 'favourites';
    public SERVICE_CONTEXT_NAME_DEVICE: string = 'device';
    public SERVICE_CONTEXT_NAME_LOV_ITEM: string = 'lovItem';
    public SERVICE_CONTEXT_NAME_LOCATION_NOTIFICATION: string = 'locationNotification';
    public SERVICE_CONTEXT_NAME_VOUCHER: string = 'voucher';
    public ACCOUNT_SERVICE_NAME_LOGIN = 'login';
    public ACCOUNT_SERVICE_NAME_GET_PROFILE = 'getProfile';
    public ACCOUNT_SERVICE_NAME_CREATE_PROFILE = 'createProfile';
    public ACCOUNT_SERVICE_NAME_EDIT_PROFILE = 'editProfile';
    public ACCOUNT_SERVICE_NAME_CHANGE_PASSWORD = 'changePassword';
    public ACCOUNT_SERVICE_NAME_GET_MEMBER_SECURITY_QUESTION = 'getMemberSecurityQuestion';
    public ACCOUNT_SERVICE_NAME_VERIFY_MEMBER_SECURITY_QUESTION = 'verifyMemberSecurityQuestion';
    public ACCOUNT_SERVICE_NAME_CREATE_MEMBER_SECURITY_QUESTION = 'createMemberSecurityQuestion';
    public ACCOUNT_SERVICE_NAME_EDIT_MEMBER_SECURITY_QUESTION = 'editMemberSecurityQuestion';
    public ACCOUNT_SERVICE_NAME_GET_MEMBER_ADDRESS = 'getMemberAddress';
    public ACCOUNT_SERVICE_NAME_GET_TNC_CONSENT = 'getTncConsent';
    public ACCOUNT_SERVICE_NAME_POST_TNC_CONSENT = 'postTncConsent'
    public ACCOUNT_SERVICE_NAME_TRANSACTION = 'transactions';
    public ACCOUNT_SERVICE_NAME_PASSWORD_HINTS = 'passwordHints';

    public GOAL_SERVICE_NAME_MY_TARGETS = 'myTargets';
    public GOAL_SERVICE_SET_TARGET = 'setOfferBasedTarget';
    public GOAL_SERVICE_DELETE_TARGET = 'deleteTarget';

    public WALLET_SERVICE_NAME_VIRTUAL_CARD = 'virtualCard';
    public WALLET_SERVICE_NAME_QR_CODE = 'qrCode';

    public OFFER_SERVICE_NAME_OFFER_LIST = 'offerlist';
    public OFFER_SERVICE_NAME_GALLERIES = 'offerGalleries';
    public OFFER_SERVICE_NAME_PARTNER_LOCATIONS = 'offerpartnerlocations';

    public PARTNER_SERVICE_NAME_NEARBY_PARTNERS = 'nearByPartners';
    public PARTNER_SERVICE_NAME_FEATURED_PARTNERS = 'featuredPartners';
    public PARTNER_LOCATION_SERVICE_NAME_CHECK_IN = 'checkIn';
    public SERVICE_NAME_VOUCHERS = 'VoucherForRedemption';
    public SERVICE_NAME_MYVOUCHER: string = 'myvoucher';
    public SERVICE_NAME_REDEEM_VOUCHER = 'REDEEM_VOUCHER'
    public COMMON_SERVICE_NAME_APP_MENU = 'appMenu';
    public COMMON_SERVICE_NAME_APP_CONFIG = 'appConfig';
    public COMMON_SERVICE_NAME_INDUSTRY_TYPES = 'industryTypes';
    public COMMON_SERVICE_NAME_MESSAGE_CONTENT = 'messageContent';
    public COMMON_SERVICE_NAME_SYSTEM_QUERY = 'systemQuery';

    public FAVOURITES_SERVICE_NAME_LOCATIONS = 'favLocations';
    public FAVOURITES_SERVICE_NAME_SET_OFFERS = 'setOffersAsFav';
    public FAVOURITES_SERVICE_NAME_SET_LOCATION = 'setLocationAsFav';

    public DEVICE_SERVICE_NAME_REGISTER = 'registerDevice';

    public LOV_ITEM_SERVICE_NAME_SECURITY_QUESTIONS = 'getSecurityQuestions';
    public LOV_ITEM_SERVICE_NAME_COUNTRY = 'getCountryLov';
    public LOV_ITEM_SERVICE_NAME_STATE = 'getStateLov';
    public LOV_ITEM_SERVICE_NAME_CITY = 'getCityLov';
    public LOV_ITEM_SERVICE_NAME_NAME_SUFFIX = 'getNameSuffixLov';


    public LOCATION_NOTIFICATION_SERVICE_NAME_GET = 'getLocationNotification';


    //Notification Codes
    public NOTIF_CODE_SYNC_OFFER = 'SYNC_OFFER';
    public NOTIF_CODE_SYNC_PTNR = 'SYNC_PTNR';
    public NOTIF_CODE_SYNC_PTNR_LOC = 'SYNC_PTNR_LOC';
    public NOTIF_CODE_SYNC_CONF_PARAM = 'SYNC_CONF_PARAM';
    public NOTIF_CODE_SYNC_LOC_NOT = 'SYNC_LOC_NOT';
    public NOTIF_CODE_SYNC_MENU = 'SYNC_MENU';
    public NOTIF_CODE_SYNC_TARGET = 'SYNC_TRGT';
    public NOTIF_CODE_SYNC_PROFILE = 'SYNC_PROFILE';
    public NOTIF_CODE_SYNC_TERMS = 'SYNC_TERMS';


    //Message Requests
    public SHR_TRGT_EN = 'SHR_TRGT_EN';
    public SHR_TRGT_ES = 'SHR_TRGT_ES';
    public SHR_CHKIN_EN = 'SHR_CHKIN_EN';
    public SHR_CHKIN_ES = 'SHR_CHKIN_ES';
    public TERMS_N_COND_EN = 'TERMS_N_COND_EN';
    public TERMS_N_COND_ES = 'TERMS_N_COND_ES';
    public TERMS_CONTENT_TYPE_TC = 'TC';
    public TERMS_CONTENT_TYPE_H = 'H';
    public TERMS_CONTENT_TYPE_U = 'U';


    //Local Notification
    public LOC_NOTIF_LANG_ID_EN = 21;
    public LOC_NOTIF_LANG_ID_ES = 194;

    //System Query Code
    public SYSTEM_QUERY_CP_CHAT = 'CPCHAT';
    public SYSTEM_QUERY_QR_CODE = 'QRCODE';


    constructor() {

    }
}
