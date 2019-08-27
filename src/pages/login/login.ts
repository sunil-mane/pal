import {Component, Renderer} from '@angular/core';
import {ViewController,Events,ModalController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {UserUtils} from '../../utils/commons/user.utils';
import {ClientUtils} from '../../utils/commons/client.utils';
import {McfLoaderService} from '../../services/commons/service.loading';
import {LoginResponse} from '../../dto/account.dto'
import {ServiceErrorInfo} from '../../dto/common.dto'
import {GoogleAnalyticsUtils} from '../../utils/commons/google-analytics.utils';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {AppConstants} from '../../constants/app.constants';
import {NetworkService} from '../../services/commons/network.service';
import {FacebookAuthResponse, FacebookConnectService} from '../../services/commons/facebook-connect.service';
import { TncPage } from '../tnc/tnc';

@Component({
    templateUrl: 'login.html'
})


export class LoginPage {

    username: string = '';
    password: string = '';
    forgotPasswordURL: string = null;
    registrationURL: string = null;
    shouldShowEnrollment: boolean = false;
    shouldShowFBLogin: boolean = false;
    body: any;
    public type = 'password';
  public showPass = false;

    constructor(public viewController: ViewController,
                private events: Events,
                private userUtils: UserUtils,
                private mcfLoadService: McfLoaderService,
                private clientUtils: ClientUtils,
                private configUtils: ConfigUtils,
                private render: Renderer,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private appConstants: AppConstants,
                private translate: TranslateService,
                private networkService: NetworkService,
                private facebookConnectService: FacebookConnectService,
                private modalCtrl: ModalController,) {
    }

    ngOnInit() {
        this.googleAnalyticsUtils.trackPage(this.appConstants.LOGIN_SCREEN);
        if (this.clientUtils.getTenantCode() == this.appConstants.APP_TENANT_CODE_XX) {
            if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_DEV) {
                this.username = '00250521471';
                this.password = 'Tst@12';
            } else if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_TEST) {
                this.username = '00005318832';
                this.password = 'aaaaaA1@';
            }
        } else if (this.clientUtils.isDebugMode()) {
             if (this.clientUtils.getTenantCode() == this.appConstants.APP_TENANT_CODE_AM) {
                if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_DEV) {
                    this.username = '00050003326';
                    this.password = 'Tst1_';
                } else if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_TEST) {
                    this.username = '00814028304';
                    this.password = 'Mememe03';
                } else if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_MAINTENANCE) {
                    this.username = '00814028304';
                    this.password = 'Mememe03';
                }
            } else if (this.clientUtils.getTenantCode() == this.appConstants.APP_TENANT_CODE_PR) {
                if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_DEV) {
                    this.username = '00250521471';
                    this.password = 'Tst1_';
                } else if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_TEST) {
                    this.username = '00005753646';
                    this.password = 'Test@1';
                } else if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_MAINTENANCE) {
                    this.username = '00005753646';
                    this.password = 'Test123';
                }
            } else if (this.clientUtils.getTenantCode() == this.appConstants.APP_TENANT_CODE_PX) {
                if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_DEV) {
                    this.username = '00250521471';
                    this.password = 'Tst1_';
                } else if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_TEST) {
                    this.username = '00500000001';
                    this.password = 'Rpylc44';
                } else if (this.clientUtils.getEnvironmentType() == this.appConstants.APP_ENVIRONMENT_TYPE_MAINTENANCE) {
                    this.username = '00500000001';
                    this.password = 'Rpylc44';
                }
            }
        }
        this.shouldShowFBLogin = this.clientUtils.shouldShowFacebookLogin();
        this.forgotPasswordURL= this.configUtils.getForgotPasswordURL();
        this.registrationURL= this.configUtils.getRegistrationURL();
        this.shouldShowEnrollment = this.clientUtils.shouldShowEnrollment();
        this.addClassToBody();
    }
    showPassword() {
        this.showPass = !this.showPass;
        if(this.showPass){
          this.type = 'text';
        } else {
          this.type = 'password';
        }
      }
    addClassToBody(){
        this.body = document.getElementsByTagName('body')[0];
        this.render.setElementClass(this.body, this.getModalClassName(), true);
    }


    dismiss(value: boolean) {
        this.viewController.dismiss(value, null, {animate: value, keyboardClose: true});
        setTimeout(() => {
            this.render.setElementClass(this.body, this.getModalClassName(), false);
        }, 500);
    }

    getModalClassName(): string {
        let value: string = 'loginSmallModal-280';
        let rows: number = 0;
        if (this.shouldShowFBLogin == true) {
            rows ++;
        }
        if (this.forgotPasswordURL && (this.forgotPasswordURL.trim().length > 0)) {
            rows ++;
        }
        if (this.registrationURL && (this.registrationURL.trim().length > 0)) {
            rows ++;
        }
        if (rows == 1) {
            value = 'loginSmallModal-320';
        } else if (rows == 2) {
            value = 'loginSmallModal-360';
        } else if (rows == 3) {
            value = 'loginSmallModal-400';
        }
        return value;
    }
    getTncConsentDate(activeCardNo) {
        let consentConfig = this.configUtils.getTncConsentObj();
        let reqObj = {
            "activeCardNumber": activeCardNo,
            "consentCode": consentConfig.tncCode
        }
        this.userUtils.getConsentDate(reqObj,
            (result: any) => {
                if (consentConfig.tncFlag) {
                    if (result.consentDate) {
                        if ((new Date(consentConfig.lastTncChanged)) >= (new Date(result.consentDate))) {
                            let modal = this.modalCtrl.create(TncPage, {}, { enableBackdropDismiss: false });
                            modal.present();
                        }
                    } else {
                        let modal = this.modalCtrl.create(TncPage, {}, { enableBackdropDismiss: false });
                        modal.present();
                    }
                }
            }, (error: ServiceErrorInfo) => {
                let modal = this.modalCtrl.create(TncPage, {}, { enableBackdropDismiss: false });
                modal.present();
            });
    }
    doLogin() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.LOGIN_SCREEN, this.appConstants.LOGIN_EVENT);
        if (this.networkService.isOnline()) {
            let uname: string = String(this.username);
            if (uname && (uname.trim().length > 0)) {
                uname = this.userUtils.validateUsername(uname.trim());
                if (this.password && (this.password.trim().length > 0)) {
                    this.mcfLoadService.show('');
                    if(this.clientUtils.getTenantCode()==this.appConstants.APP_TENANT_CODE_PR){
                        this.password = this.password.length>8?this.password.substring(0,8):this.password; //For Pal only
                    }
                    this.userUtils.doLogin(uname, this.password,
                        (result: LoginResponse) => {
                            console.log('LOgin Response'+JSON.stringify(result));
                            this.getTncConsentDate(result.data[0].member.activeCardNo)
                            this.googleAnalyticsUtils.trackEvent(this.appConstants.LOGIN_SCREEN, this.appConstants.LOGIN_SUCCESSFUL);
                            this.mcfLoadService.hide();
                            this.dismiss(true);
                        }, (error: ServiceErrorInfo) => {
                            this.mcfLoadService.hide();
                            let msg = '';
                            if (error && error.message && (error.message.trim().length > 0)) {
                                msg = error.message.trim();
                            } else {
                                msg = this.translate.instant('SOMETHING_WENT_WRONG');
                            }
                            this.clientUtils.showAlert(msg);
                            this.googleAnalyticsUtils.trackEvent(this.appConstants.LOGIN_SCREEN,
                                this.appConstants.LOGIN_UNSUCCESSFUL, msg);
                        });
                }
                else {
                    this.clientUtils.showAlert(this.translate.instant('Invalid Password'));
                }
            }
            else {
                this.clientUtils.showAlert(this.translate.instant('INVALID_ACCOUNT_NUMBER'));
            }
        }
        else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

    loginUsingFBToken(fbToken: string) {
        if (fbToken && (fbToken.trim().length > 0)) {
            this.mcfLoadService.show('');
            this.userUtils.loginUsingFacebook(fbToken,
                (result: LoginResponse) => {
                    this.googleAnalyticsUtils.trackEvent(this.appConstants.LOGIN_SCREEN, this.appConstants.LOGIN_SUCCESSFUL);
                    this.mcfLoadService.hide();
                    this.dismiss(true);
                }, (error: ServiceErrorInfo) => {
                    this.mcfLoadService.hide();
                    let msg = '';
                    if (error && error.message && (error.message.trim().length > 0)) {
                        msg = error.message.trim();
                    } else {
                        msg = this.translate.instant('SOMETHING_WENT_WRONG');
                    }
                    this.clientUtils.showAlert(msg);
                    this.googleAnalyticsUtils.trackEvent(this.appConstants.LOGIN_SCREEN,
                        this.appConstants.LOGIN_UNSUCCESSFUL, msg);
                });
        }
        else {
            this.clientUtils.showAlert(this.translate.instant('FAILED_LOGIN_FACEBOOK'));
        }
    }

    doLoginWithFacebook() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.LOGIN_SCREEN, this.appConstants.FACEBOOK_LOGIN_EVENT);
        if (this.networkService.isOnline()) {
            this.facebookConnectService.login().then(
                (authResponse: FacebookAuthResponse) => {
                    console.log('Login with Facebook:\n' + JSON.stringify(authResponse));
                    if (this.clientUtils.isNullOrEmpty(authResponse)) {
                        this.clientUtils.showAlert(this.translate.instant('FAILED_LOGIN_FACEBOOK'));
                    } else {
                        this.loginUsingFBToken(authResponse.accessToken);
                    }
                }).catch((error: ServiceErrorInfo) => {
                console.log('Login with Facebook Error:\n' + JSON.stringify(error));
                let msg = '';
                if (error && error.message && (error.message.trim().length > 0)) {
                    msg = error.message.trim();
                } else {
                    msg = this.translate.instant('SOMETHING_WENT_WRONG');
                }
                this.clientUtils.showAlert(msg);
                this.googleAnalyticsUtils.trackEvent(this.appConstants.LOGIN_SCREEN,
                    this.appConstants.LOGIN_UNSUCCESSFUL, msg);
            });
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

    forgotPassword() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.LOGIN_SCREEN, this.appConstants.FORGOT_PASSWORD_EVENT);
        if (this.networkService.isOnline()) {
            this.clientUtils.openExternalWebURL(this.forgotPasswordURL);
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

    registerNow() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.LOGIN_SCREEN, this.appConstants.REGISTER_NOW_EVENT);
        if (this.networkService.isOnline()) {
            this.clientUtils.openWebURL(this.registrationURL);
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

    enrollUser() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.LOGIN_SCREEN, this.appConstants.USER_ENROLLMENT_EVENT);
        if (this.networkService.isOnline()) {
            if (this.shouldShowEnrollment == true) {
                this.dismiss(false);
                this.events.publish(this.appConstants.EVENT_OPEN_ENROLLMENT_PAGE);
            } else {
                this.clientUtils.openExternalWebURL(this.configUtils.getEnrollmentLink());
            }
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }
}