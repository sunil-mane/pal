/**
 * Created by sandip on 1/16/17.
 */
import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {Events,Platform} from 'ionic-angular';
import {SessionUtils} from './session.utils';
import {ClientUtils} from './client.utils';
import {ConfigUtils} from './config.utils';
import {DeviceUtils} from './device.utils';
import {GlobalizationUtils} from './globalization.utils';
import {ServiceErrorInfo} from '../../dto/common.dto';
import {LocationNotificationInfo,LocationNotificationResponse} from '../../dto/location-notification.dto';
import {LocalNotificationService,LocalNotificationOption} from '../../services/commons/local-notification.service';
import {GeolocationService,GeolocationPosition,GeolocationOption} from '../../services/commons/geolocation.service';
import {DataAccessService} from '../../services/commons/data.access.service';
import {ServiceContext} from '../../services/commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {AppConstants} from '../../constants/app.constants';


@Injectable()
export class LocationNotificationUtils {

    MIN_LOCATION_TIME_GAP = 10000; //Milliseconds
    MIN_DISPLAY_TIME_GAP = 86400; //Seconds
    MIN_DISTANCE_GAP = 500; //Meters
    trackingId: string = null;
    locations: Array<LocationNotificationInfo> = [];
    trackPosition: GeolocationPosition = null;

    constructor(private events: Events,
                private platform: Platform,
                private sessionUtils: SessionUtils,
                private clientUtils: ClientUtils,
                private configUtils: ConfigUtils,
                private deviceUtils: DeviceUtils,
                private globalizationUtils: GlobalizationUtils,
                private dataAccessService: DataAccessService,
                private serviceConstants: ServiceConstants,
                private appConstants: AppConstants,
                private localNotificationService: LocalNotificationService,
                private geolocationService: GeolocationService) {

    }

