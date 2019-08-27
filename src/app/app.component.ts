import { Component, ViewChild, Renderer } from '@angular/core';
import { Events, MenuController, Nav, Platform, ModalController } from 'ionic-angular';
import { Splashscreen, StatusBar, Keyboard } from 'ionic-native';
import { TabsPage } from '../pages/tabs/tabs';
import { ProfilePage } from '../pages/profile/profile';
import { TermsPage } from '../pages/terms/terms';
import { SettingsPage } from '../pages/settings/settings';
import { LoginPage } from '../pages/login/login';
import { OfflinePopupPage } from '../pages/widgets/offline-popup/offline-popup';
import { AppMenu, ServiceErrorInfo, SystemQueryInfo, SystemQueryResponse } from '../dto/common.dto';
import { AppConstants } from '../constants/app.constants';
import { ServiceConstants } from '../constants/service.constants';
import { SessionUtils } from '../utils/commons/session.utils';
import { UserUtils } from '../utils/commons/user.utils';
import { ClientUtils } from '../utils/commons/client.utils';
import { ConfigUtils } from '../utils/commons/config.utils';
import { MenuUtils } from '../utils/commons/menu.utils';
import { DeviceUtils } from '../utils/commons/device.utils';
import { SyncDataUtils } from '../utils/commons/sync-data.utils';
import { GoogleAnalyticsUtils } from '../utils/commons/google-analytics.utils';
import { LocationNotificationUtils } from '../utils/commons/location-notification.utils';
import { TargetUtils } from '../utils/commons/target.utils';
import { OfferUtils } from '../utils/commons/offer.utils';
import { PartnerUtils } from '../utils/commons/partner.utils';
import { TransactionUtils } from '../utils/commons/transaction.utils';
import { WalletUtils } from '../utils/commons/wallet.utils';
import { MemberInfo } from '../dto/account.dto';
import { NetworkService } from '../services/commons/network.service';
import { CustomHttpService } from '../services/commons/http.service';
import { TranslateService } from 'ng2-translate';
import { ConfigurationUtils } from '../utils/commons/configuration.utils';
import { GlobalizationUtils } from '../utils/commons/globalization.utils';
import { ConfigurationDetailsDTO } from '../dto/configuration.dto';
import { McfLoaderService } from '../services/commons/service.loading';
import { EnrollmentPage } from '../pages/enrollment/enrollment';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { ForceUpdateDTO } from '../dto/force.update.dto';
import { ForceUpdatePage } from '../pages/forceUpdate/forceUpdate';

@Component({
    selector: 'app-component',
    templateUrl: 'app.html'
})
export class mEngageApp {
    // the root nav is a child of the root app component
    // @ViewChild(Nav) gets a reference to the app's root nav this
    @ViewChild(Nav) nav: Nav;

    rootPage: any;
    appMenus: Array<AppMenu> = [];
    menuList: Array<AppMenu> = [];
    memberInfo: MemberInfo = null;
    lastSyncDate: string = null;
    shouldHideAvatar: boolean = false;
    private backgroundImageURL: string = '';

    constructor(public events: Events,
        public menu: MenuController,
        private platform: Platform,
        private sessionUtils: SessionUtils,
        private userUtils: UserUtils,
        private clientUtils: ClientUtils,
        private configUtils: ConfigUtils,
        private deviceUtils: DeviceUtils,
        private menuUtils: MenuUtils,
        private locationNotificationUtils: LocationNotificationUtils,
        private googleAnalyticsUtils: GoogleAnalyticsUtils,
        private syncDataUtils: SyncDataUtils,
        private targetUtils: TargetUtils,
        private offerUtils: OfferUtils,
        private partnerUtils: PartnerUtils,
        private transactionUtils: TransactionUtils,
        private walletUtils: WalletUtils,
        private appConstants: AppConstants,
        private serviceConstants: ServiceConstants,
        private networkService: NetworkService,
        private render: Renderer,
        private translate: TranslateService,
        private mcfLoadService: McfLoaderService,
        private modalCtrl: ModalController,
        private customHttpService: CustomHttpService,
        private configurationUtils: ConfigurationUtils,
        private globalizationUtils: GlobalizationUtils) {

    }

