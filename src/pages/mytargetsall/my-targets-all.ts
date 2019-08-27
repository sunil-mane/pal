import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {ServiceConstants} from '../../constants/service.constants';
import {TargetUtils} from '../../utils/commons/target.utils';
import {GoalInfo, GoalResponse} from '../../dto/goal.dto';
import {ServiceErrorInfo} from "../../dto/common.dto";
import {MemberInfo} from "../../dto/account.dto";
import {SessionUtils} from '../../utils/commons/session.utils';
import {GoogleAnalyticsUtils} from '../../utils/commons/google-analytics.utils';
import {AppConstants} from '../../constants/app.constants';
import {McfLoaderService} from '../../services/commons/service.loading';
import {ClientUtils} from '../../utils/commons/client.utils';


@Component({
    selector: 'page-my-targets-all',
    templateUrl: 'my-targets-all.html'
})

export class MyTargetsAllPage {

    pageTitle: String;
    navParamsData: any;
    allMyTargets: Array<GoalInfo> = [];
    private shouldLoadMyTargetsAll: boolean = true;
    private myTargetsAllIndex: number = 1;
    memberInfo: MemberInfo = new MemberInfo();


    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public clientUtils: ClientUtils,
                private configUtils: ConfigUtils,
                private targetUtils: TargetUtils,
                private sessionUtils: SessionUtils,
                private mcfLoadService: McfLoaderService,
                private serviceConstants: ServiceConstants,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private translate: TranslateService,
                private appConstants: AppConstants) {

        //this.allMyTargets =  AllMyTargets
        //
    }

    ngOnInit() {
        this.googleAnalyticsUtils.trackPage(this.appConstants.VIEW_ALL_TARGETS_SCREEN);
        this.navParamsData = this.navParams.data;
        this.pageTitle = this.navParamsData.pageTitle;
        this.allMyTargets = [];
        this.memberInfo = this.sessionUtils.getMemberInfo();
        this.loadData();
    }

    loadData() {
        return new Promise(resolve => {
            if (this.shouldLoadMyTargetsAll) {
                let numOfRecords = this.configUtils.getNumOfRecordsForKey(this.serviceConstants.PAGINATION_NO_OF_RECORDS);
                let startIndex = this.myTargetsAllIndex;
                let endIndex = this.myTargetsAllIndex + numOfRecords - 1;
                if (this.allMyTargets.length <= 0)
                    this.mcfLoadService.show('');
                this.targetUtils.fetchAllTargets(startIndex, endIndex,
                    (result: GoalResponse) => {
                        this.mcfLoadService.hide();
                        if (result.data && (result.data.length < numOfRecords)) {
                            this.shouldLoadMyTargetsAll = false;
                        } else {
                            this.myTargetsAllIndex = endIndex + 1;
                        }
                        let tempArray = this.allMyTargets;
                        for (let item of result.data) {
                            if ((item.targetStatus == '') ||
                                (item.targetStatus == 'I') ||
                                (item.targetStatus == 'A') ||
                                (item.targetStatus == 'E')) {
                                if (item.targetPoints > this.memberInfo.availableBalanceMiles) {
                                    let percentValue = Math.round((this.memberInfo.availableBalanceMiles /
                                        item.targetPoints) * 100);
                                    if (percentValue > 100) {
                                        percentValue = 100;
                                    }
                                    item.myTarget = percentValue;
                                } else {
                                    item.myTarget = 100;
                                }
                                tempArray.push(item);
                            }
                        }
                        this.allMyTargets = tempArray;
                        let maxLimit = this.configUtils.getPaginationLimit();
                        if (this.allMyTargets.length >= maxLimit) {
                            this.shouldLoadMyTargetsAll = false;
                        }
                        resolve(true);
                    }, (error: ServiceErrorInfo) => {
                        console.log('All Targets Error:\n' + JSON.stringify(error));
                        if (this.allMyTargets.length <= 0) {
                            this.mcfLoadService.hide();
                            let msg = '';
                            if (error && error.message && (error.message.trim().length > 0)) {
                                msg = error.message.trim();
                            } else {
                                msg = this.translate.instant('SOMETHING_WENT_WRONG');
                            }
                            this.clientUtils.showToast(msg);
                        }
                        resolve(true);
                    });
            } else {
                resolve(true);
            }

        });
    }

    doInfinite(infiniteScroll: any) {
        this.loadData().then(() => {
            infiniteScroll.complete();
        });
    }
}
