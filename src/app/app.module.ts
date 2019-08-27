//Core components
import {NgModule, ErrorHandler, enableProdMode} from '@angular/core';
enableProdMode();

import {Http} from '@angular/http';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {FormsModule} from "@angular/forms";


//3rd party components
import {RoundProgress} from '../libs/angular-svg-round-progressbar/round-progress';
import {MyTranslateLoader} from '../translate/translate.service';
import {TranslateModule, TranslateLoader, TranslateService} from 'ng2-translate';
import {Ng2CompleterModule} from "ng2-completer";

//Services
import {DataAccessService} from '../services/commons/data.access.service';
import {CustomHttpService} from '../services/commons/http.service';
import {StorageService} from '../services/commons/storage.service';
import {OfferService} from '../services/offer/offer.service';
import {MenuService} from '../services/menu/menu.services';
import {ProfileService} from '../services/account/profile.service';
import {WalletService} from '../services/wallet/wallet.service';
import {MyTargetsService} from '../services/target/mytargets.service';
import {PartnerService} from '../services/partners/partner.service';
import {ConfigService} from '../services/configuration/config.service';
import {FavouritesService} from '../services/favourites/favourites.services';
import {IndustryTypesService} from '../services/industrytypes/industrytypes.services';
import {RemoteNotificationService} from '../services/commons/remote-notification.service';
import {DeviceService} from '../services/commons/device.service';
import {GeolocationService} from '../services/commons/geolocation.service';
import {SocialSharingService} from '../services/commons/social-sharing.service';
import {MessageContentService} from '../services/commons/message-content.service';
import {SystemQueryService} from '../services/commons/system-query.service';
import {GoogleAnalyticService} from '../services/commons/google-analytics.service';
import {LocationNotificationService} from '../services/locationNotification/location-notification.service';
import {LocalNotificationService} from '../services/commons/local-notification.service';
import {NetworkService} from '../services/commons/network.service';
import {ConfigurationUtils} from '../utils/commons/configuration.utils';
import {FileService} from '../services/commons/file.service';
import {SafariViewService} from '../services/commons/safari-view-controller.service';
import {InAppBrowserService} from '../services/commons/in-app-browser.service';
import {GlobalizationService} from '../services/commons/globalization.service';
import {AppVersionService} from '../services/commons/app-version.service';
import {LovItemService} from '../services/lovItem/lov-item.service';
import {FacebookConnectService} from '../services/commons/facebook-connect.service';

//Utils
import {ClientUtils} from '../utils/commons/client.utils';
import {SessionUtils} from '../utils/commons/session.utils';
import {ConfigUtils} from '../utils/commons/config.utils';
import {MenuUtils} from '../utils/commons/menu.utils';
import {WalletUtils} from '../utils/commons/wallet.utils';
import {OfferUtils} from '../utils/commons/offer.utils';
import {PartnerUtils} from '../utils/commons/partner.utils';
import {TargetUtils} from '../utils/commons/target.utils';
import {DeviceUtils} from '../utils/commons/device.utils';
import {SocialSharingUtils} from '../utils/commons/social-sharing.utils';
import {TransactionUtils} from '../utils/commons/transaction.utils';
import {UserAddressUtils} from '../utils/commons/user-address.utils';
import {GlobalizationUtils} from '../utils/commons/globalization.utils';
import {LocationNotificationUtils} from '../utils/commons/location-notification.utils';
import {UserUtils} from '../utils/commons/user.utils';
import {GoogleAnalyticsUtils} from '../utils/commons/google-analytics.utils';
import {SyncDataUtils} from '../utils/commons/sync-data.utils';
import {LovItemUtils} from '../utils/commons/lov-item.utils';

//Constants
import {AppConstants} from '../constants/app.constants';
import {ServiceConstants} from '../constants/service.constants';
import {LanguageConstants} from '../constants/language.constants';

