/**
 * Created by sandip on 1/16/17.
 */
import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {Events} from 'ionic-angular';
import {ServiceErrorInfo} from '../../dto/common.dto';
import {DataAccessService} from '../../services/commons/data.access.service';
import {ServiceContext} from '../../services/commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {AppConstants} from '../../constants/app.constants';
import {SessionUtils} from './session.utils';
import {ClientUtils} from './client.utils';
import {
    MemberInfo, LoginRequest, LoginResponse, EnrollResponse, MemberAddressInfo,
    PasswordHintResponse
} from '../../dto/account.dto';
import {SessionRootInfo} from '../../dto/session.dto';


@Injectable()
export class UserUtils {

    private MIN_NUM_OF_CHAR_USERNAME = 11;

    constructor(private dataAccessService: DataAccessService,
                private serviceConstants: ServiceConstants,
                private appConstants: AppConstants,
                private sessionUtils: SessionUtils,
                private clientUtils: ClientUtils,
                private events: Events) {

    }

    saveUserInfo(contextObj: MemberInfo): void {
        let rootContext: SessionRootInfo = this.sessionUtils.getRootContext();
        rootContext.memberInfo = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearUserInfo(): void {
        let contextObj = new MemberInfo();
        this.saveUserInfo(contextObj);
    }

    isUserLoggedIn(): boolean{
        return (this.sessionUtils.getAccessToken() != null);
    }

    isFacebookUser(): boolean{
        let userProfile = this.sessionUtils.getMemberInfo();
        return (userProfile && !this.clientUtils.isNullOrEmpty(userProfile.fbMemberId));
    }

    userProfilePic(): string {
        let profilePic: string = null;
        let userProfile = this.sessionUtils.getMemberInfo();
        if (userProfile && !this.clientUtils.isNullOrEmpty(userProfile.memberPicture)) {
            profilePic = userProfile.memberPicture;
        }
        return profilePic;
    }

    doLogin(username: string, password: string, successCallback: any, errorCallback: any) {

        let loginDataRequest = new MemberInfo();
        loginDataRequest.membershipCardNumber = username;
        loginDataRequest.password = password;
        let loginRequest = new LoginRequest();
        loginRequest.data = loginDataRequest;

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            this.serviceConstants.ACCOUNT_SERVICE_NAME_LOGIN,
            loginRequest);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: LoginResponse = result.json();
                if (!response) {
                    response = new LoginResponse();
                    response.data = [];
                }
                let loginDataResponse = response.data[0];
                let memberInfo = loginDataResponse.member;
                memberInfo.milesExpiryDiff = this.calculateMilesExpiryDateInDays(memberInfo.milesExpiryDate);
                this.saveUserInfo(memberInfo);
                this.events.publish(this.appConstants.EVENT_LOGIN_STATUS_CHANGED);
                if (successCallback) {
                    successCallback(response);
                }
            },(error: Response) => {
                if (errorCallback) {
                    let errorInfo: ServiceErrorInfo = error.json();
                    errorCallback(errorInfo);
                }
            });
    }

    loginUsingFacebook(fbToken: string, successCallback: any, errorCallback: any) {

        let loginDataRequest = new MemberInfo();
        loginDataRequest.facebookAccessToken = fbToken;
        let loginRequest = new LoginRequest();
        loginRequest.data = loginDataRequest;

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            this.serviceConstants.ACCOUNT_SERVICE_NAME_LOGIN,
            loginRequest);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: LoginResponse = result.json();
                if (!response) {
                    response = new LoginResponse();
                    response.data = [];
                }
                let loginDataResponse = response.data[0];
                let memberInfo = loginDataResponse.member;
                memberInfo.milesExpiryDiff = this.calculateMilesExpiryDateInDays(memberInfo.milesExpiryDate);
                this.saveUserInfo(memberInfo);
                this.events.publish(this.appConstants.EVENT_LOGIN_STATUS_CHANGED);
                if (successCallback) {
                    successCallback(response);
                }
            },(error: Response) => {
                if (errorCallback) {
                    let errorInfo: ServiceErrorInfo = error.json();
                    errorCallback(errorInfo);
                }
            });
    }

    fetchProfile(successCallback: any, errorCallback: any) {

        if (this.sessionUtils.isUserLoggedIn()) {

            let memberInfo = this.sessionUtils.getMemberInfo();
            let requestData = new MemberInfo();
            requestData.membershipCardNumber = memberInfo.username;

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
                this.serviceConstants.ACCOUNT_SERVICE_NAME_GET_PROFILE,
                requestData);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: LoginResponse = result.json();
                    if (!response) {
                        response = new LoginResponse();
                        response.data = [];
                    }
                    let loginDataResponse = response.data[0];
                    let memberInfo = loginDataResponse.member;
                    let memInfo = this.sessionUtils.getMemberInfo();
                    memberInfo.accessToken = memInfo.accessToken;
                    memberInfo.milesExpiryDiff = this.calculateMilesExpiryDateInDays(memberInfo.milesExpiryDate);
                    this.saveUserInfo(memberInfo);
                    this.events.publish(this.appConstants.EVENT_USER_PROFILE_CHANGED);
                    if (successCallback) {
                        successCallback(response);
                    }
                }, (error: Response) => {
                    let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                    if (error) {
                        errorInfo = error.json();
                        errorInfo.code = error.status;
                    }
                    if (errorCallback) {
                        errorCallback(errorInfo);
                    }
                    if (errorInfo.code == 401) {
                        this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                    }
                });
        }
    }

    saveProfile(profileInfo: MemberInfo, shouldEdit: boolean, successCallback: any, errorCallback: any) {

        let serviceName: string = (shouldEdit == true) ?
            this.serviceConstants.ACCOUNT_SERVICE_NAME_EDIT_PROFILE :
            this.serviceConstants.ACCOUNT_SERVICE_NAME_CREATE_PROFILE;
        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            serviceName,
            profileInfo);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: EnrollResponse = result.json();
                if (!response) {
                    response = new EnrollResponse();
                    response.data = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }

    changePassword(profileInfo: MemberInfo, successCallback: any, errorCallback: any) {

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            this.serviceConstants.ACCOUNT_SERVICE_NAME_CHANGE_PASSWORD,
            profileInfo);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: EnrollResponse = result.json();
                if (!response) {
                    response = new EnrollResponse();
                    response.data = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }

    getMemberAddress(profileInfo: MemberInfo, successCallback: any, errorCallback: any) {

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            this.serviceConstants.ACCOUNT_SERVICE_NAME_GET_MEMBER_ADDRESS,
            profileInfo);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: Array<MemberAddressInfo> = result.json();
                if (!response) {
                    response = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }

    getMemberSecurityQuestion(profileInfo: MemberInfo, successCallback: any, errorCallback: any) {

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            this.serviceConstants.ACCOUNT_SERVICE_NAME_GET_MEMBER_SECURITY_QUESTION,
            profileInfo);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: EnrollResponse = result.json();
                if (!response) {
                    response = new EnrollResponse();
                    response.data = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }

    saveMemberSecurityQuestion(profileInfo: MemberInfo, shouldEdit: boolean, successCallback: any, errorCallback: any) {

        let serviceName: string = (shouldEdit == true) ?
            this.serviceConstants.ACCOUNT_SERVICE_NAME_EDIT_MEMBER_SECURITY_QUESTION :
            this.serviceConstants.ACCOUNT_SERVICE_NAME_CREATE_MEMBER_SECURITY_QUESTION;
        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            serviceName,
            profileInfo);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: any = result.json();
                if (!response) {
                    response = {message:''};
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }

    verifyMemberSecurityQuestion(profileInfo: MemberInfo, successCallback: any, errorCallback: any) {

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            this.serviceConstants.ACCOUNT_SERVICE_NAME_VERIFY_MEMBER_SECURITY_QUESTION,
            profileInfo);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: any = result.json();
                if (!response) {
                    response = {message:''};
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }

    getPasswordHints(successCallback: any, errorCallback: any) {

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            this.serviceConstants.ACCOUNT_SERVICE_NAME_PASSWORD_HINTS,
            null);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: PasswordHintResponse = result.json();
                if (!response) {
                    response = new PasswordHintResponse();
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }

    validateUsername(username: string): string {
        let textValue: string = username;
        if (textValue && (textValue.length < this.MIN_NUM_OF_CHAR_USERNAME)) {
            let diffValue = this.MIN_NUM_OF_CHAR_USERNAME - textValue.length;
            for (let i = 0; i < diffValue; i++) {
                textValue = '0' + textValue;
            }
        }
        return textValue;
    }

    calculateMilesExpiryDateInDays(expDateString: string): number {
        let diffHours: number = this.clientUtils.getDateTimeDiff(expDateString) / 3600;
        let diffDays = 0;
        if (diffHours >= 24) {
            diffDays = Math.floor(diffHours / 24);
        }
        return diffDays;
    }
    getConsentDate(reqObj: any, successCallback: any, errorCallback: any){
        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            this.serviceConstants.ACCOUNT_SERVICE_NAME_GET_TNC_CONSENT,
            reqObj);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: any = result.json();
                if (!response) {
                    response = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }
    postConsentDate(reqObj: any, successCallback: any, errorCallback: any){
        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
            this.serviceConstants.ACCOUNT_SERVICE_NAME_POST_TNC_CONSENT,
            reqObj);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: any = result.json();
                if (!response) {
                    response = [];
                }
                if (successCallback) {
                    successCallback(response);
                }
            }, (error: Response) => {
                let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                if (error) {
                    errorInfo = error.json();
                    errorInfo.code = error.status;
                }
                if (errorCallback) {
                    errorCallback(errorInfo);
                }
                if (errorInfo.code == 401) {
                    this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                }
            });
    }
}
