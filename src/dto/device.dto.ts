import { PageInfo } from './common.dto';


export class RegisterDeviceRequest {
    data: RegisterDeviceInfo;
    pageInfo: PageInfo;
}

export class RegisterDeviceResponse {
    message: string;
}

export class RegisterDeviceInfo {
    deviceId: number;
    deviceToken: string;
    deviceModel: string;
    active: string;
    receiveNot: string;
    appId: number;
    localNotToken: string;
    localNotMessageSent: string;
    memberUid: number;
    userDeviceId: string;
    operatingSystemName: string;
    apnsStatus: string;
    receivePartnerNotification: string;
}
