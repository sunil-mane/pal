/**
 * Created by sandip on 1/23/17.
 */
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {ServiceConstants} from '../../constants/service.constants';
import {AppConstants} from '../../constants/app.constants';
import {OfferUtils} from './offer.utils';
import {PartnerUtils} from './partner.utils';
import {ConfigUtils} from './config.utils';
import {LocationNotificationUtils} from './location-notification.utils';
import {MenuUtils} from './menu.utils';
import {UserUtils} from './user.utils';
import {WalletUtils} from './wallet.utils';
import {SessionUtils} from './session.utils';
import {TargetUtils} from './target.utils';
import {TransactionUtils} from './transaction.utils';
import {ClientUtils} from './client.utils';
import {NetworkService} from '../../services/commons/network.service';


@Injectable()
export class SyncDataUtils {

    private timer: any = null;

    constructor(private serviceConstants: ServiceConstants,
                private appConstants: AppConstants,
                private offerUtils: OfferUtils,
                private partnerUtils: PartnerUtils,
                private configUtils: ConfigUtils,
                private locationNotificationUtils: LocationNotificationUtils,
                private menuUtils: MenuUtils,
                private userUtils: UserUtils,
                private walletUtils: WalletUtils,
                private sessionUtils: SessionUtils,
                private targetUtils: TargetUtils,
                private transactionUtils: TransactionUtils,
                private clientUtils: ClientUtils,
                private networkService: NetworkService) {

    }

    getLastSyncDate(): string {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.lastSyncDate;
        if (!contextObj) {
            return null;
        }
        return contextObj;
    }

    saveLastSyncDate(contextObj: string): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.lastSyncDate = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    cleaLastSyncDate(): void {
        let contextObj = null;
        this.saveLastSyncDate(contextObj);
    }

    startTimer() {
        if (this.timer == null) {
            this.timer = Observable.timer(60000, 60000);
            this.timer.subscribe(t => {
                this.checkLastSyncStatus();
            });
        }
    }

    checkLastSyncStatus(): void {
        let lastSyncDate = this.getLastSyncDate();
        if (lastSyncDate) {
            if (this.timer) {
                let diffHours = Math.abs(this.clientUtils.getDateTimeDiff(lastSyncDate)) / 3600;
                let interval = this.configUtils.getBulkDataSyncInterval();
                if ((diffHours >= interval) && this.networkService.isOnline()) {
                    let nowDate = new Date();
                    this.saveLastSyncDate(nowDate.toDateString() + ' ' + nowDate.toTimeString());
                    this.fireSyncRequests();
                }
            }
        }
        else {
            let nowDate = new Date();
            this.saveLastSyncDate(nowDate.toDateString() + ' ' + nowDate.toTimeString());
        }
    }

    fireSyncRequests() {
        this.configUtils.fetchAppConfig(null, null);
        this.menuUtils.fetchMenuData(null, null);
        this.userUtils.fetchProfile(null, null);
        this.targetUtils.fetchMyTargets(null, null);
        this.walletUtils.fetchWalletData(null, null);
        this.walletUtils.fetchQRCodeData(null, null);
        this.offerUtils.fetchOffersNearBy(null, null);
        this.offerUtils.fetchRecommendedOffers(null, null);
        this.offerUtils.fetchFavoriteOffers(null, null);
        this.partnerUtils.fetchFeaturedPartners(null, null);
        this.partnerUtils.fetchPartnerLocationsNearBy(null, null);
        this.partnerUtils.fetchFavoritePartnerLocations(null, null);
        this.locationNotificationUtils.fetchLocationNotifications(null, null);
        this.transactionUtils.fetchRecentTransactions(null, null);
        this.menuUtils.getTermsAndCondition(null, null);
    }

