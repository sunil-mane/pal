import { Component, ViewChild, Renderer, NgZone } from '@angular/core';
import { Events, Content, ModalController, Modal, Platform, NavController,ViewController } from 'ionic-angular';
import { SliderData } from '../../dto/slider.dto';
import { GeolocationService, GeolocationPosition } from '../../services/commons/geolocation.service';
import { SessionUtils } from '../../utils/commons/session.utils';
import { OfferUtils } from '../../utils/commons/offer.utils';
import { PartnerUtils } from '../../utils/commons/partner.utils';
import { ConfigUtils } from '../../utils/commons/config.utils';
import { ClientUtils } from '../../utils/commons/client.utils';
import { GoogleAnalyticsUtils } from '../../utils/commons/google-analytics.utils';
import { AppConstants } from '../../constants/app.constants';
import { UserAddressUtils } from '../../utils/commons/user-address.utils';
import { SyncDataUtils } from '../../utils/commons/sync-data.utils';
import { ServiceErrorInfo } from '../../dto/common.dto';
import { OfferInfo } from '../../dto/offers.dto';
import { PartnerLocationInfo, PartnerInfo } from '../../dto/partners.dto';
import { MemberInfo } from '../../dto/account.dto';
import { GeocodeInfo } from '../../dto/geocode.dto';
import { LocationPage } from './location/location';
import { TranslateService } from 'ng2-translate';
import { NetworkService } from '../../services/commons/network.service';
import { MilesCalculatorPage } from '../../pages/mcalculator/mcalculator';
import { UserUtils } from '../../utils/commons/user.utils';
import { TncPage } from '../tnc/tnc';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
    providers: []
})

export class HomePage {

    @ViewChild(Content) content: Content;

    nearByOffersData: Array<SliderData> = [];
    nearByParnersData: Array<SliderData> = [];
    recomOffersData: Array<SliderData> = [];
    offersByLocation: Array<OfferInfo> = [];
    recommendedOffers: Array<OfferInfo> = [];
    partnersByLocation: Array<PartnerLocationInfo> = [];
    partnersData: Array<PartnerInfo> = [];
    memberInfo: MemberInfo = null;
    selectedLocationObj: GeocodeInfo = null;
    shouldUseCurrentLocation: boolean = true;
    userLocationFinderStatus: boolean = true;
    shouldShowMileCalculator: boolean = false;
    appDisplayName: string = '';
    isRefreshing: boolean = false;
    tncModalFlag:boolean = false;
    constructor(public navCtrl: NavController,
        private sessionUtils: SessionUtils,
        private offerUtils: OfferUtils,
        private partnerUtils: PartnerUtils,
        private configUtils: ConfigUtils,
        private clientUtils: ClientUtils,
        private userAddressUtils: UserAddressUtils,
        private geolocation: GeolocationService,
        private events: Events,
        private render: Renderer,
        private ngZone: NgZone,
        private platform: Platform,
        private modalCtrl: ModalController,
        private translate: TranslateService,
        private googleAnalyticsUtils: GoogleAnalyticsUtils,
        private syncDataUtils: SyncDataUtils,
        private appConstants: AppConstants,
        private networkService: NetworkService,
        private userUtils: UserUtils,
        public viewController: ViewController,
    ) {

    }

