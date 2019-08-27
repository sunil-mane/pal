/**
 * Created by chandan on 2/28/17.
 */
import {Injectable} from '@angular/core';
import {SessionUtils} from './session.utils';
import {ClientUtils} from './client.utils';
import {CustomHttpService} from '../../services/commons/http.service';
import {SessionRootInfo}  from '../../dto/session.dto';

import {ConfigurationDetailsDTO,ActiveTenantDetails,TenantDetailsDTO,EnvironmentDetailsDTO, ApplicationDetailsDTO, ServerDetailsDTO, DefaultConfiguration} from '../../dto/configuration.dto';


@Injectable()
export class ConfigurationUtils {
    constructor(private sessionUtils: SessionUtils,
                private clientUtils: ClientUtils,
                private customHttpService: CustomHttpService) {

    }

    fetchConfigurationDataFromJSON(): void {
        let strURL: string = '../assets/resources/app.config.json';
        //console.log('customHttpService.baseUrl='+JSON.stringify(this.customHttpService.fetchLocalData(strURL)));
        this.customHttpService.fetchLocalData(strURL).subscribe(
            result => {
                //this.newsData=result.data.children;
                // let configurationDTO: ConfigurationDetailsDTO = result;
                // let defaultConfiguration: DefaultConfiguration = this.fetchConfigurationDetails(configurationDTO);
                //console.log("defaultConfiguration : "+JSON.stringify(defaultConfiguration));
            },
            err =>{
                console.error("Error : "+err);
            } ,
            () => {
                // console.log('getData completed');
            }
        );
    }
    /**
     * Returns active tenant from the list
     * @param configurationDetailsDTO
     * @returns {DefaultConfiguration}
     */
    fetchConfigurationDetails( configurationDetailsDTO: ConfigurationDetailsDTO ): DefaultConfiguration {
        //console.log('...  fetching configuration details');
        let defaultConfiguration: DefaultConfiguration = new DefaultConfiguration();
        if ( !this.clientUtils.isNullOrEmpty( configurationDetailsDTO ) ) {
            let activeTenantDetails: ActiveTenantDetails = configurationDetailsDTO.activeTenantDetails;
            let tenantList: Array<TenantDetailsDTO> = configurationDetailsDTO.tenantList;
            defaultConfiguration.version = configurationDetailsDTO.version;
            if ( !this.clientUtils.isNullOrEmpty( tenantList ) ) {
                let isTenantFound: boolean = false;
                let isEnvironmentFound: boolean = false;
                let isApplicationFound: boolean = false;
                //let isServerFound: boolean = false;
                tenantList.forEach( ( tenantDetailsDTO: TenantDetailsDTO ) => {
                    if ( !isTenantFound && tenantDetailsDTO.tenantCode === activeTenantDetails.tenantCode ) {
                        isTenantFound = true;
                        defaultConfiguration.tenantCode = tenantDetailsDTO.tenantCode;
                        defaultConfiguration.tenantName = tenantDetailsDTO.tenantName;
                        defaultConfiguration.defaultAppId = tenantDetailsDTO.defaultAppId;
                        defaultConfiguration.defaultLocationLatitude = tenantDetailsDTO.defaultLocationLatitude;
                        defaultConfiguration.defaultLocationLongitude = tenantDetailsDTO.defaultLocationLongitude;
                        defaultConfiguration.rateTheAppIOSURL = tenantDetailsDTO.rateTheAppIOSURL;
                        defaultConfiguration.rateTheAppAndroidURL = tenantDetailsDTO.rateTheAppAndroidURL;
                        defaultConfiguration.bookingAppIOSURL = tenantDetailsDTO.bookingAppIOSURL;
                        defaultConfiguration.bookingAppAndroidURL = tenantDetailsDTO.bookingAppAndroidURL;
                        defaultConfiguration.googleAnalyticsTrackID = tenantDetailsDTO.googleAnalyticsTrackID;
                        defaultConfiguration.version = tenantDetailsDTO.version;
                        let environmentList: Array<EnvironmentDetailsDTO> = tenantDetailsDTO.environmentList;
                        if ( !this.clientUtils.isNullOrEmpty( environmentList ) ) {
                            //console.log('-- environmentList = \n'+ JSON.stringify(environmentList));
                            environmentList.forEach
                            ( ( environmentDetailsDTO: EnvironmentDetailsDTO ) => {
                                if ( !isEnvironmentFound
                                    && environmentDetailsDTO.environmentType === activeTenantDetails.environmentType ) {
                                    isEnvironmentFound = true;
                                    defaultConfiguration.environmentType = environmentDetailsDTO.environmentType;
                                    defaultConfiguration.analyticsTrackEnabled = environmentDetailsDTO.analyticsTrackEnabled;
                                    defaultConfiguration.debugMode = environmentDetailsDTO.debugMode;
                                    defaultConfiguration.webApiKey = environmentDetailsDTO.webApiKey;
                                    let applicationList: Array<ApplicationDetailsDTO> = environmentDetailsDTO.applicationList;
                                    applicationList.forEach( ( applicationDetailsDTO: ApplicationDetailsDTO ) => {
                                        if ( !isApplicationFound && applicationDetailsDTO.applicationName === activeTenantDetails.applicationName ) {
                                            isApplicationFound = true;
                                            defaultConfiguration.appDisplayName = applicationDetailsDTO.applicationDescription;
                                            let serverList: Array<ServerDetailsDTO> = applicationDetailsDTO.serverList;
                                            //console.log( 'serverList = \n' + JSON.stringify( serverList ) );
                                            if ( !this.clientUtils.isNullOrEmpty( serverList ) ) {
                                                serverList.forEach( ( serverDetailsDTO: ServerDetailsDTO ) => {
                                                    if ( 'Running' === serverDetailsDTO.status ) {
                                                        defaultConfiguration.hostURL = serverDetailsDTO.serverURL;
                                                    }
                                                } );
                                            }
                                        }

                                    } );
                                }

                            } );
                        }
                    }
                } );
            }
        }

        if(!this.clientUtils.isNullOrEmpty(defaultConfiguration)) {
            //console.log('...defaultConfiguration =\n' + JSON.stringify(defaultConfiguration));
            let sessionRootInfo: SessionRootInfo = this.sessionUtils.getRootContext();
            if(this.clientUtils.isNullOrEmpty(sessionRootInfo)){
                sessionRootInfo = new SessionRootInfo();
            }
            sessionRootInfo.defaultConfiguration = defaultConfiguration;
            this.sessionUtils.saveRootContext(sessionRootInfo);
        }
        return defaultConfiguration;
    }

}