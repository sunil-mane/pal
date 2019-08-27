
import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';
import {PartnersListPage} from '../../partners-list/partner-list';
import {SessionUtils} from '../../../utils/commons/session.utils';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {AppConstants} from '../../../constants/app.constants';
import {PartnerInfo} from '../../../dto/partners.dto';


@Component({
    selector: 'partners-card-component',
    templateUrl: 'partners.html'
})
export class PartnersCardComponent {

    @Input() data: PartnerInfo;

    constructor(public navCtrl: NavController,
                private sessionUtils: SessionUtils,
                private googleAnalyticsUtils:GoogleAnalyticsUtils,
                private appConstants:AppConstants) {

    }

    viewDetails() {
        this.sendGATrackPage();
        if (this.data && this.data.partnerCode) {
            const data = {
                offerId: null,
                parnterDetail: this.data
            };
            this.navCtrl.push(PartnersListPage, data);
        }
    }

    sendGATrackPage() {
            if (this.sessionUtils.isUserLoggedIn()) {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.USER_HOME_SCREEN, this.appConstants.FEATURED_PARTNER_EVENT);
            } else {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.FEATURED_PARTNER_EVENT);
            }
    }

}
