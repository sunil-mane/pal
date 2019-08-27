import { PageInfo } from './common.dto';
import { ServiceResponseStatus } from './common.dto';

/**
 * Login Request DTO
 * @class LoginRequest
 *
 */
export class LoginRequest {
    /**
     * @property data
     * @type {MemberInfo}
     */
    data: MemberInfo;
    /**
     * @property pageInfo
     * @type {PageInfo}
     */
    pageInfo: PageInfo;
}

export class LoginResponse {
    data: Array<LoginDataResponse>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class LoginDataResponse {
    member: MemberInfo;
}

export class MemberInfo {
    accessToken: string;
    activeCardNo: string;
    activeStatus: string;
    address: MemberAddressInfo;
    airlineUseField: string;
    answer: string;
    availableBalanceMiles: number;
    birthDate: string;
    cardExpiryDate: string;
    contact: MemberContactInfo;
    countryOfResidence: string;
    dateJoined: string;
    earnedMiles: number;
    emailAddress: string;
    errorMessage: string;
    facebookAccessToken: string;
    fbMemberId: string;
    firstName: string;
    gender: string;
    lastDgradeReviewDate: string;
    lastExp: string;
    lastLoginDate: string;
    lastName: string;
    loginSuccess: string;
    memberID: string;
    memberPicture: string;
    membershipCardNumber: string;
    memUID: number;
    message: string;
    middleName: string;
    milesExpiryDate: string;
    milesExpiryDiff: number;
    mobileNumber: string;
    monthOfDob: number;
    mothersMaidenName: string;
    nameSuffix: string;
    nationality: string;
    nationalityDescription: string;
    newPassword: string;
    nccCode: string;
    nextExpiryMiles: string;
    nickName: string;
    noOfAttempts: number;
    oldPassword: string;
    password: string;
    passwordHint: string;
    personId: number;
    pmpType: string;
    poBox: string;
    pointsBalanace: number;
    preferredCardName: string;
    preferredLanguage: number;
    preferredLanguageDescription: string;
    questionId: string;
    registrationType: string;
    termsAccepted: string;
    tier: string;
    tierDescr: string;
    tierPointsBalance: number;
    title: string;
    username: string;
}

export class TransactionResponse {
    data: Array<TransactionInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class TransactionInfo {
    activityCode: string;
    activityDate: string;
    activityDateString: string;
    activityDescription: string;
    activityID: number;
    activityMethod: string;
    activityType: string;
    activityTypeCategory: string;
    actualPoints: number;
    cityPair: string;
    contribMemNo: string;
    couponDetails: string;
    couponDetailsFamily: string;
    englishDescr: string;
    expiryActionDate: string;
    familyID: number;
    familyMemUID: number;
    familyTicketNumber: string;
    flightNumber: string;
    isCancelled: string;
    isExpired: string;
    isFamilyTransaction: string;
    isMerged: string;
    lastExpired: string;
    mcdCardNumber: string;
    membershipCardNumber: string;
    memUID: number;
    mergedCardNumber: string;
    milesUnExpired: number;
    mktcareer: string;
    mktfltno: string;
    numberOfRecords: number;
    optcareer: string;
    optfltno: string;
    partnerCode: string;
    partnerDescr: string;
    personID: number;
    pmaId: number;
    pmaIdFamily: number;
    pmaType: string;
    prbr: string;
    qrsCode: string;
    recordLocator: string;
    redemptionMiles: number;
    rewardID: number;
    statementDate: string;
    status: string;
    ticketNumber: string;
    ticketNumberTrans: string;
    tierMiles: number;
    transactionCouponID: number;
    transactionCouponIDFamily: number;
    transactionDate: string;
    transactionDateString: string;
    transactionDescr: string;
    transactionID: number;
    transactionIDFamily: number;
    transactionType: string;
}

export class VirtualCardInfo {
    cardNumber: string;
    binNumber: number;
    cardFrontUrl: string;
    cardBackUrl: string;
    isUsable: string;
    dvNumber: number;
    tierCode: string;
}

export class VirtualCardResponse {
    data: Array<VirtualCardInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class QRCodeInfo {
    data: string;
    qrCodeAsByte: string;
    qrCodeAsString: string;
    memberUid: number;
    cardNumber: string;
}

export class QRCodeResponse {
    data: Array<QRCodeInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class EnrollResponse {
    data: Array<MemberInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class MemberAddressResponse {
    data: Array<MemberAddressInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class MemberAddressInfo {
    addressID: number;
    address1: string;
    address2: string;
    cityIataCode: string;
    comments: string;
    country: string;
    isPreferred: boolean;
    isValidate: boolean;
    locationID: number;
    orgID: number;
    parentCardNo: string;
    personID: number;
    preferredContactMethod: string;
    poBox: string;
    postCode: string;
    region: string;
    salesOffice: string;
    sendCareOf: string;
    state: string;
    town: string;
    updateFlag: string;
    usages: string;
}

export class MemberContactInfo {
    areaCode: string;
    contactNumber: string;
    isdCode: string;
}

export class MilesCalculatorFilters {
    milesType: string;
    promotionCode: string;
}

export class PasswordHintResponse {
    data: Array<PasswordHintList>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class PasswordHintList {
    passwordHints: PasswordHint;
    passwordCharacters: Array<PasswordCharacter>;
}

export class PasswordHint {
    rowId: string;
    lowerCase: string;
    maxPwdLength: number;
    minPwdLength: number;
    numeric: string;
    pwdChangeFreq: number;
    pwdCharCombination: string;
    pwdExpiry: number;
    pwdHistory: number;
    specialChar: string;
    suspendPeriod: number;
    upperCase: string;
    userType: string;
    specialCharset: string;
}

export class PasswordCharacter {
    characterset: string;
    code: string;
    description: string;
    rowId: string;
    userType: string;
}
