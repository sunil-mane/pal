import {Component, ViewChild, Input, trigger, state, animate, transition, style ,ElementRef, Renderer} from '@angular/core';
import {NavController,ModalController,Events} from 'ionic-angular';
import {OffersPage} from '../../offers/offers';
import {LoginPage} from '../../login/login';
import {McfLoaderService} from '../../../services/commons/service.loading';
import {OffersPopupPage} from '../offers-popup/offers-popup';
import {PartnersListPage} from '../../partners-list/partner-list';
import {OfferUtils} from '../../../utils/commons/offer.utils';
import {PartnerUtils} from '../../../utils/commons/partner.utils';
import {TargetUtils} from '../../../utils/commons/target.utils';
import {SocialSharingUtils} from '../../../utils/commons/social-sharing.utils';
import {SessionUtils} from '../../../utils/commons/session.utils';
import {ClientUtils} from '../../../utils/commons/client.utils';
import {ConfigUtils} from '../../../utils/commons/config.utils';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {GlobalizationUtils} from '../../../utils/commons/globalization.utils';
import {AppConstants} from '../../../constants/app.constants';
import {ServiceConstants} from '../../../constants/service.constants';
import {MyTargetsPage} from '../../mytargets/my-targets';
import {ServiceErrorInfo,MessageResponse,MessageInfo} from "../../../dto/common.dto";
import {OfferResponse} from "../../../dto/offers.dto";
import {PartnerResponse} from "../../../dto/partners.dto";
import {SliderData} from "../../../dto/slider.dto";
import {TranslateService} from 'ng2-translate';
import {MemberInfo} from "../../../dto/account.dto";
import {TargetPopupPage} from "../target-popup/target";
import {LanguageConstants} from '../../../constants/language.constants';


@Component({
    selector: 'component-swiper',
    templateUrl: 'swiper.html',
    animations: [
        trigger('visibilityChanged', [
            state('true', style({opacity: 1, transform: 'scale(1.0)'})),
            state('false', style({opacity: 0, transform: 'scale(0.0)', display: 'none'})),
            transition('1 => 0', animate('300ms')),
            transition('0 => 1', animate('900ms'))
        ])
    ],
})
export class Swiper {
    @Input() showTemplate:any;
    @Input() data: Array<SliderData>;
    @Input() personalTargetData:any;
    @Input() isMyTarget:boolean;
    @Input() activeSlide:number;

    @ViewChild('Template3') Template3;
    @ViewChild('usefulSwiperTemplate5') usefulSwiperTemplate5;
    @ViewChild('Template2') Template2;
    @ViewChild('usefulSwiperTemplate4') usefulSwiperTemplate4;
    @ViewChild('Template1') Template1;
    // @ViewChild("Template1") inputChild: ElementRef;

    radius: number = 20;
    max: number = 100;
    responsive: boolean = false;
    clockwise: boolean = true;
    targetShareRequestTag: string = '';
    showSpinnerFavourite: boolean = false;
    showSpinnerTarget: boolean = false;
    shouldHideCheckin: boolean = false;
    shouldHideSocialShare: boolean = false;
    private backgroundImageURL: string = '';

    constructor(public navCtrl:NavController,
                public modalCtrl:ModalController,
                public languageConstants: LanguageConstants,
                private events: Events,
                private translate: TranslateService,
                private mcfLoadService:McfLoaderService,
                private offerUtils:OfferUtils,
                private partnerUtils:PartnerUtils,
                private targetUtils:TargetUtils,
                private socialShare:SocialSharingUtils,
                private globalizationUtils:GlobalizationUtils,
                private googleAnalyticsUtils:GoogleAnalyticsUtils,
                private appConstants:AppConstants,
                private serviceConstants: ServiceConstants,
                private sessionUtils:SessionUtils,
                private render: Renderer,
                private clientUtils:ClientUtils,
                private configUtils: ConfigUtils,
                private _elementRef:ElementRef) {

    }


