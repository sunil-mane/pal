import {Component, Input} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {SliderData} from '../../../dto/slider.dto';
import {TargetUtils} from '../../../utils/commons/target.utils';
import {ClientUtils} from '../../../utils/commons/client.utils';
import {McfLoaderService} from '../../../services/commons/service.loading';
import {LanguageConstants} from '../../../constants/language.constants';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {AppConstants} from '../../../constants/app.constants';


@Component({
    templateUrl: 'personal-target.html',
    selector: 'component-personal-target',
})
export class PersonalTargetComponent {
    @Input() personalTargetData: Array<SliderData>;
    dataObj: any;
    current = 90;
    radius = 20;
    max = 100;
    responsive = false;
    clockwise = true;

    personalTargetList: Array<SliderData> = [];


    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public viewController: ViewController,
                public languageConstants: LanguageConstants,
                private translate: TranslateService,
                private mcfLoadService: McfLoaderService,
                private googleAnalyticsUtils:GoogleAnalyticsUtils,
                private appConstants: AppConstants,
                private clientUtils: ClientUtils,
                private targetUtils: TargetUtils) {
        this.dataObj = navParams.get('data')
    }

    ngOnInit() {
        if (!this.clientUtils.isNullOrEmpty(this.personalTargetData)) {
            this.personalTargetList = this.personalTargetData;
        }
    }


    dismiss() {
        this.viewController.dismiss();
    }


    /**
     * This will delete items in users personal targets
     * @param index
     */

    delete(targetObj: SliderData) {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.TERGET_CARD, this.appConstants.DROP_TARGETS_EVENT);
        this.mcfLoadService.show('');
        this.targetUtils.deleteTarget(targetObj,
            (result) => {
                this.mcfLoadService.hide();
                if (this.personalTargetList.length > 1) {
                    this.personalTargetList.splice(this.personalTargetList.indexOf(targetObj), 1);
                }
                else if (this.navCtrl) {
                    this.navCtrl.pop();
                }
            }, (error) => {
                this.mcfLoadService.hide();
                let msg = '';
                if (error && error.message && (error.message.trim().length > 0)) {
                    msg = error.message.trim();
                } else {
                    msg = this.translate.instant('SOMETHING_WENT_WRONG');
                }
                this.clientUtils.showToast(msg);
            })
    }

}
