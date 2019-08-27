/**
 * Created by C00121 on 16/01/2017.
 */

import {Injectable} from '@angular/core';
import {ClientUtils} from '../../utils/commons/client.utils';

// declare let cordova;


@Injectable()
export class GoogleAnalyticService {

    constructor(private clientUtils: ClientUtils) {
    }

    startTracking(){
        if (this.clientUtils.isAnalyticsEnabled() && (<any>window).plugins) {
            (<any>window).plugins.googleanalytics.startTrackerWithId(this.clientUtils.getGoogleAnalyticsTrackingId());

            // Google Tag Manager
            // let trackingId = 'GTM-M4LC9PR';
            // let intervalPeriod = 30; // seconds
            // let tagManager = cordova.require('com-mercator-cordova-googletagmanager.TagManager');
            // tagManager.init(
            //     (result: any) => {
            //         console.log('TagManager init:\n', JSON.stringify(result));
            //     }, (error: any) => {
            //         console.log('TagManager init error:\n', JSON.stringify(error));
            //     }, trackingId, intervalPeriod);

            if (this.clientUtils.isDebugMode()) {
                (<any>window).plugins.googleanalytics.debugMode();
            }
        }
    }

    trackPage(pageName: string) {
        if (this.clientUtils.isAnalyticsEnabled() && (<any>window).plugins) {
            (<any>window).plugins.googleanalytics.trackView(pageName);

            // Google Tag Manager
            // let tagManager = cordova.require('com-mercator-cordova-googletagmanager.TagManager');
            // tagManager.trackPage(
            //     (result: any) => {
            //         console.log('TagManager trackPage:\n', JSON.stringify(result));
            //     }, (error: any) => {
            //         console.log('TagManager trackPage error:\n', JSON.stringify(error));
            //     }, pageName);
        }
    }

    trackEvent(category: string, action: string, label: string, value: number ) {
        if (this.clientUtils.isAnalyticsEnabled() && (<any>window).plugins) {
            (<any>window).plugins.googleanalytics.trackEvent(category, action, label, value);

            // Google Tag Manager
            // let tagManager = cordova.require('com-mercator-cordova-googletagmanager.TagManager');
            // tagManager.trackEvent(
            //     (result: any) => {
            //         console.log('TagManager trackEvent:\n', JSON.stringify(result));
            //     }, (error: any) => {
            //         console.log('TagManager trackEvent error:\n', JSON.stringify(error));
            //     }, category, action, label, value);
        }
    }

    setUserId(userId: string) {
        if (this.clientUtils.isAnalyticsEnabled() && (<any>window).plugins) {
            (<any>window).plugins.googleanalytics.setUserId(userId);
        }
    }
}