    processSyncCode(notifCode: string) {
        if (notifCode === this.serviceConstants.NOTIF_CODE_SYNC_OFFER) {
            this.offerUtils.fetchOffersNearBy(null, null);
            this.offerUtils.fetchRecommendedOffers(null, null);
            this.offerUtils.fetchFavoriteOffers(null, null);
        } else if (notifCode === this.serviceConstants.NOTIF_CODE_SYNC_PTNR) {
            this.partnerUtils.fetchFeaturedPartners(null, null);
        } else if (notifCode === this.serviceConstants.NOTIF_CODE_SYNC_PTNR_LOC) {
            this.partnerUtils.fetchPartnerLocationsNearBy(null, null);
            this.partnerUtils.fetchFavoritePartnerLocations(null, null);
        } else if (notifCode === this.serviceConstants.NOTIF_CODE_SYNC_CONF_PARAM) {
            this.configUtils.fetchAppConfig(null, null);
        } else if (notifCode === this.serviceConstants.NOTIF_CODE_SYNC_LOC_NOT) {
            this.locationNotificationUtils.fetchLocationNotifications(null, null);
        } else if (notifCode === this.serviceConstants.NOTIF_CODE_SYNC_MENU) {
            this.menuUtils.fetchMenuData(null, null);
        } else if (notifCode === this.serviceConstants.NOTIF_CODE_SYNC_TARGET) {
            this.targetUtils.fetchMyTargets(null, null);
        } else if (notifCode === this.serviceConstants.NOTIF_CODE_SYNC_PROFILE) {
            this.userUtils.fetchProfile(null, null);
            this.walletUtils.fetchWalletData(null, null);
            this.walletUtils.fetchQRCodeData(null, null);
            this.transactionUtils.fetchRecentTransactions(null, null);
        } else if (notifCode === this.serviceConstants.NOTIF_CODE_SYNC_TERMS) {
            this.menuUtils.getTermsAndCondition(null, null);
        }
    }

    processPageCode(pageCode: string): Promise<boolean> {
        return new Promise(resolve => {
            if (this.networkService.isOnline()) {
                if (pageCode === this.appConstants.GUEST_HOME_SCREEN) {
                    this.offerUtils.fetchOffersNearBy(null, null);
                    this.partnerUtils.fetchPartnerLocationsNearBy(null, null);
                    this.offerUtils.fetchRecommendedOffers(null, null);
                    this.partnerUtils.fetchFeaturedPartners(
                        () => {
                            setTimeout(() => {
                                resolve(true);
                            }, 2000);
                        }, () => {
                            setTimeout(() => {
                                resolve(false);
                            }, 2000);
                        });
                } else if (pageCode === this.appConstants.USER_HOME_SCREEN) {
                    this.offerUtils.fetchOffersNearBy(null, null);
                    this.partnerUtils.fetchPartnerLocationsNearBy(null, null);
                    this.offerUtils.fetchRecommendedOffers(null, null);
                    this.partnerUtils.fetchFeaturedPartners(null, null);
                    this.walletUtils.fetchWalletData(null, null);
                    this.walletUtils.fetchQRCodeData(null, null);
                    this.transactionUtils.fetchRecentTransactions(null, null);
                    this.userUtils.fetchProfile(
                        () => {
                            setTimeout(() => {
                                resolve(true);
                            }, 2000);
                        }, () => {
                            setTimeout(() => {
                                resolve(false);
                            }, 2000);
                        });
                } else if (pageCode === this.appConstants.VIRTUAL_CARD_SCREEN) {
                    this.userUtils.fetchProfile(
                        () => {
                            this.walletUtils.fetchWalletData(
                                () => {
                                    setTimeout(() => {
                                        resolve(true);
                                    }, 2000);
                                }, () => {
                                    setTimeout(() => {
                                        resolve(false);
                                    }, 2000);
                                });
                        }, () => {
                            this.walletUtils.fetchWalletData(
                                () => {
                                    setTimeout(() => {
                                        resolve(true);
                                    }, 2000);
                                }, () => {
                                    setTimeout(() => {
                                        resolve(false);
                                    }, 2000);
                                });
                        });
                    this.walletUtils.fetchQRCodeData(null, null);
                    this.transactionUtils.fetchRecentTransactions(null, null);
                } else if (pageCode === this.appConstants.MY_PROFILE_SCREEN) {
                    this.targetUtils.fetchMyTargets(null, null);
                    this.offerUtils.fetchFavoriteOffers(null, null);
                    this.partnerUtils.fetchFavoritePartnerLocations(null, null);
                    this.transactionUtils.fetchRecentTransactions(null, null);
                    this.walletUtils.fetchWalletData(null, null);
                    this.walletUtils.fetchQRCodeData(null, null);
                    this.userUtils.fetchProfile(
                        () => {
                            setTimeout(() => {
                                resolve(true);
                            }, 2000);
                        }, () => {
                            setTimeout(() => {
                                resolve(false);
                            }, 2000);
                        });
                }
            } else {
                resolve(false);
            }
        });
    }

    fireProfileRequests() {
        this.userUtils.fetchProfile(null, null);
        this.walletUtils.fetchWalletData(null, null);
        this.transactionUtils.fetchRecentTransactions(null, null);
    }

}
