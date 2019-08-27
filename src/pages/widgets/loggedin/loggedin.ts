import {Component, Input} from '@angular/core';
import {NavController,Events} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {LanguageConstants} from '../../../constants/language.constants';
import {ClientUtils} from '../../../utils/commons/client.utils';
import {ConfigUtils} from '../../../utils/commons/config.utils';
import {SessionUtils} from '../../../utils/commons/session.utils';
import {AppConstants} from '../../../constants/app.constants';
import {MemberInfo} from "../../../dto/account.dto";


@Component({
    selector: 'loggedin-component',
    templateUrl: 'loggedin.html'
})

export class LoggedInCardComponent {
    @Input() data: MemberInfo;
    private expiryMessage: string = null;
    private backgroundImageURL: string = '';
    private shouldShowInfo: boolean = true;

    constructor(public navCtrl: NavController,
                public languageConstants: LanguageConstants,
                private events: Events,
                private translate: TranslateService,
                private appConstants: AppConstants,
                private clientUtils: ClientUtils,
                private configUtils: ConfigUtils,
                private sessionUtils: SessionUtils) {

        this.events.subscribe(this.appConstants.EVENT_APP_LANGUAGE_CHANGED, () => {
            this.shouldShowInfo = false;
            this.updateExpiryMessage();
            setTimeout(() => {
                this.shouldShowInfo = true;
            }, 500);
        });

        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.shouldShowInfo = false;
            this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
            setTimeout(() => {
                this.shouldShowInfo = true;
            }, 500);
        });

        this.events.subscribe(this.appConstants.EVENT_USER_PROFILE_CHANGED, () => {
            this.shouldShowInfo = false;
            this.data = this.sessionUtils.getMemberInfo();
            this.updateExpiryMessage();
            setTimeout(() => {
                this.shouldShowInfo = true;
            }, 500);
        });
    }

    ngAfterViewInit(): void {
        this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        this.updateExpiryMessage();
    }

    updateExpiryMessage() {
        if (this.data &&
            (this.data.nextExpiryMiles != '0') &&
            (this.data.milesExpiryDiff > 0) &&
            this.data.milesExpiryDate) {
            let nextExpiryMiles: number = Number(this.data.nextExpiryMiles);
            this.expiryMessage = nextExpiryMiles.toLocaleString() + ' ' + this.translate.instant('POINTS_EXPIRING_ON') + ' ' +
                    this.clientUtils.getFormattedDate('yMMMd', this.data.milesExpiryDate);
        } else {
            this.expiryMessage = null;
        }
    }
}
