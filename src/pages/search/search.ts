import { LoginPage } from './../login/login';
import { Component, ViewChild, Renderer, NgZone } from '@angular/core';
import { Keyboard } from 'ionic-native';
import { NavController, Content, ModalController, FabContainer, Events, Modal } from 'ionic-angular';
import { IndustryTypeInfo, IndustryTypeResponse, VouchersInfo, VouchersResponse } from "../../dto/partners.dto";
import { PartnerInfo, PartnerResponse } from '../../dto/partners.dto';
import { PartnerLocationsResponse, PartnerLocationInfo } from '../../dto/partners.dto';
import { OfferResponse, OfferInfo } from '../../dto/offers.dto';
import { ServiceErrorInfo } from '../../dto/common.dto';
import { OfferUtils } from '../../utils/commons/offer.utils';
import { PartnerUtils } from '../../utils/commons/partner.utils';
import { SessionUtils } from '../../utils/commons/session.utils';
import { ConfigUtils } from '../../utils/commons/config.utils';
import { GoogleAnalyticsUtils } from '../../utils/commons/google-analytics.utils';
import { AppConstants } from '../../constants/app.constants';
import { ServiceConstants } from '../../constants/service.constants';
import { FilterPopupPage } from '../widgets/filters-popup/filter';
import { TranslateService } from 'ng2-translate';
import { ClientUtils } from '../../utils/commons/client.utils';
import { AlertController } from 'ionic-angular';

@Component({
    selector: 'page-search',
    templateUrl: 'search.html',

})

export class SearchPage {

    @ViewChild(Content) content: Content;
    @ViewChild('fab') fabContainer: FabContainer;

    private SEARCH_PARTNERS_TAB = 'tab01';
    private SEARCH_OFFERS_TAB = 'tab02';
    private SEARCH_LOCATIONS_TAB = 'tab03';
    private SEARCH_VOUCHERS_TAB = "tab04";
    private INDUSTRY_TYPE_DEFAULT_CODE = 'default_code';

