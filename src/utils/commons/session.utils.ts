import {Injectable} from '@angular/core';
import {StorageService} from '../../services/commons/storage.service';
import {SessionRootInfo} from '../../dto/session.dto';
import {MemberInfo} from '../../dto/account.dto';

@Injectable()
export class SessionUtils {

    private contextKey: string  = "SESSION_ROOT_CONTEXT";
    private tutorialKey: string  = "TUTORIAL_CONTEXT";
    private voucherKey: string = "VOUCHERS_TAB_FLAG";
    constructor(private storageService: StorageService) {

    }

    getRootContext(): SessionRootInfo {
        let contextObj = this.storageService.getObject(this.contextKey);
        if (!contextObj) {
            contextObj = new SessionRootInfo();
        }
        return contextObj;
    }

    saveRootContext(contextObj: SessionRootInfo): void {
        this.storageService.setObject(this.contextKey, contextObj);
    }

    clearRootContext(): void {
        let contextObj = new SessionRootInfo();
        this.saveRootContext(contextObj);
    }

    getAccessToken(): string {
        let accessToken: string = null;
        let userProfile = this.getMemberInfo();
        if (userProfile && userProfile.accessToken) {
            accessToken = userProfile.accessToken;
        }
        return accessToken;
    }

    isUserLoggedIn(): boolean{
        return (this.getAccessToken() != null);
    }

    getMemberInfo(): MemberInfo {
        let rootContext = this.getRootContext();
        let contextObj = rootContext.memberInfo;
        if (!contextObj) {
            contextObj = new MemberInfo();
        }
        return contextObj;
    }
    setTutorialFlag(value){
        this.storageService.setObject(this.tutorialKey, value);
    }
    getTutorialFlag(){
        return this.storageService.getObject(this.tutorialKey);
    }

    getVoucherFlag() {
        let rootContext = this.getRootContext();
        let configs = {};
        rootContext.configs.forEach(
            config => {
                configs[config.code] = config.value
            }
        );
        if(configs[this.voucherKey] && configs[this.voucherKey] == 'Y'){
            return true;
        } else {
            return false;
        }
    }
}
