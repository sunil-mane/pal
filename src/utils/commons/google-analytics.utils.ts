/**
 * Created by C00121 on 17/01/2017.
 */

import {Injectable} from '@angular/core';
import {GoogleAnalyticService} from '../../services/commons/google-analytics.service';
import {ClientUtils} from './client.utils';


@Injectable()
export class GoogleAnalyticsUtils{

    constructor(private googleAnalytics: GoogleAnalyticService,
                private clientUtils: ClientUtils){

    }

    startTracking(){
        this.googleAnalytics.startTracking();
    }

    trackPage(pageName: string){
        this.googleAnalytics.trackPage(pageName);
    }

    trackEvent(category: string, action: string, label?: string, value?: number ) {
        if (!this.clientUtils.isNullOrEmpty(label) && !this.clientUtils.isNullOrEmpty(value)) {
            this.googleAnalytics.trackEvent(category, action, label, value);
        } else if (!this.clientUtils.isNullOrEmpty(value)) {
            this.googleAnalytics.trackEvent(category, action, null, value);
        } else if (!this.clientUtils.isNullOrEmpty(label)) {
            this.googleAnalytics.trackEvent(category, action, label, 0);
        } else {
            this.googleAnalytics.trackEvent(category, action, null, 0);
        }
    }

    setUserId(userId: string) {
        this.googleAnalytics.setUserId(this.clientUtils.isNullOrEmpty(userId) ? '' : userId);
    }
}
