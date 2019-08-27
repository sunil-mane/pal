/**
 * Created by sandip on 1/15/17.
 */
import {Injectable} from '@angular/core';
import {SessionUtils} from './session.utils';
import {ClientUtils} from './client.utils';
import {GeocodeResponse,GeocodeInfo} from '../../dto/geocode.dto';


declare let Geocode;

@Injectable()
export class UserAddressUtils {

    private MAX_NUM_OF_RECORDS: number = 11;

    constructor(private sessionUtils: SessionUtils,
                private clientUtils: ClientUtils) {

    }

    getUserAddressContext(): Array<GeocodeInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.geocodes;
        if (!contextObj) {
            contextObj = new Array<GeocodeInfo>();
        }
        return contextObj;
    }

    saveUserAddressContext(contextObj: Array<GeocodeInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.geocodes = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearUserAddressContext(): void {
        let contextObj = new Array<GeocodeInfo>();
        this.saveUserAddressContext(contextObj);
    }

    fetchAddressForLocation(latitude: number, longitude: number, successCallback: any, errorCallback: any) {
        Geocode.getAddressForLocation(latitude, longitude,
            (result: string) => {
                if (this.clientUtils.isNullOrEmpty(result)) {
                    if (errorCallback) {
                        errorCallback(null);
                    }
                } else {
                    let response: GeocodeResponse = JSON.parse(result);
                    if (!response) {
                        response = new GeocodeResponse();
                        response.results = [];
                    }
                    if (response.results && (response.results.length > 0)) {
                        let geocodeInfo = response.results[0];
                        this.storeGeocodeInfo(geocodeInfo);
                        if (successCallback) {
                            successCallback(geocodeInfo);
                        }
                    }
                    else if (errorCallback) {
                        errorCallback(null);
                    }
                }
            });
    }

    fetchLocationsForAddress(searchText: string, successCallback: any, errorCallback: any) {
        Geocode.getLocationForAddress(searchText,
            (result: string) => {
                if (this.clientUtils.isNullOrEmpty(result)) {
                    if (errorCallback) {
                        errorCallback(null);
                    }
                } else {
                    let response: GeocodeResponse = JSON.parse(result);
                    if (!response) {
                        response = new GeocodeResponse();
                        response.results = [];
                    }
                    if (response.results && (response.results.length > 0)) {
                        let geocodeInfo = response.results[0];
                        this.storeGeocodeInfo(geocodeInfo);
                        if (successCallback) {
                            successCallback(geocodeInfo);
                        }
                    }
                    else if (errorCallback) {
                        errorCallback(null);
                    }
                }
            });
    }

    storeGeocodeInfo(geocodeInfo: GeocodeInfo) {

        let geocodes = this.getUserAddressContext();

        let tempArray: Array<GeocodeInfo> = [];
        tempArray.push(geocodeInfo);
        for (let index = 0; index < geocodes.length; index++) {
            if ((geocodeInfo.formatted_address != geocodes[index].formatted_address) &&
                (index < (this.MAX_NUM_OF_RECORDS - 1))) {
                tempArray.push(geocodes[index]);
            }
        }

        this.saveUserAddressContext(tempArray);
    }
}
