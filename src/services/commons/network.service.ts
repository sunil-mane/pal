/**
 * Created by sandip on 1/22/17.
 */
import {Injectable} from '@angular/core';
import {Events} from 'ionic-angular';
import {AppConstants} from '../../constants/app.constants';

declare let cordova: any;
declare let navigator: any;
declare let Connection: any;

@Injectable()
export class NetworkService {

    constructor(private events: Events,
                private appConstants: AppConstants) {

    }

    isOnline(): boolean {
        if ((typeof cordova !== 'undefined') && navigator && navigator.connection && Connection && (navigator.connection.type === Connection.NONE)) {
             return false;
        }
        return true;
    }

    subscribeOnline(callback: any): void {
        document.addEventListener("online", () => {
            this.events.publish(this.appConstants.EVENT_NETWORK_STATUS_CONNECTED);
            if (callback) {
                callback();
            }
        }, false);
    }

    subscribeOffline(callback: any): void {
        document.addEventListener("offline", () => {
            this.events.publish(this.appConstants.EVENT_NETWORK_STATUS_DISCONNECTED);
            if (callback) {
                callback();
            }
        }, false);
    }
}
