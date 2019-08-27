import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, Content, Navbar, Button } from 'ionic-angular';
import { Keyboard } from 'ionic-native';
import { TranslateService } from 'ng2-translate';
import { ClientUtils } from '../../utils/commons/client.utils';
import { UserUtils } from '../../utils/commons/user.utils';
import { SessionUtils } from '../../utils/commons/session.utils';
import { UserAddressUtils } from '../../utils/commons/user-address.utils';
import { LovItemUtils } from '../../utils/commons/lov-item.utils';
import { ConfigUtils } from '../../utils/commons/config.utils';
import { McfLoaderService } from '../../services/commons/service.loading';
import {
    EnrollResponse, LoginResponse, MemberAddressInfo, MemberAddressResponse, MemberContactInfo, MemberInfo,
    PasswordCharacter,
    PasswordHint, PasswordHintResponse,
} from "../../dto/account.dto";
import { ConfigInfo, ServiceErrorInfo } from "../../dto/common.dto";
import { SecurityQuestionLov, CountryLov, StateLov, CityLov, NameSuffixLov } from "../../dto/lov-item.dto";
import { GeocodeAddressComponent, GeocodeInfo } from "../../dto/geocode.dto";
import { NetworkService } from '../../services/commons/network.service';
import { GoogleAnalyticsUtils } from '../../utils/commons/google-analytics.utils';
import { AppConstants } from '../../constants/app.constants';
import { Slides } from 'ionic-angular';
import {TabsPage} from '../../pages/tabs/tabs';
import {Events, MenuController, Nav, Platform, ModalController} from 'ionic-angular';
import { App, ViewController } from 'ionic-angular';
import * as $ from 'jquery'

@Component({
    selector: 'tutorial',
    templateUrl: 'tutorial.html',
    // styleUrls:['tutorial.scss']
})


export class TutorialPage {
    constructor(public navCtrl: NavController,
        private clientUtils: ClientUtils,
        private userUtils: UserUtils,
        private sessionUtils: SessionUtils,
        private configUtils: ConfigUtils,
        private userAddressUtils: UserAddressUtils,
        private googleAnalyticsUtils: GoogleAnalyticsUtils,
        private appConstants: AppConstants,
        private lovItemUtils: LovItemUtils,
        private mcfLoadService: McfLoaderService,
        private translate: TranslateService,
        private networkService: NetworkService,
        public appCtrl: App) {
    }
     @ViewChild(Slides) slides: Slides;
    @ViewChild(Nav) nav: NavController;
    ngOnInit() {
    }
    ngAfterViewInit(): void {
    }
      goToSlide(n) {
        this.slides.slideNext();
      }
      goToHome(){
        this.appCtrl.getRootNav().push(TabsPage);
      }
}