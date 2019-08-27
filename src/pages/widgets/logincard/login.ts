import {Component,Input} from '@angular/core';
import {NavController,ModalController,Events} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {LoginPage} from '../../login/login';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {ConfigUtils} from '../../../utils/commons/config.utils';
import {ClientUtils} from '../../../utils/commons/client.utils';
import {AppConstants} from '../../../constants/app.constants';
import {NetworkService} from '../../../services/commons/network.service';
import { TncPage } from '../../tnc/tnc';

@Component({
    selector: 'login-component',
    templateUrl: 'login.html'
})




export class LoginCardComponent {

    @Input() data: any;
    loginCardImageURL: string = '';
    guestUserText: string = '';
    shouldShowEnrollment: boolean = false;

    constructor(public navCtrl: NavController,
                public modalCtrl: ModalController,
                private configUtils: ConfigUtils,
                private clientUtils: ClientUtils,
                private events: Events,
                private translate: TranslateService,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private appConstants: AppConstants,
                private networkService: NetworkService) {
    }

    ngOnInit() {

        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.loginCardImageURL = this.configUtils.getLoginCardImageURL();
            this.guestUserText = this.configUtils.getGuestUserText();
        });

        this.events.subscribe(this.appConstants.EVENT_APP_LANGUAGE_CHANGED, () => {
            this.guestUserText = this.configUtils.getGuestUserText();
        });

        this.loginCardImageURL = this.configUtils.getLoginCardImageURL();
        this.guestUserText = this.configUtils.getGuestUserText();
        this.shouldShowEnrollment = this.clientUtils.shouldShowEnrollment();
    }

    openModal() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.LOGIN_EVENT);
        let modal = this.modalCtrl.create(LoginPage);
        modal.present();
    }

    enrollUser() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.USER_ENROLLMENT_EVENT);
        if (this.networkService.isOnline()) {
            if (this.shouldShowEnrollment == true) {
                this.events.publish(this.appConstants.EVENT_OPEN_ENROLLMENT_PAGE);
            } else {
                this.clientUtils.openExternalWebURL(this.configUtils.getEnrollmentLink());
            }
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

}
