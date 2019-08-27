import {Component} from '@angular/core';
import {NavController,NavParams,ViewController} from 'ionic-angular';
import {TargetUtils} from '../../../utils/commons/target.utils';
import {SessionUtils} from '../../../utils/commons/session.utils';
import {ClientUtils} from '../../../utils/commons/client.utils';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {ServiceErrorInfo} from '../../../dto/common.dto';
import {GoalInfo} from '../../../dto/goal.dto';
import {McfLoaderService} from '../../../services/commons/service.loading';
import {TranslateService} from 'ng2-translate';
import {AppConstants} from '../../../constants/app.constants';
import {LanguageConstants} from '../../../constants/language.constants';


@Component({
    templateUrl: 'target.html'
})
export class TargetPopupPage {

    dataObj: any;
    minDate: string = '';
    maxDate: string = '';
    myDate: string = '';
    points: number;
    name: string = '';
    cancelText: string = '';
    selectText: string = '';
    months: Array<string> = [];

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public viewController: ViewController,
                private languageConstants: LanguageConstants,
                private mcfLoadService: McfLoaderService,
                private clientUtils: ClientUtils,
                private translate: TranslateService,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private appConstants: AppConstants,
                private sessionUtils: SessionUtils,
                private targetUtils: TargetUtils) {
        this.dataObj = navParams.get('data')

    }

    ngOnInit() {
        this.googleAnalyticsUtils.trackPage(this.appConstants.CREATE_PERSONAL_TARGET_SCREEN );
        let nowDate = new Date();
        this.myDate = this.clientUtils.getFormattedDate('yyyy-MM-dd');
        this.minDate = this.clientUtils.getFormattedDate('yyyy-MM-dd');
        nowDate.setDate(nowDate.getDate() + (365 * 5)); //5 Years Later
        this.maxDate = this.clientUtils.getFormattedDate('yyyy-MM-dd', nowDate.toDateString());
        this.months = this.clientUtils.fullMonths();
        this.cancelText = this.translate.instant('CANCEL');
        this.selectText = this.translate.instant('SELECT');
    }

    dismiss(value: boolean) {
        this.viewController.dismiss(value);
    }

    createTarget(){

        if (this.sessionUtils.isUserLoggedIn()) {
            if (this.name && (this.name.trim().length > 0) && this.points && this.myDate) {
                let memberInfo = this.sessionUtils.getMemberInfo();
                if (this.points > memberInfo.availableBalanceMiles) {
                    let goalInfo = new GoalInfo();
                    goalInfo.memberUid = memberInfo.memUID;
                    goalInfo.active = 'Y';
                    goalInfo.targetName = this.name;
                    goalInfo.targetPoints = this.points;
                    goalInfo.targetEndDate = this.myDate;

                    this.mcfLoadService.show('');
                    this.targetUtils.setPersonalTarget(goalInfo,
                        (success: any) => {
                            this.mcfLoadService.hide();
                            this.clientUtils.showToast(this.translate.instant('YOUR_TARGET_SUCCESSFULLY_SAVED'));
                            this.dismiss(true);
                        }, (error: ServiceErrorInfo) => {
                            this.mcfLoadService.hide();
                            let msg = '';
                            if (error && error.message && (error.message.trim().length > 0)) {
                                msg = error.message.trim();
                            } else {
                                msg = this.translate.instant('SOMETHING_WENT_WRONG');
                            }
                            if (error.code == 401) {
                                this.clientUtils.showToast(msg);
                                this.dismiss(false);
                            } else {
                                this.clientUtils.showAlert(msg);
                            }
                        });
                }
                else {
                    let msg: string = this.translate.instant('YOU_HAVE_ALREADY_ACHIEVED') + this.points + ' '
                        + this.translate.instant(this.languageConstants.POINTS) + '.';
                    this.clientUtils.showAlert(msg);
                }
            }
        }
        else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_LOGIN_TO_CREATE_TARGETS'));
        }
    }
}
