/**
 * Created by sandip on 1/16/17.
 */
import {Injectable} from '@angular/core';
import {Events} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {AppConstants} from '../../constants/app.constants';
import {SessionUtils} from './session.utils';
import {LanguageInfo, ServiceErrorInfo} from '../../dto/common.dto';
import {GlobalizationService} from '../../services/commons/globalization.service';

@Injectable()
export class GlobalizationUtils {

    public DEVICE_LANGUAGE_EN_US = 'en-US';
    public DEVICE_LANGUAGE_ES_ES = 'es-ES';

    constructor(private sessionUtils: SessionUtils,
                private events: Events,
                private translate: TranslateService,
                private appConstants: AppConstants,
                private globalizationService: GlobalizationService) {

    }

    getAppLanguage(): string {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.deviceLanguage;
        if (!contextObj || (contextObj == null) || (contextObj == '')) {
            return this.DEVICE_LANGUAGE_EN_US;
        }
        return contextObj;
    }

    saveAppLanguage(contextObj: string): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.deviceLanguage = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearAppLanguage(): void {
        let contextObj = this.DEVICE_LANGUAGE_EN_US;
        this.saveAppLanguage(contextObj);
    }

    getUserChangedAppLanguageSettings(): string {
        let rootContext = this.sessionUtils.getRootContext();
        let contextObj = rootContext.userChangedAppLanguageSettings;
        if (!contextObj || (contextObj == null) || (contextObj == '')) {
            return 'N';
        }
        return contextObj;
    }

    saveUserChangedAppLanguageSettings(contextObj: string): void {
        let rootContext = this.sessionUtils.getRootContext();
        rootContext.userChangedAppLanguageSettings = contextObj;
        this.sessionUtils.saveRootContext(rootContext);
    }

    clearUserChangedAppLanguageSettings(): void {
        let contextObj = 'N';
        this.saveUserChangedAppLanguageSettings(contextObj);
    }

    getAvailableLanguages(): Array<LanguageInfo> {

        let languageList: Array<LanguageInfo> = [];

        let language1 = new LanguageInfo();
        language1.description = 'English';
        language1.code = this.DEVICE_LANGUAGE_EN_US;
        languageList.push(language1);

        let language2 = new LanguageInfo();
        language2.description = 'Español';
        language2.code = this.DEVICE_LANGUAGE_ES_ES;
        languageList.push(language2);

        return languageList;
    }

    setDeviceLanguage(): void {
        this.globalizationService.getPreferredLanguage(
            (language: string) => {
                this.updateAppLanguage(language ? language : this.DEVICE_LANGUAGE_EN_US);
            },
            (error: ServiceErrorInfo) => {
                console.log('Failed to get device language:\n' + JSON.stringify(error));
                this.updateAppLanguage(this.DEVICE_LANGUAGE_EN_US);
            });
    }

    updateAppLanguage(language: string): void {
        let languageCode: string = this.DEVICE_LANGUAGE_EN_US;
        if (language.toLocaleLowerCase().includes('es')) {
            languageCode = this.DEVICE_LANGUAGE_ES_ES;
        }
        if (languageCode != this.getAppLanguage()) {
            this.saveAppLanguage(languageCode);
            this.translate.use(languageCode);
            this.events.publish(this.appConstants.EVENT_APP_LANGUAGE_CHANGED);
        }
    }
}