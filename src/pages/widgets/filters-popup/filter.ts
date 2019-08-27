import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {OfferInfo} from '../../../dto/offers.dto';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {AppConstants} from '../../../constants/app.constants';
import {LanguageConstants} from '../../../constants/language.constants';


@Component({
    templateUrl: 'filter.html',
    selector: 'filter-popup-component'
})
export class FilterPopupPage {

    isEarn: boolean = true;
    isBurn: boolean = false;
    isPromotion: boolean = false;
    isRecommended: boolean = false;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public languageConstants: LanguageConstants,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private appConstants: AppConstants,
                public viewController: ViewController) {

        let offerFilterInfo: OfferInfo = navParams.get('data');
        if (offerFilterInfo && offerFilterInfo.earnBurnFlag) {
            this.isEarn = (offerFilterInfo.earnBurnFlag == 'E');
            this.isBurn = (offerFilterInfo.earnBurnFlag == 'B');
        }
        if (offerFilterInfo && offerFilterInfo.special) {
            this.isPromotion = (offerFilterInfo.special == 'Y');
        }
        if (offerFilterInfo && offerFilterInfo.featured) {
            this.isRecommended = (offerFilterInfo.featured == 'Y');
        }
    }


    dismiss() {
        this.viewController.dismiss();
    }

    earnValueChanged() {
        this.isBurn = !this.isEarn;
        this.googleAnalyticsUtils.trackEvent(this.appConstants.SEARCH_OFFER_SCREEN, this.appConstants.SEARCH_EARN_OFFER_FILTER_EVENT);
    }

    burnValueChanged() {
        this.isEarn = !this.isBurn;
        this.googleAnalyticsUtils.trackEvent(this.appConstants.SEARCH_OFFER_SCREEN, this.appConstants.SEARCH_BURN_OFFER_FILTER_EVENT);
    }

    saveFilters() {
        let offerFilterInfo = new OfferInfo();
        offerFilterInfo.earnBurnFlag = this.isEarn ? 'E' : 'B';
        offerFilterInfo.special = this.isPromotion ? 'Y' : 'N';
        offerFilterInfo.featured = this.isRecommended ? 'Y' : 'N';
        this.viewController.dismiss(offerFilterInfo);
    }

}
