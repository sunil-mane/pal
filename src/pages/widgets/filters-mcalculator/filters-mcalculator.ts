import {Component,Renderer} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {LanguageConstants} from '../../../constants/language.constants';
import {MilesCalculatorFilters} from '../../../dto/account.dto';


@Component({
    templateUrl: 'filters-mcalculator.html',
    selector: 'filters-mcalculator'
})
export class FilterMilesCalculator {

    MILES_TYPE_EARN: string = 'earn';
    MILES_TYPE_BURN: string = 'burn';

    body: any;
    selectedMilesType: string = null;
    promoText: string = null;

    constructor(public navParams: NavParams,
                public navCtrl: NavController,
                public viewController: ViewController,
                public languageConstants: LanguageConstants,
                private render: Renderer) {

        let filters: MilesCalculatorFilters = navParams.get('data');
        if (filters) {
            this.selectedMilesType = filters.milesType;
            this.promoText = filters.promotionCode;
        }
        if (!this.selectedMilesType) {
            this.selectedMilesType = this.MILES_TYPE_EARN;
        }
        if (!this.promoText) {
            this.promoText = '';
        }

        this.addClassToBody();
    }

    addClassToBody(){
        this.body = document.getElementsByTagName('body')[0];
        this.render.setElementClass(this.body, 'modal-filter-miles-calculator', true);
    }

    dismiss(obj: any) {
        this.viewController.dismiss(obj, null, {animate: true, keyboardClose: true});
        setTimeout(() => {
            this.render.setElementClass(this.body, 'modal-filter-miles-calculator', false);
        }, 500);
    }

    saveFilters() {
        let filters: MilesCalculatorFilters = new MilesCalculatorFilters();
        filters.milesType = this.selectedMilesType;
        filters.promotionCode = this.promoText;
        this.dismiss(filters);
    }

}
