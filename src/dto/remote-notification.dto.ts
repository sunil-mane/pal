/**
 * Created by sandip on 2/7/17.
 */


export class RemoteNotificationInfo {
    message: string;
    title: string;
    count: number;
    sound: string;
    image: string;
    additionalData: RemoteNotificationAdditionalData;
}

export class RemoteNotificationAdditionalData {
    foreground: boolean;
    payload: RemoteNotificationPayload;
}

export class RemoteNotificationPayload {
    notifCode: string;
}