    ngOnInit() {
        this.nearByOffersData = [];
        this.nearByParnersData = [];
        this.recomOffersData = [];

        this.events.subscribe(this.appConstants.EVENT_APP_LANGUAGE_CHANGED, () => {
            this.updateTargetForNearbyOffers();
            this.updateNearbyPartnerLocations();
            this.updateTargetForRecommendedOffers();
        });

        this.events.subscribe(this.appConstants.EVENT_NEARBY_OFFERS_CHANGED, () => {
            this.offersByLocation = this.offerUtils.getNearbyOfferContext();
            this.updateTargetForNearbyOffers();
        });

        this.events.subscribe(this.appConstants.EVENT_NEARBY_PARTNER_LOCATIONS_CHANGED, () => {
            this.partnersByLocation = this.partnerUtils.getNearbyPartnerLocationContext();
            this.updateNearbyPartnerLocations();
        });

        this.events.subscribe(this.appConstants.EVENT_RECOMMENDED_OFFERS_CHANGED, () => {
            this.recommendedOffers = this.offerUtils.getRecommendedOfferContext();
            this.updateTargetForRecommendedOffers();
        });

        this.events.subscribe(this.appConstants.EVENT_FEATURED_PARTNERS_CHANGED, () => {
            this.partnersData = this.partnerUtils.getFeaturedPartnerContext();
        });

        this.events.subscribe(this.appConstants.EVENT_LOGIN_STATUS_CHANGED, () => {
            if (this.sessionUtils.isUserLoggedIn()) {
                this.memberInfo = this.sessionUtils.getMemberInfo();
                //this.getTncConsentDate(this.memberInfo.activeCardNo);
            }
            else {
                this.memberInfo = null;
            }
            this.offerUtils.fetchOffersNearBy(null, null);
            this.partnerUtils.fetchPartnerLocationsNearBy(null, null);
            this.offerUtils.fetchRecommendedOffers(null, null);
            this.partnerUtils.fetchFeaturedPartners(null, null);
        });

        this.events.subscribe(this.appConstants.EVENT_USER_PROFILE_CHANGED, () => {
            this.memberInfo = this.sessionUtils.getMemberInfo();
            //this.getTncConsentDate(this.memberInfo.activeCardNo);
        });

        this.events.subscribe(this.appConstants.EVENT_USER_LOCATION_CHANGED,
            (data: GeolocationPosition, error: ServiceErrorInfo) => {
                if (data) {
                    if (this.shouldUseCurrentLocation) {
                        this.fetchAddressForLocation(data.coords.latitude, data.coords.longitude);
                    }
                }
                else if (error) {
                    if (this.shouldUseCurrentLocation) {
                        let defaultLocation = this.configUtils.getUserLocationCoordinate();
                        this.fetchAddressForLocation(defaultLocation.latitude, defaultLocation.longitude);
                    }
                }
            });

        this.platform.ready().then(() => {

            if (this.sessionUtils.isUserLoggedIn()) {
                this.googleAnalyticsUtils.trackPage(this.appConstants.USER_HOME_SCREEN);
                this.memberInfo = this.sessionUtils.getMemberInfo();
            }
            else {
                this.googleAnalyticsUtils.trackPage(this.appConstants.GUEST_HOME_SCREEN);
                this.memberInfo = null;
            }

            this.offersByLocation = this.offerUtils.getNearbyOfferContext();
            this.updateTargetForNearbyOffers();

            this.partnersByLocation = this.partnerUtils.getNearbyPartnerLocationContext();
            this.updateNearbyPartnerLocations();

            this.recommendedOffers = this.offerUtils.getRecommendedOfferContext();
            this.updateTargetForRecommendedOffers();
            if (!this.recommendedOffers || (this.recommendedOffers.length == 0)) {
                this.offerUtils.fetchRecommendedOffers(null, null);
            }

            this.partnersData = this.partnerUtils.getFeaturedPartnerContext();
            if (!this.partnersData || (this.partnersData.length == 0)) {
                this.partnerUtils.fetchFeaturedPartners(null, null);
            }

            let geocodes = this.userAddressUtils.getUserAddressContext();
            if (geocodes && (geocodes.length > 0)) {
                this.selectedLocationObj = geocodes[0];
                if (!this.selectedLocationObj || !this.selectedLocationObj.formatted_address) {
                    this.shouldUseCurrentLocation = true;
                }
                else {
                    this.shouldUseCurrentLocation = false;
                }
                if (!this.offersByLocation || (this.offersByLocation.length == 0)) {
                    this.offerUtils.fetchOffersNearBy(null, null);
                }
                if (!this.partnersByLocation || (this.partnersByLocation.length == 0)) {
                    this.partnerUtils.fetchPartnerLocationsNearBy(null, null);
                }
            }
            else {
                this.getCurrentLocation();
            }

            setTimeout(() => {
                this.appDisplayName = this.clientUtils.getAppDisplayName();
                this.shouldShowMileCalculator = this.clientUtils.shouldShowMilesCalculator();
            }, 1000);
        });
    }

