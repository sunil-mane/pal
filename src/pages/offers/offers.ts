import {Component} from '@angular/core';
import {NavController, NavParams, ModalController} from 'ionic-angular';
import {SliderData} from '../../dto/slider.dto';
import {GoogleAnalyticsUtils} from '../../utils/commons/google-analytics.utils';
import {AppConstants} from '../../constants/app.constants';
import {SessionUtils} from '../../utils/commons/session.utils';

@Component({
    selector: 'page-offers',
    templateUrl: 'offers.html'
})

export class OffersPage {
    pageTitle:String;
    offersData:SliderData;
    currentIndex:number;

    constructor(public navCtrl:NavController,
                public navParams:NavParams,
                public modalCtrl:ModalController,
                private sessionUtils:SessionUtils,
                private googleAnalyticsUtils:GoogleAnalyticsUtils,
                private appConstants:AppConstants) {
    }

    ngOnInit() {
        this.sendGATrackPage();
        this.offersData = this.navParams.data.data;
        this.currentIndex = this.navParams.data.currentIndex;
        this.pageTitle = this.offersData[0].pageTitle;
        // console.log(JSON.stringify(this.offersData));

    }


    sendGATrackPage() {
        if (this.pageTitle == this.appConstants.HEADING_NEAR_ME_OFFERS) {
            if (this.sessionUtils.isUserLoggedIn()) {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.USER_HOME_SCREEN, this.appConstants.NEAR_ME_OFFER_SCREEN);
            } else {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.NEAR_ME_OFFER_SCREEN);
            }
        } else if (this.pageTitle == this.appConstants.HEADING_NEAR_ME_STORES) {
            if (this.sessionUtils.isUserLoggedIn()) {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.USER_HOME_SCREEN, this.appConstants.NEAR_ME_STORE_SCREEN);
            } else {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.NEAR_ME_STORE_SCREEN);
            }
        } else if (this.pageTitle == this.appConstants.HEADING_RECOMMENDED_OFFERS) {
            if (this.sessionUtils.isUserLoggedIn()) {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.USER_HOME_SCREEN, this.appConstants.RECOMMENDED_OFFER_SCREEN);
            } else {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.RECOMMENDED_OFFER_SCREEN);
            }
        } else if (this.pageTitle == this.appConstants.HEADING_MY_FAVOURITE_OFFERS) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.MY_FAVORITES_OFFER_SCREEN);
        } else if (this.pageTitle == this.appConstants.HEADING_MY_FAVOURITE_LOCATIONS) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.MY_FAVORITES_LOCATION_SCREEN);
        }
    }


}
