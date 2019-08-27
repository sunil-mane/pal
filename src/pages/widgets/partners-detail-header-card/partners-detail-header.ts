import {Component} from '@angular/core';
import {NavController,NavParams,ModalController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {McfLoaderService} from '../../../services/commons/service.loading';
import {LoginPage} from '../../login/login';
import {SessionUtils} from '../../../utils/commons/session.utils';
import {ClientUtils} from '../../../utils/commons/client.utils';
import {PartnerUtils} from '../../../utils/commons/partner.utils';
import {SocialSharingUtils} from '../../../utils/commons/social-sharing.utils';
import {GlobalizationUtils} from '../../../utils/commons/globalization.utils';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {ServiceErrorInfo, MessageResponse, MessageInfo} from "../../../dto/common.dto";
import {PartnerLocationsResponse} from '../../../dto/partners.dto';
import {SliderData} from '../../../dto/slider.dto';
import {AppConstants} from '../../../constants/app.constants';
import {ServiceConstants} from '../../../constants/service.constants';


@Component({
    selector: 'partners-detail-header-component',
    templateUrl: 'partners-detail-header.html'
})


export class PartnersDetailHeaderComponent {

    partnerLocationInfo: SliderData = null;
    showSpinnerFavourite: boolean = false;
    shouldHideCheckin: boolean = false;
    shouldHideSocialShare: boolean = false;

    constructor(public navCtrl: NavController,
                public modalCtrl: ModalController,
                public navParams: NavParams,
                private mcfLoadService: McfLoaderService,
                private clientUtils: ClientUtils,
                private socialShare: SocialSharingUtils,
                private globalizationUtils: GlobalizationUtils,
                private partnerUtils: PartnerUtils,
                private appConstants: AppConstants,
                private serviceConstants: ServiceConstants,
                private translate: TranslateService,
                private sessionUtils: SessionUtils,
                private googleAnalyticsUtils:GoogleAnalyticsUtils) {


    }

    ngOnInit() {
        this.shouldHideCheckin = this.clientUtils.shouldHideCheckin();
        this.shouldHideSocialShare = this.clientUtils.shouldHideSocialSharing();
        if (this.navParams && this.navParams.data) {
            this.partnerLocationInfo = this.navParams.data.partnerDetail;
        }
    }

    liked(item: SliderData) {
        if (this.sessionUtils.isUserLoggedIn()) {
            this.showSpinnerFavourite = true;
            this.partnerUtils.setLocationAsFavourite(item.addressId, item.isFavourite,
                (result: PartnerLocationsResponse) => {
                    this.showSpinnerFavourite = false;
                    item.isFavourite = !item.isFavourite;
                    if (item.isFavourite) {
                        let msg: string = this.translate.instant('THIS_LOCATION_SUCCESSFULLY_SET_AS_FAVOURITE');
                        this.clientUtils.showToast(msg);
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_DETAIL_SCREEN, this.appConstants.LIKE_PARTNER_EVENT);
                    } else {
                        let msg: string = this.translate.instant('THIS_LOCATION_SUCCESSFULLY_REMOVED_FROM_YOUR_FAVOURITES');
                        this.clientUtils.showToast(msg);
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_DETAIL_SCREEN, this.appConstants.UNLIKE_PARTNER_EVENT);
                    }
                }, (error) => {
                    this.showSpinnerFavourite = false;
                    let msg = '';
                    if (error && error.message && (error.message.trim().length > 0)) {
                        msg = error.message.trim();
                    } else {
                        msg = this.translate.instant('SOMETHING_WENT_WRONG');
                    }
                    this.clientUtils.showToast(msg);
                });
        } else {
            let modal = this.modalCtrl.create(LoginPage);
            modal.present();
        }
    }


    openMap(obj: SliderData) {
        if (obj.latitude && obj.longitude) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_DETAIL_SCREEN,this.appConstants.PARTNER_LOCATION_EVENT);
            let urlQuery = obj.latitude + "," + obj.longitude;
            if (obj.name) {
                urlQuery = urlQuery + '(' + obj.name + ')';
            }
            this.clientUtils.openMapURL(urlQuery);
        }
    }

    checkIn(item) {
        if (this.sessionUtils.isUserLoggedIn()) {
            if (item.isCheckedIn != true && this.partnerUtils.shouldCheckin(item.lastCheckinTime)) {
                this.mcfLoadService.show('');
                this.partnerUtils.locationCheckIn(item.addressId,
                    (result: MessageResponse) => {
                        item.isCheckedIn = true;
                        let code: string = '';
                        let langCode = this.globalizationUtils.getAppLanguage();
                        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
                            code = this.serviceConstants.SHR_CHKIN_EN;
                        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
                            code = this.serviceConstants.SHR_CHKIN_ES;
                        }
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_DETAIL_SCREEN,this.appConstants.CHECKIN_LOCATION_EVENT);
                        if (this.shouldHideSocialShare == false) {
                            this.getShareMessage(code, item.name);
                        }
                    }, (error: ServiceErrorInfo) => {
                        this.mcfLoadService.hide();
                        let msg = '';
                        if (error && error.message && (error.message.trim().length > 0)) {
                            msg = error.message.trim();
                        } else {
                            msg = this.translate.instant('SOMETHING_WENT_WRONG');
                        }
                        this.clientUtils.showToast(msg);
                    });
            } else {
                item.isCheckedIn = true;
                let msg = this.translate.instant('YOUR_ALREADY_CHECKED_IN');
                this.clientUtils.showToast(msg);
            }
        } else {
            let modal = this.modalCtrl.create(LoginPage);
            modal.present();
        }
    }

    getShareMessage(code: string, storeName: string) {
        let requestData = new MessageInfo();
        requestData.code = code;
        this.socialShare.generateShareMessage(requestData,
            (result: MessageResponse) => {
                this.mcfLoadService.hide();
                let message: string = '';
                let subject: string = '';
                if (result && !this.clientUtils.isNullOrEmpty(result.data)) {
                    message = result.data[0].content + storeName;
                    subject = result.data[0].msgSubject;
                }
                else {
                    message = storeName;
                }
                let options = {
                    message: message,
                    subject: subject
                };
                this.socialShare.share(options);
            }, (error: ServiceErrorInfo) => {
                this.mcfLoadService.hide();
                let options = {
                    message: storeName,
                    subject: ''
                };
                this.socialShare.share(options);
            });
    }
}
