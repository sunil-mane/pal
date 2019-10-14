import { Component, ViewChild } from '@angular/core';
import { NavController, Events, Content } from 'ionic-angular';
import { SliderData } from '../../dto/slider.dto';
import { MemberInfo, TransactionInfo } from '../../dto/account.dto';
import { SessionUtils } from '../../utils/commons/session.utils';
import { GoalInfo } from '../../dto/goal.dto';
import { OfferInfo } from '../../dto/offers.dto';
import { PartnerLocationInfo } from '../../dto/partners.dto';
import { OfferUtils } from '../../utils/commons/offer.utils';
import { PartnerUtils } from '../../utils/commons/partner.utils';
import { TransactionUtils } from '../../utils/commons/transaction.utils';
import { TargetUtils } from '../../utils/commons/target.utils';
import { MyTargetsAllPage } from '../mytargetsall/my-targets-all';
import { GoogleAnalyticsUtils } from '../../utils/commons/google-analytics.utils';
import { AppConstants } from '../../constants/app.constants';
import { LanguageConstants } from '../../constants/language.constants';
import { TranslateService } from 'ng2-translate';
import { NetworkService } from '../../services/commons/network.service';
import { ClientUtils } from '../../utils/commons/client.utils';
import { ConfigUtils } from '../../utils/commons/config.utils';
import { EnrollmentPage } from '../../pages/enrollment/enrollment';
import { SyncDataUtils } from '../../utils/commons/sync-data.utils';
import { MyVouchers } from "../myvouchers/my-vouchers";

@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html'
})

export class ProfilePage {

    @ViewChild(Content) content: Content;

    memberInfo: MemberInfo = new MemberInfo();
    targets: Array<GoalInfo> = [];
    targetSliderItems: Array<SliderData> = [];
    favOffers: Array<OfferInfo> = [];
    favParnerLocations: Array<PartnerLocationInfo> = [];
    // vouchers: Array<VouchersInfo> = [];
    favOffersData: Array<SliderData> = [];
    favParnerLocationsData: Array<SliderData> = [];
    vouchersData: any = [];
    transactionsByDate: any = {};
    transactionDates: Array<string> = [];
    shouldDisplayTargets: boolean = false;
    shouldHideAvatar: boolean = false;
    shouldShowEnrollment: boolean = false;
    shouldDisplayLoading: boolean = true;
    isRefreshing: boolean = false;
    backgroundImageURL: string = '';
    shouldShowVouchers = false;

    constructor(public navCtrl: NavController,
        public languageConstants: LanguageConstants,
        public clientUtils: ClientUtils,
        private sessionUtils: SessionUtils,
        private offerUtils: OfferUtils,
        private partnerUtils: PartnerUtils,
        private transactionUtils: TransactionUtils,
        private targetUtils: TargetUtils,
        private configUtils: ConfigUtils,
        private events: Events,
        private translate: TranslateService,
        private networkService: NetworkService,
        private googleAnalyticsUtils: GoogleAnalyticsUtils,
        private appConstants: AppConstants,
        private syncDataUtils: SyncDataUtils) {

    }