    private partnersIndex: number = 1;
    private offersIndex: number = 1;
    private locationsIndex: number = 1;
    private vouchersIndex: number = 1;
    private shouldLoadPartners: boolean = true;
    private shouldLoadOffers: boolean = true;
    private shouldLoadLocations: boolean = true;
    private shouldLoadVouchers: boolean = true;
    private searchedPartners: Array<PartnerInfo> = [];
    private searchedOffers: Array<OfferInfo> = [];
    private searchedLocations: Array<PartnerLocationInfo> = [];
    private searchedVouchers: Array<VouchersInfo> = [];
    private industryTypes: Array<IndustryTypeInfo> = [];
    private selectIndustryTypeCode: string = null;
    private offerFilterInfo: OfferInfo = null;
    private activeTab: string = '';
    partnersSearchKey: string = '';
    offersSearchKey: string = '';
    locationsSearchKey: string = '';
    vouchersSearchKey: string = "";
    searchByPartnerPlaceholder: string = '';
    searchByOfferPlaceholder: string = '';
    searchByLocationPlaceholder: string = '';
    searchByVoucherPlaceholder: string = "";
    searchNoPartnerText: string = '';
    searchNoOfferText: string = '';
    searchNoLocationText: string = '';
    searchNoVoucherText: string = "";
    shouldShowCancel: boolean = false;
    shouldShowScrollTopButton: boolean = false;
    shouldShowOfferFilterButton: boolean = false;
    isLoadingPartners: boolean = false;
    isLoadingOffers: boolean = false;
    isLoadingLocations: boolean = false;
    isLoadingVouchers: boolean = false;
    isRefreshing: boolean = false;
    shouldShowVouchers = false;

    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        public clientUtils: ClientUtils,
        private ngZone: NgZone,
        private events: Events,
        private offerUtils: OfferUtils,
        private render: Renderer,
        private partnerUtils: PartnerUtils,
        private configUtils: ConfigUtils,
        private googleAnalyticsUtils: GoogleAnalyticsUtils,
        private appConstants: AppConstants,
        private sessionUtils: SessionUtils,
        private translate: TranslateService,
        private serviceConstants: ServiceConstants,
        private alertCtrl: AlertController) {

    }

    ngOnInit() {

        this.shouldShowVouchers = this.sessionUtils.getVoucherFlag();

        this.events.subscribe(this.appConstants.EVENT_APP_LANGUAGE_CHANGED, () => {

            this.searchByOfferPlaceholder = this.translate.instant('SEARCH_BY_OFFER_NAME');
            this.searchByLocationPlaceholder = this.translate.instant('SEARCH_BY_PARTNER_LOCATION');
            this.searchByVoucherPlaceholder = this.translate.instant(
                "SEARCH_BY_PARTNER_VOUCHER"
            );
            if (this.searchNoPartnerText && (this.searchNoPartnerText.length > 0)) {
                this.searchNoPartnerText = this.translate.instant('SEARCH_NO_PARTNER');
            }
            if (this.searchNoOfferText && (this.searchNoOfferText.length > 0)) {
                this.searchNoOfferText = this.translate.instant('SEARCH_NO_OFFER');
            }
            if (this.searchNoLocationText && (this.searchNoLocationText.length > 0)) {
                this.searchNoLocationText = this.translate.instant('SEARCH_NO_PARTNER_LOCATION');
            }
            if (this.searchNoVoucherText && this.searchNoVoucherText.length > 0) {
                this.searchNoVoucherText = this.translate.instant(
                    "SEARCH_NO_PARTNER_VOUCHER"
                );
            }
            this.searchByPartnerPlaceholder = this.translate.instant('SEARCH_BY_PARTNER_NAME');
            this.updateAllIndustryTypeText();
            
        });

        this.searchByPartnerPlaceholder = this.translate.instant('SEARCH_BY_PARTNER_NAME');
        this.searchByOfferPlaceholder = this.translate.instant('SEARCH_BY_OFFER_NAME');
        this.searchByLocationPlaceholder = this.translate.instant('SEARCH_BY_PARTNER_LOCATION');
        this.searchByVoucherPlaceholder = this.translate.instant(
            "SEARCH_BY_PARTNER_VOUCHER"
        );

        this.content.ionScroll.subscribe(() => {
            this.contentScrolling();
        });

        this.activeTab = this.SEARCH_PARTNERS_TAB;
        this.offerFilterInfo = new OfferInfo();
        this.offerFilterInfo.earnBurnFlag = 'E';
        this.offerFilterInfo.featured = 'N';
        this.offerFilterInfo.special = 'N';
        this.getAllIndustryTypes();
        this.loadData();
    }

    searchWithKeyword(tab: string) {
        Keyboard.close();
        if (tab == this.SEARCH_PARTNERS_TAB) {
            this.partnersIndex = 1;
            this.shouldLoadPartners = true;
            this.searchedPartners = [];
            this.googleAnalyticsUtils.trackEvent(this.appConstants.SEARCH_PARTNER_SCREEN,
                this.appConstants.SEARCH_PARTNER_KEY_EVENT);
        } else if (tab == this.SEARCH_OFFERS_TAB) {
            this.offersIndex = 1;
            this.shouldLoadOffers = true;
            this.searchedOffers = [];
            this.googleAnalyticsUtils.trackEvent(this.appConstants.SEARCH_OFFER_SCREEN,
                this.appConstants.SEARCH_OFFER_KEY_EVENT);
        } else if (tab == this.SEARCH_LOCATIONS_TAB) {
            this.locationsIndex = 1;
            this.shouldLoadLocations = true;
            this.searchedLocations = [];
            this.googleAnalyticsUtils.trackEvent(this.appConstants.SEARCH_LOCATION_SCREEN,
                this.appConstants.SEARCH_LOCATION_KEY_EVENT);
        } else if (tab == this.SEARCH_VOUCHERS_TAB) {
            this.vouchersIndex = 1;
            this.shouldLoadVouchers = true;
            this.searchedVouchers = [];
            this.googleAnalyticsUtils.trackEvent(
                this.appConstants.SEARCH_VOUCHER_SCREEN,
                this.appConstants.SEARCH_VOUCHER_KEY_EVENT
            );
        }

        this.content.scrollToTop(0);
        this.loadData();
    }

    onCancel() {

    }

    activeTabEvent(tab: string) {
        Keyboard.close();
        let shouldLoadData = false;
        if (tab == this.SEARCH_PARTNERS_TAB) {
            shouldLoadData = (this.searchedPartners.length == 0);
            this.googleAnalyticsUtils.trackPage(this.appConstants.SEARCH_PARTNER_SCREEN);
        } else if (tab == this.SEARCH_OFFERS_TAB) {
            shouldLoadData = (this.searchedOffers.length == 0);
            this.googleAnalyticsUtils.trackPage(this.appConstants.SEARCH_OFFER_SCREEN);
        } else if (tab == this.SEARCH_LOCATIONS_TAB) {
            shouldLoadData = (this.searchedLocations.length == 0);
            this.googleAnalyticsUtils.trackPage(this.appConstants.SEARCH_LOCATION_SCREEN);
        } else if (tab == this.SEARCH_VOUCHERS_TAB) {
            shouldLoadData = this.searchedVouchers.length == 0;
            this.googleAnalyticsUtils.trackPage(
                this.appConstants.SEARCH_VOUCHER_SCREEN
            );
        }
        this.shouldShowOfferFilterButton = (tab == this.SEARCH_OFFERS_TAB);
        this.content.scrollToTop(0);
        if (shouldLoadData) {
            this.loadData();
        }
    }

    getAllIndustryTypes() {
        this.partnerUtils.fetchAllIndustryTypes(
            (result: IndustryTypeResponse) => {
                let industryTypes = result.data;
                if (industryTypes) {
                    let anArray = [];
                    let anObject = new IndustryTypeInfo();
                    anObject.active = 'Y';
                    anObject.description = '';
                    anObject.code = this.INDUSTRY_TYPE_DEFAULT_CODE;
                    anObject.logoPath = '';
                    anArray.push(anObject);
                    if (!this.selectIndustryTypeCode) {
                        this.selectIndustryTypeCode = anObject.code;
                    }
                    for (let index = 0; index < industryTypes.length; index++) {
                        let anObject = industryTypes[index];
                        anArray.push(anObject);
                    }
                    this.industryTypes = anArray;
                    this.updateAllIndustryTypeText();
                }
            }, (error: ServiceErrorInfo) => {
                console.log('Industry Types Error:\n' + JSON.stringify(error));
                if (this.industryTypes.length == 0) {
                    let msg = '';
                    if (error && error.message && (error.message.trim().length > 0)) {
                        msg = error.message.trim();
                    } else {
                        msg = this.translate.instant('SOMETHING_WENT_WRONG');
                    }
                    this.clientUtils.showToast(msg);
                }
            });
    }

    updateAllIndustryTypeText() {
        if (this.industryTypes && (this.industryTypes.length > 0)) {
            let anObject: IndustryTypeInfo = this.industryTypes[0];
            if (anObject.code === this.INDUSTRY_TYPE_DEFAULT_CODE) {
                anObject.description = this.translate.instant('ALL');
            }
        }
    }

    industryTypesTapped(industryType: IndustryTypeInfo) {
        Keyboard.close();
        this.googleAnalyticsUtils.trackEvent(this.appConstants.SEARCH_PARTNER_SCREEN, this.appConstants.INDUSTRY_TYPE_FILTER_EVENT);
        if (industryType && (industryType.code !== this.selectIndustryTypeCode)) {
            this.selectIndustryTypeCode = industryType.code;
            this.partnersIndex = 1;
            this.shouldLoadPartners = true;
            this.searchedPartners = [];
            this.content.scrollToTop(0);
            this.loadData();
        }
    }

    loadData() {
        return new Promise(resolve => {
            if (this.activeTab == this.SEARCH_PARTNERS_TAB) {
                if (this.shouldLoadPartners) {
                    let numOfRecords = this.configUtils.getNumOfRecordsForKey(
                        this.serviceConstants.PAGINATION_NO_OF_RECORDS);
                    let startIndex = this.partnersIndex;
                    let endIndex = this.partnersIndex + numOfRecords - 1;
                    let searchKey: string = this.partnersSearchKey.trim();
                    if (searchKey.length == 0) {
                        searchKey = null;
                    }
                    let industryTypeCode = null;
                    if (this.selectIndustryTypeCode &&
                        (this.selectIndustryTypeCode !== this.INDUSTRY_TYPE_DEFAULT_CODE)) {
                        industryTypeCode = this.selectIndustryTypeCode;
                    }
                    this.searchNoPartnerText = '';
                    if (this.searchedPartners.length == 0) {
                        this.isLoadingPartners = true;
                    }
                    this.partnerUtils.fetchAllPartners(startIndex, endIndex, searchKey, industryTypeCode,
                        (result: PartnerResponse) => {
                            this.isLoadingPartners = false;
                            if (result.data.length < numOfRecords) {
                                this.shouldLoadPartners = false;
                            } else {
                                this.partnersIndex = endIndex + 1;
                            }
                            let tempArray = this.searchedPartners;
                            for (let item of result.data) {
                                tempArray.push(item);
                            }
                            this.searchedPartners = tempArray;
                            let maxLimit = this.configUtils.getPaginationLimit();
                            if (this.searchedPartners.length >= maxLimit) {
                                this.shouldLoadPartners = false;
                            }
                            if (this.searchedPartners.length == 0) {
                                this.searchNoPartnerText = this.translate.instant('SEARCH_NO_PARTNER');
                            }
                            resolve(true);
                        }, (error: ServiceErrorInfo) => {
                            console.log('Search Partners Error:\n' + JSON.stringify(error));
                            this.isLoadingPartners = false;
                            if (this.searchedPartners.length == 0) {
                                let msg = '';
                                if (error && error.message && (error.message.trim().length > 0)) {
                                    msg = error.message.trim();
                                } else {
                                    msg = this.translate.instant('SOMETHING_WENT_WRONG');
                                }
                                this.clientUtils.showToast(msg);
                            }
                            resolve(true);
                        });
                } else {
                    resolve(true);
                }
            } else if (this.activeTab == this.SEARCH_OFFERS_TAB) {
                if (this.shouldLoadOffers) {
                    let numOfRecords = this.configUtils.getNumOfRecordsForKey(
                        this.serviceConstants.PAGINATION_NO_OF_RECORDS);
                    let startIndex = this.offersIndex;
                    let endIndex = this.offersIndex + numOfRecords - 1;
                    let searchKey: string = this.offersSearchKey.trim();
                    if (searchKey.length == 0) {
                        searchKey = null;
                    }
                    let offerInfo = new OfferInfo();
                    offerInfo.active = 'Y';
                    offerInfo.searchKey = searchKey;
                    offerInfo.earnBurnFlag = this.offerFilterInfo.earnBurnFlag;
                    if (this.offerFilterInfo.special == 'Y') {
                        offerInfo.special = 'Y';
                    }
                    if (this.offerFilterInfo.featured == 'Y') {
                        offerInfo.featured = 'Y';
                    }
                    if (this.sessionUtils.isUserLoggedIn()) {
                        let memberInfo = this.sessionUtils.getMemberInfo();
                        offerInfo.memberUid = memberInfo.memUID;
                    }
                    this.searchNoOfferText = '';
                    if (this.searchedOffers.length == 0) {
                        this.isLoadingOffers = true;
                    }
                    this.offerUtils.fetchAllOffers(startIndex, endIndex, offerInfo,
                        (result: OfferResponse) => {
                            this.isLoadingOffers = false;
                            if (result.data.length < numOfRecords) {
                                this.shouldLoadOffers = false;
                            } else {
                                this.offersIndex = endIndex + 1;
                            }
                            let tempArray = this.searchedOffers;
                            for (let item of result.data) {
                                tempArray.push(item);
                            }
                            this.searchedOffers = tempArray;
                            let maxLimit = this.configUtils.getPaginationLimit();
                            if (this.searchedOffers.length >= maxLimit) {
                                this.shouldLoadOffers = false;
                            }
                            if (this.searchedOffers.length == 0) {
                                this.searchNoOfferText = this.translate.instant('SEARCH_NO_OFFER');
                            }
                            resolve(true);
                        }, (error: ServiceErrorInfo) => {
                            console.log('Search Offers Error:\n' + JSON.stringify(error));
                            this.isLoadingOffers = false;
                            if (this.searchedOffers.length == 0) {
                                let msg = '';
                                if (error && error.message && (error.message.trim().length > 0)) {
                                    msg = error.message.trim();
                                } else {
                                    msg = this.translate.instant('SOMETHING_WENT_WRONG');
                                }
                                this.clientUtils.showToast(msg);
                            }
                            resolve(true);
                        });
                } else {
                    resolve(true);
                }
            } else if (this.activeTab == this.SEARCH_LOCATIONS_TAB) {
                if (this.shouldLoadLocations) {
                    let numOfRecords = this.configUtils.getNumOfRecordsForKey(
                        this.serviceConstants.PAGINATION_NO_OF_RECORDS);
                    let startIndex = this.locationsIndex;
                    let endIndex = this.locationsIndex + numOfRecords - 1;
                    let searchKey: string = this.locationsSearchKey.trim();
                    if (searchKey.length == 0) {
                        searchKey = null;
                    }
                    this.searchNoLocationText = '';
                    if (this.searchedLocations.length == 0) {
                        this.isLoadingLocations = true;
                    }
                    this.partnerUtils.fetchAllPartnerLocations(startIndex, endIndex, searchKey,
                        (result: PartnerLocationsResponse) => {
                            this.isLoadingLocations = false;
                            if (result.data.length < numOfRecords) {
                                this.shouldLoadLocations = false;
                            } else {
                                this.locationsIndex = endIndex + 1;
                            }
                            let tempArray = this.searchedLocations;
                            for (let item of result.data) {
                                tempArray.push(item);
                            }
                            this.searchedLocations = tempArray;
                            let maxLimit = this.configUtils.getPaginationLimit();
                            if (this.searchedLocations.length >= maxLimit) {
                                this.shouldLoadLocations = false;
                            }
                            if (this.searchedLocations.length == 0) {
                                this.searchNoLocationText = this.translate.instant('SEARCH_NO_PARTNER_LOCATION');
                            }
                            resolve(true);
                        }, (error: ServiceErrorInfo) => {
                            console.log('Search Locations Error:\n' + JSON.stringify(error));
                            this.isLoadingLocations = false;
                            if (this.industryTypes.length == 0) {
                                let msg = '';
                                if (error && error.message && (error.message.trim().length > 0)) {
                                    msg = error.message.trim();
                                } else {
                                    msg = this.translate.instant('SOMETHING_WENT_WRONG');
                                }
                                this.clientUtils.showToast(msg);
                            }
                            resolve(true);
                        }
                    );
                }
            } else if (this.activeTab == this.SEARCH_VOUCHERS_TAB) {
                if (this.shouldLoadVouchers) {
                    let numOfRecords = this.configUtils.getNumOfRecordsForKey(
                        this.serviceConstants.PAGINATION_NO_OF_RECORDS
                    );
                    let startIndex = this.vouchersIndex;
                    let endIndex = this.vouchersIndex + numOfRecords - 1;
                    let searchKey: string = this.vouchersSearchKey.trim();
                    if (!searchKey) {
                        searchKey = null;
                    }
                    this.searchNoVoucherText = "";
                    if (this.searchedVouchers.length == 0) {
                        this.isLoadingVouchers = true;
                    }
                    this.partnerUtils.fetchAllVouchers(
                        startIndex,
                        endIndex,
                        searchKey,
                        (result: VouchersResponse) => {
                            console.log(result);
                            this.searchedVouchers = result.data;
                            this.isLoadingVouchers = false;
                            let maxLimit = this.configUtils.getPaginationLimit();
                            if (this.searchedVouchers.length >= maxLimit) {
                                this.shouldLoadVouchers = false;
                            }
                            if (this.searchedVouchers.length == 0) {
                                this.searchNoVoucherText = this.translate.instant(
                                    "SEARCH_NO_PARTNER_VOUCHER"
                                );
                            }
                            resolve(true);
                        },
                        (error: ServiceErrorInfo) => {
                            console.log("Search Locations Error:\n" + JSON.stringify(error));
                            this.isLoadingLocations = false;
                            if (this.industryTypes.length == 0) {
                                let msg = "";
                                if (error && error.message && error.message.trim().length > 0) {
                                    msg = error.message.trim();
                                } else {
                                    msg = this.translate.instant("SOMETHING_WENT_WRONG");
                                }
                                this.clientUtils.showToast(msg);
                            }
                            resolve(true);
                        }
                    );
                    setTimeout(() => {
                        // this.searchedVouchers = [
                        //   { partnerName: "Starbucks", value: 50, miles: "1,000" },
                        //   { partnerName: "Starbucks", value: 100, miles: "2,000" },
                        //   { partnerName: "Starbucks", value: 200, miles: "4,000" }
                        // ];
                        this.isLoadingVouchers = false;
                    }, 300);
                } else {
                    resolve(true);
                }
            }
        });
    }

    doInfinite(infiniteScroll: any) {
        this.loadData().then(() => {
            infiniteScroll.complete();
        });
    }

    scrollToTop(fab: FabContainer) {
        if (fab) {
            fab.close();
        }
        this.content.scrollToTop();
        // console.log(this.content.getContentDimensions());
    }

    contentScrolling() {
        if (this.fabContainer) {
            this.fabContainer.close();
        }
        let shouldShowScrollTopButton = (this.content.scrollTop > (this.content.contentHeight / 2));
        if (shouldShowScrollTopButton != this.shouldShowScrollTopButton) {
            this.ngZone.run(() => {
                this.shouldShowScrollTopButton = shouldShowScrollTopButton;
            });
        }
    }

    /**
     * filter items
     */
    doFilter(fab: FabContainer) {

        if (fab) {
            fab.close();
        }

        let body = document.getElementsByTagName('body')[0];
        let opts = {
            showBackdrop: true,
            enableBackdropDismiss: true
        };

        let profileModal = this.modalCtrl.create(FilterPopupPage, { data: this.offerFilterInfo }, opts);

        profileModal.onDidDismiss((data: OfferInfo) => {
            this.render.setElementClass(body, 'smallModal', false);
            if (data) {
                this.offerFilterInfo = data;
                this.offersIndex = 1;
                this.shouldLoadOffers = true;
                this.searchedOffers = [];
                this.content.scrollToTop(0);
                this.loadData();
            }
        });

        this.render.setElementClass(body, 'smallModal', true);
        profileModal.present();
    }

    refreshButtonTapped() {
        if (this.isRefreshing != true) {
            this.isRefreshing = true;
            Keyboard.close();
            if (this.activeTab == this.SEARCH_PARTNERS_TAB) {
                this.partnersIndex = 1;
                this.shouldLoadPartners = true;
                this.searchedPartners = [];
                this.googleAnalyticsUtils.trackEvent(this.appConstants.SEARCH_PARTNER_SCREEN,
                    this.appConstants.SEARCH_PARTNER_KEY_EVENT);
                this.getAllIndustryTypes();
            } else if (this.activeTab == this.SEARCH_OFFERS_TAB) {
                this.offersIndex = 1;
                this.shouldLoadOffers = true;
                this.searchedOffers = [];
                this.googleAnalyticsUtils.trackEvent(this.appConstants.SEARCH_OFFER_SCREEN,
                    this.appConstants.SEARCH_OFFER_KEY_EVENT);
            } else if (this.activeTab == this.SEARCH_LOCATIONS_TAB) {
                this.locationsIndex = 1;
                this.shouldLoadLocations = true;
                this.searchedLocations = [];
                this.googleAnalyticsUtils.trackEvent(this.appConstants.SEARCH_LOCATION_SCREEN,
                    this.appConstants.SEARCH_LOCATION_KEY_EVENT);
            }
            this.content.scrollToTop(0);
            this.loadData().then(() => {
                this.isRefreshing = false;
            });
        }
    }

    openModal() {

        if (!this.sessionUtils.isUserLoggedIn()) {
            let modal: Modal = this.modalCtrl.create(LoginPage);
            modal.onDidDismiss((isSuccess: boolean) => {
                if (isSuccess) {
                    //this.tab2Root = MyWalletPage;
                } else {
                    //this.tabRef.select(0);
                }
            });
            modal.present();
        } else {
            //this.tab2Root = MyWalletPage;
        }
    }
    redeemVoucher(voucher) {
        if (!this.sessionUtils.isUserLoggedIn()) {
            let modal: Modal = this.modalCtrl.create(LoginPage);
            modal.onDidDismiss((isSuccess: boolean) => {
                if (isSuccess) {
                    // this.isLoadingVouchers = true;
                    // this.partnerUtils.redeemVouchers(voucher,
                    //     (result: any) => {
                    //         console.log(result);
                    //         this.isLoadingVouchers = false;
                    //         let maxLimit = this.configUtils.getPaginationLimit();
                    //     },
                    //     (error: ServiceErrorInfo) => {
                    //         console.log("Search Locations Error:\n" + JSON.stringify(error));
                    //         this.isLoadingVouchers = false;
                    //         this.clientUtils.showToast(JSON.stringify(error));
                    //     }
                    // );
                } else {
                    //this.tabRef.select(0);
                }
            });
            modal.present();
        } else {
            let alert = this.alertCtrl.create({
                title: 'Confirm Voucher Redeem',
                message: 'Do you really want to redeem voucher?',
                buttons: [
                  {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                      console.log('Cancel clicked');
                    }
                  },
                  {
                    text: 'Yes',
                    handler: () => {
                        this.isLoadingVouchers = true;
                        this.partnerUtils.redeemVouchers(voucher,
                            (result: any) => {
                                console.log(result);
                                this.isLoadingVouchers = false;
                                this.clientUtils.showToast(JSON.stringify(result.data[0].message));
                            },
                            (error: ServiceErrorInfo) => {
                                console.log("Search Locations Error:\n" + JSON.stringify(error));
                                this.isLoadingVouchers = false;
                                this.clientUtils.showToast(JSON.stringify(error));
                            }
                        );
                    }
                  }
                ]
              });
              alert.present();

        }
    }
}
