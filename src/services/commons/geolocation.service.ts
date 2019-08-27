/**
 * Created by sandip on 25/12/2016.
 */
import {Injectable} from '@angular/core';
import {ServiceErrorInfo} from '../../dto/common.dto';


declare let navigator: any;

export class GeolocationCoordinate {
    latitude: number; //Latitude in decimal degrees
    longitude: number; //Longitude in decimal degrees
    altitude: number; //Height of the position in meters above the ellipsoid
    accuracy: number; //Accuracy level of the latitude and longitude coordinates in meters
    altitudeAccuracy: number; //Accuracy level of the altitude coordinate in meters
    heading: number; //Direction of travel, specified in degrees counting clockwise relative to the true north
    speed: number; //Current ground speed of the device, specified in meters per second
}

export class GeolocationPosition {
    coords: GeolocationCoordinate;
    timestamp: number; //Creation timestamp for coords
}

export class GeolocationOption {
    maximumAge: number; //Accept cached position whose age is no greater than the specified time (milliseconds)
    timeout: number; //Maximum length of time (milliseconds) that is allowed to pass
    enableHighAccuracy: boolean; //Provides a hint that the application needs the best possible results
}

@Injectable()
export class GeolocationService {

    constructor() {
    }

    getCurrentLocation(option: GeolocationOption, successCallback: any, errorCallback: any): void {
        if (navigator && navigator.geolocation) {
            if (!option) {
                option = new GeolocationOption;
                option.timeout = 20000;
            }
            navigator.geolocation.getCurrentPosition(
                (result: GeolocationPosition) => {
                    if (successCallback) {
                        successCallback(result);
                    }
                },
                (error: ServiceErrorInfo) => {
                    if (errorCallback) {
                        errorCallback(error);
                    }
                },
                option);
        }
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = 'Platform does not support';
                errorCallback(error);
            }
        }
    }

    trackUserLocation(option: GeolocationOption, successCallback: any, errorCallback: any): string {
        if (navigator && navigator.geolocation) {
            if (!option) {
                option = null;
            }
            return navigator.geolocation.watchPosition(
                (result: GeolocationPosition) => {
                    if (successCallback) {
                        successCallback(result);
                    }
                },
                (error: ServiceErrorInfo) => {
                    if (errorCallback) {
                        errorCallback(error);
                    }
                },
                option);
        }
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = 'Platform does not support';
                errorCallback(error);
            }
        }

        return null;
    }

    stopTrackingUserLocation(trackingId: string): void {
        if (navigator && navigator.geolocation) {
            navigator.geolocation.clearWatch(trackingId);
        }
    }
}
