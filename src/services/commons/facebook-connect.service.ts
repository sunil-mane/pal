/**
 * Created by sandip on 17/04/17.
 */
import {Injectable} from '@angular/core';
import {ServiceErrorInfo} from "../../dto/common.dto";


declare let cordova: any;
declare let facebookConnectPlugin: any;

export class FacebookAuthResponse {
    session_key: boolean;
    accessToken: string;
    expiresIn: number;
    sig: string;
    secret: string;
    userID: string;
}

class FacebookLoginResponse {
    authResponse: FacebookAuthResponse;
    status: string;
}

@Injectable()
export class FacebookConnectService {

    constructor() {

    }

    login(): Promise<FacebookAuthResponse|ServiceErrorInfo> {
        return new Promise<FacebookAuthResponse|ServiceErrorInfo>((resolve, reject) => {
            if ((typeof cordova !== 'undefined') && facebookConnectPlugin) {
                let permissions = ['public_profile', 'email'];
                facebookConnectPlugin.login(permissions,
                    (userData: FacebookLoginResponse) => {
                        if (userData.status == 'connected') {
                            resolve(userData.authResponse);
                        } else {
                            let error = new ServiceErrorInfo();
                            error.message = userData.status;
                            reject(error);
                        }
                    },
                    (err: string) => {
                        let error = new ServiceErrorInfo();
                        error.message = err;
                        reject(error);
                    });
            } else {
                let error = new ServiceErrorInfo();
                error.message = 'Platform does not support';
                reject(error);
            }
        });
    }

    getLoginStatus(): Promise<FacebookAuthResponse|ServiceErrorInfo> {
        return new Promise<FacebookAuthResponse|ServiceErrorInfo>((resolve, reject) => {
            if ((typeof cordova !== 'undefined') && facebookConnectPlugin) {
                facebookConnectPlugin.getLoginStatus(
                    (userData: FacebookLoginResponse) => {
                        if (userData.status == 'connected') {
                            resolve(userData.authResponse);
                        } else {
                            let error = new ServiceErrorInfo();
                            error.message = userData.status;
                            reject(error);
                        }
                    },
                    (err: string) => {
                        let error = new ServiceErrorInfo();
                        error.message = err;
                        reject(error);
                    });
            } else {
                let error = new ServiceErrorInfo();
                error.message = 'Platform does not support';
                reject(error);
            }
        });
    }

    logout(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if ((typeof cordova !== 'undefined') && facebookConnectPlugin) {
                facebookConnectPlugin.logout(
                    () => {
                        resolve(true);
                    },
                    () => {
                        reject(false);
                    });
            } else {
                reject(false);
            }
        });
    }

    api(requestPath: string): Promise<any|ServiceErrorInfo> {
        return new Promise<any|ServiceErrorInfo>((resolve, reject) => {
            if ((typeof cordova !== 'undefined') && facebookConnectPlugin) {
                let permissions = ['public_profile', 'email'];
                facebookConnectPlugin.login(requestPath, permissions,
                    (userData: any) => {
                        resolve(userData);
                    },
                    (err: string) => {
                        let error = new ServiceErrorInfo();
                        error.message = err;
                        reject(error);
                    });
            } else {
                let error = new ServiceErrorInfo();
                error.message = 'Platform does not support';
                reject(error);
            }
        });
    }
}
