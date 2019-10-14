import {Component, Renderer} from '@angular/core';
import {ViewController} from 'ionic-angular';
import {ClientUtils} from '../../utils/commons/client.utils';
import {ConfigUtils} from '../../utils/commons/config.utils';
import {SessionUtils} from '../../utils/commons/session.utils';
import { MemberInfo } from '../../dto/account.dto';
import { GlobalizationUtils } from '../../utils/commons/globalization.utils';
import { ForceUpdateDTO } from '../../dto/force.update.dto';
import { DeviceUtils } from '../../utils/commons/device.utils';
@Component({
    templateUrl: 'forceUpdate.html'
})


export class ForceUpdatePage {
    body: any;
    acceptTerms:any;
    memberInfo: MemberInfo = null;
    consentResponse:any;
    UpdateMessage: string;
    constructor(public viewController: ViewController,
                private configUtils: ConfigUtils,
                private render: Renderer,
                private clientUtils: ClientUtils,
                private sessionUtils: SessionUtils,
                private globalizationUtils: GlobalizationUtils,
                private deviceUtils: DeviceUtils,
            ) {
    }

    ngOnInit() {
        this.addClassToBody();
        this.memberInfo = this.sessionUtils.getMemberInfo();
        this.checkForceUpdateRequired();
    }
    addClassToBody(){
        this.body = document.getElementsByTagName('body')[0];
        this.render.setElementClass(this.body, this.getModalClassName(), true);
    }
      getModalClassName(): string {
        let value: string = 'loginSmallModal-280';
        let rows: number = 0;
        if (rows == 1) {
            value = 'loginSmallModal-320';
        } else if (rows == 2) {
            value = 'loginSmallModal-360';
        } else if (rows == 3) {
            value = 'loginSmallModal-400';
        }
        return value;
    }
    checkForceUpdateRequired() {
        let forceUpdateObj: ForceUpdateDTO = this.configUtils.getForceUpdateObj();
        let langCode = this.globalizationUtils.getAppLanguage();
        if(langCode=='en-US'){
            this.UpdateMessage = forceUpdateObj.updateMsgEN;
        }else if(langCode=='es-ES'){
            this.UpdateMessage = forceUpdateObj.updateMsgES;
        }
    }
    submitButtonTapped(){
        let url: string = this.configUtils.getStoreUrl(this.deviceUtils.getPlatformName());
            this.clientUtils.openWebURL(url);
    }
}