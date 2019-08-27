import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';


@Component({
    templateUrl: 'offline-popup.html'
})
export class OfflinePopupPage {

    dataObj:any;
    offlineMsg:string;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public viewController: ViewController) {

    }

    ngOnInit() {
        this.dataObj = this.navParams.get('data');
        this.offlineMsg = this.dataObj.offlineMsg;
        // console.log(JSON.stringify(this.offlineMsg));
    }


    dismiss() {
        this.viewController.dismiss();
    }

}
