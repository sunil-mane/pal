/**
 * Created by sandip on 1/12/17.
 */
import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {Events} from 'ionic-angular';
import {TransactionResponse,TransactionInfo} from '../../dto/account.dto';
import {ServiceErrorInfo} from '../../dto/common.dto';
import {DataAccessService} from '../../services/commons/data.access.service';
import {ServiceContext} from '../../services/commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {AppConstants} from '../../constants/app.constants';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {SessionUtils} from '../../utils/commons/session.utils';


@Injectable()
export class TransactionUtils {

    constructor(private events: Events,
                private appConstants: AppConstants,
                private dataAccessService: DataAccessService,
                private serviceConstants: ServiceConstants,
                private configUtils: ConfigUtils,
                private sessionUtils: SessionUtils) {

    }

    getTransactionContext(): Array<TransactionInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.transactions;
        if (!contextObj) {
            contextObj = new Array<TransactionInfo>();
        }
        return contextObj;
    }

    saveTransactionContext(contextObj: Array<TransactionInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.transactions = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearTransactionContext(): void {
        let contextObj = new Array<TransactionInfo>();
        this.saveTransactionContext(contextObj);
    }

    fetchRecentTransactions(successCallback: any, errorCallback: any): void {

        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo = this.sessionUtils.getMemberInfo();
            let requestData = new TransactionInfo();
            requestData.membershipCardNumber = memberInfo.activeCardNo;
            requestData.numberOfRecords = this.configUtils.getNumOfRecordsForKey(
                this.serviceConstants.NO_OF_RECENT_TRANSACTIONS);

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_ACCOUNT,
                this.serviceConstants.ACCOUNT_SERVICE_NAME_TRANSACTION,
                requestData);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: TransactionResponse = result.json();
                    if (!response) {
                        response = new TransactionResponse();
                        response.data = [];
                    }
                    this.saveTransactionContext(response.data);
                    this.events.publish(this.appConstants.EVENT_RECENT_TRANSACTIONS_CHANGED);
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
                errorCallback(null);
            }
        }
    }

}
