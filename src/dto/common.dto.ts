

export class PageInfo {
    startIndex: number;
    endIndex: number;
    orderBy: string;
    groupBy: string;
    whereClause: string;
    numberOfRecords: number;
    hasMoreRecords: boolean;
    nextURL: string;
    prevURL: string;
    userId: string;
}

export class ServiceHeaderInfo {
    Authorization: string;
    language: string;
    API_KEY: string;
}

export class ServiceErrorInfo {
    message: string;
    code: number;
}

export class ServiceResponseStatus {
    //For future use
}

export class AppMenuRequest {
    data: AppMenu;
    pageInfo: PageInfo;
}

export class AppMenuResponse {
    data: Array<AppMenu>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class AppMenu {
    activeStatus: string;
    description: string;
    documentLevel: string;
    facilityName: string;
    facilityType: string;
    groupName: string;
    menuItemName: string;
    menuLocation: string;
    menuName: string;
    menuParentName: string;
    purpose: string;
    sortOrder: string;
}

export class ConfigInfo {
    code: string;
    value: string;
}

export class ConfigResponse {
    data: Array<ConfigInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class TermsCondtionsInfo {
    activeStatus: string;
    authorisedStatus: string;
    cdcCode: string;
    cmdCode: string;
    cmfCode: string;
    content: string;
    contentVerfied: string;
    languageId: number;
    membershipNo: string;
    msgSubject: string;
    msgVerified: string;
    personalise: string;
    prtCode: string;
}

export class TermsResponse {
    data: Array<TermsCondtionsInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class GeoCoordinate {
    latitude: number;
    longitude: number;
}

export class MessageInfo {
    activeStatus: string;
    authorisedStatus: string;
    cdcCode: string;
    cmdCode: string;
    cmfCode: string;
    code: string;
    content: string;
    contentVerfied: string;
    languageId: number;
    membershipNo: string;
    msgSubject: string;
    msgVerified: string;
    personalise: string;
    prtCode: string;
}

export class MessageResponse {
    data: Array<MessageInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class LanguageInfo {
    description: string;
    code: string;
}

export class SystemQueryInfo {
    activeCardNumber: string;
    queryCode: string;
    queryResult: string;
}

export class SystemQueryResponse {
    data: Array<SystemQueryInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