    ngOnInit() {

        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        });

        this.shouldHideCheckin = this.clientUtils.shouldHideCheckin();
        this.shouldHideSocialShare = this.clientUtils.shouldHideSocialSharing();

        if (this.showTemplate == 2) {
            setTimeout(() => {
                this.Template2.slideTo(this.activeSlide, 1000, false);
            }, 500);
        }

        if (this.showTemplate == 4) {
            setTimeout(() => {
                this.usefulSwiperTemplate4.slideTo(this.activeSlide, 1000, false);
            }, 500);
        }
        this.getTargetShareCode();
    }

    ngAfterViewInit():void {
        let swiperContainer = this._elementRef.nativeElement.getElementsByClassName('swiper-container')[0];
        this.clientUtils.waitRendered(swiperContainer).then(()=> {

            if(this.Template1){
                this.Template1.update();
                this.data[0].isSlidActive = true;
            }

            this.Template3 ? this.Template3.update() : null;
        });
        this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
    }


    slideDidChange(index){
        let activeIndex:any;
        if(this.Template1){
              activeIndex = this.Template1.getActiveIndex();
        }
        if(this.Template2){
            activeIndex = this.Template2.getActiveIndex();
        }

        const itemsIndex = (index.length) - 1;
        if(activeIndex <= itemsIndex){
            index[activeIndex].isSlidActive = true;
        }
    }


    goToPage(data: Array<SliderData>, currentIndex) {

        const myData = {
            data: data,
            currentIndex: currentIndex
        };

        if (this.isMyTarget) {
            this.sepratePersonalTarget(data,currentIndex);

        } else {
            this.navCtrl.push(OffersPage, myData);
        }
        this.sendGATrackEvent(data);
    }


    moreInfo(data) {
        this.googleAnalyticsUtils.trackEvent(((this.isMyTarget == true) ? this.appConstants.TERGET_CARD : this.appConstants.OFFER_CARD), this.appConstants.MORE_INFO_EVENT);
        let profileModal = this.modalCtrl.create(OffersPopupPage, {data: data});
        profileModal.present();
    }



    liked(item: SliderData) {
        console.log('liked swiper.ts 170')
        if (this.sessionUtils.isUserLoggedIn()) {
            if (item.offerId) {
                this.showSpinnerFavourite = true;
                this.offerUtils.setOfferAsFavourite(item.offerId, item.isFavourite,
                    (result:OfferResponse) => {
                        this.showSpinnerFavourite = false;
                        item.isFavourite = !item.isFavourite;
                        if (item.isFavourite) {
                            this.clientUtils.showToast(this.translate.instant('THIS_OFFER_SUCCESSFULLY_SET_AS_FAVOURITE'));
                            this.googleAnalyticsUtils.trackEvent(((this.isMyTarget == true) ? this.appConstants.TERGET_CARD : this.appConstants.OFFER_CARD), this.appConstants.LIKE_OFFER_EVENT);
                        } else {
                            this.clientUtils.showToast(this.translate.instant('THIS_OFFER_IS_SUCCESSFULLY_REMOVED_FROM_YOUR_FAVOURITES'));
                            this.googleAnalyticsUtils.trackEvent(((this.isMyTarget == true) ? this.appConstants.TERGET_CARD : this.appConstants.OFFER_CARD), this.appConstants.UNLIKE_OFFER_EVENT);
                        }
                    }, (error: ServiceErrorInfo) => {
                        console.log('error swiper.ts 186  ' +JSON.stringify(error))
                        this.showSpinnerFavourite = false;
                        if (error.code == 401) {
                            this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                        }
                        let msg = '';
                        if (error && error.message && (error.message.trim().length > 0)) {
                            msg = error.message.trim();
                        } else {
                            msg = this.translate.instant('SOMETHING_WENT_WRONG');
                        }
                        this.clientUtils.showToast(msg);
                    });
            } else if (item.addressId) {
                this.showSpinnerFavourite = true;
                this.partnerUtils.setLocationAsFavourite(item.addressId, item.isFavourite,
                    (result:any) => {
                        this.showSpinnerFavourite = false;
                        item.isFavourite = !item.isFavourite;
                        if (item.isFavourite) {
                            let msg: string = this.translate.instant('THIS_LOCATION_SUCCESSFULLY_SET_AS_FAVOURITE');
                            this.clientUtils.showToast(msg);
                            this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_CARD, this.appConstants.LIKE_LOCATION_EVENT);
                        } else {
                            let msg: string = this.translate.instant('THIS_LOCATION_SUCCESSFULLY_REMOVED_FROM_YOUR_FAVOURITES');
                            this.clientUtils.showToast(msg);
                            this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_CARD, this.appConstants.UNLIKE_LOCATION_EVENT);
                        }
                    }, (error: ServiceErrorInfo) => {
                        console.log('error swiper.ts 186  ' +JSON.stringify(error))
                        this.showSpinnerFavourite = false;
                        if (error.code == 401) {
                            this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                        }
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
        else {
            let modal = this.modalCtrl.create(LoginPage);
            modal.present();
        }
    }


    setAsTarget(item: SliderData, index: number) {
        if (this.sessionUtils.isUserLoggedIn()) {
            if (!item.isTarget) {
                if (!this.targetUtils.isTargetLimitReached()) {
                    let memberInfo: MemberInfo = this.sessionUtils.getMemberInfo();
                    if (item.offerPoints > memberInfo.availableBalanceMiles) {
                        this.showSpinnerTarget = true;
                        this.targetUtils.setOfferAsTarget(item.offerId,
                            (result) => {
                                this.showSpinnerTarget = false;
                                item.isTarget = !item.isTarget;
                                this.clientUtils.showToast(this.translate.instant('YOUR_TARGET_SUCCESSFULLY_SAVED'));
                            }, (error: ServiceErrorInfo) => {
                                if (error.code == 401) {
                                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                                }
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
                        let msg: string = this.translate.instant('YOU_HAVE_ALREADY_ACHIEVED') + item.offerPoints
                            + ' ' + this.translate.instant(this.languageConstants.POINTS) + '.';
                        this.clientUtils.showToast(msg);
                    }
                } else {
                    this.clientUtils.showToast(this.translate.instant('SET_TARGET_LIMIT_REACHED'));
                }
                this.googleAnalyticsUtils.trackEvent(((this.isMyTarget == true) ? this.appConstants.TERGET_CARD : this.appConstants.OFFER_CARD), this.appConstants.TARGET_OFFER_EVENT);
            } else {
                if (this.showTemplate == 4) {
                    this.mcfLoadService.show('');
                }
                else {
                    this.showSpinnerTarget = true;
                    if (this.showTemplate == 2) {
                        item.active = 'N';
                    }
                }
                this.targetUtils.deleteTarget(item,
                    (result) => {
                        if (this.showTemplate == 4) {
                            this.mcfLoadService.hide();
                            this.hideTargetBigCard(item, index);
                        }
                        else {
                            this.showSpinnerTarget = false;
                            item.isTarget = !item.isTarget;
                        }
                        this.clientUtils.showToast(this.translate.instant('YOUR_GOAL_DELETED_SUCCESSFULLY'));
                    }, (error: ServiceErrorInfo) => {
                        if (error.code == 401) {
                            this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                        }
                        if (this.showTemplate == 4) {
                            this.mcfLoadService.hide();
                        }
                        else {
                            this.showSpinnerTarget = false;
                        }
                        let msg = '';
                        if (error && error.message && (error.message.trim().length > 0)) {
                            msg = error.message.trim();
                        } else {
                            msg = this.translate.instant('SOMETHING_WENT_WRONG');
                        }
                        this.clientUtils.showToast(msg);
                    });
                this.googleAnalyticsUtils.trackEvent(((this.isMyTarget == true) ? this.appConstants.TERGET_CARD : this.appConstants.OFFER_CARD), this.appConstants.DROP_TARGETS_EVENT);
            }
        }
        else {
            let modal = this.modalCtrl.create(LoginPage);
            modal.present();
        }
    }

    sendGATrackEvent(data) {
        if (data[0].pageTitle == this.appConstants.HEADING_NEAR_ME_OFFERS) {
            if (this.sessionUtils.isUserLoggedIn()) {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.USER_HOME_SCREEN, this.appConstants.NEAR_ME_OFFER_EVENT);
            } else {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.NEAR_ME_OFFER_EVENT);
            }
        } else if (data[0].pageTitle == this.appConstants.HEADING_NEAR_ME_STORES) {
            if (this.sessionUtils.isUserLoggedIn()) {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.USER_HOME_SCREEN, this.appConstants.NEAR_ME_STORE_EVENT);
            } else {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.NEAR_ME_STORE_EVENT);
            }
        } else if (data[0].pageTitle == this.appConstants.HEADING_RECOMMENDED_OFFERS) {
            if (this.sessionUtils.isUserLoggedIn()) {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.USER_HOME_SCREEN, this.appConstants.RECOMMENDED_OFFER_EVENT);
            } else {
                this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.RECOMMENDED_OFFER_EVENT);
            }
        } else if (data[0].pageTitle == this.appConstants.HEADING_MY_TARGETS) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.MY_PROFILE_SCREEN, this.appConstants.MY_TARGETS_EVENT);
        } else if (data[0].pageTitle == this.appConstants.HEADING_MY_FAVOURITE_OFFERS) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.MY_PROFILE_SCREEN, this.appConstants.MY_FAVORITES_OFFER_EVENT);
        } else if (data[0].pageTitle == this.appConstants.HEADING_MY_FAVOURITE_LOCATIONS) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.MY_PROFILE_SCREEN, this.appConstants.MY_FAVORITES_LOCATION_EVENT);
        }
    }

    hideTarget(index) {
        index.showHide = !index.showHide;
        setTimeout(() => {
            let indexx = this.data.indexOf(index);
            this.data.splice(indexx, 1);
             this.usefulSwiperTemplate5.update();
        }, 900);
    }


    hideTargetBigCard(item, index) {
        setTimeout(() => {
            if (this.data.length > 1) {
                console.log('hideTargetBigCard: ', index);
                this.data.splice(index, 1);
            } else if (this.navCtrl) {
                // this.navCtrl.pop();
            }
        }, 500);
    }

    checkIn(item:SliderData) {
        if (this.sessionUtils.isUserLoggedIn()) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_CARD,this.appConstants.CHECKIN_LOCATION_EVENT);
            if (item.isCheckedIn != true && this.partnerUtils.shouldCheckin(item.lastCheckinTime)) {
                this.mcfLoadService.show('');
                this.partnerUtils.locationCheckIn(item.addressId,
                    (result:MessageResponse) => {
                        item.isCheckedIn = true;
                        let code = '';
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
                        if (error.code == 401) {
                            this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                        }
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

    openShareModal(code: string) {
        this.mcfLoadService.show('');
        this.getShareMessage(code, '');
        this.googleAnalyticsUtils.trackEvent(this.appConstants.TERGET_CARD, this.appConstants.SHARE_TARGET_EVENT);
    }

    getShareMessage(code: string, storeName: string) {
        let requestData = new MessageInfo();
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

    openLocation(obj:SliderData) {
        if (obj.latitude && obj.longitude) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.PARTNER_LOCATION_CARD,this.appConstants.PARTNER_LOCATION_EVENT);
            let urlQuery = obj.latitude + "," + obj.longitude;
            if (obj.storeName) {
                urlQuery = urlQuery + '(' + obj.storeName + ')';
            }
            this.clientUtils.openMapURL(urlQuery);
        } else if (obj.offerId && obj.partnerCode) {
            this.mcfLoadService.show('');
            this.googleAnalyticsUtils.trackEvent(((this.isMyTarget == true) ? this.appConstants.TERGET_CARD : this.appConstants.OFFER_CARD), this.appConstants.OFFER_LOCATION_EVENT);
            this.partnerUtils.fetchPartnersByCode(obj.partnerCode, null,
                (result:PartnerResponse) => {
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


    sepratePersonalTarget(data: Array<SliderData>, currentIndex: number){
        let personalTargetList = [];
        let offerTargetList = [];
        let selectedIndex = null;
        let currentObj: SliderData = null;
        if (currentIndex < data.length) {
            currentObj = data[currentIndex];
        }
        for(let count = 0; count < data.length; count++ ) {
            if(data[count].offerId != 0){
                let sliderObj = new SliderData();
                sliderObj.title = data[count].title;
                sliderObj.name = data[count].name;
                sliderObj.logo = data[count].logo;
                sliderObj.partnerCode = data[count].partnerCode;
                sliderObj.location = data[count].location;
                sliderObj.earnBurn = data[count].earnBurn;
                sliderObj.offerId = data[count].offerId;
                sliderObj.offerPoints = data[count].offerPoints;
                sliderObj.isTarget = data[count].isTarget;
                sliderObj.myTarget = data[count].myTarget;
                sliderObj.img = data[count].img;
                sliderObj.points = data[count].points;
                sliderObj.isFavourite = data[count].isFavourite;
                sliderObj.targetId = data[count].targetId;
                sliderObj.showHide = data[count].showHide;
                sliderObj.targetStatus = data[count].targetStatus;
                sliderObj.targetEndDate = data[count].targetEndDate;
                sliderObj.targetEndDateString = this.clientUtils.getFormattedDate('yMMMd', sliderObj.targetEndDate);
                sliderObj.targetStatusDescription = data[count].targetStatusDescription;
                sliderObj.special = data[count].special;
                sliderObj.description = null;
                offerTargetList.push(sliderObj);
                if (currentObj && (currentObj.targetId === sliderObj.targetId)) {
                    selectedIndex = offerTargetList.length - 1;
                }
            } else {
                let sliderObj = new SliderData();
                sliderObj.title = data[count].title;
                sliderObj.isTarget = data[count].isTarget;
                sliderObj.myTarget = data[count].myTarget;
                sliderObj.points = data[count].points;
                sliderObj.isFavourite = data[count].isFavourite;
                sliderObj.targetId = data[count].targetId;
                sliderObj.description = null;
                sliderObj.targetEndDate = data[count].targetEndDate;
                sliderObj.targetEndDateString = data[count].targetEndDateString;
                personalTargetList.push(sliderObj);
            }
        }

        if (selectedIndex == null) {
            selectedIndex = (personalTargetList.length > 0) ? offerTargetList.length : 0;
        }

        const myData = {
            pageTitle: data[0].pageTitle,
            personalTargets: personalTargetList,
            offerTargets: offerTargetList,
            currentIndex: selectedIndex
        };
        console.log(JSON.stringify(myData))
        this.navCtrl.push(MyTargetsPage, myData);
    }


    setTarget() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.MY_PROFILE_SCREEN, this.appConstants.CREATE_PERSONAL_TARGET_EVENT);
        if (!this.targetUtils.isTargetLimitReached()) {
            let body = document.getElementsByTagName('body')[0];
            let opts = {
                showBackdrop: true,
                enableBackdropDismiss: true
            };

            let data = "";
            let profileModal = this.modalCtrl.create(TargetPopupPage, {data: data}, opts);

            profileModal.onDidDismiss((value: boolean) => {
                this.render.setElementClass(body, 'smallModal', false);
            });

            this.render.setElementClass(body, 'smallModal', true);
            profileModal.present();
        } else {
            this.clientUtils.showToast(this.translate.instant('SET_TARGET_LIMIT_REACHED'));
        }
    }


}
