import { PageInfo } from './common.dto';
import { ServiceResponseStatus } from './common.dto';


export class PartnerRequest {
    data: PartnerInfo;
    pageInfo: PageInfo;
}

export class PartnerResponse {
    data: Array<PartnerInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class PartnerInfo {
    activePartnerContract: string;
    checkinReqVal: string;
    classChangeAllowed: string;
    corpAccrualAllowed: string;
    culledStatus: string;
    description: string;
    downloadReq: string;
    end: number;
    industryType: string;
    isMengage: string;
    localNotEnable: string;
    logiFileName: string;
    milesMultiplier: string;
    offersCount: number;
    organizationDescription: string;
    partnerAboutUs: string;
    partnerActive: string;
    partnerAvtive: string;
    partnerCode: string;
    partnerLocationCount: number;
    partnerLogoPath: string;
    partnerImagePath: string;
    partnerName: string;
    partnerType: string;
    paxNameReqd: string;
    principle: string;
    recordId: string;
    redemptionMiles: string;
    retroVerificationReq: string;
    rewardItnReqd: string;
    rewardverReqd: string;
    scanReceiptEnable: string;
    start: number;
    terms: string;
    termsType: string;
    territoryCode: string;
    tierMiles: string;
    updateLPPPOintsExpiry: string;
}

export class PartnerLocationsRequest {
    data: PartnerLocationInfo;
    pageInfo: PageInfo;
}

export class PartnerLocationsResponse {
    data: Array<PartnerLocationInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class PartnerLocationInfo {
    active: string;
    addressDescription: string;
    addressId: number;
    building: string;
    businessType: any;
    category: string;
    checkingPoints: string;
    cityIataCode: string;
    comments: string;
    coName: string;
    countryIataCode: any;
    description: any;
    distance: number;
    email: string;
    end: number;
    faxNumber: string;
    imagePath: any;
    invalidAddress: string;
    latitude: number;
    locality: string;
    localNotEnabled: string;
    locationDescription: string;
    lastCheckinTime: string;
    locationId: number;
    isFavorite: string;
    isCheckedIn: boolean;
    longitude: number;
    lpt_Code: any;
    memberUid: number;
    mobileNumber: string;
    numberOfOffers: number;
    offerId: number;
    partnerCode: string;
    partnerLogoPath: string;
    partnerName: string;
    poBox: string;
    postCode: string;
    prefContact: string;
    region: string;
    searchString: string;
    sendCareOf: string;
    serviceTime: string;
    sitaNumber: string;
    start: number;
    storeName: string;
    street: string;
    telephoneNumber: string;
    telexNumber: string;
    terms: string;
    termsType: string;
    town: string;
}

export class IndustryTypesRequest {
    data: IndustryTypeInfo;
    pageInfo: PageInfo;
}

export class IndustryTypeResponse {
    data: Array<IndustryTypeInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class IndustryTypeInfo {
    code: string;
    description: string;
    active: string;
    logoPath: string;
    partnerActive: string;
}

export class CheckinInfo {
    checkinId: number;
    memberUid: number;
    addressId: number;
    appId: number;
    checkinTime: string;
    checkinPoints: number;
    active: string;
}

export class CheckinRequest {
    data: CheckinInfo;
    pageInfo: PageInfo;
}

export class VouchersInfo {
    searchKey: string;
    start: number;
    end: number;
}
export class MyVoucherRequest {
    personId: number;
    activeCardNumber: string;
    utilized: string;
}
export class VouchersResponse {
    data: Array<VouchersInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}
export class MyVouchersResponse {
    data: Array<MyVoucherDto>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}
export class MyVoucherDto {
    personId: number;
    customerVoucherNo: number;
    customerVoucherCode: string;
    issueDate: Date;
    expiryDate: Date;
    pullDate: Date;
    pullRequired: string;
    cancelled: string;
    activeCardno: number;
    chargesId: number;
    chargesPaid: string;
    useCount: number;
    utilizedCount: number;
    issueTo: string;
    salesOffice: string;
    voucherUtilized: string;
    voucherDescription: string;
    voucherType: string;
    voucherUtilizedDate: Date;
    remarks: string;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}

export class redeemVoucherRequest {
    partnerCode: string;
    activeCardNo: string;
    activityDate: Date;
    activityIdentifier: string;
    numberOfActivityUnits: number;
    isQuoteOnly: string;
    applicableRuleCode: string;
    activityType: string;
    redemptionType: string;
}