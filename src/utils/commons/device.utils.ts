/**
 * Created by sandip on 1/9/17.
 */
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Events, Platform } from 'ionic-angular';
import { Device } from 'ionic-native';
import { DataAccessService } from '../../services/commons/data.access.service';
import { AppVersionService } from '../../services/commons/app-version.service';
import { ServiceContext } from '../../services/commons/context.service';
import { ServiceConstants } from '../../constants/service.constants';
import { AppConstants } from '../../constants/app.constants';
import { ClientUtils } from './client.utils';
import { SessionUtils } from './session.utils';
import { RemoteNotificationService } from '../../services/commons/remote-notification.service';
import { RegisterDeviceRequest, RegisterDeviceInfo, RegisterDeviceResponse } from '../../dto/device.dto';
import { RemoteNotificationInfo } from '../../dto/remote-notification.dto';
import { PageInfo, ServiceErrorInfo } from '../../dto/common.dto';
import { LocalNotificationService, LocalNotificationOption } from '../../services/commons/local-notification.service';


@Injectable()
export class DeviceUtils {

    private DEVICE_INFO_OS_IOS = 'IOS';
    private DEVICE_INFO_OS_ANDROID = 'ANDROID';
    private DEVICE_INFO_OS_WINDOWSPHONE = 'WINDOWSPHONE';
    private DEVICE_INFO_OS_UNKNOWN = 'UNKNOWN';

    constructor(private events: Events,
        private platform: Platform,
        private dataAccessService: DataAccessService,
        private appVersionService: AppVersionService,
        private serviceConstants: ServiceConstants,
        private appConstants: AppConstants,
        private clientUtils: ClientUtils,
        private sessionUtils: SessionUtils,
        private localNotificationService: LocalNotificationService,
        private remoteNotification: RemoteNotificationService) {

    }

    getDeviceToken(): string {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.deviceToken;
        if (!contextObj || (contextObj == null) || (contextObj == '')) {
            return null;
        }
        return contextObj;
    }

    saveDeviceToken(contextObj: string): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.deviceToken = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaDeviceToken(): void {
        let contextObj = '';
        this.saveDeviceToken(contextObj);
    }

    getAppNotificationFlag(): string {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.appNotification;
        if (!contextObj || (contextObj == null) || (contextObj == '')) {
            return 'Y';
        }
        return contextObj;
    }

    saveAppNotificationFlag(contextObj: string): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.appNotification = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaAppNotificationFlag(): void {
        let contextObj = 'Y';
        this.saveAppNotificationFlag(contextObj);
    }

    getPartnerNotificationFlag(): string {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.partnerNotification;
        if (!contextObj || (contextObj == null) || (contextObj == '')) {
            return 'Y';
        }
        return contextObj;
    }

    savePartnerNotificationFlag(contextObj: string): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.partnerNotification = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearPartnerNotificationFlag(): void {
        let contextObj = 'Y';
        this.savePartnerNotificationFlag(contextObj);
    }

    getUserChangedNotificationSettings(): string {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.userChangedNotificationSettings;
        if (!contextObj || (contextObj == null) || (contextObj == '')) {
            return 'N';
        }
        return contextObj;
    }

    saveUserChangedNotificationSettings(contextObj: string): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.userChangedNotificationSettings = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearUserChangedNotificationSettings(): void {
        let contextObj = 'N';
        this.savePartnerNotificationFlag(contextObj);
    }

    getAppVersionNumber(): string {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.appVersionNumber;
        if (!contextObj || (contextObj == null) || (contextObj == '')) {
            return null;
        }
        return contextObj;
    }

    saveAppVersionNumber(contextObj: string): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.appVersionNumber = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaAppVersionNumber(): void {
        let contextObj = '';
        this.saveAppVersionNumber(contextObj);
    }

    getAppVersionCode(): string {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.appVersionCode;
        if (!contextObj || (contextObj == null) || (contextObj == '')) {
            return null;
        }
        return contextObj;
    }

    saveAppVersionCode(contextObj: string): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.appVersionCode = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaAppVersionCode(): void {
        let contextObj = '';
        this.saveAppVersionCode(contextObj);
    }

    getDeviceAppVersionNumber(): string {
        return this.appVersionService.version();
    }

    getDeviceAppVersionCode(): string {
        return this.appVersionService.build();
    }

    getDeviceModelInfo(): string {
        return Device.model;
    }

    getDeviceUUID(): string {
        return Device.uuid;
    }

    getPlatformName(): string {
        if (this.platform.is('ios')) {
            return this.DEVICE_INFO_OS_IOS;
        }
        if (this.platform.is('android')) {
            return this.DEVICE_INFO_OS_ANDROID;
        }
        if (this.platform.is('windows')) {
            return this.DEVICE_INFO_OS_WINDOWSPHONE;
        }
        return this.DEVICE_INFO_OS_UNKNOWN;
    }

    getPlatformVersion(): string {
        return this.platform.version().str;
    }

    isHandheldDevice(): boolean {
        if (this.platform.is('ios') || this.platform.is('android') || this.platform.is('windows')) {
            return true;
        }
        return false;
    }

    openSettings() {
        this.remoteNotification.openSettings();
    }

    checkNotificationPermission(callback: any) {
        this.remoteNotification.checkNotificationPermission(
            (isEnabled: boolean) => {
                if ((this.getUserChangedNotificationSettings() != 'Y') || (isEnabled === false)) {
                    let appNotification: boolean = (this.getAppNotificationFlag() == 'Y');
                    if (isEnabled != appNotification) {
                        this.updateAppNotificationFlag(isEnabled, null);
                    } else {
                        this.saveAppNotificationFlag((isEnabled === true) ? 'Y' : 'N');
                        this.savePartnerNotificationFlag((isEnabled === true) ? 'Y' : 'N');
                    }
                    if (isEnabled === false) {
                        this.saveUserChangedNotificationSettings('N');
                    }
                }
                if (callback) {
                    callback(isEnabled);
                }
            });
    }