//Pages
import {mEngageApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {LoginPage} from '../pages/login/login';
import {TabsPage} from '../pages/tabs/tabs'
import {MyWalletPage} from '../pages/mywallet/wallet'
import {SearchPage} from '../pages/search/search'
import {ProfilePage} from '../pages/profile/profile';
import {OffersPage} from '../pages/offers/offers';
import {TermsPage} from '../pages/terms/terms';
import {OffersPopupPage} from '../pages/widgets/offers-popup/offers-popup';
import {TargetPopupPage} from '../pages/widgets/target-popup/target';
import {FilterPopupPage} from '../pages/widgets/filters-popup/filter';
import {OfflinePopupPage} from '../pages/widgets/offline-popup/offline-popup';
import {QrCodePage} from '../pages/mywallet/qrcode/qrcode';
import {FullScreenPage} from '../pages/mywallet/fullscreen/fullscreen';
import {LocationPage} from '../pages/home/location/location';
import {SettingsPage} from '../pages/settings/settings';
import {MyTargetsPage} from '../pages/mytargets/my-targets';
import {MyTargetsAllPage} from '../pages/mytargetsall/my-targets-all';
import {PartnersPage} from '../pages/partners/partners';
import {PartnersListPage} from '../pages/partners-list/partner-list';
import {EnrollmentPage} from '../pages/enrollment/enrollment';
import {MilesCalculatorPage} from '../pages/mcalculator/mcalculator';
import {FilterMilesCalculator} from '../pages/widgets/filters-mcalculator/filters-mcalculator';
import {TutorialPage} from '../pages/tutorial/tutorial';
import {TncPage} from '../pages/tnc/tnc';
import {ForceUpdatePage} from '../pages/forceUpdate/forceUpdate';
//Components
import {Swiper} from '../pages/widgets/swiper/swiper';
import {LoginCardComponent} from '../pages/widgets/logincard/login';
import {PartnersCardComponent} from '../pages/widgets/partners/partners';
import {LoggedInCardComponent} from '../pages/widgets/loggedin/loggedin';
import {McfLoaderService} from '../services/commons/service.loading';
import {ExpandableComponent} from '../pages/widgets/expandable/expandable';
import {ExpandableLocationComponent} from '../pages/widgets/expandable-location/expandable-location';
import {VirtualCardComponent} from '../pages/widgets/virtual-card/virtual-card';
import {PersonalTargetComponent} from '../pages/widgets/personal-target/personal-target';
import {PersonalTargetListComponent} from '../pages/widgets/personal-target-list/personal-target-list';
import {PartnersDetailHeaderComponent} from '../pages/widgets/partners-detail-header-card/partners-detail-header';
import { MyVouchers } from '../pages/myvouchers/my-vouchers';


//Directives
//import { ParallaxHeaderDirective } from '../components/parallax-header/parallax-header';

@NgModule({
    declarations: [
        TutorialPage,
        TncPage,
        ForceUpdatePage,
        mEngageApp,
        HomePage,
        Swiper,
        LoginCardComponent,
        PartnersCardComponent,
        LoggedInCardComponent,
        ExpandableComponent,
        ExpandableLocationComponent,
        VirtualCardComponent,
        PersonalTargetComponent,
        PersonalTargetListComponent,
        PartnersDetailHeaderComponent,
        LoginPage,
        TabsPage,
        MyWalletPage,
        SearchPage,
        ProfilePage,
        OffersPage,
        OffersPopupPage,
        TargetPopupPage,
        FilterPopupPage,
        OfflinePopupPage,
        PartnersPage,
        PartnersListPage,
        TermsPage,
        QrCodePage,
        FullScreenPage,
        LocationPage,
        SettingsPage,
        MyTargetsPage,
        MyTargetsAllPage,
        MyVouchers,
        EnrollmentPage,
        MilesCalculatorPage,
        FilterMilesCalculator
    ],
    imports: [
        RoundProgress,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (MyTranslateLoader),
            deps: [Http]
        }),
        IonicModule.forRoot(mEngageApp, {
            pageTransition: 'ios',

        }, {
            links: [
                {component: TutorialPage, name: 'tutorial', segment: 'tutorial'},
                {component: HomePage, name: 'Home', segment: 'home'},
                {component: MyWalletPage, name: 'Wallet', segment: 'wallet'},
                {component: SearchPage, name: 'Search', segment: 'search'},
                {component: ProfilePage, name: 'ProfilePage', segment: 'profile', defaultHistory: [mEngageApp]},
                {component: OffersPage, name: 'OffersPage', segment: 'offers/:type/:id', defaultHistory: [mEngageApp]},
                {
                    component: TermsPage,
                    name: 'TermsPage',
                    segment: 'terms-and-conditions',
                    defaultHistory: [mEngageApp]
                },
                {component: SettingsPage, name: 'SettingsPage', segment: 'app-settings', defaultHistory: [mEngageApp]},
                {
                    component: MyTargetsAllPage,
                    name: 'MyTargetsAllPage',
                    segment: 'targets/:pageUrl',
                    defaultHistory: [mEngageApp]
                },
                {
                    component: MyVouchers,
                    name: 'MyVouchers',
                    segment: 'vouchers/:pageUrl',
                    defaultHistory: [mEngageApp]
                },
                {
                    component: PartnersPage,
                    name: 'PartnersPage',
                    segment: 'partner/:pageUrl',
                    defaultHistory: [mEngageApp]
                },
                {
                    component: PartnersListPage,
                    name: 'PartnersListPage',
                    segment: 'Partners-list/:pageUrl',
                    defaultHistory: [mEngageApp]
                },
                {
                    component: EnrollmentPage,
                    name: 'EnrollmentPage',
                    segment: 'enrollment',
                    defaultHistory: [mEngageApp]
                },
                {
                    component: MilesCalculatorPage,
                    name: 'MilesCalculatorPage',
                    segment: 'miles-calculator',
                    defaultHistory: [mEngageApp]
                }
            ]
        }),
        Ng2CompleterModule,
        FormsModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        TutorialPage,
        TncPage,
        ForceUpdatePage,
        mEngageApp,
        HomePage,
        Swiper,
        LoginPage,
        TabsPage,
        MyWalletPage,
        SearchPage,
        ProfilePage,
        OffersPage,
        OffersPopupPage,
        TargetPopupPage,
        FilterPopupPage,
        OfflinePopupPage,
        PartnersPage,
        PartnersListPage,
        TermsPage,
        QrCodePage,
        FullScreenPage,
        LocationPage,
        SettingsPage,
        MyTargetsPage,
        MyTargetsAllPage,
        MyVouchers,
        EnrollmentPage,
        MilesCalculatorPage,
        FilterMilesCalculator
    ],
    providers: [
        {
            provide: ErrorHandler,
            useClass: IonicErrorHandler
        },
        DataAccessService,
        CustomHttpService,
        StorageService,
        OfferService,
        MenuService,
        ProfileService,
        McfLoaderService,
        MyTargetsService,
        PartnerService,
        ConfigService,
        DeviceService,
        WalletService,
        FavouritesService,
        IndustryTypesService,
        MessageContentService,
        LocationNotificationService,
        MessageContentService,
        SystemQueryService,
        LocalNotificationService,
        RemoteNotificationService,
        GeolocationService,
        SocialSharingService,
        GoogleAnalyticService,
        NetworkService,
        FileService,
        SafariViewService,
        InAppBrowserService,
        GlobalizationService,
        AppVersionService,
        LovItemService,
        FacebookConnectService,
        ClientUtils,
        SessionUtils,
        ConfigUtils,
        ConfigurationUtils,
        MenuUtils,
        WalletUtils,
        OfferUtils,
        PartnerUtils,
        TargetUtils,
        DeviceUtils,
        SocialSharingUtils,
        TransactionUtils,
        UserAddressUtils,
        GlobalizationUtils,
        LocationNotificationUtils,
        UserUtils,
        GoogleAnalyticsUtils,
        SyncDataUtils,
        LovItemUtils,
        AppConstants,
        ServiceConstants,
        LanguageConstants
    ]
})
export class AppModule {
    constructor(public translate: TranslateService,
                private globalizationUtils: GlobalizationUtils) {
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.addLangs([this.globalizationUtils.DEVICE_LANGUAGE_EN_US,
                            this.globalizationUtils.DEVICE_LANGUAGE_ES_ES
                            ]);
        translate.setDefaultLang(this.globalizationUtils.DEVICE_LANGUAGE_EN_US);
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(this.globalizationUtils.getAppLanguage());
    }
}
