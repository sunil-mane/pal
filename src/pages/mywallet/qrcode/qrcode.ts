import {Component,NgZone} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {AppConstants} from '../../../constants/app.constants';
import {FileService} from '../../../services/commons/file.service';
import {WalletUtils} from '../../../utils/commons/wallet.utils';
import {ServiceErrorInfo} from '../../../dto/common.dto';
import {McfLoaderService} from '../../../services/commons/service.loading';
import {QRCodeResponse} from "../../../dto/account.dto";
import {ClientUtils} from '../../../utils/commons/client.utils';


@Component({
  templateUrl: 'qrcode.html'
})
export class QrCodePage {

  cardData: any = null;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewController: ViewController,
              public clientUtils: ClientUtils,
              private ngZone: NgZone,
              private googleAnalyticsUtils: GoogleAnalyticsUtils,
              private fileService: FileService,
              private walletUtils: WalletUtils,
              private appConstants: AppConstants,
              private translate: TranslateService,
              private mcfLoadService: McfLoaderService) {
  }

  ngOnInit() {
      this.googleAnalyticsUtils.trackPage(this.appConstants.QR_CODE_SCREEN);
  }

  ngAfterViewInit() {

      this.fileService.isFileExists(this.appConstants.WALLET_QR_CODE_IMAGE, false,
          () => {
              this.fileService.dataURL(this.appConstants.WALLET_QR_CODE_IMAGE, false)
                  .then((result: string) => {
                      if (result) {
                          this.ngZone.run(() => {
                              this.cardData = result;
                          });
                      }
                  });
          }, (error: ServiceErrorInfo) => {
              let qrCodes = this.walletUtils.getQRCodeContext();
              if (qrCodes && (qrCodes.length > 0)) {
                  let qrcodeInfo = qrCodes[0];
                  if (qrcodeInfo && qrcodeInfo.qrCodeAsByte) {
                      this.cardData = 'data:image/jpg;base64,' + qrcodeInfo.qrCodeAsByte;
                  }
              }
              if (this.cardData == null) {
                  setTimeout(() => {
                      this.downloadQRCodeInfo();
                  }, 1000);
              }
          });
  }

  downloadQRCodeInfo() {
    this.mcfLoadService.show('');
    this.walletUtils.fetchQRCodeData(
        (result: QRCodeResponse) => {
          this.fileService.isFileExists(this.appConstants.WALLET_QR_CODE_IMAGE, false,
              () => {
                this.fileService.dataURL(this.appConstants.WALLET_QR_CODE_IMAGE, false)
                    .then((result: string) => {
                        if (result) {
                            this.ngZone.run(() => {
                                this.cardData = result;
                            });
                        }
                      this.mcfLoadService.hide();
                    });
              }, (error: ServiceErrorInfo) => {
                let qrCodes = this.walletUtils.getQRCodeContext();
                if (qrCodes && (qrCodes.length > 0)) {
                  let qrcodeInfo = qrCodes[0];
                  if (qrcodeInfo && qrcodeInfo.qrCodeAsByte) {
                    this.cardData = 'data:image/jpg;base64,' + qrcodeInfo.qrCodeAsByte;
                  }
                }
                this.mcfLoadService.hide();
              });
        }, (error: ServiceErrorInfo) => {
          console.log('Fetch QR code data error:\n' + JSON.stringify(error));
          this.mcfLoadService.hide();
            let msg = '';
            if (error && error.message && (error.message.trim().length > 0)) {
                msg = error.message.trim();
            } else {
                msg = this.translate.instant('SOMETHING_WENT_WRONG');
            }
            this.clientUtils.showToast(msg);
        });
  }

  dismiss() {
    this.viewController.dismiss();
  }

}
