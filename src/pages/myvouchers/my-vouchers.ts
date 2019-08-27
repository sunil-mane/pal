import { PartnerUtils } from './../../../src/utils/commons/partner.utils';
import { ConfigUtils } from './../../utils/commons/config.utils';
import { ServiceConstants } from './../../../src/constants/service.constants';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { MemberInfo } from "../../dto/account.dto";
import { SessionUtils } from '../../utils/commons/session.utils';
import { GoogleAnalyticsUtils } from '../../utils/commons/google-analytics.utils';
import { AppConstants } from '../../constants/app.constants';
import { ClientUtils } from '../../utils/commons/client.utils';
import { MyVouchersResponse, MyVoucherDto, VouchersResponse } from '../../dto/partners.dto';
import { ServiceErrorInfo } from '../../dto/common.dto';
import { TranslateService } from 'ng2-translate';
import { Keyboard } from 'ionic-native';

@Component({
    selector: 'page-my-vouchers',
    templateUrl: 'my-vouchers.html'
})

export class MyVouchers {

    pageTitle: String;
    navParamsData: any;
    memberInfo: MemberInfo = new MemberInfo();
    isLoadingPartners: boolean = false;
    isLoadingOffers: boolean = false;
    isLoadingLocations: boolean = false;
    isLoadingVouchers: boolean = false;
    isRefreshing: boolean = false;
    vouchersIndex: number = 1;
    vouchersSearchKey: string = "";
    myVouchers: Array<MyVoucherDto> = [];
    utilizedVouchers: Array<MyVoucherDto> = [];
    searchNoVoucherText: string = "";
    private ALL_VOUCHERS_TAB = 'tab01';
    private UTILIZED_VOUCHERS_TAB = 'tab02';
    @ViewChild(Content) content: Content;
    activeTab: string;
    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public clientUtils: ClientUtils,
        private sessionUtils: SessionUtils,
        private googleAnalyticsUtils: GoogleAnalyticsUtils,
        private appConstants: AppConstants,
        private serviceConstants: ServiceConstants,
        private configUtils: ConfigUtils,
        private partnerUtils: PartnerUtils,
        private translate: TranslateService) {
        this.activeTab = this.ALL_VOUCHERS_TAB;
        this.getMyVouchers('all')
    }

    ngOnInit() {
        this.googleAnalyticsUtils.trackPage(this.appConstants.VIEW_ALL_VOUCHERS);
        this.navParamsData = this.navParams.data;
        this.pageTitle = this.navParamsData.pageTitle;
        console.log(JSON.stringify(this.navParamsData))
        this.myVouchers = [];
        this.memberInfo = this.sessionUtils.getMemberInfo();
    }
    getMyVouchers(flag) {
        let numOfRecords = this.configUtils.getNumOfRecordsForKey(
            this.serviceConstants.PAGINATION_NO_OF_RECORDS
        );
        if (this.myVouchers.length == 0) {
            this.isLoadingVouchers = true;
        }
        this.partnerUtils.fetchMyVouchers(flag, 
            (result: MyVouchersResponse) => {
                console.log(result);
                if(flag=='N'){
                    this.utilizedVouchers = result.data; //this.myVouchers.filter(x => x.voucherUtilized == 'Y');
                }else{
                    this.myVouchers = result.data;
                }
                this.isLoadingVouchers = false;
                let maxLimit = this.configUtils.getPaginationLimit();
                if (this.myVouchers.length == 0) {
                    this.searchNoVoucherText = this.translate.instant(
                        "SEARCH_NO_PARTNER_VOUCHER"
                    );
                }
            },
            (error: ServiceErrorInfo) => {
                console.log("Search Locations Error:\n" + JSON.stringify(error));
                this.isLoadingVouchers = false;
                this.clientUtils.showToast(JSON.stringify(error));
            }
        );
    }

    activeTabEvent(tab: string) {
        Keyboard.close();
        let shouldLoadData = false;
        this.googleAnalyticsUtils.trackPage(this.appConstants.MY_VOUCHERS_SCREEN);
        if (tab == this.UTILIZED_VOUCHERS_TAB) {
            this.activeTab = this.UTILIZED_VOUCHERS_TAB;
            this.getMyVouchers('N');
            console.log('utilized : '+JSON.stringify(this.utilizedVouchers))
        }else if (tab == this.ALL_VOUCHERS_TAB) {
            this.activeTab = this.ALL_VOUCHERS_TAB
        }  
        this.content.scrollToTop(0);
    }

    doInfinite(infiniteScroll: any) {
        // this.loadData().then(() => {
        //     infiniteScroll.complete();
        // });
    }


}
