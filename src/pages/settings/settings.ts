import {Component} from '@angular/core';
import {NavController,NavParams,Events} from 'ionic-angular';
import {AppConstants} from '../../constants/app.constants';
import {GoogleAnalyticsUtils} from '../../utils/commons/google-analytics.utils';
import {DeviceUtils} from '../../utils/commons/device.utils';
import {McfLoaderService} from '../../services/commons/service.loading';
import {GlobalizationUtils} from '../../utils/commons/globalization.utils';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {LanguageInfo} from '../../dto/common.dto';


@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage {

    appNotification: boolean = false;
    partnerNotification: boolean = false;
    shouldFireRequest: boolean = false;
    languageList: Array<LanguageInfo> = [];
    selectedLanguageCode: string = '';
    private backgroundImageURL: string = '';

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private events: Events,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private appConstants: AppConstants,
                private deviceUtils: DeviceUtils,
                private globalizationUtils: GlobalizationUtils,
                private configUtils: ConfigUtils,
                private mcfLoadService: McfLoaderService) {
    }

    ngOnInit() {
        this.googleAnalyticsUtils.trackPage(this.appConstants.APP_SETTINGS_SCREEN);

        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        });

        this.deviceUtils.checkNotificationPermission(
            (isEnabled: boolean) => {
                this.partnerNotification = (this.deviceUtils.getPartnerNotificationFlag() == 'Y');
                this.appNotification = (this.deviceUtils.getAppNotificationFlag() == 'Y');
            });

        this.selectedLanguageCode = this.globalizationUtils.getAppLanguage();

        let languageCodes: Array<string> = this.configUtils.getLanguageCodes();
        let availableLanguages: Array<LanguageInfo> = this.globalizationUtils.getAvailableLanguages();

        this.languageList = [];
        for (let i = 0; i < languageCodes.length; i++) {
            for (let j = 0; j < availableLanguages.length; j++) {
                let language: LanguageInfo = availableLanguages[j];
                if (language.code == languageCodes[i]) {
                    this.languageList.push(language);
                    break;
                }
            }
        }

        //Fix: ion-toggle related issue
        setTimeout(() => {
            this.shouldFireRequest = true;
        }, 1000);
    }

    ngAfterViewInit(): void {
        this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
    }

    updateLang(languageCode: string) {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.APP_SETTINGS_SCREEN,this.appConstants.APP_SETTINGS_LANGUAGE_EVENT);
        if (this.selectedLanguageCode != languageCode) {
            this.selectedLanguageCode = languageCode;
            this.globalizationUtils.updateAppLanguage(languageCode);
            this.globalizationUtils.saveUserChangedAppLanguageSettings('Y');
        }
    }

    appNotificationToggle() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.APP_SETTINGS_SCREEN,this.appConstants.APP_SETTINGS_NOTIFICATION_EVENT);
        if (this.shouldFireRequest) {
            this.deviceUtils.checkNotificationPermission(
                (isEnabled: boolean) => {
                    if (isEnabled) {
                        this.updateAppNotificationToggle();
                    } else {
                        if (this.appNotification) {
                            this.deviceUtils.openSettings();
                            this.navCtrl.pop();
                        } else {
                            this.updateAppNotificationToggle();
                        }
                    }
                });
        }
    }

    updateAppNotificationToggle() {
        if (this.appNotification === false) {
            this.deviceUtils.saveUserChangedNotificationSettings('Y');
        }
        this.partnerNotification = this.appNotification;
        this.mcfLoadService.show('');
        this.deviceUtils.updateAppNotificationFlag(this.appNotification,
            () => {
                this.mcfLoadService.hide();
            });
    }

    partnerNotificationToggle() {
        if (this.shouldFireRequest) {
            this.deviceUtils.savePartnerNotificationFlag((this.partnerNotification === true)?'Y':'N');
            this.mcfLoadService.show('');
            this.deviceUtils.registerDeviceToken(
                (result) => {
                    this.mcfLoadService.hide();
                }, (error) => {
                    this.mcfLoadService.hide();
                });
        }
    }

}
