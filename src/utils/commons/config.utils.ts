/**
 * Created by C00121 on 26/12/2016.
 */
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Events } from 'ionic-angular';
import { SessionUtils } from './session.utils';
import { ConfigInfo, ConfigResponse, ServiceErrorInfo, GeoCoordinate } from '../../dto/common.dto';
import { DataAccessService } from '../../services/commons/data.access.service';
import { ServiceContext } from '../../services/commons/context.service';
import { ServiceConstants } from '../../constants/service.constants';
import { AppConstants } from '../../constants/app.constants';
import { GlobalizationUtils } from './globalization.utils';
import { ClientUtils } from './client.utils';
import { NetworkService } from "../../services/commons/network.service";
import { ForceUpdateDTO } from '../../dto/force.update.dto';
import { DefaultConfiguration } from '../../dto/configuration.dto';

@Injectable()
export class ConfigUtils {

    constructor(private events: Events,
        private sessionUtils: SessionUtils,
        private globalizationUtils: GlobalizationUtils,
        private clientUtils: ClientUtils,
        private dataAccessService: DataAccessService,
        private serviceConstants: ServiceConstants,
        private appConstants: AppConstants,
        private networkService: NetworkService) {

    }

    getConfigContext(): Array<ConfigInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.configs;
        if (!contextObj) {
            contextObj = new Array<ConfigInfo>();
        }
        return contextObj;
    }

    saveConfigContext(contextObj: Array<ConfigInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.configs = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearConfigContext(): void {
        let contextObj = new Array<ConfigInfo>();
        this.saveConfigContext(contextObj);
    }

    fetchAppConfig(successCallback: any, errorCallback: any): void {

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_COMMON,
            this.serviceConstants.COMMON_SERVICE_NAME_APP_CONFIG,
            null);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: ConfigResponse = result.json();
                if (!response) {
                    response = new ConfigResponse();
                    response.data = [];
                }
                console.log('fetchAppConfig : ' + JSON.stringify(response.data))
                this.saveConfigContext(response.data);
                this.events.publish(this.appConstants.EVENT_CONFIG_DATA_CHANGED);
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

    fetchAppConfigIfRequired(): Promise<boolean> {
        return new Promise(resolve => {
            let configs = this.getConfigContext();
            if (this.networkService.isOnline()) {
                this.fetchAppConfig(
                    (result: ConfigResponse) => {
                        resolve(true);
                    }, (error: ServiceErrorInfo) => {
                        resolve(false);
                    });
            } else {
                if (configs && (configs.length > 0)) {
                    resolve(true);
                } else {
                    this.fetchAppConfig(
                        (result: ConfigResponse) => {
                            resolve(true);
                        }, (error: ServiceErrorInfo) => {
                            resolve(false);
                        });
                }
            }

        });
    }

    getNumOfRecordsForKey(key: string): number {

        let value = this.appConstants.DEFAULT_NUM_OF_RECORDS;
        let configData = this.getConfigContext();

        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === key) {
                    value = Number(configData[count].value);
                    break;
                }
            }
        }
        return value;
    }
    getTncConsentObj(): any {
            let configData = this.getConfigContext();
        let consentObj = {
            "tncCode": "",
            "lastTncChanged": "",
            "tncFlag": "",
            "tncMsgEN": "",
            "tncMsgES": "",
        }
        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === 'TNC_CODE') {
                    consentObj.tncCode = configData[count].value;
                } else if (configData[count].code === 'TNC_DATE') {
                    consentObj.lastTncChanged = configData[count].value;
                } else if (configData[count].code === 'TNC_FLAG') {
                    consentObj.tncFlag = configData[count].value;
                } else if (configData[count].code === 'TNC_CONSENT_MSG_EN') {
                    consentObj.tncMsgEN = configData[count].value;
                } else if (configData[count].code === 'TNC_CONSENT_MSG_ES') {
                    consentObj.tncMsgES = configData[count].value;
                }
            }
        }
        return consentObj;
    }
    getForceUpdateObj() {
        let forceUpdateObj = new ForceUpdateDTO()
        let configData = this.getConfigContext();
        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === this.serviceConstants.FORCE_UPDATE) {
                    forceUpdateObj.forceUpdate = configData[count].value;
                } else if (configData[count].code === this.serviceConstants.ANDROID_VERSION) {
                    forceUpdateObj.androidVersion = configData[count].value;
                } else if (configData[count].code === this.serviceConstants.IOS_VERSION) {
                    forceUpdateObj.iOSVersion = configData[count].value;
                } else if (configData[count].code === this.serviceConstants.UPDATE_MSG_EN) {
                    forceUpdateObj.updateMsgEN = configData[count].value;
                } else if (configData[count].code === this.serviceConstants.UPDATE_MSG_ES) {
                    forceUpdateObj.updateMsgES = configData[count].value;
                }
            }
        }
        return forceUpdateObj;
    }
    getPaginationLimit(): number {
        let value = this.appConstants.DEFAULT_PAGINATION_LIMIT;
        let configData = this.getConfigContext();

        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === this.serviceConstants.PAGINATION_LIMIT) {
                    value = Number(configData[count].value);
                    break;
                }
            }
        }
        return value;
    }

    getRangeForRegionTracking(): number {

        let value = this.appConstants.DEFAULT_RANGE_FOR_REGION_TRACK;
        let configData = this.getConfigContext();

        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === this.serviceConstants.RANGE_FOR_REGION_TRACKING) {
                    value = Number(configData[count].value);
                    break;
                }
            }
        }

        return value;
    }

    getBulkDataSyncInterval(): number {

        let value = this.appConstants.DEFAULT_BULK_DATA_SYNC_INTERVAL;
        let configData = this.getConfigContext();

        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === this.serviceConstants.BULK_DATA_SYNC_INTERVAL) {
                    value = Number(configData[count].value);
                    break;
                }
            }
        }

        return value;
    }

    getUserLocationCoordinate(): GeoCoordinate {

        let coord: GeoCoordinate = new GeoCoordinate();
        coord.latitude = this.clientUtils.defaultLatitude();
        coord.longitude = this.clientUtils.defaultLongitude();

        let configData = this.getConfigContext();
        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === this.serviceConstants.USER_LOCATION_LATITUDE) {
                    coord.latitude = Number(configData[count].value);
                }
                else if (configData[count].code === this.serviceConstants.USER_LOCATION_LONGITUDE) {
                    coord.longitude = Number(configData[count].value);
                }
            }
        }

        return coord;
    }

    getGuestUserText(): string {

        let value = '';
        let configKey = null;

        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            configKey = this.serviceConstants.GUEST_USER_TEXT_EN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            configKey = this.serviceConstants.GUEST_USER_TEXT_ES;
        }

        let configData = this.getConfigContext();
        if (configData && configKey) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === configKey) {
                    value = configData[count].value;
                    break;
                }
            }
        }
        return value;
    }

    getEnrollmentLink(): string {
        let value = '';
        let configKey = null;

        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            configKey = this.serviceConstants.ENROLMENT_URL_EN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            configKey = this.serviceConstants.ENROLMENT_URL_ES;
        }

        let configData = this.getConfigContext();
        if (configData && configKey) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === configKey) {
                    value = configData[count].value;
                    break;
                }
            }
        }
        return value;
    }

    getAppBackgroundImageURL(): string {
        let value = '';

        let configData = this.getConfigContext();
        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === this.serviceConstants.APP_BACKGROUND_IMAGE_URL) {
                    value = configData[count].value;
                    break;
                }
            }
        }
        return value;
    }

    getLoginCardImageURL(): string {
        let value = '';

        let configData = this.getConfigContext();
        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === this.serviceConstants.LOGIN_CARD_IMAGE_URL) {
                    value = configData[count].value;
                    break;
                }
            }
        }
        return value;
    }

    getForgotPasswordURL(): string {
        let value = null;
        let configKey = null;

        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            configKey = this.serviceConstants.FORGOT_PASSWORD_URL_EN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            configKey = this.serviceConstants.FORGOT_PASSWORD_URL_ES;
        }

        let configData = this.getConfigContext();
        if (configData && configKey) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === configKey) {
                    value = configData[count].value;
                    break;
                }
            }
        }
        return value;
    }

    getRegistrationURL(): string {
        let value = null;
        let configKey = null;

        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            configKey = this.serviceConstants.REGISTRATION_URL_EN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            configKey = this.serviceConstants.REGISTRATION_URL_ES;
        }

        let configData = this.getConfigContext();
        if (configData && configKey) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === configKey) {
                    value = configData[count].value;
                    break;
                }
            }
        }
        return value;
    }

    getTermsConditionsURL(): string {
        let value = null;
        let configKey = null;

        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            configKey = this.serviceConstants.TERMS_CONDITIONS_URL_EN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            configKey = this.serviceConstants.TERMS_CONDITIONS_URL_ES;
        }

        let configData = this.getConfigContext();
        if (configData && configKey) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === configKey) {
                    value = configData[count].value;
                    break;
                }
            }
        }
        return value;
    }
    getStoreUrl(platform): string {
        let value =null;
        let defaultConfiguraiton: DefaultConfiguration =  this.sessionUtils.getRootContext().defaultConfiguration;
        if (platform=='IOS'||platform=='iOS') {
            value = defaultConfiguraiton.rateTheAppIOSURL;
        }else if(platform=='"ANDROID"'||platform=='ANDROID'){
            value = defaultConfiguraiton.rateTheAppAndroidURL;
        }
        return value;
    }

    getPrivacyPolicyURL(): string {
        let value = null;
        let configKey = null;

        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            configKey = this.serviceConstants.PRIVACY_POLICY_URL_EN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            configKey = this.serviceConstants.PRIVACY_POLICY_URL_ES;
        }

        let configData = this.getConfigContext();
        if (configData && configKey) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === configKey) {
                    value = configData[count].value;
                    break;
                }
            }
        }
        return value;
    }

    getOfflineMessage(): string {
        let value = '';
        let configKey = null;

        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            configKey = this.serviceConstants.OFFLINE_MSG_EN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            configKey = this.serviceConstants.OFFLINE_MSG_ES;
        }

        let configData = this.getConfigContext();
        if (configData && configKey) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === configKey) {
                    value = configData[count].value;
                    break;
                }
            }
        }
        return value;
    }

    getContactsLink(): string {
        let value = '';
        let configKey = null;

        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            configKey = this.serviceConstants.CONTACT_URL_EN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            configKey = this.serviceConstants.CONTACT_URL_ES;
        }

        let configData = this.getConfigContext();
        if (configData && configKey) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === configKey) {
                    value = configData[count].value;
                    break;
                }
            }
        }
        return value;
    }

    getLanguageCodes(): Array<string> {

        let value = '';
        let configData = this.getConfigContext();

        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === this.serviceConstants.LANGUAGE_CODES) {
                    value = configData[count].value;
                    break;
                }
            }
        }

        let codes: Array<string> = [];
        if (!this.clientUtils.isNullOrEmpty(value)) {
            codes = value.split(',');
        }

        return codes;
    }

    getTiersToHideExpiryDate(): Array<string> {

        let value = '';
        let configData = this.getConfigContext();

        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === this.serviceConstants.VC_HIDE_EXPIRY_DATE) {
                    value = configData[count].value;
                    break;
                }
            }
        }

        let codes: Array<string> = [];
        if (!this.clientUtils.isNullOrEmpty(value)) {
            codes = value.split(',');
        }

        return codes;
    }
    getFlagToHideExpiryDate(): boolean {
        let value: boolean = false;
        let configData = this.getConfigContext();
        if (configData) {
            for (let count = 0; count < configData.length; count++) {
                if (configData[count].code === this.serviceConstants.SHOW_VC_EXPIRY) {
                    value = configData[count].value == 'N' ? true : false;
                    break;
                }
            }
        }
        return value;
    }
}
