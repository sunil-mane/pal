/**
 * Created by C00121 on 13/12/2016.
 */
import {Injectable} from '@angular/core';
import {Platform,AlertController,ToastController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {DatePipe} from "@angular/common";
import {SessionUtils} from "./session.utils";
import {GlobalizationUtils} from "./globalization.utils";
import {DefaultConfiguration} from '../../dto/configuration.dto';
import {SafariViewService,SafariViewControllerOptions} from '../../services/commons/safari-view-controller.service';
import {InAppBrowserService} from '../../services/commons/in-app-browser.service';
import {AppConstants} from '../../constants/app.constants';
import {FileService} from '../../services/commons/file.service';


@Injectable()
export class ClientUtils {

    constructor(private alertCtrl: AlertController,
                private toastCtrl: ToastController,
                private platform: Platform,
                private translate: TranslateService,
                private safariViewService: SafariViewService,
                private inAppBrowserService: InAppBrowserService,
                private fileService: FileService,
                private appConstants: AppConstants,
                private globalizationUtils: GlobalizationUtils,
                private sessionUtils: SessionUtils) {

    }

    showAlert(message: string,
              title?: string, //OPTIONAL
              cancelButton?: string, //OPTIONAL
              otherButtons?: Array<string>, //OPTIONAL
              callback?: any //OPTIONAL
    ) {
        let titleText = title ? title : '';
        let cancelText = cancelButton ? cancelButton : this.translate.instant('OK');

        let alert = this.alertCtrl.create({
            title: titleText,
            message: message,
            buttons: [{
                text: cancelText,
                role: 'cancel',
                handler: () => {
                    // console.log('Cancel clicked');
                    if (callback) {
                        callback(cancelText);
                    }
                }
            }]
        });

        if (otherButtons && (otherButtons.length > 0)) {
            for (let index = 0; index < otherButtons.length; index++) {
                let buttonText = otherButtons[index];
                let button = {
                    text: buttonText,
                    handler: () => {
                        // console.log(buttonText + ' clicked');
                        if (callback) {
                            callback(buttonText);
                        }
                    }
                };
                alert.addButton(button);
            }
        }

        alert.present();
    }

    showToast(message: string,
              duration?: number, //OPTIONAL
              dismissOnPageChange?: boolean, //OPTIONAL
              showCloseButton?: boolean, //OPTIONAL
              closeButtonText?: string, //OPTIONAL
              position?: string, //OPTIONAL
              callback?: any //OPTIONAL
    ) {
        let delay: number = duration ? duration : 3000;
        let shouldDismiss: boolean = dismissOnPageChange ? dismissOnPageChange : false;
        let showButton: boolean = showCloseButton ? showCloseButton : false;
        let buttonText: string = closeButtonText ? closeButtonText : this.translate.instant('OK');
        let positionText: string = position ? position : 'bottom';

        let toast = this.toastCtrl.create({
            message: message,
            duration: delay,
            dismissOnPageChange: shouldDismiss,
            showCloseButton: showButton,
            closeButtonText: buttonText,
            position: positionText
        });

        toast.onDidDismiss(() => {
            if (callback) {
                callback();
            }
        });

        toast.present();
    }

    openMapURL(urlQuery: string) {
        let url: string = '';
        if (this.platform.is('android')) {
            url = "geo:?z=11&q=" + urlQuery;
        } else {
            url = "https://maps.google.com/?z=11&q=" + urlQuery;
        }
        this.openExternalWebURL(url);
    }

    openWebURL(url: string) {
        if (!this.isNullOrEmpty(url)) {
            this.safariViewService.isAvailable(
                (available: boolean) => {
                    if (available) {
                        let options: SafariViewControllerOptions = new SafariViewControllerOptions();
                        options.url = url;
                        options.hidden = false;
                        options.animated = true;
                        options.transition = 'curl';
                        options.enterReaderModeIfAvailable = false;
                        options.tintColor = '#ff0000';
                        this.safariViewService.show(options,
                            (result: any) => {
                                // if (result.event === 'opened') console.log('Opened');
                                // else if (result.event === 'loaded') console.log('Loaded');
                                // else if (result.event === 'closed') console.log('Closed');
                            }, (error: any) => {
                                console.error(error)
                            });
                    } else {
                        this.openURL(url);
                    }
                });
        }
    }

    openURL(url: string) {
        if (!this.isNullOrEmpty(url)) {
            this.inAppBrowserService.show(url);
        }
    }

    openExternalWebURL(url: string) {
        if (!this.isNullOrEmpty(url)) {
            window.open(url, "_system", "location=true");
        }
    }

    waitRendered(element: HTMLElement) {
        return new Promise((resolve) => {
            let checkNextFrame = () => {
                requestAnimationFrame(() => {
                    if (element.clientWidth)
                        resolve(element);
                    else
                        checkNextFrame();
                });
            };
            checkNextFrame();
        });
    }

    createTempFile(fileData: string, fileName: string, callback: any): void {
        if (fileData && !this.isNullOrEmpty(fileName)) {
            this.fileService.writeFile(fileData, fileName, true,
                (success: boolean) => {
                    if (success == true) {
                        this.fileService.checkFile(fileName, true,false,
                            (fileEntry: any) => {
                                if (fileEntry.isFile == true) {
                                    if (callback) {
                                        callback(fileEntry.toURL());
                                    }
                                } else {
                                    if (callback) {
                                        callback(null);
                                    }
                                }
                            }, (error: any) => {
                                if (callback) {
                                    callback(null);
                                }
                            });
                    } else {
                        if (callback) {
                            callback(null);
                        }
                    }
                });
        } else {
            if (callback) {
                callback(null);
            }
        }
    }

    fullMonths(): Array<string> {
        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            return ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        }
        return ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
    }

    /**
     * Return formatted date string
     * @param pattern
     * @param dateString
     * @param locale
     * @returns {any}
     */
    getFormattedDate(pattern: string, dateString?: string, locale?: string): string {
        if (!this.isNullOrEmpty(pattern)) {
            let date: Date = new Date();
            if (!this.isNullOrEmpty(dateString)) {
                date = new Date(dateString);
            }
            let loc: string = this.globalizationUtils.getAppLanguage();
            if (!this.isNullOrEmpty(locale)) {
                loc = locale;
            }
            let datePipe: DatePipe = new DatePipe(loc);
            return datePipe.transform(date, pattern);
        }
        return '';
    }

    /**
     * Return date difference in seconds
     * @param date1String
     * @param date2String
     * @returns {number}
     */
    getDateTimeDiff(date1String: string, date2String?: string): number {
        if (!this.isNullOrEmpty(date1String)) {
            let date2 = new Date();
            if (!this.isNullOrEmpty(date2String)) {
                date2 = new Date(date2String);
            }
            let date1: Date = new Date(date1String);
            return (date1.getTime() - date2.getTime()) / 1000;
        }
        return 0;
    }

    /**
     * Returns string after replaced keywords
     * @param text
     * @param keywords
     * @param values
     * @returns {string}
     */
    replaceKeywordsWithValues(text: string, keywords: Array<string>, values: Array<string>): string {
        let replacedTexts: string = text;
        if (!this.isNullOrEmpty(replacedTexts) && keywords && values && (keywords.length == values.length)) {
            for (let index = 0; index < keywords.length; index++) {
                replacedTexts = replacedTexts.replace(keywords[index], values[index]);
            }
        }
        return replacedTexts;
    }

    /**
     * Return true if passed object is undefined or null
     * @param str
     * @returns {boolean}
     */
    isNullOrEmpty( str: any ): boolean {
        let retVal: boolean = false;
        if (  !str
            || str == null
            || str === 'null'
            || str === ''
            || str === '{}'
            || str === 'undefined'
            || str.length === 0 ) {
            retVal = true;
        }
        return retVal;
    }

    /**
     * Return true if email address is valid
     * @param str
     * @returns {boolean}
     */
    isValidEmailAddress(str: string): boolean {
        if (this.isNullOrEmpty(str)) {
            return false;
        }
        let atpos = str.trim().indexOf("@");
        let dotpos = str.trim().lastIndexOf(".");
        if ((atpos < 1) || (dotpos < (atpos + 2)) || ((dotpos + 2) >= str.trim().length)) {
            return false;
        }
        return true;
    }

    /**
     * Return Tenant Code
     * @returns {string}
     */
    getTenantCode(): string {
        let retStr: string = '';
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            retStr = defaultConfiguraiton.tenantCode;
        }
        return retStr;
    }

    /**
     * Return Tenant Code
     * @returns {string}
     */
    getEnvironmentType(): string {
        let retStr: string = '';
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            retStr = defaultConfiguraiton.environmentType;
        }
        return retStr;
    }

    /**
     * Return base URL for the application
     * @returns {string}
     */
    getBaseURL(): string {
        let value: string = '';
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            value = defaultConfiguraiton.hostURL;
        }
        return value;
    }

    /**
     * Return web API key
     * @returns {string}
     */
    getWebApiKey(): string {
        let value: string = '';
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            value = defaultConfiguraiton.webApiKey;
        }
        return value;
    }

    /**
     * Returns true if analytics is enabled
     * @returns {boolean}
     */
    isAnalyticsEnabled(): boolean {
        let value: boolean = false;
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            let isEnabled: boolean  = defaultConfiguraiton.analyticsTrackEnabled;
            if (isEnabled === true) {
                value = true;
            }
        }
        return value;
    }

    /**
     * Return default longitude
     * @returns {string}
     */
    defaultLongitude(): number {
        let value: number;
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            value = defaultConfiguraiton.defaultLocationLongitude;
        }
        return value;
    }

    /**
     * Return default latitude
     * @returns {string}
     */
    defaultLatitude(): number {
        let value: number;
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            value = defaultConfiguraiton.defaultLocationLatitude;
        }
        return value;
    }

    /**
     * Return google analytics tracking id
     * @returns {string}
     */
    getGoogleAnalyticsTrackingId(): string {
        let value: string = '';
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            value = defaultConfiguraiton.googleAnalyticsTrackID;
        }
        return value;
    }

    /**
     * Returns true if dedug mode is enabled
     * @returns {boolean}
     */
    isDebugMode(): boolean {
        let value: boolean = false;
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            let isEnabled: boolean  = defaultConfiguraiton.debugMode;
            if (isEnabled === true) {
                value = true;
            }
        }
        return value;
    }

    /**
     * Return rate the app URL
     * @returns {string}
     */
    getRateTheAppURL(): string {
        let value: string = '';
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            if (this.platform.is('android')) {
                value = defaultConfiguraiton.rateTheAppAndroidURL;
            } else if (this.platform.is('ios')) {
                value = defaultConfiguraiton.rateTheAppIOSURL;
            }
        }
        return value;
    }

    /**
     * Return booking app URL
     * @returns {string}
     */
    getBookingAppURL(): string {
        let value: string = '';
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            if (this.platform.is('android')) {
                value = defaultConfiguraiton.bookingAppAndroidURL;
            } else if (this.platform.is('ios')) {
                value = defaultConfiguraiton.bookingAppIOSURL;
            }
        }
        return value;
    }

    /**
     * Return app display name
     * @returns {string}
     */
    getAppDisplayName(): string {
        let value: string = '';
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if(!this.isNullOrEmpty(defaultConfiguraiton)) {
            value = defaultConfiguraiton.appDisplayName;
        }
        return value;
    }

    /**
     * Returns true if Check-in feature will be hidden
     * @returns {boolean}
     */
    shouldHideCheckin(): boolean {
        return ((this.getTenantCode() === this.appConstants.APP_TENANT_CODE_AM) ||
            (this.getTenantCode() === this.appConstants.APP_TENANT_CODE_PR));
    }

    /**
     * Returns true if Avatar icon will be hidden
     * @returns {boolean}
     */
    shouldHideAvatar(): boolean {
        return (this.getTenantCode() === this.appConstants.APP_TENANT_CODE_AM);
    }

    /**
     * Returns true if Social Sharing feature will be hidden
     * @returns {boolean}
     */
    shouldHideSocialSharing(): boolean {
        return (this.getTenantCode() === this.appConstants.APP_TENANT_CODE_PR);
    }

    /**
     * Returns true if Enrollment feature will be shown
     * @returns {boolean}
     */
    shouldShowEnrollment(): boolean {
        return ((this.getTenantCode() === this.appConstants.APP_TENANT_CODE_XX) ||
            (this.getTenantCode() === this.appConstants.APP_TENANT_CODE_PR));
    }

    /**
     * Returns true if Facebook Login feature will be shown
     * @returns {boolean}
     */
    shouldShowFacebookLogin(): boolean {
        // return (this.getTenantCode() === this.appConstants.APP_TENANT_CODE_XX);
        return false;
    }

    /**
     * Returns true if app should trigger bulk sync after new version release
     * @returns {boolean}
     */
    shouldBulkSyncAfterVersionRelease(): boolean {
        return true;
    }

    /**
     * Returns true if Miles Calculator feature will be shown
     * @returns {boolean}
     */
    shouldShowMilesCalculator(): boolean {
        return (this.getTenantCode() === this.appConstants.APP_TENANT_CODE_XX);
    }
}
