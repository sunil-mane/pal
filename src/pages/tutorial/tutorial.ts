import { Component, ViewChild } from '@angular/core';
import { NavController} from 'ionic-angular';
import { Slides } from 'ionic-angular';
import {TabsPage} from '../../pages/tabs/tabs';
import { Nav} from 'ionic-angular';
import { App } from 'ionic-angular';

@Component({
    selector: 'tutorial',
    templateUrl: 'tutorial.html',
    // styleUrls:['tutorial.scss']
})


export class TutorialPage {
    constructor(public navCtrl: NavController,
        public appCtrl: App) {
    }
     @ViewChild(Slides) slides: Slides;
    @ViewChild(Nav) nav: NavController;
    ngOnInit() {
    }
    ngAfterViewInit(): void {
    }
      goToSlide(n) {
        this.slides.slideNext();
      }
      goToHome(){
        this.appCtrl.getRootNav().push(TabsPage);
      }
}