    ngOnInit() {

        this.memberInfo = this.sessionUtils.isUserLoggedIn() ? this.sessionUtils.getMemberInfo() : null;

        this.events.subscribe(this.appConstants.EVENT_LOGIN_STATUS_CHANGED, () => {
            this.memberInfo = this.sessionUtils.isUserLoggedIn() ? this.sessionUtils.getMemberInfo() : null;
            this.updateMenuList();
            this.deviceUtils.registerDeviceToken(null, null);
            this.menuUtils.fetchMenusIfRequired();
            this.configUtils.fetchAppConfigIfRequired();
            this.googleAnalyticsUtils.setUserId((this.memberInfo && this.memberInfo.personId)
                ? this.memberInfo.personId.toString() : null);
        });

        this.events.subscribe(this.appConstants.EVENT_USER_PROFILE_CHANGED, () => {
            this.memberInfo = this.sessionUtils.getMemberInfo();
            this.googleAnalyticsUtils.setUserId((this.memberInfo && this.memberInfo.personId)
                ? this.memberInfo.personId.toString() : null);
        });

        this.events.subscribe(this.appConstants.EVENT_MENU_INFO_CHANGED, () => {
            this.appMenus = this.menuUtils.getMenuContext();
            this.updateMenuList();
        });

        this.events.subscribe(this.appConstants.EVENT_NETWORK_STATUS_CONNECTED, () => {
            this.showHideNetwork(false);
        });

        this.events.subscribe(this.appConstants.EVENT_NETWORK_STATUS_DISCONNECTED, () => {
            this.lastSyncDate = this.clientUtils.getFormattedDate('yMMMd',
                this.syncDataUtils.getLastSyncDate());
            this.showHideNetwork(true);
        });

        this.events.subscribe(this.appConstants.EVENT_APP_LANGUAGE_CHANGED, () => {
            this.menuUtils.cleaTermsConditionsContext();
            this.locationNotificationUtils.fetchLocationNotifications(null, null);
        });

        this.events.subscribe(this.appConstants.EVENT_APP_DATA_SYNC_REQUEST, (syncCode: string) => {
            if (this.clientUtils.isNullOrEmpty(syncCode)) {
                this.syncDataUtils.fireSyncRequests();
            } else {
                this.syncDataUtils.processSyncCode(syncCode);
            }
        });

        this.events.subscribe(this.appConstants.EVENT_USER_SESSION_EXPIRED, () => {
            if (this.sessionUtils.isUserLoggedIn()) {
                this.logoutUser();
                // this.nav.goToRoot({animate: false, keyboardClose: true});
                this.nav.push(TabsPage);
                this.openLoginPage();
            }
        });

        this.events.subscribe(this.appConstants.EVENT_OPEN_ENROLLMENT_PAGE, () => {
            this.nav.push(EnrollmentPage);
        });

        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        });

        this.events.subscribe(this.appConstants.EVENT_APP_RESUMES, () => {
            this.syncDataUtils.fireProfileRequests();
        });
        this.platform.ready().then(() => {
            this.platform.registerBackButtonAction(() => {
                return false;
            });
            StatusBar.styleLightContent();
            Keyboard.hideKeyboardAccessoryBar(false);
            this.fetchConfiguration();
            // this.nav.push(TutorialPage);
        });
    }

    fetchConfiguration() {
        let strURL: string = 'assets/resources/app.config.json';
        this.customHttpService.fetchLocalData(strURL).subscribe(
            result => {
                let configurationDTO: ConfigurationDetailsDTO = result;
                this.configurationUtils.fetchConfigurationDetails(configurationDTO);
            },
            err => {
            },
            () => {
                // this.rootPage = TabsPage;
                if (this.sessionUtils.getTutorialFlag() == undefined || this.sessionUtils.getTutorialFlag() == null || this.sessionUtils.getTutorialFlag() == false) {
                    this.sessionUtils.setTutorialFlag(true);
                    this.nav.push(TutorialPage);
                } else {
                    this.rootPage = TabsPage;
                }
                this.processInitialRequests();
            });
    }
    checkForceUpdateRequired() {
        let forceUpdateObj: ForceUpdateDTO = this.configUtils.getForceUpdateObj();
        console.log(JSON.stringify(this.deviceUtils.getPlatformName()));
        if (forceUpdateObj) {
            if (forceUpdateObj.forceUpdate == 'Y') {
                if (this.deviceUtils.getPlatformName() == 'IOS' || this.deviceUtils.getPlatformName() == 'iOS') {
                    let appVersion = this.deviceUtils.getDeviceAppVersionNumber();
                    let appVersionArr = appVersion.split('.');
                    let currentVersionArr = forceUpdateObj.iOSVersion.split('.');
                    for (let i = 0; i < appVersionArr.length; i++) {
                        if (appVersionArr[i] < currentVersionArr[i]) {
                            setTimeout(() => {
                                let modal = this.modalCtrl.create(ForceUpdatePage, {}, { enableBackdropDismiss: false });
                                modal.present();
                            }, 3000);
                            break;
                        }
                    }
                } else{
                    let appVersion = this.deviceUtils.getDeviceAppVersionNumber();
                    let appVersionArr = appVersion.split('.');
                    let currentVersionArr = forceUpdateObj.androidVersion.split('.');
                    for (let k = 0; k < appVersionArr.length; k++) {
                        if (appVersionArr[k] < currentVersionArr[k]) {
                            setTimeout(() => {
                                let modal = this.modalCtrl.create(ForceUpdatePage, {}, { enableBackdropDismiss: false });
                                modal.present();
                            }, 3000);
                            break;
                        }
                    }
                }
            } else if (forceUpdateObj.forceUpdate == 'I') {
                if (this.deviceUtils.getPlatformName() == 'IOS' || this.deviceUtils.getPlatformName() == 'iOS') {
                    let appVersion = this.deviceUtils.getDeviceAppVersionNumber();
                    let appVersionArr = appVersion.split('.');
                    let currentVersionArr = forceUpdateObj.iOSVersion.split('.');
                    let count = 0;
                    for (let i = 0; i < appVersionArr.length; i++) {
                        if (appVersionArr[i] < currentVersionArr[i]) {
                            setTimeout(() => {
                                let modal = this.modalCtrl.create(ForceUpdatePage, {}, { enableBackdropDismiss: false });
                                modal.present();
                            }, 3000);
                            break;
                        }
                        count++
                    }
                }
            } else if (forceUpdateObj.forceUpdate == 'A') {
                if (this.deviceUtils.getPlatformName() == '"ANDROID"' || this.deviceUtils.getPlatformName() == 'ANDROID') {
                    let appVersion = this.deviceUtils.getDeviceAppVersionNumber();
                    let appVersionArr = appVersion.split('.');
                    let currentVersionArr = forceUpdateObj.iOSVersion.split('.');
                    for (let i = 0; i < appVersionArr.length; i++) {
                        if (appVersionArr[i] < currentVersionArr[i]) {
                            setTimeout(() => {
                                let modal = this.modalCtrl.create(ForceUpdatePage, {}, { enableBackdropDismiss: false });
                                modal.present();
                            }, 3000);
                            break;
                        }
                    }
                }
                
            }
        }
    }
    processInitialRequests(): void {

        this.networkService.subscribeOnline(null);
        this.networkService.subscribeOffline(null);

        this.googleAnalyticsUtils.startTracking();
        this.googleAnalyticsUtils.setUserId((this.memberInfo && this.memberInfo.personId)
            ? this.memberInfo.personId.toString() : null);

        this.shouldHideAvatar = this.clientUtils.shouldHideAvatar();
        this.deviceUtils.checkNotificationPermission(null);
        this.deviceUtils.registerFoResumeEvent();
        if (this.globalizationUtils.getUserChangedAppLanguageSettings() != 'Y') {
            this.globalizationUtils.setDeviceLanguage();
        }

        this.configUtils.fetchAppConfigIfRequired()
            .then((result: boolean) => {
                this.finishedConfigRequest();
            });
    }

    finishedConfigRequest(): void {
        this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        let appMenus = this.menuUtils.getMenuContext();
        if (appMenus && (appMenus.length > 0)) {
            this.appMenus = appMenus;
            this.updateMenuList();
            this.finishedMenuRequest();
        }
        else {
            this.menuUtils.fetchMenusIfRequired()
                .then((result: boolean) => {
                    this.finishedMenuRequest();
                });
        }
        setTimeout(() => {
            this.checkForceUpdateRequired();
        }, 1000);
    }

    finishedMenuRequest(): void {

        setTimeout(() => {
            Splashscreen.hide();
        }, 1000);

        this.registerForRemoteNotification();
        this.syncDataUtils.fireProfileRequests();
        this.startSyncTask();

        setTimeout(() => {
            if (!this.networkService.isOnline()) {
                this.lastSyncDate = this.clientUtils.getFormattedDate('yMMMd',
                    this.syncDataUtils.getLastSyncDate());
                this.showHideNetwork(true);
            }
        }, 1000);

        setTimeout(() => {
            this.locationNotificationUtils.startLocationTracking();
        }, 65000);
    }

    startSyncTask() {
        let shouldStartTimer: boolean = true;
        let shouldCheckVersion: boolean = this.clientUtils.shouldBulkSyncAfterVersionRelease();
        if (shouldCheckVersion == true) {
            let lastSyncDate = this.syncDataUtils.getLastSyncDate();
            if (lastSyncDate) {
                let versionNumber: string = this.deviceUtils.getDeviceAppVersionNumber();
                let versionCode: string = this.deviceUtils.getDeviceAppVersionCode();
                if (versionNumber && versionCode) {
                    let lastVersionNumber: string = this.deviceUtils.getAppVersionNumber();
                    let lastVersionCode: string = this.deviceUtils.getAppVersionCode();
                    if ((versionNumber != lastVersionNumber) || (versionCode != lastVersionCode)) {
                        let nowDate = new Date();
                        nowDate.setDate(nowDate.getDate() - 30);
                        this.syncDataUtils.saveLastSyncDate(nowDate.toDateString() + ' ' + nowDate.toTimeString());
                        this.syncDataUtils.startTimer();
                        this.syncDataUtils.checkLastSyncStatus();
                        shouldStartTimer = false;
                        this.deviceUtils.saveAppVersionNumber(versionNumber);
                        this.deviceUtils.saveAppVersionCode(versionCode);
                    }
                }
            }
        }

        if (shouldStartTimer == true) {
            this.syncDataUtils.checkLastSyncStatus();
            this.syncDataUtils.startTimer();
        }
    }

    updateMenuList(): void {
        let menus: Array<AppMenu> = [];
        for (let index = 0; index < this.appMenus.length; index++) {
            let appMenu = this.appMenus[index];
            if ((appMenu.facilityName != this.menuUtils.FACILITY_NAME_LOGOUT) ||
                this.sessionUtils.isUserLoggedIn()) {
                menus.push(appMenu);
            }
        }
        if ((menus.length == 0) && this.sessionUtils.isUserLoggedIn()) {
            let appMenu: AppMenu = new AppMenu();
            appMenu.facilityName = this.menuUtils.FACILITY_NAME_LOGOUT;
            menus.push(appMenu);
        }
        this.menuList = menus;
    }

    gotoProfile() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.APP_MENU_SCREEN, this.appConstants.MY_PROFILE_EVENT);
        //this.nav.push(ProfilePage);
        //this.app.getRootNav().push(ProfilePage)
        this.nav.push(ProfilePage);
    }

    openLoginPage() {
        let modal = this.modalCtrl.create(LoginPage);
        modal.present();
    }

    openPage(appMenu: AppMenu) {
        if (appMenu.facilityName == this.menuUtils.FACILITY_NAME_LOGOUT) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.APP_MENU_SCREEN, this.appConstants.LOGOUT_EVENT);
            this.logoutUser();
        } else if (appMenu.facilityName == this.menuUtils.FACILITY_NAME_RATE_APP) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.APP_MENU_SCREEN, this.appConstants.RATE_THE_APP_EVENT);
            this.openRateTheApp();
        } else if (appMenu.facilityName == this.menuUtils.FACILITY_NAME_AIR_MEXICO_MOBILE) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.APP_MENU_SCREEN, this.appConstants.MOBILE_APP_STORE_LINK_EVENT);
            this.openBookingApp();
        } else if (appMenu.facilityName == this.menuUtils.FACILITY_NAME_CHAT) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.APP_MENU_SCREEN, this.appConstants.CHAT_EVENT);
            this.openChat();
        } else if (appMenu.facilityName == this.menuUtils.FACILITY_NAME_CONTACTS) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.APP_MENU_SCREEN, this.appConstants.CONTACTS_EVENT);
            this.openContacts();
        } else if (appMenu.facilityName == this.menuUtils.FACILITY_NAME_SETTINGS) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.APP_MENU_SCREEN, this.appConstants.APP_SETTINGS_EVENT);
            this.nav.push(SettingsPage);
        } else if (appMenu.facilityName == this.menuUtils.FACILITY_NAME_TERMS_CONDITIONS) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.APP_MENU_SCREEN, this.appConstants.APP_TERMS_AND_CONDITIONS_EVENT);
            this.openTermsPage(appMenu.description);
        } else if (appMenu.facilityName == this.menuUtils.FACILITY_NAME_GUIDE) {
            this.openGuidePage();
        }
    }

    logoutUser() {
        this.userUtils.clearUserInfo();
        this.targetUtils.clearTargetContext();
        this.offerUtils.cleaFavoriteOfferContext();
        this.partnerUtils.clearFavoritePartnerLocationContext();
        this.transactionUtils.clearTransactionContext();
        this.walletUtils.cleaWalletContext();
        this.walletUtils.cleaQRCodeContext();
        this.walletUtils.removeWalletImages();
        this.events.publish(this.appConstants.EVENT_LOGIN_STATUS_CHANGED);
    }

    openRateTheApp() {
        let url: string = this.clientUtils.getRateTheAppURL();
        if (this.clientUtils.isNullOrEmpty(url)) {
            this.clientUtils.showAlert(this.translate.instant('MY_PAL_APP_UNAVAILABLE'));
        } else {
            this.clientUtils.openExternalWebURL(url);
        }
    }

    openBookingApp() {
        let url: string = this.clientUtils.getBookingAppURL();
        if (this.clientUtils.isNullOrEmpty(url)) {
            this.clientUtils.showAlert(this.translate.instant('MY_PAL_APP_UNAVAILABLE'));
        } else {
            this.clientUtils.openExternalWebURL(url);
        }
    }

    openChat() {
        if (this.sessionUtils.isUserLoggedIn()) {
            this.mcfLoadService.show('');
            this.menuUtils.getChatContent(
                (result: SystemQueryResponse) => {
                    this.mcfLoadService.hide();
                    let shouldShowError: boolean = true;
                    if (!this.clientUtils.isNullOrEmpty(result.data)) {
                        let queryInfo: SystemQueryInfo = result.data[0];
                        if (queryInfo.queryResult) {
                            shouldShowError = false;
                            let content: string = queryInfo.queryResult.replace('/ChatClient/chatservlet', 'https://chat.clubpremier.com/ChatClient/chatservlet');
                            this.clientUtils.createTempFile(content, this.appConstants.CHAT_FILE_NAME,
                                (fileURL: string) => {
                                    this.clientUtils.openURL(fileURL);
                                });
                        }
                    }
                    if (shouldShowError == true) {
                        this.clientUtils.showAlert(this.translate.instant('SOMETHING_WENT_WRONG'));
                    }
                }, (error: ServiceErrorInfo) => {
                    this.mcfLoadService.hide();
                    let msg = '';
                    if (error && error.message && (error.message.trim().length > 0)) {
                        msg = error.message.trim();
                    } else {
                        msg = this.translate.instant('SOMETHING_WENT_WRONG');
                    }
                    this.clientUtils.showAlert(msg);
                });
        } else {
            this.openLoginPage();
        }
    }

    openContacts() {
        let url: string = this.configUtils.getContactsLink();
        this.clientUtils.openURL(url);
    }

    openTermsPage(pageTitle: string) {
        let data = {
            contentType: this.serviceConstants.TERMS_CONTENT_TYPE_TC,
            pageTitle: pageTitle
        };
        this.nav.push(TermsPage, { data: data });
    }
    openGuidePage() {
        this.nav.push(TutorialPage);
    }

    registerForRemoteNotification() {
        this.deviceUtils.requestForDeviceToken(
            (result: string) => {
                this.deviceUtils.registerDeviceToken(null,
                    (error: ServiceErrorInfo) => {
                    });
            }, (error: ServiceErrorInfo) => {
            });
    }


    showHideNetwork(isNetworkOkay) {
        let body = document.getElementsByTagName('body')[0];
        this.render.setElementClass(body, 'offline-active', isNetworkOkay);
    }


    offlineMode() {
        let offlineMsg = this.configUtils.getOfflineMessage();
        let offlineData = {
            offlineMsg: offlineMsg
        };
        let Modal = this.modalCtrl.create(OfflinePopupPage, { data: offlineData });
        Modal.present();
    }

    menuOpened() {
        if (this.sessionUtils.isUserLoggedIn()) {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.USER_HOME_SCREEN, this.appConstants.MENU_EVENT);
        }
        else {
            this.googleAnalyticsUtils.trackEvent(this.appConstants.GUEST_HOME_SCREEN, this.appConstants.MENU_EVENT);
        }

        this.menuUtils.fetchMenusIfRequired();
        this.configUtils.fetchAppConfigIfRequired();
    }
}
