/**
 * Created by sandip on 22/12/2016.
 */
import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {ServiceErrorInfo} from '../../dto/common.dto';
import {RemoteNotificationInfo,
    RemoteNotificationAdditionalData,
    RemoteNotificationPayload} from '../../dto/remote-notification.dto';

declare let FCMPlugin;

@Injectable()
export class RemoteNotificationService {

    private push: any;

    constructor(private platform: Platform) {

        this.push = null;
    }

    register(onRegistration: any, onNotification: any, onError: any): void  {
       // alert(JSON.stringify(onError)+' : onRegistration : '+JSON.stringify(onRegistration)+' : onNotification : '+JSON.stringify(onNotification))
        if ((<any>window).plugins && this.platform.is('ios')) {

            if (this.push == null) {
                this.push = (<any>window).plugins.push.init({
                    "ios": {"alert": true, "badge": true, "sound": true}
                });

                if (this.push) {

                    this.push.on('registration', (data: any) => {
                        if (onRegistration && data) {
                            onRegistration(data.registrationId);
                        }
                    });

                    this.push.on('notification', (data: any) => {
                     //   alert('processNotification : '+JSON.stringify(data));
                        if (onNotification) {
                            onNotification(data);
                        }
                    });

                    this.push.on('error', (error: any) => {
                       // alert('processNotification error : '+JSON.stringify(error));
                        if (onError) {
                            onError(error);
                        }
                    });
                }
                else {
                    if (onError) {
                        let error = new ServiceErrorInfo();
                        error.message = 'Platform does not support';
                        onError(error);
                    }
                }
            }
        }
        else if ((<any>window).plugins && this.platform.is('android')) {
            // console.log('FCM Plugin : ' );
            FCMPlugin.getToken(
                function(data: string) {
                    if (onRegistration) {
                        onRegistration(data);
                    }
                },
                function(error: any) {
                    if (onError) {
                        onError(error);
                    }
                });

            FCMPlugin.onNotification(
                (data: any) => {
                    let notificationInfo = new RemoteNotificationInfo();
                    if (data) {
                        let additionalData = new RemoteNotificationAdditionalData();
                        additionalData.foreground = false;
                        if (data.wasTapped === true)
                            additionalData.foreground = true;

                        let payload = new RemoteNotificationPayload();
                        payload.notifCode = data.NotifCode;
                        additionalData.payload = payload;

                        notificationInfo.additionalData = additionalData;
                        notificationInfo.title = data.Title;
                        notificationInfo.message = data.Message;
                    }
                    if (onNotification) {
                        onNotification(notificationInfo);
                    }
                },
                (data: string) => {
                    console.log('FCM onNotification successfully registered: ' + data);
                },
                (error: any) => {
                    if (onError) {
                        onError(error);
                    }
                });
        }
        else {
            if (onError) {
                let error = new ServiceErrorInfo();
                error.message = 'Platform does not support';
                onError(error);
            }
        }
    }

    checkNotificationPermission(callback: any) {
        if ((<any>window).plugins && this.platform.is('ios')) {
            (<any>window).plugins.push.hasPermission(
                (data: any) => {
                    if (callback) {
                        callback(data.isEnabled);
                    }
                });
        }
        else if ((<any>window).plugins && this.platform.is('android')) {
            FCMPlugin.hasPermission(
                function(data: string) {
                    if (callback) {
                        callback((data == 'Y'));
                    }
                });
        }
        else {
            if (callback) {
                callback(false);
            }
        }
    }

    openSettings() {
        if ((<any>window).plugins && this.platform.is('ios')) {
            (<any>window).plugins.push.openSettings();
        }
        else if ((<any>window).plugins && this.platform.is('android')) {
            FCMPlugin.openSettings();
        }
    }
}