    updateTargetForNearbyOffers() {
        let nearByOffers = [];
        for (let count = 0; count < this.offersByLocation.length; count++) {
            let sliderObj = new SliderData();
            sliderObj.name = this.offersByLocation[count].partnerName;
            sliderObj.title = this.offersByLocation[count].offerName;
            sliderObj.offerPoints = this.offersByLocation[count].offerPoints;
            sliderObj.img = this.offersByLocation[count].offerBannerPath;
            sliderObj.logo = this.offersByLocation[count].partnerLogoPath;
            sliderObj.location = this.offersByLocation[count].locationName;
            sliderObj.partnerCode = this.offersByLocation[count].partnerCode;
            sliderObj.description = this.offersByLocation[count].description;
            sliderObj.offerId = this.offersByLocation[count].offerId;
            sliderObj.earnBurn = this.offersByLocation[count].earnBurnFlag;
            sliderObj.isFavourite = (this.offersByLocation[count].isFavorite == 'Y');
            sliderObj.isTarget = (this.offersByLocation[count].isTarget == 'Y');
            sliderObj.special = this.offersByLocation[count].special;
            sliderObj.terms = this.offersByLocation[count].terms;
            sliderObj.termsType = this.offersByLocation[count].termsType;
            sliderObj.pageTitle = this.appConstants.HEADING_NEAR_ME_OFFERS;
            sliderObj.isSlidActive = false;

            if (this.memberInfo && sliderObj.isTarget && (this.offersByLocation[count].offerPoints > 0)) {
                let percentValue = Math.round((this.memberInfo.availableBalanceMiles /
                    this.offersByLocation[count].offerPoints) * 100);
                if (percentValue > 100) {
                    percentValue = 100;
                }
                sliderObj.myTarget = percentValue;
                sliderObj.targetId = this.offersByLocation[count].targetId;
            } else {
                sliderObj.myTarget = null;
            }

            nearByOffers.push(sliderObj);
        }

        this.nearByOffersData = nearByOffers;
    }

    updateNearbyPartnerLocations() {

        let nearByPartners = [];
        for (let count = 0; count < this.partnersByLocation.length; count++) {
            let sliderObj = new SliderData();
            sliderObj.name = this.partnersByLocation[count].partnerName;
            sliderObj.title = this.partnersByLocation[count].partnerName;
            sliderObj.img = this.partnersByLocation[count].imagePath;
            sliderObj.logo = this.partnersByLocation[count].partnerLogoPath;
            sliderObj.addressId = this.partnersByLocation[count].addressId;
            sliderObj.storeName = this.partnersByLocation[count].storeName;
            sliderObj.partnerCode = this.partnersByLocation[count].partnerCode;
            sliderObj.description = this.partnersByLocation[count].addressDescription;
            sliderObj.distance = Number(this.partnersByLocation[count].distance.toFixed(2));
            sliderObj.latitude = this.partnersByLocation[count].latitude;
            sliderObj.longitude = this.partnersByLocation[count].longitude;
            sliderObj.terms = this.partnersByLocation[count].terms;
            sliderObj.termsType = this.partnersByLocation[count].termsType;
            sliderObj.isFavourite = (this.partnersByLocation[count].isFavorite == 'Y');
            sliderObj.lastCheckinTime = this.partnersByLocation[count].lastCheckinTime;
            sliderObj.pageTitle = this.appConstants.HEADING_NEAR_ME_STORES;
            sliderObj.targetId = null;
            sliderObj.offerId = null;
            sliderObj.offers = this.translate.instant('OFFERS');
            sliderObj.distanceDenom = this.translate.instant('KM') + ' ' + this.translate.instant('APPROX');

            if (this.partnersByLocation[count].numberOfOffers != null)
                sliderObj.offersCount = this.partnersByLocation[count].numberOfOffers;
            else
                sliderObj.offersCount = 0;

            nearByPartners.push(sliderObj);
        }

        this.nearByParnersData = nearByPartners;
    }

