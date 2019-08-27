/**
 * Created by C00121 on 09/01/2017.
 */
import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {Events} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {GoalRequest,GoalInfo,GoalResponse} from '../../dto/goal.dto';
import {ServiceConstants} from '../../constants/service.constants';
import {AppConstants} from '../../constants/app.constants';
import {ServiceContext} from '../../services/commons/context.service';
import {DataAccessService} from '../../services/commons/data.access.service';
import {SessionUtils} from '../../utils/commons/session.utils';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {OfferUtils} from '../../utils/commons/offer.utils';
import {PageInfo,ServiceErrorInfo} from '../../dto/common.dto';



@Injectable()
export class TargetUtils {

    constructor(private events: Events,
                private serviceConstants: ServiceConstants,
                private appConstants: AppConstants,
                private translate: TranslateService,
                private dataAccessService: DataAccessService,
                private sessionUtils: SessionUtils,
                private configUtils: ConfigUtils,
                private offerUtils: OfferUtils) {

    }

    getTargetContext(): Array<GoalInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.targets;
        if (!contextObj) {
            contextObj = new Array<GoalInfo>();
        }
        return contextObj;
    }

    saveTargetContext(contextObj: Array<GoalInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.targets = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearTargetContext(): void {
        let contextObj = new Array<GoalInfo>();
        this.saveTargetContext(contextObj);
    }

    fetchMyTargets(successCallback: any, errorCallback: any) {

        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo = this.sessionUtils.getMemberInfo();
            let requestData = new GoalInfo();
            requestData.active = 'Y';
            requestData.memberUid = memberInfo.memUID;
            requestData.start = 1;
            requestData.end = this.configUtils.getNumOfRecordsForKey(
                this.serviceConstants.NO_OF_TARGETS);


            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_GOAL,
                this.serviceConstants.GOAL_SERVICE_NAME_MY_TARGETS,
                requestData);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: GoalResponse = result.json();
                    if (!response) {
                        response = new GoalResponse();
                        response.data = [];
                    }
                    this.saveTargetContext(response.data);
                    this.events.publish(this.appConstants.EVENT_TARGET_CHANGED);
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
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = this.translate.instant('YOU_ARE_NOT_LOGGED_IN');
                errorCallback(error);
            }
        }
    }

    fetchAllTargets(start: number, end: number, successCallback: any, errorCallback: any) {

        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo = this.sessionUtils.getMemberInfo();
            let requestData = new GoalInfo();
            requestData.active = 'Y';
            requestData.memberUid = memberInfo.memUID;
            requestData.start = start;
            requestData.end = end;

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_GOAL,
                this.serviceConstants.GOAL_SERVICE_NAME_MY_TARGETS,
                requestData);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: GoalResponse = result.json();
                    if (!response) {
                        response = new GoalResponse();
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
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = this.translate.instant('YOU_ARE_NOT_LOGGED_IN');
                errorCallback(error);
            }
        }
    }

    setOfferAsTarget(offerId: number, successCallback: any, errorCallback: any) {

        let memberInfo = this.sessionUtils.getMemberInfo();
        let offerBaseGoalInfo = new GoalInfo();
        offerBaseGoalInfo.goalOfferId = offerId;
        offerBaseGoalInfo.memberUid = memberInfo.memUID;
        offerBaseGoalInfo.active = 'Y';

        let pageInfo: PageInfo = new PageInfo();
        let offerBasedGoalRequest = new GoalRequest();
        offerBasedGoalRequest.data = offerBaseGoalInfo;
        offerBasedGoalRequest.pageInfo = pageInfo;

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_GOAL,
            this.serviceConstants.GOAL_SERVICE_SET_TARGET,
            offerBasedGoalRequest);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: GoalResponse = result.json();
                if (!response) {
                    response = new GoalResponse();
                    response.data = [];
                }
                this.fetchMyTargets(null, null);
                this.offerUtils.fetchOffersNearBy(null, null);
                this.offerUtils.fetchRecommendedOffers(null, null);
                this.offerUtils.fetchFavoriteOffers(null, null);
                if (successCallback) {
                    successCallback(response);
                }
            },(error: Response) => {
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

    setPersonalTarget(goalInfo: GoalInfo, successCallback: any, errorCallback: any) {

        let pageInfo: PageInfo = new PageInfo();
        let personalGoalRequest = new GoalRequest();
        personalGoalRequest.data = goalInfo;
        personalGoalRequest.pageInfo = pageInfo;

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_GOAL,
            this.serviceConstants.GOAL_SERVICE_SET_TARGET,
            personalGoalRequest);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: GoalResponse = result.json();
                if (!response) {
                    response = new GoalResponse();
                    response.data = [];
                }
                this.fetchMyTargets(null, null);
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

    deleteTarget(data: any, successCallback: any, errorCallback: any){

        let memberInfo = this.sessionUtils.getMemberInfo();
        let personalGoalInfo = new GoalInfo();
        personalGoalInfo.memberUid = memberInfo.memUID;

        if (data.active == 'N'){
            personalGoalInfo.active = 'N';
        }else{
            personalGoalInfo.targetStatus = 'D';
        }
        personalGoalInfo.targetId = data.targetId;

        let pageInfo: PageInfo = new PageInfo();
        let personalGoalRequest = new GoalRequest();
        personalGoalRequest.data = personalGoalInfo;
        personalGoalRequest.pageInfo = pageInfo;

        let serviceContext: ServiceContext = new ServiceContext(
            this.serviceConstants.SERVICE_CONTEXT_NAME_GOAL,
            this.serviceConstants.GOAL_SERVICE_DELETE_TARGET,
            personalGoalRequest);

        this.dataAccessService.call(serviceContext)
            .subscribe((result: Response) => {
                let response: GoalResponse = result.json();
                if (!response) {
                    response = new GoalResponse();
                    response.data = [];
                }
                this.fetchMyTargets(null, null);
                this.offerUtils.fetchOffersNearBy(null, null);
                this.offerUtils.fetchRecommendedOffers(null, null);
                this.offerUtils.fetchFavoriteOffers(null, null);
                if (successCallback) {
                    successCallback(response);
                }
            },(error: Response) => {
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
            })
    }

    isTargetLimitReached(): boolean {
        let goals: Array<GoalInfo> = this.getTargetContext();
        let count = 0;
        for (let index = 0; index < goals.length; index++) {
            if(goals[index].targetStatus === '' || goals[index].targetStatus === 'I') {
               count ++;
            }
        }
        let setTargetLimit = this.configUtils.getNumOfRecordsForKey(this.serviceConstants.NO_OF_TARGETS);
        return (count >= setTargetLimit);
    }
}