import {Component, ViewChild} from '@angular/core';
import { NgForm } from '@angular/forms';
import {NavController, Content, Navbar, ModalController, FabContainer} from 'ionic-angular';
import {Keyboard} from 'ionic-native';
import {TranslateService} from 'ng2-translate';
import {CompleterService,RemoteData,CompleterItem} from 'ng2-completer';
import {ClientUtils} from '../../utils/commons/client.utils';
import {McfLoaderService} from '../../services/commons/service.loading';
import {NetworkService} from '../../services/commons/network.service';
import {IndustryTypeInfo, IndustryTypeResponse} from "../../dto/partners.dto";
import {ServiceErrorInfo} from "../../dto/common.dto";
import {PartnerUtils} from '../../utils/commons/partner.utils';
import {FilterMilesCalculator} from '../../pages/widgets/filters-mcalculator/filters-mcalculator';
import {MilesCalculatorFilters} from "../../dto/account.dto";


@Component({
    selector: 'miles-calculator-page',
    templateUrl: 'mcalculator.html'
})


export class MilesCalculatorPage {

    @ViewChild(Content) content: Content;
    @ViewChild('navBar') navBar: Navbar;
    @ViewChild('form1') form1: NgForm;

    TRIP_TYPE_RETURN: string = 'return';
    TRIP_TYPE_ONEWAY: string = 'oneway';
    MILES_TYPE_EARN: string = 'earn';

    shouldShowResults: boolean = false;
    selectedTripType: string = '';
    textNoResults:string = '';
    textSearching:string = '';
    dataServiceFrom: RemoteData = null;
    dataServiceTo: RemoteData = null;
    minDate: string = '';
    maxDate: string = '';
    cancelText: string = '';
    selectText: string = '';
    months: Array<string> = [];
    startDateText: string = null;
    endDateText: string = null;
    fromText: string = '';
    toText: string = '';
    private industryTypes: Array<IndustryTypeInfo> = [];
    private selectIndustryTypeCode: string = null;
    private classList: Array<string> = [];
    private selectedClassObj: string = null;
    private selectedMilesType: string = null;
    private promoText: string = '';

    constructor(public navCtrl: NavController,
                private modalCtrl: ModalController,
                private clientUtils: ClientUtils,
                private partnerUtils: PartnerUtils,
                private mcfLoadService: McfLoaderService,
                private translate: TranslateService,
                private completerService: CompleterService,
                private networkService: NetworkService) {
    }

    ngOnInit() {

        this.selectedTripType = this.TRIP_TYPE_ONEWAY;

        this.textNoResults = this.translate.instant('NO_LOCATION_FOUND');
        this.textSearching = this.translate.instant('SEARCHING');

        this.dataServiceFrom = this.completerService.remote(null, null, "formatted_address");
        this.dataServiceFrom.urlFormater(term => {
            return `https://maps.googleapis.com/maps/api/geocode/json?address=${term}`;
        });
        this.dataServiceFrom.dataField("results");

        this.dataServiceTo = this.completerService.remote(null, null, "formatted_address");
        this.dataServiceTo.urlFormater(term => {
            return `https://maps.googleapis.com/maps/api/geocode/json?address=${term}`;
        });
        this.dataServiceTo.dataField("results");

        let nowDate = new Date();
        this.minDate = this.clientUtils.getFormattedDate('yyyy-MM-dd', nowDate.toDateString());
        nowDate.setDate(nowDate.getDate() + (365.35 * 5));
        this.maxDate = this.clientUtils.getFormattedDate('yyyy-MM-dd', nowDate.toDateString());
        this.months = this.clientUtils.fullMonths();
        this.cancelText = this.translate.instant('CANCEL');
        this.selectText = this.translate.instant('SELECT');
        this.startDateText = this.minDate;
        this.endDateText = this.minDate;

        this.classList = ['Economy', 'Business', 'First'];
        this.selectedClassObj = this.classList[0];

        this.selectedMilesType = this.MILES_TYPE_EARN;

        // this.getAllIndustryTypes();
    }

    ngAfterViewInit() {

    }

    getAllIndustryTypes() {
        this.partnerUtils.fetchAllIndustryTypes(
            (result: IndustryTypeResponse) => {
                let industryTypes: Array<IndustryTypeInfo> = result.data;
                if (industryTypes && industryTypes.length > 0) {
                    this.industryTypes = industryTypes;
                    this.selectIndustryType(this.industryTypes[0]);
                }
            }, (error: ServiceErrorInfo) => {
                console.log('Industry Types Error:\n' + JSON.stringify(error));
                if (this.industryTypes.length == 0) {
                    let msg = '';
                    if (error && error.message && (error.message.trim().length > 0)) {
                        msg = error.message.trim();
                    } else {
                        msg = this.translate.instant('SOMETHING_WENT_WRONG');
                    }
                    this.clientUtils.showToast(msg);
                }
            });
    }

    selectIndustryType(industryType: IndustryTypeInfo) {
        Keyboard.close();
        // this.googleAnalyticsUtils.trackEvent(this.appConstants.SEARCH_PARTNER_SCREEN,this.appConstants.INDUSTRY_TYPE_FILTER_EVENT);
        if (industryType && (industryType.code !== this.selectIndustryTypeCode)) {
            this.selectIndustryTypeCode = industryType.code;
            // this.partnersIndex = 1;
            // this.shouldLoadPartners = true;
            // this.searchedPartners = [];
            // this.loadData();
        }
    }

    itemSelected(selectedItem: CompleterItem): void {
        if (selectedItem && selectedItem.originalObject) {
            console.log('selectedItem:\n' + selectedItem.originalObject);
        }
    }

    validateFields(): string {
        let errMsg: string = null;
        if (!this.fromText || (this.fromText.trim().length == 0)) {
            errMsg = 'Please enter valid From location';
        } else if (!this.toText || (this.toText.trim().length == 0)) {
            errMsg = 'Please enter valid To location';
        }
        return errMsg;
    }

    bottomButtonTapped() {
        let errMsg: string = this.validateFields();
        if (errMsg) {
            this.clientUtils.showAlert(errMsg);
        } else {
            if (this.networkService.isOnline()) {
                this.mcfLoadService.show('');
                this.fetchMilesCalculator();
            } else {
                this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
            }
        }
    }

    modifyTapped() {
        this.shouldShowResults = false;
    }

    doFilter(fab: FabContainer) {

        if (fab) {
            fab.close();
        }

        let opts = {
            showBackdrop: true,
            enableBackdropDismiss: true
        };

        let filters: MilesCalculatorFilters = new MilesCalculatorFilters();
        filters.milesType = this.selectedMilesType;
        filters.promotionCode = this.promoText;

        let modal = this.modalCtrl.create(FilterMilesCalculator, {data: filters}, opts);
        modal.onDidDismiss((data: MilesCalculatorFilters) => {
            if (data) {
                this.selectedMilesType= data.milesType;
                this.promoText= data.promotionCode;
            }
        });

        modal.present();
    }

    fetchMilesCalculator() {
        setTimeout(()=> {
            this.mcfLoadService.hide();
            this.shouldShowResults = true;
        }, 2000);
    }
}
