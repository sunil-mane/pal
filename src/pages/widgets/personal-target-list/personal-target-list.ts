import {Component, Input,
    trigger,
    style,
    transition,
    animate} from '@angular/core';
import {NavController,ModalController,Events} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {McfLoaderService} from '../../../services/commons/service.loading';
import {LoginPage} from '../../login/login';
import {OfferUtils} from '../../../utils/commons/offer.utils';
import {SessionUtils} from '../../../utils/commons/session.utils';
import {ServiceErrorInfo,MessageResponse,MessageInfo} from "../../../dto/common.dto";
import {GlobalizationUtils} from '../../../utils/commons/globalization.utils';
import {SocialSharingUtils} from '../../../utils/commons/social-sharing.utils';
import {PartnerUtils} from '../../../utils/commons/partner.utils';
import {ClientUtils} from '../../../utils/commons/client.utils';
import {PartnerResponse} from "../../../dto/partners.dto";
import {PartnersListPage} from '../../partners-list/partner-list';
import {ServiceConstants} from '../../../constants/service.constants';
import {LanguageConstants} from '../../../constants/language.constants';
import {AppConstants} from '../../../constants/app.constants';
import {GoalInfo} from "../../../dto/goal.dto";
import {ConfigUtils} from '../../../utils/commons/config.utils';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';


@Component({
    templateUrl: 'personal-target-list.html',
    selector: 'component-personal-target-list',
    animations: [
        trigger('fadeInOut', [
            transition('void => *', [
                style({opacity:0}),
                animate(600, style({opacity:1}))
            ]),
            transition('* => void', [
                animate(300, style({opacity:0}))
            ])
        ])
    ]
})
export class PersonalTargetListComponent {

    @Input() data: GoalInfo;

    visible = false;
    radius = 30;
    max = 100;
    responsive = false;
    clockwise = true;
    targetShareRequestTag: string = '';
    showSpinnerFavourite: boolean = false;
    targetEndDateString: string = '';
    shouldHideSocialShare: boolean = false;
    private backgroundImageURL: string = '';

    constructor(public navCtrl: NavController,
                public modalCtrl: ModalController,
                public languageConstants: LanguageConstants,
                private clientUtils: ClientUtils,
                private events: Events,
                private mcfLoadService: McfLoaderService,
                private offerUtils: OfferUtils,
                private sessionUtils: SessionUtils,
                private partnerUtils:PartnerUtils,
                private configUtils: ConfigUtils,
                private socialShare: SocialSharingUtils,
                private serviceConstants: ServiceConstants,
                private appConstants: AppConstants,
                private translate: TranslateService,
                private googleAnalyticsUtils:GoogleAnalyticsUtils,
                private globalizationUtils:GlobalizationUtils) {
    }

    ngOnInit() {
        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        });
        // console.log('PersonalTargetListComponent '+JSON.stringify(this.data));
        this.shouldHideSocialShare = this.clientUtils.shouldHideSocialSharing();
        this.getTargetShareCode();
    }

    ngAfterViewInit():void {
        this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        this.targetEndDateString = this.clientUtils.getFormattedDate('yMMMd', this.data.targetEndDate);
    }

    toggle() {
        this.visible = !this.visible;
    }

    updateOfferAsFavourite(item: GoalInfo) {
        // console.log(item.isFavourite);
        if (this.sessionUtils.isUserLoggedIn()) {
            let isFavorite = (item.isFavorite == 'Y');
            this.showSpinnerFavourite = true;
            this.offerUtils.setOfferAsFavourite(item.offerId, isFavorite,
                (result: any) => {
                    item.isFavorite = isFavorite ? 'N' : 'Y';
                    this.showSpinnerFavourite = false;
                    if (!isFavorite) {
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.TERGET_CARD, this.appConstants.LIKE_OFFER_EVENT);
                        let msg: string = this.translate.instant('THIS_TARGET_SUCCESSFULLY_SET_AS_FAVOURITE');
                        this.clientUtils.showToast(msg);
                    } else {
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.TERGET_CARD, this.appConstants.UNLIKE_OFFER_EVENT);
                        let msg: string = this.translate.instant('THIS_TARGET_SUCCESSFULLY_REMOVED_FROM_YOUR_FAVOURITES');
                        this.clientUtils.showToast(msg);
                    }
                }, (error: ServiceErrorInfo) => {
                    this.showSpinnerFavourite = false;
                    let msg = '';
                    if (error && error.message && (error.message.trim().length > 0)) {
                        msg = error.message.trim();
                    } else {
                        msg = this.translate.instant('SOMETHING_WENT_WRONG');
                    }
                    this.clientUtils.showToast(msg);
                });
        }
        else {
            let modal = this.modalCtrl.create(LoginPage);
            modal.present();
        }
    }

    openShareModal(code: string, storeName: string) {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.TERGET_CARD, this.appConstants.SHARE_TARGET_EVENT);
        this.mcfLoadService.show('');
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

    openLocation(obj: GoalInfo) {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.TERGET_CARD, this.appConstants.OFFER_LOCATION_EVENT);
        if (obj.partnerCode) {
            this.mcfLoadService.show('');
            this.partnerUtils.fetchPartnersByCode(obj.partnerCode, null,
                (result: PartnerResponse) => {
                    this.mcfLoadService.hide();
                    let response = result.data;
                    if (response && response.length) {
                        const data = {
                            offerId: obj.offerId,
                            parnterDetail: response[0]
                        };
                        this.navCtrl.push(PartnersListPage, data);
                    } else {
                        let msg = this.translate.instant('SEARCH_NO_PARTNER');
                        this.clientUtils.showToast(msg);
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
        }
    }

    getTargetShareCode() {
        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            this.targetShareRequestTag = this.serviceConstants.SHR_TRGT_EN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            this.targetShareRequestTag = this.serviceConstants.SHR_TRGT_ES;
        }
    }
}