    updateTargetForRecommendedOffers() {

        let recommendedOffers = [];

        for (let count = 0; count < this.recommendedOffers.length; count++) {
            let sliderObj = new SliderData();
            sliderObj.name = this.recommendedOffers[count].partnerName;
            sliderObj.title = this.recommendedOffers[count].offerName;
            sliderObj.offerPoints = this.recommendedOffers[count].offerPoints;
            sliderObj.img = this.recommendedOffers[count].offerBannerPath;
            sliderObj.logo = this.recommendedOffers[count].partnerLogoPath;
            sliderObj.partnerCode = this.recommendedOffers[count].partnerCode;
            sliderObj.description = this.recommendedOffers[count].description;
            sliderObj.offerId = this.recommendedOffers[count].offerId;
            sliderObj.earnBurn = this.recommendedOffers[count].earnBurnFlag;
            sliderObj.isFavourite = (this.recommendedOffers[count].isFavorite == 'Y');
            sliderObj.isTarget = (this.recommendedOffers[count].isTarget == 'Y');
            sliderObj.special = this.recommendedOffers[count].special;
            sliderObj.terms = this.recommendedOffers[count].terms;
            sliderObj.termsType = this.recommendedOffers[count].termsType;
            sliderObj.pageTitle = this.appConstants.HEADING_RECOMMENDED_OFFERS;
            sliderObj.isSlidActive = false;

            let loationCount: string = this.recommendedOffers[count].partnerLoationCount;
            if (loationCount && (loationCount != '0')) {
                sliderObj.location = (loationCount == 'ALL') ? this.translate.instant('ALL_LOCATIONS')
                    : loationCount + " " + this.translate.instant('LOCATIONS');
            } else {
                sliderObj.location = '';
            }

            if (this.memberInfo && sliderObj.isTarget && (this.recommendedOffers[count].offerPoints > 0)) {
                let percentValue: number = Math.round((this.memberInfo.availableBalanceMiles /
                    this.recommendedOffers[count].offerPoints) * 100);
                if (percentValue > 100) {
                    percentValue = 100;
                }
                sliderObj.myTarget = percentValue;
                sliderObj.targetId = this.recommendedOffers[count].targetId;
            } else {
                sliderObj.myTarget = null;
            }

            recommendedOffers.push(sliderObj);
        }

        this.recomOffersData = recommendedOffers;
    }

    fetchAddressForLocation(latitude: number, longitude: number) {
        this.userAddressUtils.fetchAddressForLocation(latitude, longitude,
            (result: GeocodeInfo) => {
                this.ngZone.run(() => {
                    this.selectedLocationObj = result;
                    if (!this.selectedLocationObj || !this.selectedLocationObj.formatted_address) {
                        this.shouldUseCurrentLocation = true;
                    }
                    else {
                        this.shouldUseCurrentLocation = false;
                    }
                    this.offerUtils.fetchOffersNearBy(null, null);
                    this.partnerUtils.fetchPartnerLocationsNearBy(null, null);
                });
            }, (error: any) => {

            });
    }

