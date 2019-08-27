import {
    Component,
    Input,
    trigger,
    style,
    transition,
    animate} from '@angular/core';
import { NavController,NavParams,ModalController,Events} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {ClientUtils} from '../../../utils/commons/client.utils';
import {ConfigUtils} from '../../../utils/commons/config.utils';
import {LoginPage} from '../../login/login';
import {GlobalizationUtils} from '../../../utils/commons/globalization.utils';
import {SocialSharingUtils} from '../../../utils/commons/social-sharing.utils';
import {ServiceConstants} from '../../../constants/service.constants';
import {AppConstants} from '../../../constants/app.constants';
import {PartnerUtils} from '../../../utils/commons/partner.utils';
import {SessionUtils} from '../../../utils/commons/session.utils';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {ServiceErrorInfo,MessageResponse,MessageInfo} from "../../../dto/common.dto";
import {PartnerLocationInfo} from "../../../dto/partners.dto";
import {McfLoaderService} from '../../../services/commons/service.loading';


@Component({
    selector: 'expandable-location-component',
    templateUrl: 'expandable-location.html',
    animations: [
        trigger('fadeInOut', [
            transition('void => *', [
                style({opacity: 0}),
                animate(600, style({opacity: 1}))
            ]),
            transition('* => void', [
                animate(300, style({opacity: 0}))
            ])
        ])
    ]
})
export class ExpandableLocationComponent {
    @Input() data;

    visible: boolean = false;
    showSpinner: boolean = false;
    shouldHideCheckin: boolean = false;
    shouldHideSocialShare: boolean = false;
    private backgroundImageURL: string = '';

    constructor(public navCtrl:NavController,
                public navParams:NavParams,
                public modalCtrl:ModalController,
                private events: Events,
                private translate: TranslateService,
                private serviceConstants: ServiceConstants,
                private mcfLoadService:McfLoaderService,
                private partnerUtils:PartnerUtils,
                private socialShare:SocialSharingUtils,
                private sessionUtils:SessionUtils,
                private globalizationUtils:GlobalizationUtils,
                private clientUtils:ClientUtils,
                private configUtils: ConfigUtils,
                private googleAnalyticsUtils:GoogleAnalyticsUtils,
                private appConstants: AppConstants) {
    }

    ngOnInit() {
        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        });
        this.shouldHideCheckin = this.clientUtils.shouldHideCheckin();
        this.shouldHideSocialShare = this.clientUtils.shouldHideSocialSharing();
    }

    ngAfterViewInit(): void {
        this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
    }

    toggle() {
        this.visible = !this.visible;
    }

    openLocation(obj: PartnerLocationInfo) {

        if (obj.latitude && obj.longitude) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_CARD,this.appConstants.PARTNER_LOCATION_EVENT);
            let urlQuery = obj.latitude + "," + obj.longitude;
            if (obj.storeName) {
                urlQuery = urlQuery + '(' + obj.storeName + ')';
            }
            this.clientUtils.openMapURL(urlQuery);
        }

    }

    checkIn(item: PartnerLocationInfo) {
        if (this.sessionUtils.isUserLoggedIn()) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_CARD,this.appConstants.CHECKIN_LOCATION_EVENT);
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
                        if (this.shouldHideSocialShare == false) {
                            this.getShareMessage(code, item.storeName);
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

    getShareMessage(code:string, storeName:string) {
        let requestData: MessageInfo = new MessageInfo();
        requestData.code = code;
        this.socialShare.generateShareMessage(requestData,
            (result:MessageResponse) => {
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

    liked(item: PartnerLocationInfo) {
        if (this.sessionUtils.isUserLoggedIn()) {
            this.showSpinner = true;
            let isFavorite: boolean = (item.isFavorite == 'Y');
            this.partnerUtils.setLocationAsFavourite(item.addressId, isFavorite,
                (result:any) => {
                    this.showSpinner = false;
                    if (!isFavorite) {
                        item.isFavorite = 'Y';
                        let msg: string = this.translate.instant('THIS_LOCATION_SUCCESSFULLY_SET_AS_FAVOURITE');
                        this.clientUtils.showToast(msg)
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_CARD, this.appConstants.LIKE_LOCATION_EVENT);
                    } else {
                        item.isFavorite = 'N';
                        let msg: string = this.translate.instant('THIS_LOCATION_SUCCESSFULLY_REMOVED_FROM_YOUR_FAVOURITES');
                        this.clientUtils.showToast(msg);
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_CARD, this.appConstants.UNLIKE_LOCATION_EVENT);
                    }
                }, (error: ServiceErrorInfo) => {
                    this.showSpinner = false;
                    let msg = '';
                    if (error && error.message && (error.message.trim().length > 0)) {
                        msg = error.message.trim();
                    } else {
                        msg = this.translate.instant('SOMETHING_WENT_WRONG');
                    }
                    this.clientUtils.showToast(msg);
                });
        } else {
            this.showSpinner = false;
            let modal = this.modalCtrl.create(LoginPage);
            modal.present();
        }
    }
}

