/**
 * Created by sandip on 1/18/17.
 */
import {Injectable} from '@angular/core';


declare let cordova: any;

export class LocalNotificationOption {
    id: number;
    title: string;
    text: string;
    afterDelay: number
}

@Injectable()
export class LocalNotificationService {

    constructor() {

    }

    generateLocalNotification(option: LocalNotificationOption) {
        if ((typeof cordova !== 'undefined') && cordova.plugins) {
            cordova.plugins.notification.local.schedule({
                id: option.id,
                title: option.title,
                text: option.text,
                trigger: { in: option.afterDelay, unit: 'second' }
            });
        }
    }
}
