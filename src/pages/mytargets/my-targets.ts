import {Component, Renderer} from '@angular/core';
import {NavController,NavParams,ModalController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {SliderData} from '../../dto/slider.dto';
import {TargetPopupPage} from '../widgets/target-popup/target';
import {GoogleAnalyticsUtils} from '../../utils/commons/google-analytics.utils';
import {AppConstants} from '../../constants/app.constants';
import {TargetUtils} from '../../utils/commons/target.utils';
import {ClientUtils} from '../../utils/commons/client.utils';


@Component({
    selector: 'page-my-targets',
    templateUrl: 'my-targets.html'
})

export class MyTargetsPage {

    pageTitle: String;
    personalTargetList: Array<SliderData> = null;
    offerTargetList: Array<SliderData> = null;
    currentIndex: number = 0;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private modalCtrl: ModalController,
                private render: Renderer,
                private translate: TranslateService,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private targetUtils: TargetUtils,
                private clientUtils: ClientUtils,
                private appConstants: AppConstants) {

    }


    ngOnInit() {

        this.currentIndex = this.navParams.data.currentIndex;
        this.pageTitle = this.navParams.data.pageTitle;
        this.personalTargetList = this.navParams.data.personalTargets;
        this.offerTargetList = this.navParams.data.offerTargets;

        this.googleAnalyticsUtils.trackPage(this.appConstants.MY_TARGETS_SCREEN);
    }


    setTarget() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.MY_TARGETS_SCREEN,this.appConstants.CREATE_PERSONAL_TARGET_EVENT);
        if (!this.targetUtils.isTargetLimitReached()) {
            let body = document.getElementsByTagName('body')[0];
            let opts = {
                showBackdrop: true,
                enableBackdropDismiss: true
            };

            let data = "";
            let profileModal = this.modalCtrl.create(TargetPopupPage, {data: data}, opts);

            profileModal.onDidDismiss((value: boolean) => {
                this.render.setElementClass(body, 'smallModal', false);
                if ((value == true) && this.navCtrl) {
                    this.navCtrl.pop();
                }
            });

            this.render.setElementClass(body, 'smallModal', true);
            profileModal.present();
        } else {
            this.clientUtils.showToast(this.translate.instant('SET_TARGET_LIMIT_REACHED'));
        }
    }

}
