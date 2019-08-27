import {Component,
    Input,
    trigger,
    style,
    transition,
    animate} from '@angular/core';
import {NavController,ModalController,Events} from 'ionic-angular';
import {McfLoaderService} from '../../../services/commons/service.loading';
import {LoginPage} from '../../login/login';
import {OfferUtils} from '../../../utils/commons/offer.utils';
import {TargetUtils} from '../../../utils/commons/target.utils';
import {PartnerUtils} from '../../../utils/commons/partner.utils';
import {SessionUtils} from '../../../utils/commons/session.utils';
import {ClientUtils} from '../../../utils/commons/client.utils';
import {ConfigUtils} from '../../../utils/commons/config.utils';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {ServiceErrorInfo} from "../../../dto/common.dto";
import {PartnerResponse} from "../../../dto/partners.dto";
import {PartnersListPage} from '../../partners-list/partner-list';
import {OfferInfo} from "../../../dto/offers.dto";
import {MemberInfo} from '../../../dto/account.dto';
import {TranslateService} from 'ng2-translate';
import {LanguageConstants} from '../../../constants/language.constants';
import {AppConstants} from '../../../constants/app.constants';


@Component({
    selector: 'expandable-component',
    templateUrl: 'expandable.html',
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
export class ExpandableComponent {

    @Input() data: OfferInfo;

    myTarget: number = null;
    memberInfo: MemberInfo = null;
    radius = 20;
    max = 100;
    responsive = false;
    clockwise = true;
    showSpinner: boolean = false;
    showSpinnerTarget: boolean = false;
    private backgroundImageURL: string = '';

    constructor(public navCtrl:NavController,
                public modalCtrl:ModalController,
                public clientUtils:ClientUtils,
                public languageConstants: LanguageConstants,
                private events: Events,
                private translate: TranslateService,
                private mcfLoadService:McfLoaderService,
                private offerUtils:OfferUtils,
                private targetUtils:TargetUtils,
                private sessionUtils:SessionUtils,
                private partnerUtils:PartnerUtils,
                private configUtils: ConfigUtils,
                private googleAnalyticsUtils:GoogleAnalyticsUtils,
                private appConstants: AppConstants) {

    }

    visible = false;

    ngOnInit() {

        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        });

        if (this.sessionUtils.isUserLoggedIn()) {
            if ((this.data.isTarget == 'Y') && (this.data.offerPoints > 0)) {
                this.memberInfo = this.sessionUtils.getMemberInfo();
                let percentValue = Math.round((this.memberInfo.availableBalanceMiles /
                    this.data.offerPoints) * 100);
                if (percentValue > 100) {
                    percentValue = 100;
                }
                this.myTarget = percentValue;
            }
        }
    }

    ngAfterViewInit(): void {
        this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
    }

    toggle() {
        this.visible = !this.visible;
    }

    updateOfferAsFavourite(item: OfferInfo) {
        //console.log(JSON.stringify(item));
        if (this.sessionUtils.isUserLoggedIn()) {
            this.showSpinner = true;
            let isFavorite: boolean = (item.isFavorite === 'Y');
            this.offerUtils.setOfferAsFavourite(item.offerId, isFavorite,
                (result:any) => {
                    this.showSpinner = false;
                    if (!isFavorite) {
                        item.isFavorite = 'Y';
                        this.clientUtils.showToast(this.translate.instant('THIS_OFFER_SUCCESSFULLY_SET_AS_FAVOURITE'));
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.OFFER_CARD, this.appConstants.LIKE_OFFER_EVENT);
                    } else {
                        item.isFavorite = 'N';
                        this.clientUtils.showToast(this.translate.instant('THIS_OFFER_IS_SUCCESSFULLY_REMOVED_FROM_YOUR_FAVOURITES'));
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.OFFER_CARD, this.appConstants.UNLIKE_OFFER_EVENT);
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
        }
        else {
            let modal = this.modalCtrl.create(LoginPage);
            modal.present();
        }
    }

    updateOfferAsTarget(item: OfferInfo) {
        if (this.sessionUtils.isUserLoggedIn()) {
            if (item.isTarget == 'N') {
                if (!this.targetUtils.isTargetLimitReached()) {
                    let memberInfo: MemberInfo = this.sessionUtils.getMemberInfo();
                    if (item.offerPoints > memberInfo.availableBalanceMiles) {
                        //this.mcfLoadService.show('');
                        this.showSpinnerTarget = true;
                        this.targetUtils.setOfferAsTarget(item.offerId,
                            (result) => {
                                //this.mcfLoadService.hide();
                                this.showSpinnerTarget = false;
                                item.isTarget = 'Y';
                                this.clientUtils.showToast(this.translate.instant('YOUR_TARGET_SUCCESSFULLY_SAVED'));
                            }, (error: ServiceErrorInfo) => {
                                //this.mcfLoadService.hide();
                                this.showSpinnerTarget = false;
                                let msg = '';
                                if (error && error.message && (error.message.trim().length > 0)) {
                                    msg = error.message.trim();
                                } else {
                                    msg = this.translate.instant('SOMETHING_WENT_WRONG');
                                }
                                this.clientUtils.showToast(msg);
                            });
                    } else {
                        let msg: string = this.translate.instant('YOU_HAVE_ALREADY_ACHIEVED') +
                            item.offerPoints + ' ' + this.translate.instant(this.languageConstants.POINTS) + '.';
                        this.clientUtils.showToast(msg);
                    }
                } else {
                    this.clientUtils.showToast(this.translate.instant('SET_TARGET_LIMIT_REACHED'));
                }
                this.googleAnalyticsUtils.trackEvent(this.appConstants.OFFER_CARD, this.appConstants.TARGET_OFFER_EVENT);
            }
        }
        else {
            let modal = this.modalCtrl.create(LoginPage);
            modal.present();
        }
    }

    openLocation(obj: OfferInfo) {
        if (obj.partnerCode) {
            this.mcfLoadService.show('');
            this.googleAnalyticsUtils.trackEvent(this.appConstants.OFFER_CARD, this.appConstants.OFFER_LOCATION_EVENT);
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
}
