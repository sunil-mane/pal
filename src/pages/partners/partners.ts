import {Component, ViewChild} from '@angular/core';
import {Content, NavController, NavParams} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {OfferUtils} from '../../utils/commons/offer.utils';
import {PartnerLocationInfo} from '../../dto/partners.dto';
import {OfferResponse,OfferInfo} from '../../dto/offers.dto';
import {ServiceConstants} from '../../constants/service.constants';
import {McfLoaderService} from '../../services/commons/service.loading';
import {GoogleAnalyticsUtils} from '../../utils/commons/google-analytics.utils';
import {AppConstants} from '../../constants/app.constants';

@Component({
    selector: 'page-partners',
    templateUrl: 'partners.html'
})
export class PartnersPage {

    @ViewChild(Content) content: Content;

    pageTitle: string = '';
    partnerLocationInfo: PartnerLocationInfo = null;
    offers: Array<OfferInfo> = [];
    isRefreshing: boolean = false;
    private shouldLoadOffers: boolean = true;
    private offersIndex: number = 1;
    private noOfferText: string = '';

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private translate: TranslateService,
                private configUtils: ConfigUtils,
                private offerUtils: OfferUtils,
                private mcfLoadService: McfLoaderService,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private appConstants: AppConstants,
                private serviceConstants: ServiceConstants) {

    }

    ngOnInit() {
        this.googleAnalyticsUtils.trackPage(this.appConstants.PARTNER_LOCATION_DETAIL_SCREEN);
        if (this.navParams && this.navParams.data) {
            this.pageTitle = this.navParams.data.pageUrl;
            this.partnerLocationInfo = this.navParams.data.partnerDetail;
        }
        this.fetchOffersByLocation();
    }

    doInfinite(infiniteScroll: any) {
        this.fetchOffersByLocation().then(() => {
            infiniteScroll.complete();
        });
    }

    fetchOffersByLocation() {
        return new Promise(resolve => {
            if (this.shouldLoadOffers && this.partnerLocationInfo.addressId) {
                let numOfRecords = this.configUtils.getNumOfRecordsForKey(this.serviceConstants.PAGINATION_NO_OF_RECORDS);
                let startIndex = this.offersIndex;
                let endIndex = this.offersIndex + numOfRecords - 1;
                if (this.offers.length <= 0)
                    this.mcfLoadService.show('');
                this.offerUtils.fetchOffersPartnerLocation(this.partnerLocationInfo.addressId, startIndex, endIndex,
                    (result: OfferResponse) => {
                        this.mcfLoadService.hide();
                        if (result.data && (result.data.length < numOfRecords)) {
                            this.shouldLoadOffers = false;
                        } else {
                            this.offersIndex = endIndex + 1;
                        }
                        let tempArray = this.offers;
                        for (let item of result.data) {
                            tempArray.push(item);
                        }
                        this.offers = tempArray;
                        let maxLimit = this.configUtils.getPaginationLimit();
                        if (this.offers.length >= maxLimit) {
                            this.shouldLoadOffers = false;
                        }
                        this.noOfferText = this.translate.instant('SEARCH_NO_OFFER');
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

    refreshButtonTapped() {
        if (this.isRefreshing != true) {
            this.isRefreshing = true;
            this.content.scrollToTop(0);
            this.noOfferText = '';
            this.offers = [];
            this.offersIndex = 1;
            this.shouldLoadOffers = true;
            this.fetchOffersByLocation().then(() => {
                this.isRefreshing = false;
            });
        }
    }
}
