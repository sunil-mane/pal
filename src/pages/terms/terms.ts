import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Events, Content} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {McfLoaderService} from '../../services/commons/service.loading';
import {MenuUtils} from '../../utils/commons/menu.utils';
import {AppConstants} from '../../constants/app.constants';
import {ServiceConstants} from '../../constants/service.constants';
import {GoogleAnalyticsUtils} from '../../utils/commons/google-analytics.utils';
import {TermsResponse,TermsCondtionsInfo,ServiceErrorInfo} from '../../dto/common.dto';
import {NetworkService} from '../../services/commons/network.service';
import {ClientUtils} from '../../utils/commons/client.utils';


@Component({
  selector: 'page-terms',
  templateUrl: 'terms.html'
})
export class TermsPage {

    @ViewChild(Content) content: Content;

  pageTitle: string = '';
  htmlData: string = null;
  shouldShowRefresh: boolean = false;
  isRefreshing: boolean = false;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public clientUtils: ClientUtils,
              private events: Events,
              private mcfLoadService: McfLoaderService,
              private menuUtils: MenuUtils,
              private googleAnalyticsUtils: GoogleAnalyticsUtils,
              private appConstants: AppConstants,
              private serviceConstants: ServiceConstants,
              private translate: TranslateService,
              private networkService: NetworkService) {
  }

  ngOnInit() {

      this.events.subscribe(this.appConstants.EVENT_APP_TERMS_CHANGED, () => {
          this.showTermsConditions();
      });

        if (this.navParams.data && this.navParams.data.data) {
            let navData: any = this.navParams.data.data;
            let contentType: string = navData.contentType;

            if (navData.pageTitle) {
                this.pageTitle = navData.pageTitle;
            }

            if (contentType == this.serviceConstants.TERMS_CONTENT_TYPE_TC) {
                this.shouldShowRefresh = true;
                this.openTermsConditions();
                this.googleAnalyticsUtils.trackPage(this.appConstants.APP_TERMS_AND_CONDITIONS_SCREEN);
            } else if (navData.content) {
                this.htmlData = navData.content;
            }
        }
  }

    openTermsConditions() {
        let terms = this.menuUtils.getTermsConditionsContext();
        if ((!terms || (terms.length == 0)) && this.networkService.isOnline()) {
            this.mcfLoadService.show('');
            this.menuUtils.getTermsAndCondition(
                (result: TermsResponse) => {
                    this.mcfLoadService.hide();
                }, (error: ServiceErrorInfo) => {
                    console.log('Terms Conditions Error:\n' + JSON.stringify(error));
                    this.mcfLoadService.hide();
                    this.showTermsConditions();
                    let msg = '';
                    if (error && error.message && (error.message.trim().length > 0)) {
                        msg = error.message.trim();
                    } else {
                        msg = this.translate.instant('SOMETHING_WENT_WRONG');
                    }
                    this.clientUtils.showAlert(msg);
                });
        }
        else {
            this.showTermsConditions();
        }
    }

    showTermsConditions() {
        let terms = this.menuUtils.getTermsConditionsContext();
        if (terms && (terms.length > 0)) {
            let termsInfo:TermsCondtionsInfo = terms[0];
            this.htmlData = termsInfo.content;
        }
    }

    refreshButtonTapped() {
        if (this.isRefreshing != true) {
            this.isRefreshing = true;
            this.content.scrollToTop(0);
            this.menuUtils.getTermsAndCondition(
                () => {
                    this.isRefreshing = false;
                }, () => {
                    this.isRefreshing = false;
                });
        }
    }
}
