/**
 * Created by sandip on 1/16/17.
 */
import { PageInfo } from './common.dto';
import { ServiceResponseStatus } from './common.dto';


export class LocationNotificationResponse {
    data: Array<LocationNotificationInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus
}

export class LocationNotificationInfo {
    addressId: number;
    cdcCode: string;
    langaugeId: number;
    languageName: string;
    latitude: number;
    locationId: number;
    locationName: string;
    longitude: number;
    messageContent: string;
    messageSubject: string;
    partnerCode: string;
    partnerName: string;
    lastDisplayDate: string;
}
