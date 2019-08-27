import {Component, Input, Output, EventEmitter, NgZone} from '@angular/core';
import {NavController, NavParams, Events} from 'ionic-angular';
import {VirtualCardInfo, MemberInfo} from '../../../dto/account.dto';
import {ServiceErrorInfo} from '../../../dto/common.dto';
import {FileService} from '../../../services/commons/file.service';
import {ConfigUtils} from '../../../utils/commons/config.utils';
import {WalletUtils} from '../../../utils/commons/wallet.utils';
import {SessionUtils} from '../../../utils/commons/session.utils';
import {AppConstants} from '../../../constants/app.constants';
import {ClientUtils} from '../../../utils/commons/client.utils';


@Component({
    selector: 'virtual-card-component',
    templateUrl: 'virtual-card.html'
})

export class VirtualCardComponent {

    @Input() isFrontVisible: boolean = false;
    @Output() changeIsFrontVisible: EventEmitter<boolean> = new EventEmitter<boolean>();

    data: VirtualCardInfo = null;
    memberInfo: MemberInfo = null;
    cardFront: any = null;
    cardBack: any = null;
    shouldDisplayIndicator: boolean = false;
    shouldDisplayCard: boolean = false;
    cardExpiryDate: string = null;
    tenantCode: string;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private events: Events,
                private ngZone: NgZone,
                private appConstants: AppConstants,
                private fileService: FileService,
                private configUtils: ConfigUtils,
                private walletUtils: WalletUtils,
                private sessionUtils: SessionUtils,
                private clientUtils: ClientUtils) {

    }

    ngOnInit() {

        this.tenantCode = this.clientUtils.getTenantCode();

        this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
            this.updateDisplayExpiryDateStatus();
        });

        this.events.subscribe(this.appConstants.EVENT_WALLET_INFO_CHANGED, () => {
            if (this.walletUtils.hasVirtualCardData()) {
                let data: VirtualCardInfo = this.walletUtils.getWalletContext()[0];
                if (this.data &&
                    ((this.data.cardFrontUrl != data.cardFrontUrl) || (this.data.cardBackUrl != data.cardBackUrl))) {
                    this.cardFront = null;
                    this.cardBack = null;
                    this.shouldDisplayCard = false;
                    this.toggleFrontCardVisibility(false);

                }
                this.data = data;
                this.downloadCardFrontImage();
                this.downloadCardBackImage();
            }
        });

        this.events.subscribe(this.appConstants.EVENT_LOGIN_STATUS_CHANGED, () => {
            this.memberInfo = this.sessionUtils.getMemberInfo();
            if (this.sessionUtils.isUserLoggedIn()) {
                this.updateDisplayExpiryDateStatus();
            } else {
                this.data = null;
                this.cardFront = null;
                this.cardBack = null;
                this.shouldDisplayCard = false;
                this.toggleFrontCardVisibility(false);
            }
        });

        this.events.subscribe(this.appConstants.EVENT_USER_PROFILE_CHANGED, () => {
            this.memberInfo = this.sessionUtils.getMemberInfo();
            this.updateDisplayExpiryDateStatus();
        });
    }

    ngAfterViewInit() {

        this.memberInfo = this.sessionUtils.getMemberInfo();
        this.updateDisplayExpiryDateStatus();

        if (this.walletUtils.hasVirtualCardData()) {

            this.data = this.walletUtils.getWalletContext()[0];

            this.fileService.isFileExists(this.appConstants.WALLET_CARD_FRONT_IMAGE, false,
                () => {
                    this.fileService.dataURL(this.appConstants.WALLET_CARD_FRONT_IMAGE, false)
                        .then((result: string) => {
                            if (result) {
                                this.ngZone.run(() => {
                                    this.cardFront = result;
                                    this.shouldDisplayCard = true;
                                });
                            }
                        });
                }, (error: ServiceErrorInfo) => {
                    if (error && (error.code === this.fileService.FILE_NOT_SUPPORT_ERROR_CODE)) {
                        this.cardFront = this.walletUtils.frontCardImageURL(this.data);
                        this.shouldDisplayCard = true;
                    }
                    else {
                        this.downloadCardFrontImage();
                    }
                });

            this.fileService.isFileExists(this.appConstants.WALLET_CARD_BACK_IMAGE, false,
                () => {
                    this.fileService.dataURL(this.appConstants.WALLET_CARD_BACK_IMAGE, false)
                        .then((result: string) => {
                            if (result) {
                                this.cardBack = result;
                            }
                        });
                }, (error: ServiceErrorInfo) => {
                    if (error && (error.code === this.fileService.FILE_NOT_SUPPORT_ERROR_CODE)) {
                        this.cardBack = this.data.cardBackUrl;
                    }
                    else {
                        this.downloadCardBackImage();
                    }
                });
        }
    }

    swipeEvent(e: any) {
        if ((this.shouldDisplayCard == true) && this.cardFront && this.cardBack) {
            this.toggleFrontCardVisibility(!this.isFrontVisible);
        }
    }

    toggleFrontCardVisibility(value: boolean) {
        this.isFrontVisible = value;
        if (this.changeIsFrontVisible) {
            this.changeIsFrontVisible.emit(value);
        }
    }

    downloadCardFrontImage() {
        let cardFrontUrl = this.walletUtils.frontCardImageURL(this.data);
        if (cardFrontUrl && (cardFrontUrl.length > 0)) {
            this.shouldDisplayIndicator = true;
            this.fileService.downloadFile(cardFrontUrl, this.appConstants.WALLET_CARD_FRONT_IMAGE, false,
                (result: string) => {
                    this.fileService.dataURL(this.appConstants.WALLET_CARD_FRONT_IMAGE, false)
                        .then((result: string) => {
                            if (result) {
                                this.ngZone.run(() => {
                                    this.cardFront = result;
                                    this.shouldDisplayCard = true;
                                });
                            }
                        });
                    this.shouldDisplayIndicator = false;
                }, (error: ServiceErrorInfo) => {
                    console.log('Download card front image error:\n' + JSON.stringify(error));
                    if (error && (error.code === this.fileService.FILE_NOT_SUPPORT_ERROR_CODE)) {
                        this.cardFront = cardFrontUrl;
                        this.shouldDisplayCard = true;
                    }
                    this.shouldDisplayIndicator = false;
                });
        }
    }

    downloadCardBackImage() {
        let cardBackUrl = this.data.cardBackUrl;
        if (cardBackUrl && (cardBackUrl.length > 0)) {
            this.fileService.downloadFile(cardBackUrl, this.appConstants.WALLET_CARD_BACK_IMAGE, false,
                (result: string) => {
                    this.fileService.dataURL(this.appConstants.WALLET_CARD_BACK_IMAGE, false)
                        .then((result: string) => {
                            if (result) {
                                this.cardBack = result;
                            }
                        });
                }, (error: ServiceErrorInfo) => {
                    console.log('Download card back image error:\n' + JSON.stringify(error));
                    if (error && (error.code === this.fileService.FILE_NOT_SUPPORT_ERROR_CODE)) {
                        this.cardBack = cardBackUrl;
                    }
                });
        }
    }

    updateDisplayExpiryDateStatus() {
        let shouldDisplayDate = true;
        let tierCode: string = this.memberInfo.tier;
        if(!this.configUtils.getFlagToHideExpiryDate()) {
            if (!this.clientUtils.isNullOrEmpty(tierCode)) {
                let configTiers: Array<string> = this.configUtils.getTiersToHideExpiryDate();
                for (let index = 0; index < configTiers.length; index++) {
                    if (tierCode.toUpperCase() == configTiers[index].toUpperCase()) {
                        shouldDisplayDate = false;
                        break;
                    }
                }
            }
        }else{
            shouldDisplayDate = false;
        }
       // this.memberInfo.cardExpiryDate = "";
        this.cardExpiryDate = (shouldDisplayDate === true) ? this.memberInfo.cardExpiryDate : null;
    }
}
