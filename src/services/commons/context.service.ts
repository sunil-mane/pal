
export class ServiceContext {

    public shouldLoadLocalJSON: boolean;
    public timeoutPromise: any;

    constructor(public contextName: string,
                public serviceName: string,
                public requestObject: any) {
        this.shouldLoadLocalJSON = false;
        this.timeoutPromise = null;
    }
}
