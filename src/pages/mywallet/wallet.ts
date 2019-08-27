import {Component} from '@angular/core';
import {ModalController,Events} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {QrCodePage} from './qrcode/qrcode';
import {FullScreenPage} from './fullscreen/fullscreen';
import {SessionUtils} from '../../utils/commons/session.utils';
import {ClientUtils} from '../../utils/commons/client.utils';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {WalletUtils} from '../../utils/commons/wallet.utils';
import {QRCodeResponse, VirtualCardResponse} from '../../dto/account.dto';
import {ServiceErrorInfo} from '../../dto/common.dto';
import {McfLoaderService} from '../../services/commons/service.loading';
import {GoogleAnalyticsUtils} from '../../utils/commons/google-analytics.utils';
import {AppConstants} from '../../constants/app.constants';
import {NetworkService} from '../../services/commons/network.service';
import {SyncDataUtils} from '../../utils/commons/sync-data.utils';


@Component({
    selector: 'page-wallet',
    templateUrl: 'wallet.html'
})
export class MyWalletPage {

    isFrontVisible: boolean = false;
    hasVirtualCardData: boolean = false;
    isRefreshing: boolean = false;
    private backgroundImageURL: string = '';

    constructor(public clientUtils: ClientUtils,
                private configUtils: ConfigUtils,
                private modalCtrl: ModalController,
                private sessionUtils: SessionUtils,
                private walletUtils: WalletUtils,
                private mcfLoadService: McfLoaderService,
                private events: Events,
                private translate: TranslateService,
                private googleAnalyticsUtils: GoogleAnalyticsUtils,
                private appConstants: AppConstants,
                private networkService: NetworkService,
                private syncDataUtils: SyncDataUtils) {

    }

    ngOnInit() {
        this.googleAnalyticsUtils.trackPage(this.appConstants.VIRTUAL_CARD_SCREEN);

        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
        });

        this.events.subscribe(this.appConstants.EVENT_WALLET_INFO_CHANGED, () => {
            this.hasVirtualCardData = this.walletUtils.hasVirtualCardData();
        });

        this.events.subscribe(this.appConstants.EVENT_LOGIN_STATUS_CHANGED, () => {
            if (this.sessionUtils.isUserLoggedIn()) {
                this.walletUtils.fetchWalletData(null, null);
                this.walletUtils.fetchQRCodeData(null, null);
            }
            else {
                this.hasVirtualCardData = false;
            }
        });

        this.hasVirtualCardData = this.walletUtils.hasVirtualCardData();

        if (this.sessionUtils.isUserLoggedIn()) {
            if ((this.hasVirtualCardData != true) && this.networkService.isOnline()) {
                this.mcfLoadService.show('');
                this.walletUtils.fetchWalletData(
                    (result: VirtualCardResponse) =>{
                        this.mcfLoadService.hide();
                    }, (error: ServiceErrorInfo) =>{
                        this.mcfLoadService.hide();
                        let msg = '';
                        if (error && error.message && (error.message.trim().length > 0)) {
                            msg = error.message.trim();
                        } else {
                            msg = this.translate.instant('SOMETHING_WENT_WRONG');
                        }
                        this.clientUtils.showToast(msg);
                    });

                this.walletUtils.fetchQRCodeData(
                    (result: QRCodeResponse) =>{
                        //
                    }, (error: ServiceErrorInfo) =>{
                        let msg = '';
                        if (error && error.message && (error.message.trim().length > 0)) {
                            msg = error.message.trim();
                        } else {
                            msg = this.translate.instant('SOMETHING_WENT_WRONG');
                        }
                        this.clientUtils.showToast(msg);
                    });
            }
        }
    }

    ngAfterViewInit(): void {
        this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
    }

    isFrontVisibleChanged(event: boolean) {
        this.isFrontVisible = event;
        this.googleAnalyticsUtils.trackEvent(this.appConstants.VIRTUAL_CARD_SCREEN, this.appConstants.FLIP_EVENT);
    }

    openQR() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.VIRTUAL_CARD_SCREEN, this.appConstants.QR_CODE_EVENT);
        let modal = this.modalCtrl.create(QrCodePage);
        modal.present();
    }

    fullScreen() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.VIRTUAL_CARD_SCREEN, this.appConstants.FULL_SCREEN_EVENT);
        let data = {
            isFrontVisible: this.isFrontVisible
        };
        let modal = this.modalCtrl.create(FullScreenPage, {data: data});
        modal.onWillDismiss((value: boolean) => {
            if (this.isFrontVisible != value) {
                this.isFrontVisibleChanged(value);
            }
        });
        modal.present({animate: false});
    }

    refreshButtonTapped() {
        if (this.isRefreshing != true) {
            this.isRefreshing = true;
            this.syncDataUtils.processPageCode(this.appConstants.VIRTUAL_CARD_SCREEN)
                .then((result: boolean) => {
                    this.isRefreshing = false;
                });
        }
    }
}