    findMyCurrentLocation() {

        if (this.sessionUtils.isUserLoggedIn()) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.USER_HOME_SCREEN,
                this.appConstants.FETCH_CURRENT_GEO_LOCATION_EVENT);
        } else {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN,
                this.appConstants.FETCH_CURRENT_GEO_LOCATION_EVENT);
        }

        this.shouldUseCurrentLocation = true;
        this.userLocationFinderStatus = false;
        this.getCurrentLocation();
    }

    doLocationSearch() {
        if (this.sessionUtils.isUserLoggedIn()) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.USER_HOME_SCREEN,
                this.appConstants.GEO_LOCATION_SEARCH_EVENT);
        } else {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN,
                this.appConstants.GEO_LOCATION_SEARCH_EVENT);
        }

        if (this.networkService.isOnline()) {

            let body = document.getElementsByTagName('body')[0];

            let profileModal: Modal = this.modalCtrl.create(LocationPage, { data: this.selectedLocationObj });
            profileModal.onDidDismiss((data: GeocodeInfo) => {
                this.render.setElementClass(body, 'fullScreenVirtualCard', false);
                if (data) {
                    let shouldChange = true;
                    if (this.selectedLocationObj &&
                        (this.selectedLocationObj.formatted_address == data.formatted_address)) {
                        shouldChange = false;
                    }
                    if (shouldChange) {
                        this.userAddressUtils.storeGeocodeInfo(data);
                        this.selectedLocationObj = data;
                        if (!this.selectedLocationObj || !this.selectedLocationObj.formatted_address) {
                            this.shouldUseCurrentLocation = true;
                        }
                        else {
                            this.shouldUseCurrentLocation = false;
                        }
                        this.offerUtils.fetchOffersNearBy(null, null);
                        this.partnerUtils.fetchPartnerLocationsNearBy(null, null);
                    }
                }
            });

            this.render.setElementClass(body, 'fullScreenVirtualCard', true);
            profileModal.present();
        }
    }

    getCurrentLocation() {
        this.geolocation.getCurrentLocation(null,
            (data: GeolocationPosition) => {
                if (this.shouldUseCurrentLocation) {
                    this.fetchAddressForLocation(data.coords.latitude, data.coords.longitude);
                    setTimeout(() => {
                        this.userLocationFinderStatus = true;
                    }, 1000)
                }
            },
            (error: ServiceErrorInfo) => {

                setTimeout(() => {
                    this.userLocationFinderStatus = true;
                }, 1000);

                if (this.shouldUseCurrentLocation) {
                    let defaultLocation = this.configUtils.getUserLocationCoordinate();
                    this.fetchAddressForLocation(defaultLocation.latitude, defaultLocation.longitude);
                }
            });
    }

    refreshButtonTapped() {
        if (this.isRefreshing != true) {
            this.isRefreshing = true;
            this.content.scrollToTop(0);
            let pageCode = (this.sessionUtils.isUserLoggedIn() == true) ?
                this.appConstants.USER_HOME_SCREEN :
                this.appConstants.GUEST_HOME_SCREEN;
            this.syncDataUtils.processPageCode(pageCode)
                .then((result: boolean) => {
                    this.isRefreshing = false;
                });
        }
    }
    // getTncConsentDate(activeCardNo) {
    //     let consentConfig = this.configUtils.getTncConsentObj();
    //     let reqObj = {
    //         "activeCardNumber": activeCardNo,
    //         "consentCode": consentConfig.tncCode
    //     }
    //     this.userUtils.getConsentDate(reqObj,
    //         (result: any) => {
    //             if (consentConfig.tncFlag) {
    //                 if (result.consentDate) {
    //                     if ((new Date(consentConfig.lastTncChanged)) >= (new Date(result.consentDate))) {
    //                         let modal = this.modalCtrl.create(TncPage, {}, { enableBackdropDismiss: false });
    //                         modal.present();
    //                     }
    //                 } else {
    //                     let modal = this.modalCtrl.create(TncPage, {}, { enableBackdropDismiss: false });
    //                     modal.present();
    //                 }
    //             }
    //         }, (error: ServiceErrorInfo) => {
    //             let modal = this.modalCtrl.create(TncPage, {}, { enableBackdropDismiss: false });
    //             modal.present();
    //         });
    // }
    openMilesCalculator() {
        if (this.networkService.isOnline()) {
            this.navCtrl.push(MilesCalculatorPage);
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }
}
