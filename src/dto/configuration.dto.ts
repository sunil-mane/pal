/**
 * Created by chandan on 2/27/17.
 */
/**
 * Configuration details object which has all the information
 */
export class ConfigurationDetailsDTO {
    channelIdentifier: string;
    version: string;
    activeTenantDetails: ActiveTenantDetails;
    tenantList: Array<TenantDetailsDTO>;
}

export class ActiveTenantDetails {
    channelIdentifier: string;
    version: string;
    tenantCode: string;
    environmentType: string;
    applicationName: string;
}

export class TenantDetailsDTO {
    tenantCode: string;
    tenantName: string;
    version: string;
    googleAnalyticsTrackID: string;
    defaultLocationLatitude: number;
    defaultLocationLongitude: number;
    defaultAppId: string;
    rateTheAppIOSURL: string;
    rateTheAppAndroidURL: string;
    bookingAppIOSURL: string;
    bookingAppAndroidURL: string;
    environmentList: Array<EnvironmentDetailsDTO>;
}

export class EnvironmentDetailsDTO {
    environmentType: string;
    environmentDescription: string;
    analyticsTrackEnabled: boolean;
    debugMode: boolean;
    webApiKey: string;
    applicationList: Array<ApplicationDetailsDTO>;
}

export class ApplicationDetailsDTO {
    applicationName: string;
    applicationDescription: string;
    serverList: Array<ServerDetailsDTO>;
}

export class ServerDetailsDTO {
    serverName: string;
    serverURL: string;
    status: string;
}

/* classes for resrource mapping */
export class DefaultConfiguration {
    hostURL: string;
    tenantCode: string;
    tenantName: string;
    version: string;
    environmentType: string;
    analyticsTrackEnabled: boolean;
    googleAnalyticsTrackID: string;
    defaultLocationLatitude: number;
    defaultLocationLongitude: number;
    defaultAppId: string;
    rateTheAppIOSURL: string;
    rateTheAppAndroidURL: string;
    bookingAppIOSURL: string;
    bookingAppAndroidURL: string;
    debugMode: boolean;
    appDisplayName: string;
    webApiKey: string;
}
