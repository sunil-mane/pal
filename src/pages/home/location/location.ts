import { Component, Input, Renderer, trigger, transition, style , animate} from '@angular/core';
import {NavController,NavParams,ViewController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {UserAddressUtils} from '../../../utils/commons/user-address.utils';
import {GeocodeInfo} from '../../../dto/geocode.dto';
import {CompleterService,RemoteData,CompleterItem} from 'ng2-completer';
import {AppConstants} from '../../../constants/app.constants';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';


@Component({
    selector: 'page-location',
    templateUrl: 'location.html',
    animations: [
        trigger('fadeInOut', [
            transition('void => *', [
                style({opacity: 0, transform: 'scale(.6)'}), //style only for transition transition (after transiton it removes)
                animate(300, style({opacity: 1, transform: 'scale(1)'})) // the new state of the transition(after transiton it removes)
            ]),
            transition('* => *', [
                animate(300, style({opacity: 0, transform: 'scale(0)'})) // the new state of the transition(after transiton it removes)
            ])
        ])
    ]
})

export class LocationPage {

    @Input() data;

    body: any;
    toggle:boolean = true;
    locations:Array<GeocodeInfo> = [];
    private searchStr:string = '';
    private textNoResults:string = '';
    private textSearching:string = '';
    private textPlaceholder:string = '';
    private dataService:RemoteData = null;

    constructor(public navCtrl:NavController,
                public navParams:NavParams,
                public viewCtrl:ViewController,
                private render: Renderer,
                private translate:TranslateService,
                private completerService:CompleterService,
                private userAddressUtils:UserAddressUtils,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private appConstants: AppConstants) {

    }

    ngOnInit() {
        this.body = document.getElementsByTagName('body')[0];
        this.render.setElementClass(this.body, 'loginSmallModal', false);

        this.googleAnalyticsUtils.trackPage(this.appConstants.GEO_LOCATION_SEARCH_SCREEN);

        this.textNoResults = this.translate.instant('NO_LOCATION_FOUND');
        this.textSearching = this.translate.instant('SEARCHING');
        this.textPlaceholder = this.translate.instant('SEARCH_HERE');

        this.dataService = this.completerService.remote(null, null, "formatted_address");
        this.dataService.urlFormater(term => {
            return `https://maps.googleapis.com/maps/api/geocode/json?address=${term}`;
        });
        this.dataService.dataField("results");

        let locations = this.userAddressUtils.getUserAddressContext();
        let tempArray:Array<GeocodeInfo> = [];
        for (let index = 1; index < locations.length; index++) {
            tempArray.push(locations[index]);
        }
        this.locations = tempArray;
    }

    ionViewDidLoad() {
        this.searchStr = '';
        // if (this.navParams.data && this.navParams.data.data && this.navParams.data.data.formatted_address) {
        //   this.searchStr = this.navParams.data.data.formatted_address
        // }
    }

    dismiss() {
        this.toggle = !this.toggle;
        this.viewCtrl.dismiss(null);
    }

    selectedLocation(item:GeocodeInfo) {
        this.toggle = !this.toggle;
        this.viewCtrl.dismiss(item);
    }

    itemSelected(selectedItem:CompleterItem):void {
        if (selectedItem && selectedItem.originalObject) {
            this.selectedLocation(selectedItem.originalObject);
        }
    }
}
