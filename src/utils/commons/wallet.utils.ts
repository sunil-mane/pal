/**
 * Created by sandip on 1/5/17.
 */
import {Injectable} from '@angular/core';
import {Events} from 'ionic-angular';
import {VirtualCardInfo,VirtualCardResponse,QRCodeInfo,QRCodeResponse} from '../../dto/account.dto';
import {ServiceErrorInfo} from '../../dto/common.dto';
import {SessionUtils} from './session.utils';
import {FileService} from '../../services/commons/file.service';
import {DataAccessService} from '../../services/commons/data.access.service';
import {ServiceContext} from '../../services/commons/context.service';
import {ServiceConstants} from '../../constants/service.constants';
import {AppConstants} from '../../constants/app.constants';
import {Response} from "@angular/http";
import {TranslateService} from 'ng2-translate';


@Injectable()
export class WalletUtils {

    constructor(private events: Events,
                private translate: TranslateService,
                private sessionUtils: SessionUtils,
                private fileService: FileService,
                private dataAccessService: DataAccessService,
                private appConstants: AppConstants,
                private serviceConstants: ServiceConstants) {

    }

    getWalletContext(): Array<VirtualCardInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.virtualCards;
        if (!contextObj) {
            contextObj = new Array<VirtualCardInfo>();
        }
        return contextObj;
    }

    saveWalletContext(contextObj: Array<VirtualCardInfo>): void {
        console.log("Wallet  : " + JSON.stringify(contextObj))
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.virtualCards = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaWalletContext(): void {
        let contextObj = new Array<VirtualCardInfo>();
        this.saveWalletContext(contextObj);
    }

    getQRCodeContext(): Array<QRCodeInfo> {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.qrCodes;
        if (!contextObj) {
            contextObj = new Array<QRCodeInfo>();
        }
        return contextObj;
    }

    saveQRCodeContext(contextObj: Array<QRCodeInfo>): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.qrCodes = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaQRCodeContext(): void {
        let contextObj = new Array<QRCodeInfo>();
        this.saveQRCodeContext(contextObj);
    }

    fetchWalletData(successCallback: any, errorCallback: any): void {

        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo = this.sessionUtils.getMemberInfo();
            let requestData = new VirtualCardInfo();
            requestData.cardNumber = memberInfo.activeCardNo;
            requestData.tierCode = memberInfo.tier;

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_WALLET,
                this.serviceConstants.WALLET_SERVICE_NAME_VIRTUAL_CARD,
                requestData);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let shouldPublishEvent: boolean = false;
                    let response: VirtualCardResponse = result.json();
                    if (!response) {
                        response = new VirtualCardResponse();
                        response.data = [];
                    } else if (response.data && response.data.length > 0) {
                        const oldData: Array<VirtualCardInfo> = this.getWalletContext();
                        if (oldData && oldData.length > 0) {
                            const oldCardInfo: VirtualCardInfo = oldData[0];
                            const cardInfo: VirtualCardInfo = response.data[0];
                            shouldPublishEvent = ((this.frontCardImageURL(oldCardInfo) != this.frontCardImageURL(cardInfo)) ||
                                (oldCardInfo.cardBackUrl != cardInfo.cardBackUrl));
                        } else {
                            shouldPublishEvent = true;
                        }
                    }
                    if (shouldPublishEvent === true) {
                        this.saveWalletContext(response.data);
                        this.events.publish(this.appConstants.EVENT_WALLET_INFO_CHANGED);
                    }
                    if (successCallback) {
                        successCallback(response);
                    }
                }, (error: Response) => {
                    let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                    if (error) {
                        errorInfo = error.json();
                        errorInfo.code = error.status;
                    }
                    if (errorCallback) {
                        errorCallback(errorInfo);
                    }
                    if (errorInfo.code == 401) {
                        this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                    }
                });
        }
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = this.translate.instant('YOU_ARE_NOT_LOGGED_IN');
                errorCallback(error);
            }
        }
    }

    fetchQRCodeData(successCallback: any, errorCallback: any): void {

        if (this.sessionUtils.isUserLoggedIn()) {

            let memberInfo = this.sessionUtils.getMemberInfo();
            let requestData = new QRCodeInfo();
            requestData.memberUid = memberInfo.memUID;
            requestData.cardNumber = memberInfo.activeCardNo;

            let serviceContext: ServiceContext = new ServiceContext(
                this.serviceConstants.SERVICE_CONTEXT_NAME_WALLET,
                this.serviceConstants.WALLET_SERVICE_NAME_QR_CODE,
                requestData);

            this.dataAccessService.call(serviceContext)
                .subscribe((result: Response) => {
                    let response: QRCodeResponse = result.json();
                    if (!response) {
                        response = new QRCodeResponse();
                        response.data = [];
                    }
                    this.saveQRCode(response.data,
                        (isSaved: boolean) => {
                            if (isSaved) {
                                if (successCallback) {
                                    successCallback(response);
                                }
                            }
                            else {
                                if (errorCallback) {
                                    let error = new ServiceErrorInfo();
                                    error.message = this.translate.instant('INVALID_QR_CODE');
                                    errorCallback(error);
                                }
                            }
                        });
                }, (error: Response) => {
                    let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                    if (error) {
                        errorInfo = error.json();
                        errorInfo.code = error.status;
                    }
                    if (errorCallback) {
                        errorCallback(errorInfo);
                    }
                    if (errorInfo.code == 401) {
                        this.events.publish(this.appConstants.EVENT_USER_SESSION_EXPIRED);
                    }
                });
        }
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = this.translate.instant('YOU_ARE_NOT_LOGGED_IN');
                errorCallback(error);
            }
        }
    }

    saveQRCode(qrCodeData: Array<QRCodeInfo>, callback: any): void {
        if (qrCodeData && (qrCodeData.length > 0)) {
            let qrCodeAsByte = qrCodeData[0].qrCodeAsByte;
            if (qrCodeAsByte && (qrCodeAsByte.length > 0)) {
                let base64String = 'data:image/jpg;base64,' + qrCodeAsByte;
                let base64Blob = this.base64toBlob(base64String);
                if (base64Blob) {
                    this.fileService.writeFile(base64Blob, this.appConstants.WALLET_QR_CODE_IMAGE, false,
                        (result: boolean) => {
                            if (result != true) {
                                this.saveQRCodeContext(qrCodeData);
                            }
                            callback(true);
                        });
                }
                else {
                    this.saveQRCodeContext(qrCodeData);
                    callback(true);
                }
            }
            else {
                callback(false);
            }
        }
        else {
            callback(false);
        }
    }

    base64toBlob(imageData: string) {
        let byteString = '';
        let dataURIArray: Array<any> = imageData.split( ',' );
        if ( dataURIArray[ 0 ].indexOf( 'base64' ) >= 0 ) {
            byteString = atob( dataURIArray[ 1 ] );
        } else {
            byteString = decodeURI( dataURIArray[ 1 ] );
        }
        let mimeString = dataURIArray[ 0 ].split( ':' )[ 1 ].split( ';' )[ 0 ];
        let ia = new Uint8Array( byteString.length );
        for ( let i = 0 ; i < byteString.length ; i++ ) {
            ia[ i ] = byteString.charCodeAt( i );
        }
        let fileAfter = new Blob( [ ia ] , { type : mimeString } );
        return fileAfter;
    }

    frontCardImageURL(cardInfo: VirtualCardInfo): string {
        let cardFrontUrl: string = cardInfo.cardFrontUrl;
        if (cardFrontUrl) {
            if (cardInfo.isUsable == 'Y') {
                let extension = cardFrontUrl.split('.').pop();
                if (extension && extension.length > 0) {
                    let searchString = '.' + extension;
                    let replaceString = this.appConstants.WALLET_CARD_FRONT_MASTER_IMAGE_NAME + '.' + extension;
                    cardFrontUrl = cardFrontUrl.replace(searchString, replaceString);
                }
            }
            let memberInfo = this.sessionUtils.getMemberInfo();
            if (memberInfo.tier === 'MIN') {
                let suffix: string = (memberInfo.gender === 'F') ? '-F' : '-M';
                let extension = cardFrontUrl.split('.').pop();
                if (extension && extension.length > 0) {
                    let searchString = '.' + extension;
                    let replaceString = suffix + '.' + extension;
                    cardFrontUrl = cardFrontUrl.replace(searchString, replaceString);
                }
            }
        }
        return cardFrontUrl;
    }

    removeWalletImages() {
        this.fileService.removeFile(this.appConstants.WALLET_CARD_FRONT_IMAGE, false,
            (result1: boolean) => {
                this.fileService.removeFile(this.appConstants.WALLET_CARD_BACK_IMAGE, false,
                    (result2: boolean) => {
                        this.fileService.removeFile(this.appConstants.WALLET_QR_CODE_IMAGE, false, null);
                    });
            });
    }

    hasVirtualCardData(): boolean {
        let virtualCards = this.getWalletContext();
        return (virtualCards && (virtualCards.length > 0));
    }
}
