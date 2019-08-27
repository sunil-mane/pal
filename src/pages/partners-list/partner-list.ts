import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, ModalController, Content} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {TermsPage} from '../terms/terms';
import {PartnersPage} from '../partners/partners';
import {PartnerLocationInfo, PartnerInfo, PartnerLocationsResponse} from '../../dto/partners.dto';
import {SliderData} from '../../dto/slider.dto';
import {ClientUtils} from '../../utils/commons/client.utils';
import {PartnerUtils} from '../../utils/commons/partner.utils';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {AppConstants} from '../../constants/app.constants';
import {ServiceConstants} from '../../constants/service.constants';
import {McfLoaderService} from '../../services/commons/service.loading';
import {GoogleAnalyticsUtils} from '../../utils/commons/google-analytics.utils';


@Component({
    selector: 'page-partner-list',
    templateUrl: 'partner-list.html'
})

export class PartnersListPage {

    @ViewChild(Content) content: Content;

    pageTitle: string = '';
    offerId: number = null;
    partnerDetail: PartnerInfo = null;
    partnerLocations: Array<PartnerLocationInfo> = [];
    isRefreshing: boolean = false;
    private shouldLoadLocations: boolean = true;
    private locationIndex: number = 1;
    private noLocationText: string = '';

    constructor(public navCtrl: NavController,
                public modalCtrl: ModalController,
                public navParams: NavParams,
                private translate: TranslateService,
                private appConstants: AppConstants,
                private serviceConstants: ServiceConstants,
                private mcfLoadService: McfLoaderService,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private partnerUtils: PartnerUtils,
                private configUtils: ConfigUtils,
                private clientUtils: ClientUtils) {

    }

    ngOnInit() {
        this.googleAnalyticsUtils.trackPage(this.appConstants.PARTNER_DETAIL_SCREEN);
        if (this.navParams && this.navParams.data) {
            this.offerId = this.navParams.data.offerId;
            this.partnerDetail = this.navParams.data.parnterDetail;
            if (this.partnerDetail.organizationDescription) {
                this.pageTitle = this.partnerDetail.organizationDescription.replace(/\s/g, '-').toLowerCase();
            }
            this.fetchPartnerLocation();
        }
    }

    openWebSite(partnerDetail: PartnerInfo) {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_DETAIL_SCREEN, this.appConstants.PARTNER_TERMS_EVENT);
        let partnerTerms = partnerDetail.terms;
        if (!this.clientUtils.isNullOrEmpty(partnerTerms)) {
            if (partnerDetail.termsType == this.serviceConstants.TERMS_CONTENT_TYPE_U) {
                this.clientUtils.openWebURL(partnerTerms);
            } else if ((partnerDetail.termsType == this.serviceConstants.TERMS_CONTENT_TYPE_H) ||
                        (partnerDetail.termsType == '')) {
                let data = {
                    pageTitle: 'PARTNER_TERMS',
                    contentType: partnerDetail.termsType,
                    content: partnerTerms
                };
                this.navCtrl.push(TermsPage, {data: data});
            }
        }
    }

    viewDetails(partnerLocation: PartnerLocationInfo) {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_DETAIL_SCREEN, this.appConstants.LOCATION_OFFER_EVENT);
        const pageUrl = partnerLocation.storeName;
        let sliderObj = new SliderData();
        sliderObj.name = partnerLocation.partnerName;
        sliderObj.title = partnerLocation.partnerName;
        sliderObj.img = partnerLocation.imagePath;
        sliderObj.logo = partnerLocation.partnerLogoPath;
        sliderObj.addressId = partnerLocation.addressId;
        sliderObj.storeName = partnerLocation.storeName;
        sliderObj.partnerCode = partnerLocation.partnerCode;
        sliderObj.distance = Number(partnerLocation.distance.toFixed(2));
        sliderObj.latitude = partnerLocation.latitude;
        sliderObj.longitude = partnerLocation.longitude;
        sliderObj.isFavourite = (partnerLocation.isFavorite == 'Y');
        sliderObj.offersCount = (partnerLocation.numberOfOffers != null) ? partnerLocation.numberOfOffers : 0;
        sliderObj.pageTitle = this.appConstants.HEADING_MY_FAVOURITE_LOCATIONS;
        sliderObj.targetId = null;
        sliderObj.offerId = null;
        sliderObj.offers = this.translate.instant('OFFERS');
        sliderObj.distanceDenom = ' ' + this.translate.instant('KM') + ' ' + this.translate.instant('APPROX');
        const data = {
            pageUrl: pageUrl,
            partnerDetail: sliderObj
        };
        this.navCtrl.push(PartnersPage, data);
    }

    fetchPartnerLocation() {
        return new Promise(resolve => {
            if (this.shouldLoadLocations) {
                let numOfRecords = this.configUtils.getNumOfRecordsForKey(this.serviceConstants.PAGINATION_NO_OF_RECORDS);
                let startIndex = this.locationIndex;
                let endIndex = this.locationIndex + numOfRecords - 1;
                if (this.partnerLocations.length <= 0)
                    this.mcfLoadService.show('');
                this.partnerUtils.fetchPartnerByLocations(this.offerId, this.partnerDetail.partnerCode, startIndex, endIndex,
                    (result: PartnerLocationsResponse) => {
                        this.mcfLoadService.hide();
                        if (result.data && (result.data.length < numOfRecords)) {
                            this.shouldLoadLocations = false;
                        } else {
                            this.locationIndex = endIndex + 1;
                        }
                        let tempArray = this.partnerLocations;
                        for (let item of result.data) {
                            item.distance = Number(item.distance.toFixed(2));
                            item.numberOfOffers = (item.numberOfOffers != null) ? item.numberOfOffers : 0;
                            tempArray.push(item);
                        }
                        this.partnerLocations = tempArray;
                        let maxLimit = this.configUtils.getPaginationLimit();
                        if (this.partnerLocations.length >= maxLimit) {
                            this.shouldLoadLocations = false;
                        }
                        this.noLocationText = this.translate.instant('SEARCH_NO_PARTNER_LOCATION');
                        resolve(true);
                    }, (error: any) => {
                        console.log('Fetch Offers By Location Error :\n' + JSON.stringify(error));
                        this.mcfLoadService.hide();
                        resolve(true);
                    });
            } else {
                resolve(true);
            }
        });
    }

    doInfinite(infiniteScroll: any) {
        this.fetchPartnerLocation().then(() => {
            infiniteScroll.complete();
        });
    }

    refreshButtonTapped() {
        if (this.isRefreshing != true) {
            this.isRefreshing = true;
            this.content.scrollToTop(0);
            this.noLocationText = '';
            this.partnerLocations = [];
            this.locationIndex = 1;
            this.shouldLoadLocations = true;
            this.fetchPartnerLocation().then(() => {
                this.isRefreshing = false;
            });
        }
    }
}
