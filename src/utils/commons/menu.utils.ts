/**
 * Created by sandip on 1/5/17.
 */
import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {Events} from 'ionic-angular';
import {SessionUtils} from './session.utils';
import {GlobalizationUtils} from './globalization.utils';
import {DataAccessService} from '../../services/commons/data.access.service';
import {ServiceContext} from '../../services/commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {AppConstants} from '../../constants/app.constants';
import {
    AppMenuResponse,
    MessageInfo,
    AppMenu,
    TermsCondtionsInfo,
    TermsResponse,
    SystemQueryInfo,
    ServiceErrorInfo, SystemQueryResponse
} from '../../dto/common.dto';


@Injectable()
export class MenuUtils {

    public FACILITY_NAME_LOGOUT = 'MELOGOUT';
    public FACILITY_NAME_RATE_APP = 'MERTA';
    public FACILITY_NAME_AIR_MEXICO_MOBILE = 'MEAMM';
    public FACILITY_NAME_TERMS_CONDITIONS = 'METECN';
    public FACILITY_NAME_SETTINGS = 'MEAPS';
    public FACILITY_NAME_CHAT = 'MECHAT';
    public FACILITY_NAME_CONTACTS = 'MECNT';
    public FACILITY_NAME_GUIDE = 'MEGUIDE';

    constructor(private events: Events,
                private sessionUtils: SessionUtils,
                private globalizationUtils: GlobalizationUtils,
                private dataAccessService: DataAccessService,
                private serviceConstants: ServiceConstants,
                private appConstants: AppConstants) {

    }

    getMenuContext(): Array<AppMenu> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.appMenus;
        if (!contextObj) {
            contextObj = new Array<AppMenu>();
        }
        return contextObj;
    }

    saveMenuContext(contextObj: Array<AppMenu>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.appMenus = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaMenuContext(): void {
        let contextObj = new Array<AppMenu>();
        this.saveMenuContext(contextObj);
    }

    getTermsConditionsContext(): Array<TermsCondtionsInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.appTerms;
        if (!contextObj) {
            contextObj = new Array<TermsCondtionsInfo>();
        }
        return contextObj;
    }

    saveTermsConditionsContext(contextObj: Array<TermsCondtionsInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.appTerms = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaTermsConditionsContext(): void {
        let contextObj = new Array<TermsCondtionsInfo>();
        this.saveTermsConditionsContext(contextObj);
    }

    fetchMenuData(successCallback: any, errorCallback: any): void {

        let requestData = new AppMenu();
        requestData.facilityType = 'APP_MENU';

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_COMMON,
            this.serviceConstants.COMMON_SERVICE_NAME_APP_MENU,
            requestData);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: AppMenuResponse = result.json();
                if (!response) {
                    response = new AppMenuResponse();
                    response.data = [];
                }
                this.saveMenuContext(response.data);
                this.events.publish(this.appConstants.EVENT_MENU_INFO_CHANGED);
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

    getTermsAndCondition(successCallback: any, errorCallback: any) {

        let requestData = new MessageInfo();
        let langCode = this.globalizationUtils.getAppLanguage();
        if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_EN_US) {
            requestData.code = this.serviceConstants.TERMS_N_COND_EN;
        } else if (langCode === this.globalizationUtils.DEVICE_LANGUAGE_ES_ES) {
            requestData.code = this.serviceConstants.TERMS_N_COND_ES;
        }

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_COMMON,
            this.serviceConstants.COMMON_SERVICE_NAME_MESSAGE_CONTENT,
            requestData);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: TermsResponse = result.json();
                if (!response) {
                    response = new TermsResponse();
                    response.data = [];
                }
                this.saveTermsConditionsContext(response.data);
                this.events.publish(this.appConstants.EVENT_APP_TERMS_CHANGED);
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

    getChatContent(successCallback: any, errorCallback: any) {

        if (this.sessionUtils.isUserLoggedIn()) {

            let memberInfo = this.sessionUtils.getMemberInfo();
            let requestData = new SystemQueryInfo();
            requestData.activeCardNumber = memberInfo.activeCardNo;
            requestData.queryCode = this.serviceConstants.SYSTEM_QUERY_CP_CHAT;

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_COMMON,
                this.serviceConstants.COMMON_SERVICE_NAME_SYSTEM_QUERY,
                requestData);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: SystemQueryResponse = result.json();
                    if (!response) {
                        response = new SystemQueryResponse();
                        response.data = [];
                    }
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
        else {
            if (errorCallback) {
                errorCallback(null);
            }
        }
    }

    fetchMenusIfRequired(): Promise<boolean> {
        return new Promise(resolve => {
            let appMenus = this.getMenuContext();
            if (appMenus && (appMenus.length > 0)) {
                resolve(true);
            }
            else {
                this.fetchMenuData(
                    (result: AppMenuResponse) => {
                        resolve(true);
                    }, (error: ServiceErrorInfo) => {
                        resolve(false);
                    });
            }
        });
    }
}
