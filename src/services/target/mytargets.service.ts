/**
 * Created by C00121 on 04/12/2016.
 */
import {Injectable} from '@angular/core';
import {CustomHttpService} from '../commons/http.service';
import {ServiceContext} from '../commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {Observable} from '../../../node_modules/rxjs/Rx'
import {Response} from "@angular/http";


@Injectable()
export class MyTargetsService{

    private SERVICE_URL_MY_TARGETS = '/api/Goal/MyGoals';
    private SERVICE_URL_SET_TARGET = '/api/Goal';
    private SERVICE_URL_DELETE_TARGET = '/api/Goal/Status';


    constructor(private httpService: CustomHttpService,
                private serviceConstants: ServiceConstants) {
    }


    call(serviceContext: ServiceContext): Observable<Response> {

        let serviceName = serviceContext.serviceName;

        if (serviceName) {
            if (serviceName === this.serviceConstants.GOAL_SERVICE_NAME_MY_TARGETS) {
                return this.getMyTargets(serviceContext.requestObject);
            }else if (serviceName === this.serviceConstants.GOAL_SERVICE_SET_TARGET) {
                return this.setAsTarget(serviceContext.requestObject);
            }else if (serviceName === this.serviceConstants.GOAL_SERVICE_DELETE_TARGET) {
                return this.deleteTarget(serviceContext.requestObject);
            }
        }
    }

    getMyTargets(reqData: any):Observable<Response>{
        return this.httpService.getData(this.SERVICE_URL_MY_TARGETS, reqData);
    }

    setAsTarget(reqData: any):Observable<Response>{
        return this.httpService.postData(this.SERVICE_URL_SET_TARGET, reqData);
    }

    deleteTarget(reqData: any):Observable<Response>{
        return this.httpService.postData(this.SERVICE_URL_DELETE_TARGET, reqData);
    }

}
