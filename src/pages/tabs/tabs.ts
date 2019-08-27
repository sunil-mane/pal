import {Component,ViewChild} from '@angular/core';
import {NavParams, ModalController, Events, Tabs, Modal} from 'ionic-angular';
import {HomePage} from '../home/home';
import {MyWalletPage} from '../mywallet/wallet';
import {SearchPage} from '../search/search';
import { LoginPage } from '../login/login';
import {SessionUtils} from '../../utils/commons/session.utils';
import {AppConstants} from '../../constants/app.constants';


@Component({
    templateUrl: 'tabs.html'
})
export class TabsPage {

    @ViewChild('myTabs') tabRef: Tabs;

    // set the root pages for each tab
    tab1Root: any = HomePage;
    tab2Root: any ;
    tab3Root: any = SearchPage;
    mySelectedIndex: number;

    constructor(navParams: NavParams,
                private events: Events,
                private appConstants: AppConstants,
                private sessionUtils: SessionUtils,
                private modalCtrl: ModalController) {
        this.mySelectedIndex = navParams.data.tabIndex || 0;

        //console.log('navParams.data.tabIndex :',navParams.data.tabIndex );
    }

    ngOnInit(){
        this.tab1Root = HomePage;
        this.tab2Root = MyWalletPage;
        this.tab3Root = SearchPage;

        this.events.subscribe(this.appConstants.EVENT_LOGIN_STATUS_CHANGED, () => {
            if (!this.sessionUtils.isUserLoggedIn()) {
                this.tabRef.select(0);
            }
        });
    }

    openModal() {

        if(!this.sessionUtils.isUserLoggedIn()){
            let modal: Modal = this.modalCtrl.create(LoginPage);
            modal.onDidDismiss((isSuccess: boolean) => {
                if (isSuccess) {
                    this.tab2Root = MyWalletPage;
                } else {
                    this.tabRef.select(0);
                }
            });
            modal.present();
        } else {
            this.tab2Root = MyWalletPage;
        }
    }


}
