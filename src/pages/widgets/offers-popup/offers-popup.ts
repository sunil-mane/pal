import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {SliderData} from "../../../dto/slider.dto";
import {ServiceConstants} from "../../../constants/service.constants";
import {ClientUtils} from "../../../utils/commons/client.utils";


@Component({
    templateUrl: 'offers-popup.html'
})
export class OffersPopupPage {

    dataObj: SliderData;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public viewController: ViewController,
                public serviceConstants: ServiceConstants,
                private clientUtils: ClientUtils) {
        this.dataObj = navParams.get('data');
    }

    ngOnInit() {
         // console.log('OffersPopupPage : ' + JSON.stringify(this.dataObj));
    }

    dismiss() {
        this.viewController.dismiss();
        //this.navCtrl.setRoot(mEngageApp)
    }

    openWebSite() {
        this.clientUtils.openWebURL(this.dataObj.terms);
    }
}
