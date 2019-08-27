import {Component,style,  animate, transition, trigger, Renderer} from '@angular/core';
import {NavController, NavParams, ViewController, Events} from 'ionic-angular';
import {GoogleAnalyticsUtils} from '../../../utils/commons/google-analytics.utils';
import {ConfigUtils} from '../../../utils/commons/config.utils';
import {AppConstants} from '../../../constants/app.constants';


@Component({
  selector: 'virtual-card-full-screen',
  templateUrl: 'fullscreen.html',
  animations: [
    trigger('fadeInOut', [
      transition('void => *', [
        style({opacity:0,transform: 'scale(.6)'}), //style only for transition transition (after transiton it removes)
        animate(300, style({opacity:1,transform: 'scale(1)'})) // the new state of the transition(after transiton it removes)
      ]),
      transition('* => *', [
        animate(300, style({opacity:0,transform: 'scale(.2)'})) // the new state of the transition(after transiton it removes)
      ])
    ])
  ]
})
export class FullScreenPage {

  private backgroundImageURL: string = '';
  isFrontVisible: boolean = false;
  shouldDisplayCard: boolean = false;
  body:any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewController: ViewController,
              public render:Renderer,
              private events: Events,
              private configUtils: ConfigUtils,
              private googleAnalyticsUtils: GoogleAnalyticsUtils,
              private appConstants: AppConstants) {

  }

  ngOnInit() {

      this.events.subscribe(this.appConstants.EVENT_CONFIG_DATA_CHANGED, () => {
          this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
      });

    let dataObj: any = this.navParams.get('data');
    if (dataObj) {
      this.isFrontVisible = dataObj.isFrontVisible;
    }
    this.googleAnalyticsUtils.trackPage(this.appConstants.FULL_SCREEN_SCREEN);
    this.addClassToBody()
  }

  ngAfterViewInit() {
      this.backgroundImageURL = this.configUtils.getAppBackgroundImageURL();
      this.shouldDisplayCard = true;
  }

  addClassToBody(){
    this.body = document.getElementsByTagName('body')[0];
    this.render.setElementClass(this.body, 'fullScreenVirtualCard', true);
  }

  isFrontVisibleChanged(event: boolean) {
    this.isFrontVisible = event;
  }

  dismiss() {
    this.viewController.dismiss(this.isFrontVisible, null, {animate: false});

    setTimeout(()=>{
      this.render.setElementClass(this.body, 'fullScreenVirtualCard', false);
    },500);
  }

}