    updateAppNotificationFlag(isEnabled: boolean, callback: any) {
        this.saveAppNotificationFlag((isEnabled === true) ? 'Y' : 'N');
        this.savePartnerNotificationFlag((isEnabled === true) ? 'Y' : 'N');
        this.registerDeviceToken(
            (result) => {
                if (callback) {
                    callback();
                }
            }, (error) => {
                if (callback) {
                    callback();
                }
            });
    }

    requestForDeviceToken(successCallback: any, errorCallback: any) {
        this.remoteNotification.register(
            (data: string) => {
                if (data) {
                    this.saveDeviceToken(data);
                    if (successCallback) {
                        successCallback(data);
                    }
                    setTimeout(() => {
                        this.checkNotificationPermission(null);
                    }, 60000);
                }
                else {
                    if (errorCallback) {
                        let error = new ServiceErrorInfo();
                        error.message = 'Failed to get device token';
                        errorCallback(error);
                    }
                }
            },
            (data: RemoteNotificationInfo) => {
               // alert("Device Utls : "+JSON.stringify(data))
                if (data && data.additionalData) {
                    let isForeground = false;
                    if (data.additionalData.foreground) {
                        isForeground = data.additionalData.foreground;
                    }
                    let isSilent = false;
                    if (data.additionalData['content-available'] == 1) {
                        isSilent = true;
                    }
                    let notifCode = '';
                    if (data.additionalData.payload && data.additionalData.payload.notifCode) {
                        notifCode = data.additionalData.payload.notifCode;
                    }
                    let messageText = '';
                    if (data.message) {
                        messageText = data.message;
                    }
                    let titleText = '';
                    if (data.title) {
                        titleText = data.title;
                    }

                    this.processNotification(isForeground, isSilent, messageText, titleText, notifCode);
                }
            },
            (error: any) => {
                // if (error && error.message) {
                //     if (error.message == 'UserNotificationNone') {
                //         this.updateAppNotificationFlag(false, null);
                //     }
                // }
                if (errorCallback) {
                    errorCallback(error);
                }
            });
    }

    registerDeviceToken(successCallback: any, errorCallback: any) {
        let deviceToken = this.getDeviceToken();
        if (deviceToken) {
            let deviceInfo = new RegisterDeviceInfo();
            deviceInfo.deviceToken = deviceToken;
            deviceInfo.deviceModel = this.getDeviceModelInfo();
            deviceInfo.active = 'Y';
            deviceInfo.receiveNot = this.getAppNotificationFlag();
            deviceInfo.userDeviceId = this.getPlatformName() + '-' + this.getDeviceUUID();
            deviceInfo.operatingSystemName = this.getPlatformName() + ' ' + this.getPlatformVersion();
            deviceInfo.apnsStatus = this.clientUtils.isDebugMode() ? 'N' : 'Y';
            deviceInfo.receivePartnerNotification = this.getPartnerNotificationFlag();

            if (this.sessionUtils.isUserLoggedIn()) {
                let memberInfo = this.sessionUtils.getMemberInfo();
                deviceInfo.memberUid = memberInfo.memUID;
            }
            let requestObject = new RegisterDeviceRequest();
            requestObject.data = deviceInfo;
            let pageInfo = new PageInfo();
            requestObject.pageInfo = pageInfo;
            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_DEVICE,
                this.serviceConstants.DEVICE_SERVICE_NAME_REGISTER,
                requestObject);
            console.log("serviceContext : " + JSON.stringify(serviceContext))
            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: RegisterDeviceResponse = result.json();
                    if (!response) {
                        response = new RegisterDeviceResponse();
                    }
                    if (successCallback) {
                        successCallback(response);
                    }
                }, (error: Response) => {
                    if (errorCallback) {
                        let errorInfo: ServiceErrorInfo = error.json();
                        errorCallback(errorInfo);
                    }
                });
        }
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = 'Invalid device token';
                errorCallback(error);
            }
        }
    }

    processNotification(isForeground: boolean,
        isSilent: boolean,
        message: string,
        title: string,
        notifCode: string) {
//alert('device utils :  '+isForeground);
        if (!isSilent && message) {
            if (this.getAppNotificationFlag() != 'Y') {
                this.updateAppNotificationFlag(true, null);
            }
            this.clientUtils.showAlert(message, title);
            if (this.platform.is('android')) {
                this.showLocalNotification(title, message);
            }
        }

        if (!this.clientUtils.isNullOrEmpty(notifCode)) {
            this.events.publish(this.appConstants.EVENT_APP_DATA_SYNC_REQUEST, notifCode);
        }
    }

    showLocalNotification(title: string, message: string): void {

        let messageObj = new LocalNotificationOption();
        messageObj.title = title;
        messageObj.text = message;
        messageObj.afterDelay = 5;
        this.localNotificationService.generateLocalNotification(messageObj);
    }

    registerFoResumeEvent(): void {
        document.addEventListener("resume", (event: any) => {
            let metadata: any = null;
            if (event && event.pendingResult) {
                console.log('Resume Event Pending Result:\n', JSON.stringify(event.pendingResult));
                metadata = event.pendingResult.result;
            }
            setTimeout(() => {
                this.events.publish(this.appConstants.EVENT_APP_RESUMES, metadata);
            }, 1000);
        }, false);
    }
}
