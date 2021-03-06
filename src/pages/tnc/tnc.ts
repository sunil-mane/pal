import {Component, Renderer} from '@angular/core';
import {ViewController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {UserUtils} from '../../utils/commons/user.utils';
import {ClientUtils} from '../../utils/commons/client.utils';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {AppConstants} from '../../constants/app.constants';
import {NetworkService} from '../../services/commons/network.service';
import {Keyboard} from 'ionic-native';
import {GoogleAnalyticsUtils} from '../../utils/commons/google-analytics.utils';
import {SessionUtils} from '../../utils/commons/session.utils';
import { MemberInfo } from '../../dto/account.dto';
import { ServiceErrorInfo } from '../../dto/common.dto';
import { GlobalizationUtils } from '../../utils/commons/globalization.utils';
@Component({
    templateUrl: 'tnc.html'
})


export class TncPage {
    body: any;
    acceptTerms:any;
    memberInfo: MemberInfo = null;
    consentResponse:any = {"activeCardNumber":"","consentStatus":"","consentCode":""};
    tncMessage: string;
    constructor(public viewController: ViewController,
                private userUtils: UserUtils,
                private configUtils: ConfigUtils,
                private appConstants: AppConstants,
                private translate: TranslateService,
                private networkService: NetworkService,
                private render: Renderer,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private clientUtils: ClientUtils,
                private sessionUtils: SessionUtils,
                private globalizationUtils: GlobalizationUtils,
            ) {
    }

    ngOnInit() {
        this.addClassToBody();
        this.memberInfo = this.sessionUtils.getMemberInfo();
        this.getTncConsentDate(this.memberInfo.activeCardNo)
    }
    getTncConsentDate(activeCardNo) {
        let consentConfig = this.configUtils.getTncConsentObj();
        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            this.tncMessage = consentConfig.tncMsgEN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            this.tncMessage = consentConfig.tncMsgES;
        }
        let reqObj = {
            "activeCardNumber": activeCardNo,
            "consentCode": consentConfig.tncCode
        }
        this.userUtils.getConsentDate(reqObj,
            (result: any) => {
                this.consentResponse = result;
            }, (error: ServiceErrorInfo) => {
            });
    }
    addClassToBody(){
        this.body = document.getElementsByTagName('body')[0];
        this.render.setElementClass(this.body, this.getModalClassName(), true);
    }
    getModalClassName(): string {
        let value: string = 'loginSmallModal-280';
        let rows: number = 0;
        if (rows == 1) {
            value = 'loginSmallModal-320';
        } else if (rows == 2) {
            value = 'loginSmallModal-360';
        } else if (rows == 3) {
            value = 'loginSmallModal-400';
        }
        return value;
    }
    dismiss(value: boolean) {
        this.viewController.dismiss(value, null, {animate: value, keyboardClose: true});
        // setTimeout(() => {
        //     this.render.setElementClass(this.body, this.getModalClassName(), false);
        // }, 500);
    }
    analyticsPageTag(): string {
        return (((this.sessionUtils.isUserLoggedIn()) == true) ?
            this.appConstants.EDIT_PROFILE_SCREEN :
            this.appConstants.ENROLLMENT_SCREEN);
    }
    termsConditionsTapped() {
        Keyboard.close();
        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.TERMS_CONDITIONS_TAPPED_EVENT);
        if (this.networkService.isOnline()) {
            let termsURL: string = this.configUtils.getTermsConditionsURL();
            this.clientUtils.openWebURL(termsURL);
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

    privacyPolicyTapped() {
        Keyboard.close();
        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.PRIVACY_POLICY_TAPPED_EVENT);
        if (this.networkService.isOnline()) {
            let privacyPolicyURL: string = this.configUtils.getPrivacyPolicyURL();
            this.clientUtils.openWebURL(privacyPolicyURL);
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }
    submitButtonTapped(){
        let consentConfig = this.configUtils.getTncConsentObj();
        if(this.acceptTerms){
            this.dismiss(false);
            this.consentResponse.consentStatus='Y';
            this.consentResponse.activeCardNumber=this.memberInfo.activeCardNo;
            this.consentResponse.consentCode=consentConfig.tncCode;
            this.userUtils.postConsentDate(this.consentResponse,
                (result: any) => {
                }, (error: ServiceErrorInfo) => {
                    console.log('getConsentDate Error:' + JSON.stringify(error));
                });
        }
    }
}