    ngOnInit() {

        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        });
        this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        this.events.subscribe(this.appConstants.EVENT_APP_LANGUAGE_CHANGED, () => {
            this.updateActiveTargetData();
            this.updateTargetForFavOffers();
            this.updateTargetForFavLocations();
            // this.updateMyVouchers();
        });

        this.googleAnalyticsUtils.trackPage(this.appConstants.MY_PROFILE_SCREEN);
        this.memberInfo = this.sessionUtils.getMemberInfo();

        this.events.subscribe(this.appConstants.EVENT_USER_PROFILE_CHANGED, () => {
            this.memberInfo = this.sessionUtils.getMemberInfo();
            this.updateActiveTargetData();
            this.updateTargetForFavOffers();
        });

        this.events.subscribe(this.appConstants.EVENT_TARGET_CHANGED, () => {
            this.shouldDisplayLoading = false;
            this.shouldDisplayTargets = true;
            this.targets = this.targetUtils.getTargetContext();
            this.updateActiveTargetData();
        });

        this.events.subscribe(this.appConstants.EVENT_FAVORITE_OFFERS_CHANGED, () => {
            this.shouldDisplayLoading = false;
            this.favOffers = this.offerUtils.getFavoriteOfferContext();
            this.updateTargetForFavOffers();
        });

        this.events.subscribe(this.appConstants.EVENT_FAVORITE_PARTNER_LOCATIONS_CHANGED, () => {
            this.shouldDisplayLoading = false;
            this.favParnerLocations = this.partnerUtils.getFavoritePartnerLocationContext();
            this.updateTargetForFavLocations();
        });
        this.shouldDisplayLoading = false;
        // this.favParnerLocations = this.partnerUtils.getFavoritePartnerLocationContext();
        //     this.vouchers = [];
        //     this.updateMyVouchers();
        // });
        this.events.subscribe(this.appConstants.EVENT_RECENT_TRANSACTIONS_CHANGED, () => {
            this.shouldDisplayLoading = false;
            let transactions = this.transactionUtils.getTransactionContext();
            this.sortTransactionByDate(transactions);
        });

        this.targets = this.targetUtils.getTargetContext();
        this.updateActiveTargetData();
        if (!this.targets || (this.targets.length == 0)) {
            this.shouldDisplayTargets = false;
            this.targetUtils.fetchMyTargets(null, null);
        } else {
            this.shouldDisplayLoading = false;
            this.shouldDisplayTargets = true;
        }

        this.favOffers = this.offerUtils.getFavoriteOfferContext();
        this.updateTargetForFavOffers();
        if (!this.favOffers || (this.favOffers.length == 0)) {
            this.offerUtils.fetchFavoriteOffers(null, null);
        } else {
            this.shouldDisplayLoading = false;
        }

        this.favParnerLocations = this.partnerUtils.getFavoritePartnerLocationContext();
        this.updateTargetForFavLocations();
        if (!this.favParnerLocations || (this.favParnerLocations.length == 0)) {
            this.partnerUtils.fetchFavoritePartnerLocations(null, null);
        } else {
            this.shouldDisplayLoading = false;
        }
        let vouchers = this.partnerUtils.getMyVouchersContext();
        if (!vouchers || (vouchers.length == 0)) {
            this.partnerUtils.fetchMyVouchers('all',(result: any) => {
                this.vouchersData = result.data;
                if(this.vouchersData&&this.vouchersData.length==1){
                    this.vouchersData.push(this.vouchersData[0])
                }
            }
                , (error: any) => {

                });
        } else {
            this.shouldDisplayLoading = false;
        }


        let transactions = this.transactionUtils.getTransactionContext();
        this.sortTransactionByDate(transactions);
        if (!transactions || (transactions.length == 0)) {
            this.transactionUtils.fetchRecentTransactions(null, null);
        } else {
            this.shouldDisplayLoading = false;
        }

        this.shouldHideAvatar = this.clientUtils.shouldHideAvatar();
        this.shouldShowEnrollment = this.clientUtils.shouldShowEnrollment();

        this.shouldShowVouchers = this.sessionUtils.getVoucherFlag();

        setTimeout(() => {
            this.shouldDisplayLoading = false;
        }, 60000);
    }

    updateActiveTargetData() {

        let tempArray = [];

        for (let count = 0; count < this.targets.length; count++) {
            if (((this.targets[count].targetStatus != '') ||
                (this.targets[count].targetStatus != 'I') ||
                (this.targets[count].targetStatus != 'A') ||
                (this.targets[count].targetStatus != 'E')) &&
                (this.targets[count].earnBurnFlag != 'E')) {
                let sliderObj = new SliderData();
                sliderObj.name = this.targets[count].partnerName;
                sliderObj.title = this.targets[count].targetName;
                sliderObj.points = this.targets[count].targetPoints;
                sliderObj.img = this.targets[count].offerBannerPath;
                sliderObj.logo = this.targets[count].partnerLogoPath;
                sliderObj.partnerCode = this.targets[count].partnerCode;
                sliderObj.offerId = this.targets[count].offerId;
                sliderObj.targetId = this.targets[count].targetId;
                sliderObj.targetStatus = this.targets[count].targetStatus;
                sliderObj.targetEndDate = this.targets[count].targetEndDate;
                sliderObj.targetEndDateString = this.clientUtils.getFormattedDate('yMMMd', sliderObj.targetEndDate);
                sliderObj.targetStatusDescription = this.targets[count].targetStatusDescription;
                sliderObj.earnBurn = this.targets[count].earnBurnFlag;
                sliderObj.isFavourite = (this.targets[count].isFavorite == 'Y');
                sliderObj.special = this.targets[count].special;
                sliderObj.pageTitle = this.appConstants.HEADING_MY_TARGETS;
                sliderObj.isTarget = true;
                sliderObj.showHide = true;
                sliderObj.description = null;

                let loationCount: string = this.targets[count].partnerLocationCount;
                if (loationCount && (loationCount != '0')) {
                    sliderObj.location = (loationCount == 'ALL') ? this.translate.instant('ALL_LOCATIONS')
                        : loationCount + " " + this.translate.instant('LOCATIONS');
                } else {
                    sliderObj.location = '';
                }

                if (this.targets[count].offerBannerPath.length != 0)
                    sliderObj.img = this.targets[count].offerBannerPath;
                //else
                //  sliderObj.img = "assets/img/img02.png";

                if (this.targets[count].targetPoints > this.memberInfo.availableBalanceMiles) {
                    let percentValue = Math.round((this.memberInfo.availableBalanceMiles /
                        this.targets[count].targetPoints) * 100);
                    if (percentValue > 100) {
                        percentValue = 100;
                    }
                    sliderObj.myTarget = percentValue;
                } else {
                    sliderObj.myTarget = 100;
                }

                tempArray.push(sliderObj);
            }
        }

        this.targetSliderItems = tempArray;
    }

    updateTargetForFavOffers() {

        let favOffers = [];

        for (let count = 0; count < this.favOffers.length; count++) {
            let sliderObj = new SliderData();
            sliderObj.name = this.favOffers[count].partnerName;
            sliderObj.title = this.favOffers[count].offerName;
            sliderObj.offerPoints = this.favOffers[count].offerPoints;
            sliderObj.img = this.favOffers[count].offerBannerPath;
            sliderObj.logo = this.favOffers[count].partnerLogoPath;
            sliderObj.partnerCode = this.favOffers[count].partnerCode;
            sliderObj.offerId = this.favOffers[count].offerId;
            sliderObj.description = this.favOffers[count].description;
            sliderObj.earnBurn = this.favOffers[count].earnBurnFlag;
            sliderObj.isFavourite = (this.favOffers[count].isFavorite == 'Y');
            sliderObj.isTarget = (this.favOffers[count].isTarget == 'Y');
            sliderObj.special = this.favOffers[count].special;
            sliderObj.terms = this.favOffers[count].terms;
            sliderObj.termsType = this.favOffers[count].termsType;
            sliderObj.pageTitle = this.appConstants.HEADING_MY_FAVOURITE_OFFERS;
            sliderObj.targetId = null;

            let loationCount: string = this.favOffers[count].partnerLoationCount;
            if (loationCount && (loationCount != '0')) {
                sliderObj.location = (loationCount == 'ALL') ? this.translate.instant('ALL_LOCATIONS')
                    : loationCount + " " + this.translate.instant('LOCATIONS');
            } else {
                sliderObj.location = '';
            }

            if (sliderObj.isTarget && this.favOffers[count].offerPoints > 0) {
                if (this.favOffers[count].offerPoints > this.memberInfo.availableBalanceMiles) {
                    let percentValue = Math.round((this.memberInfo.availableBalanceMiles /
                        this.favOffers[count].offerPoints) * 100);
                    if (percentValue > 100) {
                        percentValue = 100;
                    }
                    sliderObj.myTarget = percentValue;
                } else {
                    sliderObj.myTarget = 100;
                }
            }
            else {
                sliderObj.myTarget = null;
            }

            favOffers.push(sliderObj)
        }

        this.favOffersData = favOffers;
    }

    updateTargetForFavLocations() {

        let favPartnerLocations = [];

        for (let count = 0; count < this.favParnerLocations.length; count++) {
            let sliderObj = new SliderData();
            sliderObj.name = this.favParnerLocations[count].partnerName;
            sliderObj.title = this.favParnerLocations[count].partnerName;
            sliderObj.img = this.favParnerLocations[count].imagePath;
            sliderObj.logo = this.favParnerLocations[count].partnerLogoPath;
            sliderObj.addressId = this.favParnerLocations[count].addressId;
            sliderObj.storeName = this.favParnerLocations[count].storeName;
            sliderObj.partnerCode = this.favParnerLocations[count].partnerCode;
            sliderObj.description = this.favParnerLocations[count].addressDescription;
            sliderObj.distance = Number(this.favParnerLocations[count].distance.toFixed(2));
            sliderObj.latitude = this.favParnerLocations[count].latitude;
            sliderObj.longitude = this.favParnerLocations[count].longitude;
            sliderObj.terms = this.favParnerLocations[count].terms;
            sliderObj.termsType = this.favParnerLocations[count].termsType;
            sliderObj.isFavourite = (this.favParnerLocations[count].isFavorite == 'Y');
            sliderObj.lastCheckinTime = this.favParnerLocations[count].lastCheckinTime;
            sliderObj.pageTitle = this.appConstants.HEADING_MY_FAVOURITE_LOCATIONS;
            sliderObj.targetId = null;
            sliderObj.offerId = null;
            sliderObj.offers = this.translate.instant('OFFERS');
            sliderObj.distanceDenom = ' ' + this.translate.instant('KM') + ' ' + this.translate.instant('APPROX');

            if (this.favParnerLocations[count].numberOfOffers != null)
                sliderObj.offersCount = this.favParnerLocations[count].numberOfOffers;
            else
                sliderObj.offersCount = 0;

            favPartnerLocations.push(sliderObj);
        }

        this.favParnerLocationsData = favPartnerLocations;
    }

    // updateMyVouchers() {
    //     let vouchers = [];

    //     for (let count = 0; count < this.vouchers.length; count++) {
    //         let sliderObj = new SliderData();
    //         sliderObj.name = "Starbucks" + count;
    //         sliderObj.title = "Starbucks" + count;
    //         sliderObj.img = null;
    //         sliderObj.logo = null;
    //         sliderObj.addressId = null;
    //         sliderObj.storeName = null;
    //         sliderObj.partnerCode = "Starbucks" + count;
    //         sliderObj.description = "Starbucks" + count;
    //         sliderObj.distance = 10;
    //         sliderObj.latitude = 0;
    //         sliderObj.longitude = 0;
    //         sliderObj.terms = "";
    //         sliderObj.termsType = "";
    //         sliderObj.isFavourite = true;
    //         sliderObj.lastCheckinTime = null;
    //         sliderObj.pageTitle = this.appConstants.HEADING_MY_FAVOURITE_LOCATIONS;
    //         sliderObj.targetId = null;
    //         sliderObj.offerId = null;
    //         sliderObj.offers = this.translate.instant("OFFERS");
    //         sliderObj.distanceDenom =
    //             " " +
    //             this.translate.instant("KM") +
    //             " " +
    //             this.translate.instant("APPROX");
    //         sliderObj.offersCount = 0;

    //         vouchers.push(sliderObj);
    //     }

    //     this.vouchersData = vouchers;
    // }
    sortTransactionByDate(transactions: Array<TransactionInfo>) {
        if (transactions && (transactions.length > 0)) {
            this.transactionsByDate = {};
            transactions.sort((val1: TransactionInfo, val2: TransactionInfo) => {
                let diffValue = 0;
                if (val1 && val2 && val1.transactionDate && val2.transactionDate) {
                    let date1 = new Date(val1.transactionDate);
                    let date2 = new Date(val2.transactionDate);
                    diffValue = (date1 < date2) ? 1 : -1;
                } else if (val1 && val1.transactionDate) {
                    diffValue = -1;
                } else if (val2 && val2.transactionDate) {
                    diffValue = 1;
                }
                return diffValue;
            });
            for (let count = 0; count < transactions.length; count++) {
                let transInfo = transactions[count];
                let tDate: string = ' ';
                if (transInfo.transactionDate) {
                    tDate = this.clientUtils.getFormattedDate('yMMMd', transInfo.transactionDate);
                }
                this.transactionsByDate[tDate] = this.transactionsByDate[tDate] || [];
                this.transactionsByDate[tDate].push(transInfo);
            }
            this.transactionDates = Object.keys(this.transactionsByDate);
        } else {
            this.transactionDates = [];
            this.transactionsByDate = {};
        }
    }


    viewAll(view: string) {
        if (view === "ALL_MY_TARGETS") {
            this.googleAnalyticsUtils.trackEvent(
                this.appConstants.MY_PROFILE_SCREEN,
                this.appConstants.VIEW_ALL_TARGETS_EVENT
            );
            if (this.networkService.isOnline()) {
                const data = {
                    pageUrl: "my-all-targets",
                    pageTitle: view,
                    bodyClass: "my-all-targets"
                };

                this.navCtrl.push(MyTargetsAllPage, data);
            } else {
                this.clientUtils.showAlert(
                    this.translate.instant("PLEASE_CHECK_NETWORK_CONNECTION")
                );
            }
        } else if (view === "MY_VOUCHERS") {
            this.googleAnalyticsUtils.trackEvent(
                this.appConstants.MY_PROFILE_SCREEN,
                this.appConstants.VIEW_ALL_VOUCHERS_EVENT
            );
            if (this.networkService.isOnline()) {
                const data = {
                    pageUrl: "my-vouchers",
                    pageTitle: view,
                    bodyClass: "my-vouchers"
                };
                this.navCtrl.push(MyVouchers, data);
            } else {
                this.clientUtils.showAlert(
                    this.translate.instant("PLEASE_CHECK_NETWORK_CONNECTION")
                );
            }
        }
    }

    editProfileTapped() {
        if (this.networkService.isOnline()) {
            this.navCtrl.push(EnrollmentPage);
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

    refreshButtonTapped() {
        if (this.isRefreshing != true) {
            this.isRefreshing = true;
            this.content.scrollToTop(0);
            this.syncDataUtils.processPageCode(this.appConstants.MY_PROFILE_SCREEN)
                .then((result: boolean) => {
                    this.isRefreshing = false;
                });
        }
    }
}