    getLocationNotificationContext(): Array<LocationNotificationInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.locationNotifications;
        if (!contextObj) {
            contextObj = new Array<LocationNotificationInfo>();
        }
        return contextObj;
    }

    saveLocationNotificationContext(contextObj: Array<LocationNotificationInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.locationNotifications = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearLocationNotificationContext(): void {
        let contextObj = new Array<LocationNotificationInfo>();
        this.saveLocationNotificationContext(contextObj);
    }

    fetchLocationNotifications(successCallback: any, errorCallback: any): void {

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_LOCATION_NOTIFICATION,
            this.serviceConstants.LOCATION_NOTIFICATION_SERVICE_NAME_GET,
            null);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: LocationNotificationResponse = result.json();
                if (!response) {
                    response = new LocationNotificationResponse();
                    response.data = [];
                }
                this.locations = response.data;
                this.saveLocationNotificationContext(this.locations);
                this.events.publish(this.appConstants.EVENT_LOCATION_NOTIFICATION_CHANGED);
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

    startLocationTracking() {
        if (this.trackingId == null) {
            let locations = this.getLocationNotificationContext();
            if (locations && (locations.length > 0)) {
                this.locations = locations;
                this.trackUserLocation();
            }
            else {
                this.fetchLocationNotifications(
                    (result: LocationNotificationResponse) => {
                        this.trackUserLocation();
                    }, null);
            }
        }
    }

    stopLocationTracking() {
        if (this.trackingId) {
            this.geolocationService.stopTrackingUserLocation(this.trackingId);
            this.trackingId = null;
            this.trackPosition = null;
        }
    }

    trackUserLocation() {
        let option = new GeolocationOption();
        option.maximumAge = 3000;
        option.timeout = this.MIN_LOCATION_TIME_GAP;
        option.enableHighAccuracy = false;
        this.trackingId = this.geolocationService.trackUserLocation(option,
            (data: GeolocationPosition) => {
                // console.log('Track User Location:\n' + JSON.stringify(data));
                if (this.trackPosition) {
                    // console.log('Track Position1:\n' + JSON.stringify(this.trackPosition));
                    if ((data.timestamp - this.trackPosition.timestamp) > this.MIN_LOCATION_TIME_GAP) {
                        let distance = this.calculateDistance(data.coords.latitude, data.coords.longitude,
                            this.trackPosition.coords.latitude, this.trackPosition.coords.longitude);
                        // console.log('Track Position Distance: ' + distance);
                        if (distance > (this.MIN_DISTANCE_GAP/1000.0)) {
                            this.trackPosition = data;
                            this.filterLocationsForNotification();
                        }
                    }
                }
                else {
                    this.trackPosition = data;
                    this.filterLocationsForNotification();
                }
            },
            (error: ServiceErrorInfo) => {
                this.events.publish(this.appConstants.EVENT_USER_LOCATION_CHANGED, null, error);
            });
    }

    filterLocationsForNotification() {
        this.events.publish(this.appConstants.EVENT_USER_LOCATION_CHANGED, this.trackPosition, null);
        // console.log('Track Position2:\n' + JSON.stringify(this.trackPosition));
        if (this.deviceUtils.getAppNotificationFlag() === 'Y') {
            let shouldSaveLocationNotifications: boolean = false;
            let minDistance: number = this.configUtils.getRangeForRegionTracking() / 1000.0;
            for (let index = 0; index < this.locations.length; index++) {
                let locObj: LocationNotificationInfo = this.locations[index];
                if (locObj.latitude &&
                    locObj.longitude &&
                    locObj.messageContent &&
                    locObj.partnerName &&
                    (locObj.messageContent.trim().length > 0) &&
                    this.hasCurrentLanguage(locObj)) {

                    let distance = this.calculateDistance(locObj.latitude, locObj.longitude,
                        this.trackPosition.coords.latitude, this.trackPosition.coords.longitude);
                    // console.log('Filter Location Distance: ' + distance);
                    // console.log('Filter Location Object: ' + locObj.messageContent);
                    // console.log('Filter Location Object: (' + locObj.latitude + ', ' + locObj.longitude + ')');
                    if (distance < minDistance) {
                        let diffSecs = Math.abs(this.clientUtils.getDateTimeDiff(locObj.lastDisplayDate));
                        let shouldDisplay: boolean = ((diffSecs <= 0) || (diffSecs >= this.MIN_DISPLAY_TIME_GAP));
                        if (shouldDisplay == true) {
                            // console.log('Show LocalNotification: ' + locObj.messageContent);
                            let title = locObj.messageSubject;
                            if (this.clientUtils.isNullOrEmpty(title)) {
                                title = locObj.partnerName;
                            }
                            this.clientUtils.showAlert(locObj.messageContent, title);
                            if (this.platform.is('android')) {
                                this.showLocalNotification(title, locObj.messageContent);
                            }
                            let nowDate = new Date();
                            this.locations[index].lastDisplayDate = nowDate.toDateString();
                            shouldSaveLocationNotifications = true;
                        }
                    }
                }
            }
            if (shouldSaveLocationNotifications == true) {
                this.saveLocationNotificationContext(this.locations);
            }
        }
    }

    showLocalNotification(title: string, message: string): void {

        let messageObj = new LocalNotificationOption();
        messageObj.title = title;
        messageObj.text = message;
        messageObj.afterDelay = 5;
        this.localNotificationService.generateLocalNotification(messageObj);
    }

    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        let radlat1 = Math.PI * lat1/180;
        let radlat2 = Math.PI * lat2/180;
        let theta = lon1-lon2;
        let radtheta = Math.PI * theta/180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344; //KMs
        if (dist < 0) {
            dist = dist * -1.0;
        }
        return dist;
    }

    hasCurrentLanguage(locObj: LocationNotificationInfo): boolean {
        let languageId: number = locObj.langaugeId;
        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            return (this.serviceConstants.LOC_NOTIF_LANG_ID_EN === languageId);
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            return (this.serviceConstants.LOC_NOTIF_LANG_ID_ES === languageId);
        }
        return false;
    }
}
