/**
 * Created by C00121 on 27/11/2016.
 */
import {Injectable} from '@angular/core';
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Observable} from '../../../node_modules/rxjs/Rx.d'
import {Response} from "@angular/http";

@Injectable()
export class ProfileService{

    private SERVICE_URL_LOGIN = '/api/Account/Login';
    private SERVICE_URL_GET_PROFILE = '/api/Account/Profile';
    private SERVICE_URL_CREATE_PROFILE = '/api/Member/MemberEnrollment';
    private SERVICE_URL_CHANGE_PASSWORD = '/api/Account/ChangePassword';
    private SERVICE_URL_MEMBER_SECURITY_QUESTION = '/api/Member/SecurityQuestion';
    private SERVICE_URL_VERIFY_SECURITY_QUESTION = '/api/Member/VerifySecurityQuestion';
    private SERVICE_URL_MEMBER_ADDRESS = '/api/Member/Address';
    private SERVICE_URL_TRANSACTION = '/api/Account/Transactions';
    private SERVICE_URL_PASSWORD_HINTS = '/api/Account/PasswordHintsAndCharacters';
    private SERVICE_URL_TNC_CONSENT = '/api/Account/Profile/Consents'

    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {
    }


    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName) {
            if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_LOGIN) {
                return this.doLogin(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_GET_PROFILE) {
                return this.getProfileData(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_CREATE_PROFILE) {
                return this.createProfile(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_EDIT_PROFILE) {
                return this.editProfile(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_CHANGE_PASSWORD) {
                return this.changePassword(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_GET_MEMBER_SECURITY_QUESTION) {
                return this.getMemberSecurityQuestion(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_VERIFY_MEMBER_SECURITY_QUESTION) {
                return this.verifyMemberSecurityQuestion(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_CREATE_MEMBER_SECURITY_QUESTION) {
                return this.createMemberSecurityQuestion(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_EDIT_MEMBER_SECURITY_QUESTION) {
                return this.editMemberSecurityQuestion(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_GET_MEMBER_ADDRESS) {
                return this.getMemberAddress(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_TRANSACTION) {
                return this.getRecentTransaction(serviceContext.requestObject);
            } else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_PASSWORD_HINTS) {
                return this.getPasswordHints(serviceContext.requestObject);
            }else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_GET_TNC_CONSENT) {
                return this.getTermsnConditionConsent(serviceContext.requestObject);
            }else if (serviceName === this.serviceConstants.ACCOUNT_SERVICE_NAME_POST_TNC_CONSENT) {
                return this.postTermsnConditionConsent(serviceContext.requestObject);
            }
        }
    }

    doLogin(reqData: any):Observable<Response>{
        return this.httpService.postData(this.SERVICE_URL_LOGIN, reqData);
    }

    getProfileData(reqData: any): Observable<Response> {
        return this.httpService.getData(this.SERVICE_URL_GET_PROFILE, reqData);
    }

    createProfile(reqData: any): Observable<Response> {
        return this.httpService.postData(this.SERVICE_URL_CREATE_PROFILE, reqData);
    }

    editProfile(reqData: any): Observable<Response> {
        return this.httpService.putData(this.SERVICE_URL_CREATE_PROFILE, reqData);
    }

    changePassword(reqData: any): Observable<Response> {
        return this.httpService.postData(this.SERVICE_URL_CHANGE_PASSWORD, reqData);
    }

    getMemberSecurityQuestion(reqData: any): Observable<Response> {
        return this.httpService.getData(this.SERVICE_URL_MEMBER_SECURITY_QUESTION, reqData);
    }

    verifyMemberSecurityQuestion(reqData: any): Observable<Response> {
        return this.httpService.getData(this.SERVICE_URL_VERIFY_SECURITY_QUESTION, reqData);
    }

    createMemberSecurityQuestion(reqData: any): Observable<Response> {
        return this.httpService.postData(this.SERVICE_URL_MEMBER_SECURITY_QUESTION, reqData);
    }

    editMemberSecurityQuestion(reqData: any): Observable<Response> {
        return this.httpService.putData(this.SERVICE_URL_MEMBER_SECURITY_QUESTION, reqData);
    }

    getMemberAddress(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_MEMBER_ADDRESS, reqData);
    }

    getRecentTransaction(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_TRANSACTION, reqData);
    }

    getPasswordHints(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_PASSWORD_HINTS, reqData);
    }
    getTermsnConditionConsent(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_TNC_CONSENT, reqData);
    }
    postTermsnConditionConsent(reqData: any):Observable<Response>{
        return this.httpService.postData(this.SERVICE_URL_TNC_CONSENT, reqData);
    }
}