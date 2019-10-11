import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, Content, Navbar, Button } from 'ionic-angular';
import { Keyboard } from 'ionic-native';
import { TranslateService } from 'ng2-translate';
import { ClientUtils } from '../../utils/commons/client.utils';
import { UserUtils } from '../../utils/commons/user.utils';
import { SessionUtils } from '../../utils/commons/session.utils';
import { UserAddressUtils } from '../../utils/commons/user-address.utils';
import { LovItemUtils } from '../../utils/commons/lov-item.utils';
import { ConfigUtils } from '../../utils/commons/config.utils';
import { McfLoaderService } from '../../services/commons/service.loading';
import {
    EnrollResponse, LoginResponse, MemberAddressInfo, MemberAddressResponse, MemberContactInfo, MemberInfo,
    PasswordCharacter,
    PasswordHint, PasswordHintResponse,
} from "../../dto/account.dto";
import { ConfigInfo, ServiceErrorInfo } from "../../dto/common.dto";
import { SecurityQuestionLov, CountryLov, StateLov, CityLov, NameSuffixLov } from "../../dto/lov-item.dto";
import { GeocodeAddressComponent, GeocodeInfo } from "../../dto/geocode.dto";
import { NetworkService } from '../../services/commons/network.service';
import { GoogleAnalyticsUtils } from '../../utils/commons/google-analytics.utils';
import { AppConstants } from '../../constants/app.constants';


@Component({
    selector: 'enrollment-page',
    templateUrl: 'enrollment.html'
})


export class EnrollmentPage {
    @ViewChild(Content) content: Content;
    @ViewChild('navBar') navBar: Navbar;
    @ViewChild('form1') form1: NgForm;
    @ViewChild('form2') form2: NgForm;
    @ViewChild('form3') form3: NgForm;
    @ViewChild('submitButton1') submitButton1: Button;
    @ViewChild('submitButton2') submitButton2: Button;
    @ViewChild('submitButton3') submitButton3: Button;
    pageState: number = 1;
    lastPageState: number = 1;
    titleObj: ConfigInfo = null;
    lastName: string = '';
    firstName: string = '';
    memberID: string = '';
    middleName: string = '';
    dobText: string = '';
    areaCode: string = '';
    areaCodeLength: number = 3;
    contactNumber: string = '';
    emailAddress: string = '';
    address1Text: string = '';
    address2Text: string = '';
    postalText: string = '';
    currentPasswordText: string = '';
    passwordText: string = '';
    rePasswordText: string = '';
    answerText: string = '';
    minDate: string = '';
    maxDate: string = '';
    cancelText: string = '';
    selectText: string = '';
    acceptTerms: boolean = false;
    editingProfile: boolean = false;
    recievedMemberAnswer: boolean = false;
    appDisplayName: string = '';
    activeCardNo: string = null;
    addressCityCode: string = null;
    addressStateRegion: string = null;
    confirmMsg: string = '';
    addressId: number = null;
    months: Array<string> = [];
    titles: Array<ConfigInfo> = [];
    selectedQuestion: SecurityQuestionLov = null;
    questions: Array<SecurityQuestionLov> = [];
    countryDialObj: CountryLov = null;
    countryAddressObj: CountryLov = null;
    countryLovs: Array<CountryLov> = [];
    selectedStateLov: StateLov = null;
    stateLovs: Array<StateLov> = [];
    selectedCityLov: CityLov = null;
    cityLovs: Array<CityLov> = [];
    selectedNameSuffix: NameSuffixLov = null;
    nameSuffixLovs: Array<NameSuffixLov> = [];
    passwordRule: PasswordHint = null;
    passwordGuidelines: string = null;
    shouldShowLoadingCityState: boolean = false;
    isValidatingForm: boolean = false;
    shouldDisplayErrorAlert: boolean = true;
    shouldShowPassword: boolean = false;
    shouldShowAnswer: boolean = false;
    passwordFieldLabel: string = '';
    formHasChanges: boolean = false;
    shouldShowAddressLoading: boolean = true;
    shouldDisablePersonalInfo: boolean = false;
    shouldHideContactNumber: boolean = false;
    consentRequest:any={consentStatus:'Y', activeCardNumber:null, consentCode: 'TNC', consentSource: 'SCB'};
    termsFlag:boolean = false;
    constructor(public navCtrl: NavController,
        private clientUtils: ClientUtils,
        private userUtils: UserUtils,
        private sessionUtils: SessionUtils,
        private configUtils: ConfigUtils,
        private userAddressUtils: UserAddressUtils,
        private googleAnalyticsUtils: GoogleAnalyticsUtils,
        private appConstants: AppConstants,
        private lovItemUtils: LovItemUtils,
        private mcfLoadService: McfLoaderService,
        private translate: TranslateService,
        private networkService: NetworkService) {
    }

    ngOnInit() {

        this.googleAnalyticsUtils.trackPage(this.analyticsPageTag());
        let nowDate = new Date();
        nowDate.setDate(nowDate.getDate() - (366 * 100));
        this.minDate = this.clientUtils.getFormattedDate('yyyy-MM-dd', nowDate.toDateString());
        nowDate = new Date();
        this.maxDate = this.clientUtils.getFormattedDate('yyyy-MM-dd', nowDate.toDateString());
        nowDate.setDate(nowDate.getDate() - (365.35 * 18));
        this.dobText = this.clientUtils.getFormattedDate('yyyy-MM-dd', nowDate.toDateString());
        this.months = this.clientUtils.fullMonths();
        this.cancelText = this.translate.instant('CANCEL');
        this.selectText = this.translate.instant('SELECT');
        this.appDisplayName = this.clientUtils.getAppDisplayName();

        let titleObj = new ConfigInfo();
        titleObj.code = 'M';
        titleObj.value = 'Mr';
        this.titles.push(titleObj);
        titleObj = new ConfigInfo();
        titleObj.code = 'F';
        titleObj.value = 'Ms';
        this.titles.push(titleObj);
        this.titleObj = this.titles[0];

        this.selectedQuestion = new SecurityQuestionLov();

        this.passwordFieldLabel = this.translate.instant('Password');

        this.passwordRule = new PasswordHint();
        this.passwordRule.maxPwdLength = 8;
        this.passwordRule.minPwdLength = 1;
        this.updatePasswordRule();
        if (this.sessionUtils.isUserLoggedIn()) {
            this.editingProfile = true;
            this.passwordFieldLabel = this.translate.instant('New Password');
            let memberInfo: MemberInfo = this.sessionUtils.getMemberInfo();
            this.lastName = memberInfo.lastName;
            this.firstName = memberInfo.firstName;
            this.memberID = memberInfo.memberID;
            this.activeCardNo = memberInfo.activeCardNo;
            this.middleName = memberInfo.middleName;
            this.emailAddress = memberInfo.emailAddress;
            this.acceptTerms = (memberInfo.termsAccepted == 'Y');
            this.getTncConsentDate(memberInfo.activeCardNo);
            if (memberInfo.lastName && memberInfo.firstName && memberInfo.birthDate) {
                this.shouldDisablePersonalInfo = true;
            }

            if (memberInfo.birthDate) {
                this.dobText = this.clientUtils.getFormattedDate('yyyy-MM-dd', memberInfo.birthDate);
            }

            let gender: string = memberInfo.gender;
            if (gender && gender.trim().length > 0) {
                for (let index = 0; index < this.titles.length; index++) {
                    if (this.titles[index].code == gender.toUpperCase()) {
                        this.titleObj = this.titles[index];
                        break;
                    }
                }
            } else {
                let title: string = memberInfo.title;
                if (title && title.trim().length > 0) {
                    for (let index = 0; index < this.titles.length; index++) {
                        if (this.titles[index].value.toUpperCase() == title.toUpperCase()) {
                            this.titleObj = this.titles[index];
                            break;
                        }
                    }
                }
            }
        }
    }

    ngAfterViewInit(): void {

        this.navBar.backButtonClick = (event: UIEvent) => {
            this.backButtonTapped();
        };

        this.fetchNameSuffix();
        this.fetchPasswordHints();
        this.updateSecurityQuestions();
        this.shouldShowAddressLoading = true;
        this.lovItemUtils.getCountryLov(
            (result: Array<CountryLov>) => {
                if (!this.clientUtils.isNullOrEmpty(result)) {
                    this.countryLovs = result;
                    this.updateContactNumber();
                    this.getMemberAddress();
                } else {
                    this.shouldShowAddressLoading = false;
                    this.displayErrorAlert(null);
                }
            },
            (error: ServiceErrorInfo) => {
                this.shouldShowAddressLoading = false;
                this.displayErrorAlert(error);
            });
    }

    onSelectIsd(selectedValue: CountryLov) {
        if (!this.countryDialObj || (selectedValue && (selectedValue.code != this.countryDialObj.isdCode))) {
            this.shouldHideContactNumber = true;
            this.countryDialObj = selectedValue;

            setTimeout(() => {
                this.areaCodeLength = selectedValue.isdCode ? (6 - selectedValue.isdCode.length) : 3;
                if (this.areaCode.length > this.areaCodeLength) {
                    this.areaCode = this.areaCode.substr(0, this.areaCodeLength);
                }
                this.shouldHideContactNumber = false;
            }, 500);
        }
    }

    onSelectCountry(selectedValue: CountryLov) {
        this.shouldShowLoadingCityState = true;
        this.updateAddressCountry(selectedValue);
    }

    backButtonTapped() {
        Keyboard.close();
        if (this.activeCardNo || (this.editingProfile == true)) {
            this.navCtrl.pop({ animate: true, keyboardClose: true });
            if (this.editingProfile == true) {
                this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(),
                    (((this.sessionUtils.isUserLoggedIn()) == true) ?
                        this.appConstants.EDIT_PROFILE_EXIT_EVENT :
                        this.appConstants.ENROLLMENT_EXIT_EVENT));
            }
        } else {
            let msg: string = this.translate.instant('Are you sure you want to cancel your enrollment? You will not be able to save this.');
            let cancelButton: string = this.translate.instant('No');
            let otherButton: string = this.translate.instant('Yes');
            this.clientUtils.showAlert(msg, null, cancelButton, [otherButton],
                (buttonText: string) => {
                    if (buttonText == otherButton) {
                        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.ENROLLMENT_EXIT_EVENT);
                        this.navCtrl.pop({ animate: true, keyboardClose: true });
                    }
                });
        }
    }

    tabButtonsTapped(pageState: number) {
        Keyboard.close();
        this.content.scrollToTop();
        if (this.pageState > pageState) {
            this.pageState = pageState;
        } else if (this.pageState < pageState) {
            const currentPage: number = this.pageState;
            let index = currentPage;
            let shouldLoop: boolean = true;
            while (shouldLoop == true) {
                if (index == currentPage) {
                    let isValid: boolean = false;
                    let isDirty: boolean = false;
                    if (index == 1) {
                        this.isValidatingForm = true;
                        this.submitButton1.getNativeElement().click();
                        isValid = this.form1.valid;
                        isDirty = this.form1.dirty;
                    } else if (index == 2) {
                        if (this.shouldShowAddressLoading == true) {
                            isValid = true;
                            isDirty = false;
                        } else {
                            this.isValidatingForm = true;
                            this.submitButton2.getNativeElement().click();
                            isValid = this.form2.valid;
                            isDirty = this.form2.dirty;
                        }
                    } else if (index == 3) {
                        this.isValidatingForm = true;
                        this.submitButton3.getNativeElement().click();
                        isValid = this.form3.valid;
                        isDirty = this.form3.dirty;
                    }
                    if ((isValid == false) && (this.editingProfile != true)) {
                        shouldLoop = false;
                    } else {
                        index++;
                    }
                } else {
                    let errorMsg: string = this.validateFields(index);
                    if ((errorMsg != null) && (this.editingProfile != true)) {
                        this.pageState = index;
                        shouldLoop = false;
                    }
                    index++;
                    if (index > pageState) {
                        this.pageState = pageState;
                        shouldLoop = false;
                    }
                }
            }
        }
    }

    editButtonTapped() {
        Keyboard.close();
        this.content.scrollToTop();
        this.pageState = this.lastPageState;
        this.acceptTerms = false;
        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(),
            (((this.sessionUtils.isUserLoggedIn()) == true) ?
                this.appConstants.EDIT_PROFILE_EDIT_AGAIN_EVENT :
                this.appConstants.ENROLLMENT_EDIT_AGAIN_EVENT));
    }

    bottomButtonTapped() {
        Keyboard.close();
        if (this.editingProfile == true) {
            let errorMsg: string = this.validateFields(this.pageState);
            if (errorMsg != null) {
                this.clientUtils.showAlert(errorMsg);
            } else {
                if (this.pageState == 1) {
                    this.formHasChanges = this.form1.dirty;
                    this.pageState = 2;
                } else if (this.form2 && !this.form2.dirty && !this.formHasChanges) {
                    if (this.acceptTerms == true) {
                        if (this.isValidatingForm == false) {
                            let errorMsg: string = this.translate.instant('Please edit your profile');
                            this.clientUtils.showAlert(errorMsg);
                        }
                    } else {
                        this.pageState = 3;
                    }
                } else {
                    if (this.pageState == 2) {
                        this.formHasChanges = true;
                    }
                    if (this.acceptTerms == true) {
                        if (this.isValidatingForm == false) {
                            this.enrollUser();
                        }
                    } else {
                        this.lastPageState = this.pageState;
                        this.pageState = 4;
                        this.acceptTerms = this.termsFlag;
                    }
                }
            }
        } else if (this.pageState < 4) {
            let errorMsg: string = this.validateFields(this.pageState);
            if (errorMsg != null) {
                this.clientUtils.showAlert(errorMsg);
            } else {
                this.content.scrollToTop();
                if ((this.pageState + 1) == 4) {
                    this.lastPageState = this.pageState;
                }
                this.pageState += 1;
            }
        } else {
            let errorMsg: string = this.validateFields(this.pageState);
            if (errorMsg != null) {
                this.clientUtils.showAlert(errorMsg);
            } else {
                this.enrollUser();
            }
        }

        this.isValidatingForm = false;
    }

    termsConditionsTapped() {
        Keyboard.close();
        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.TERMS_CONDITIONS_TAPPED_EVENT);
        if (this.networkService.isOnline()) {
            let termsURL: string = this.configUtils.getTermsConditionsURL();
            this.clientUtils.openWebURL(termsURL);
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

    privacyPolicyTapped() {
        Keyboard.close();
        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.PRIVACY_POLICY_TAPPED_EVENT);
        if (this.networkService.isOnline()) {
            let privacyPolicyURL: string = this.configUtils.getPrivacyPolicyURL();
            this.clientUtils.openWebURL(privacyPolicyURL);
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

    showPassword() {
        this.shouldShowPassword = !this.shouldShowPassword;
        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.SHOW_HIDE_PASSWORD_TEXT_TAPPED_EVENT);
    }

    showAnswer() {
        this.shouldShowAnswer = !this.shouldShowAnswer;
        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.SHOW_HIDE_ANSWER_TEXT_TAPPED_EVENT);
    }

    analyticsPageTag(): string {
        return (((this.sessionUtils.isUserLoggedIn()) == true) ?
            this.appConstants.EDIT_PROFILE_SCREEN :
            this.appConstants.ENROLLMENT_SCREEN);
    }

    displayErrorAlert(error: ServiceErrorInfo) {
        if (this.shouldDisplayErrorAlert == true) {
            this.shouldDisplayErrorAlert = false;
            let msg = this.translate.instant('An error has occurred. Please try again later.');
            this.clientUtils.showAlert(msg, null, null, [],
                (buttonText: string) => {
                    this.navCtrl.pop({ animate: true, keyboardClose: true });
                });
        }
    }

    updateContactNumber() {
        let fullContactNumber: string = null;
        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo: MemberInfo = this.sessionUtils.getMemberInfo();
            fullContactNumber = memberInfo.mobileNumber;
        }
        if (this.clientUtils.isNullOrEmpty(fullContactNumber)) {
            let geocodes = this.userAddressUtils.getUserAddressContext();
            if (!this.clientUtils.isNullOrEmpty(geocodes)) {
                let addressComponent: GeocodeAddressComponent = null;
                for (let index = 0; index < geocodes.length; index++) {
                    let locationObj: GeocodeInfo = geocodes[index];
                    if (!this.clientUtils.isNullOrEmpty(locationObj.address_components)) {
                        for (let i = 0; i < locationObj.address_components.length; i++) {
                            let obj: GeocodeAddressComponent = locationObj.address_components[i];
                            if (!this.clientUtils.isNullOrEmpty(obj.types)) {
                                for (let j = 0; j < obj.types.length; j++) {
                                    let country: string = obj.types[j];
                                    if (country.trim().toUpperCase() == 'COUNTRY') {
                                        addressComponent = obj;
                                        break;
                                    }
                                }
                                if (!this.clientUtils.isNullOrEmpty(addressComponent)) {
                                    break;
                                }
                            }
                        }
                        if (!this.clientUtils.isNullOrEmpty(addressComponent)) {
                            break;
                        }
                    }
                }
                if (!this.clientUtils.isNullOrEmpty(addressComponent)) {
                    for (let index = 0; index < this.countryLovs.length; index++) {
                        let obj: CountryLov = this.countryLovs[index];
                        if (obj.code == addressComponent.short_name) {
                            this.countryDialObj = obj;
                            this.areaCodeLength = this.countryDialObj.isdCode ? (6 - this.countryDialObj.isdCode.length) : 3;
                            if (this.editingProfile == false) {
                                this.updateAddressCountry(obj);
                            }
                            break;
                        }
                    }
                }
            }
        } else {
            for (let index = 0; index < this.countryLovs.length; index++) {
                let obj: CountryLov = this.countryLovs[index];
                if (!this.clientUtils.isNullOrEmpty(obj.isdCode) && fullContactNumber.startsWith(obj.isdCode)) {
                    if (!this.countryDialObj || !this.countryDialObj.isdCode ||
                        (obj.isdCode.length > this.countryDialObj.isdCode.length)) {
                        this.countryDialObj = obj;
                    }
                }
            }
            let contactNumber: string = fullContactNumber;
            if (this.countryDialObj && this.countryDialObj.isdCode) {
                this.areaCodeLength = 6 - this.countryDialObj.isdCode.length;
                contactNumber = fullContactNumber.substr(this.countryDialObj.isdCode.length);
                if (this.editingProfile == false) {
                    this.updateAddressCountry(this.countryDialObj);
                }
            }
            if (contactNumber) {
                if (contactNumber.length > this.areaCodeLength) {
                    this.areaCode = contactNumber.substr(0, this.areaCodeLength);
                    this.contactNumber = contactNumber.substr(this.areaCodeLength);
                } else {
                    this.areaCode = contactNumber;
                    this.contactNumber = '';
                }
            } else {
                this.areaCode = '';
                this.contactNumber = '';
            }
        }
        if (!this.countryDialObj || !this.countryDialObj.code) {
            this.countryDialObj = this.countryLovs[0];
            this.areaCodeLength = this.countryDialObj.isdCode ? (6 - this.countryDialObj.isdCode.length) : 3;
        }
        if ((this.editingProfile == false) && (!this.countryAddressObj || !this.countryAddressObj.code)) {
            this.updateAddressCountry(this.countryLovs[0]);
        }
    }

    getMemberAddress() {
        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo: MemberInfo = this.sessionUtils.getMemberInfo();
            let profileInfo: MemberInfo = new MemberInfo();
            profileInfo.personId = memberInfo.personId;
            this.userUtils.getMemberAddress(profileInfo,
                (response: MemberAddressResponse) => {
                    if (response && !this.clientUtils.isNullOrEmpty(response.data)) {
                        let addressInfo: MemberAddressInfo = null;
                        let addressList: Array<MemberAddressInfo> = response.data;
                        for (let index = 0; index < addressList.length; index++) {
                            let obj: MemberAddressInfo = addressList[index];
                            if (obj.usages && (obj.usages.trim().length > 0)) {
                                let usageList: Array<string> = obj.usages.split(',');
                                if (usageList) {
                                    for (let i = 0; i < usageList.length; i++) {
                                        if (usageList[i] == 'PREF') {
                                            addressInfo = obj;
                                            break;
                                        }
                                    }
                                }
                                if (addressInfo != null) {
                                    break;
                                }
                            }
                        }
                        if (addressInfo == null) {
                            addressInfo = response.data[0];
                        }
                        if (addressInfo.addressID) {
                            this.addressId = addressInfo.addressID;
                        }
                        if (!this.clientUtils.isNullOrEmpty(addressInfo.cityIataCode)) {
                            for (let index = 0; index < this.cityLovs.length; index++) {
                                let obj: CityLov = this.cityLovs[index];
                                if (obj.code == addressInfo.cityIataCode) {
                                    this.selectedCityLov = obj;
                                    break;
                                }
                            }
                            this.addressCityCode = addressInfo.cityIataCode;
                        }
                        let stateText: string = null;
                        if (addressInfo.state && (addressInfo.state.trim().length > 0)) {
                            stateText = addressInfo.state.trim();
                        } else if (addressInfo.region && (addressInfo.region.trim().length > 0)) {
                            stateText = addressInfo.state.trim();
                        }
                        if (stateText) {
                            for (let index = 0; index < this.stateLovs.length; index++) {
                                let obj: StateLov = this.stateLovs[index];
                                if (obj.descr == stateText) {
                                    this.selectedStateLov = obj;
                                    break;
                                }
                            }
                            this.addressStateRegion = stateText;
                        }
                        if (!this.clientUtils.isNullOrEmpty(addressInfo.country)) {
                            for (let index = 0; index < this.countryLovs.length; index++) {
                                let obj: CountryLov = this.countryLovs[index];
                                if (obj.code == addressInfo.country) {
                                    this.updateAddressCountry(obj);
                                    break;
                                }
                            }
                        }
                        if (!this.countryAddressObj || !this.countryAddressObj.code) {
                            this.updateAddressCountry((this.countryDialObj && this.countryDialObj.code) ?
                                this.countryDialObj : this.countryLovs[0]);
                        }
                        if (addressInfo.address1 && (addressInfo.address1.trim().length > 0)) {
                            this.address1Text = addressInfo.address1;
                        }
                        if (addressInfo.address2 && (addressInfo.address2.trim().length > 0)) {
                            this.address2Text = addressInfo.address2;
                        }
                        if (addressInfo.poBox && (addressInfo.poBox.trim().length > 0)) {
                            this.postalText = addressInfo.poBox.trim();
                        } else if (addressInfo.postCode && (addressInfo.postCode.trim().length > 0)) {
                            this.postalText = addressInfo.postCode.trim();
                        }
                    } else if (this.editingProfile == true) {
                        this.shouldShowAddressLoading = false;
                        this.displayErrorAlert(null);
                    }
                },
                (error: ServiceErrorInfo) => {
                    this.shouldShowAddressLoading = false;
                    if (this.editingProfile == true) {
                        this.displayErrorAlert(error);
                    }
                });
        } else {
            this.shouldShowAddressLoading = false;
        }
    }

    fetchNameSuffix() {
        this.lovItemUtils.getNameSuffixLov(
            (result: Array<NameSuffixLov>) => {
                if (!this.clientUtils.isNullOrEmpty(result)) {
                    this.nameSuffixLovs = result;
                    let defaultSuffix: NameSuffixLov = new NameSuffixLov();
                    defaultSuffix.code = this.translate.instant('None');
                    defaultSuffix.descr = null;
                    this.nameSuffixLovs.splice(0, 0, defaultSuffix);
                    this.selectedNameSuffix = this.nameSuffixLovs[0];
                    if (this.sessionUtils.isUserLoggedIn()) {
                        let memberInfo: MemberInfo = this.sessionUtils.getMemberInfo();
                        if (memberInfo.nameSuffix) {
                            for (let index = 0; index < this.nameSuffixLovs.length; index++) {
                                if (this.nameSuffixLovs[index].code == memberInfo.nameSuffix) {
                                    this.selectedNameSuffix = this.nameSuffixLovs[index];
                                    break
                                }
                            }
                        }
                    }
                }
            },
            (error: ServiceErrorInfo) => {
            });
    }

    updateSecurityQuestions() {
        this.lovItemUtils.getSecurityQuestions(
            (result: Array<SecurityQuestionLov>) => {
                if (!this.clientUtils.isNullOrEmpty(result)) {
                    this.questions = result;
                    this.selectedQuestion = this.questions[0];
                    this.getMemberSecurityQuestion();
                } else if (this.editingProfile == false) {
                    this.displayErrorAlert(null);
                }
            },
            (error: ServiceErrorInfo) => {
                if (this.editingProfile == false) {
                    this.displayErrorAlert(error);
                }
            });
    }

    getMemberSecurityQuestion() {
        if (this.sessionUtils.isUserLoggedIn()) {
            let memberInfo: MemberInfo = this.sessionUtils.getMemberInfo();
            let profileInfo: MemberInfo = new MemberInfo();
            profileInfo.activeCardNo = memberInfo.activeCardNo;
            this.userUtils.getMemberSecurityQuestion(profileInfo,
                (response: EnrollResponse) => {
                    if (!this.clientUtils.isNullOrEmpty(response.data)) {
                        let profileInfo: MemberInfo = response.data[0];
                        if (profileInfo.questionId) {
                            for (let index = 0; index < this.questions.length; index++) {
                                if (this.questions[index].code == profileInfo.questionId) {
                                    this.selectedQuestion = this.questions[index];
                                    if (profileInfo.answer) {
                                        this.answerText = profileInfo.answer;
                                        this.recievedMemberAnswer = true;
                                    }
                                    break
                                }
                            }
                        }
                    }
                },
                (error: ServiceErrorInfo) => {
                });
        }
    }

    updateAddressCountry(countryObj: CountryLov) {
        if (this.networkService.isOnline()) {
            if (!this.countryAddressObj || (countryObj && (countryObj.code != this.countryAddressObj.code))) {

                this.countryAddressObj = countryObj;

                if (this.shouldShowLoadingCityState == true) {
                    this.mcfLoadService.show('');
                }

                this.stateLovs = [];
                this.selectedStateLov = null;
                this.cityLovs = [];
                this.selectedCityLov = null;

                this.fetchStateLovs().then((error: ServiceErrorInfo) => {
                    if (error) {
                    }
                    this.fetchCityLovs().then((error: ServiceErrorInfo) => {
                        if (error) {
                        }
                        this.shouldShowAddressLoading = false;
                        if (this.shouldShowLoadingCityState == true) {
                            this.shouldShowLoadingCityState = false;
                            this.mcfLoadService.hide();
                        }
                    });
                });
            } else {
                this.shouldShowAddressLoading = false;
                this.shouldShowLoadingCityState = false;
            }
        } else {
            this.shouldShowAddressLoading = false;
            this.shouldShowLoadingCityState = false;
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

    fetchStateLovs() {

        return new Promise(resolve => {
            this.lovItemUtils.getStateLov(this.countryAddressObj.code,
                (result: Array<StateLov>) => {
                    if (!this.clientUtils.isNullOrEmpty(result)) {
                        this.stateLovs = result;
                        let foundObj: boolean = false;
                        if (this.addressStateRegion) {
                            for (let index = 0; index < this.stateLovs.length; index++) {
                                let obj: StateLov = this.stateLovs[index];
                                if (obj.code == this.addressStateRegion) {
                                    this.selectedStateLov = obj;
                                    foundObj = true;
                                    break;
                                }
                            }
                        }
                        if (foundObj == false) {
                            this.selectedStateLov = this.stateLovs[0];
                        }
                    } else {
                        this.stateLovs = [];
                    }
                    resolve(null);
                },
                (error: ServiceErrorInfo) => {
                    resolve(error);
                });
        });
    }

    fetchCityLovs() {

        return new Promise(resolve => {
            this.lovItemUtils.getCityLov(this.countryAddressObj.code,
                (result: Array<CityLov>) => {
                    if (!this.clientUtils.isNullOrEmpty(result)) {
                        this.cityLovs = result;
                        let foundObj: boolean = false;
                        if (this.addressCityCode) {
                            for (let index = 0; index < this.cityLovs.length; index++) {
                                let obj: CityLov = this.cityLovs[index];
                                if (obj.code == this.addressCityCode) {
                                    this.selectedCityLov = obj;
                                    foundObj = true;
                                    break;
                                }
                            }
                        }
                        if (foundObj == false) {
                            this.selectedCityLov = this.cityLovs[0];
                        }
                    } else {
                        this.cityLovs = [];
                    }
                    resolve(null);
                },
                (error: ServiceErrorInfo) => {
                    resolve(error);
                });
        });
    }

    fetchPasswordHints() {
        this.userUtils.getPasswordHints((response: PasswordHintResponse) => {
            if (!this.clientUtils.isNullOrEmpty(response.data) &&
                response.data[0].passwordHints &&
                !this.clientUtils.isNullOrEmpty(response.data[0].passwordCharacters)) {
                this.passwordRule = response.data[0].passwordHints;
                this.passwordRule.specialCharset = "";
                let pwdChars: Array<PasswordCharacter> = response.data[0].passwordCharacters;
                for (let index = 0; index < pwdChars.length; index++) {
                    if (pwdChars[index].code = "&" && pwdChars[index].characterset) {
                        this.passwordRule.specialCharset = pwdChars[index].characterset;
                        break;
                    }
                }
                this.updatePasswordRule();
            }
        },
            (error: ServiceErrorInfo) => {
            });
    }

    updatePasswordRule() {
        if (this.passwordRule) {
            let passwordGuidelines: string = '';
            if (this.passwordRule.maxPwdLength && this.passwordRule.minPwdLength) {
                let minText: string = this.passwordRule.minPwdLength.toString();
                let maxText: string = this.passwordRule.maxPwdLength.toString();
                let text: string = this.translate.instant('It must have MIN-MAX characters');
                let keywords: Array<string> = ['[MIN]', '[MAX]'];
                let values: Array<string> = [minText, maxText];
                passwordGuidelines += '<li>' + this.clientUtils.replaceKeywordsWithValues(text, keywords, values) + '</li>';
            }
            if (this.passwordRule.specialChar == 'Y') {
                passwordGuidelines += '<li>' + this.translate.instant('It must contain special character') + '</li>';
            }
            if (this.passwordRule.upperCase == 'Y') {
                passwordGuidelines += '<li>' + this.translate.instant('It must contain uppercase') + '</li>';
            }
            if (this.passwordRule.lowerCase == 'Y') {
                passwordGuidelines += '<li>' + this.translate.instant('It must contain lowercase') + '</li>';
            }
            if (this.passwordRule.numeric == 'Y') {
                passwordGuidelines += '<li>' + this.translate.instant('It must contain numbers') + '</li>';
            }
            if (passwordGuidelines && passwordGuidelines.length > 0) {
                this.passwordGuidelines = '<div>' + this.translate.instant('Password Guidelines') + '</div>' +
                    passwordGuidelines;
            } else {
                this.passwordGuidelines = null;
            }
        } else {
            this.passwordGuidelines = null;
        }
    }

    isValidPassword(): boolean {
        if (this.clientUtils.isNullOrEmpty(this.passwordText)) {
            return false;
        }
        if (this.passwordRule) {
            if (this.passwordRule.maxPwdLength && this.passwordRule.minPwdLength) {
                if (this.passwordText.trim().length < this.passwordRule.minPwdLength) {
                    return false;
                }
                if (this.passwordText.trim().length > this.passwordRule.maxPwdLength) {
                    return false;
                }
            }
            if (this.passwordRule.specialChar == 'Y') {
                let isFound: boolean = (this.passwordRule.specialCharset.length <= 0);
                for (let index = 0; index < this.passwordRule.specialCharset.length; index++) {
                    if (this.passwordText.includes(this.passwordRule.specialCharset.charAt(index)) == true) {
                        isFound = true;
                        break;
                    }
                }
                if (isFound == false) {
                    return false;
                }
            }
            if (this.passwordRule.upperCase == 'Y') {
                let regex = new RegExp('[A-Z]');
                let matches = this.passwordText.match(regex);
                if (!matches) {
                    return false
                }
            }
            if (this.passwordRule.lowerCase == 'Y') {
                let regex = new RegExp('[a-z]');
                let matches = this.passwordText.match(regex);
                if (!matches) {
                    return false
                }
            }
            if (this.passwordRule.numeric == 'Y') {
                let regex = new RegExp('[0-9]');
                let matches = this.passwordText.match(regex);
                if (!matches) {
                    return false
                }
            }
        }
        return true;
    }

    validateFields(pageState: number): string {
        let errorMessage: string = null;

        if (pageState == 1) {
            if (this.clientUtils.isNullOrEmpty(this.titleObj)) {
                errorMessage = this.translate.instant("Title can not be empty");
            } else if (!this.lastName || this.lastName.trim().length == 0) {
                errorMessage = this.translate.instant("Last name can not be empty");
            } else if (!this.firstName || this.firstName.trim().length == 0) {
                errorMessage = this.translate.instant("First name can not be empty");
            } else if (!this.dobText || this.dobText.length == 0) {
                errorMessage = this.translate.instant("Date of birth can not be empty");
            }
        } else if (pageState == 2) {
            if (!this.areaCode || this.areaCode.trim().length == 0) {
                errorMessage = this.translate.instant("Invalid area code");
            } else if (!this.contactNumber || this.contactNumber.trim().length == 0) {
                errorMessage = this.translate.instant("Invalid contact number");
            } else if (this.clientUtils.isValidEmailAddress(this.emailAddress) == false) {
                errorMessage = this.translate.instant("Invalid email address");
            } else if (!this.selectedCityLov || !this.selectedCityLov.code) {
                errorMessage = this.translate.instant("City/Province can not be empty");
            } else if (!this.address1Text || this.address1Text.trim().length == 0) {
                errorMessage = this.translate.instant("Number/Street can not be empty");
            } else if (!this.postalText || this.postalText.trim().length == 0) {
                errorMessage = this.translate.instant("Postal/Zip Code can not be empty");
            }
        } else if (pageState == 3) {
            if (this.isValidPassword() != true) {
                if (this.editingProfile != true) {
                    this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.INVALID_PASSWORD_EVENT);
                    errorMessage = this.translate.instant("Invalid Password");
                }
            } else if (this.passwordText != this.rePasswordText) {
                errorMessage = this.translate.instant("Password does not match");
            }
            if ((errorMessage == null) && !this.clientUtils.isNullOrEmpty(this.questions)) {
                if (!this.selectedQuestion || !this.selectedQuestion.code) {
                    if (this.editingProfile != true) {
                        errorMessage = this.translate.instant("Security question can not be empty");
                    }
                } else if (!this.answerText || this.answerText.trim().length < 0) {
                    errorMessage = this.translate.instant("Invalid security answer");
                }
            }
        } else if (pageState == 4) {
            if (this.acceptTerms != true) {
                errorMessage = this.translate.instant("Please read and agree with the Terms & Conditions and Privacy Policy");
            }
        }

        return errorMessage;
    }

    enrollUser(): void {

        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.SUBMIT_SAVE_EVENT);
        if (this.networkService.isOnline()) {

            if ((this.editingProfile != true) || this.formHasChanges) {

                this.mcfLoadService.show('');

                let profileInfo: MemberInfo = new MemberInfo();
                profileInfo.registrationType = 'M';
                profileInfo.title = this.titleObj.value;
                profileInfo.gender = this.titleObj.code;
                profileInfo.lastName = this.lastName.trim();
                profileInfo.firstName = this.firstName.trim();
                profileInfo.middleName = this.middleName ? this.middleName.trim() : '';
                profileInfo.birthDate = this.dobText;
                profileInfo.emailAddress = this.emailAddress.trim();
                profileInfo.nationality = this.countryAddressObj.code;
                profileInfo.termsAccepted = (this.acceptTerms == true) ? 'Y' : 'N';
                profileInfo.memberID = this.memberID.trim();
                profileInfo.activeCardNo = this.activeCardNo;

                if (this.selectedNameSuffix && this.selectedNameSuffix.code && this.selectedNameSuffix.descr) {
                    profileInfo.nameSuffix = this.selectedNameSuffix.code;
                }

                if (this.areaCode && this.contactNumber) {
                    let contactInfo: MemberContactInfo = new MemberContactInfo();
                    contactInfo.areaCode = this.areaCode.trim();
                    contactInfo.contactNumber = this.contactNumber.trim();
                    contactInfo.isdCode = this.countryDialObj.isdCode;
                    profileInfo.contact = contactInfo;
                }

                let addressInfo: MemberAddressInfo = new MemberAddressInfo();
                addressInfo.address1 = this.address1Text ? this.address1Text.trim() : '';
                addressInfo.address2 = this.address2Text ? this.address2Text.trim() : '';
                addressInfo.cityIataCode = (this.selectedCityLov && this.selectedCityLov.code) ? this.selectedCityLov.code : undefined;
                addressInfo.postCode = this.postalText ? this.postalText.trim() : '';
                addressInfo.region = (this.selectedStateLov && this.selectedStateLov.code) ? this.selectedStateLov.code : undefined;
                addressInfo.country = this.countryAddressObj.code;
                if (this.addressId) {
                    addressInfo.addressID = this.addressId;
                }
                profileInfo.address = addressInfo;

                if (this.editingProfile == true) {
                    let memberInfo: MemberInfo = this.sessionUtils.getMemberInfo();
                    profileInfo.activeCardNo = memberInfo.activeCardNo;
                    profileInfo.memUID = memberInfo.memUID;
                    profileInfo.personId = memberInfo.personId;
                } else if (this.passwordText && this.passwordText.trim().length > 0) {
                    profileInfo.password = this.passwordText.trim();
                }
                this.userUtils.saveProfile(profileInfo, this.editingProfile,
                    (response: EnrollResponse) => {
                        if (this.editingProfile == true) {
                            this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.EDIT_PROFILE_SUCCESSFUL_EVENT);
                            this.userUtils.fetchProfile(
                                (response: EnrollResponse) => {
                                    this.changePassword();
                                }, (error: ServiceErrorInfo) => {
                                    this.changePassword();
                                });
                                this.consentRequest.activeCardNumber=profileInfo.activeCardNo;
                        } else {
                            this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.ENROLLMENT_SUCCESSFUL_EVENT);
                            this.mcfLoadService.hide();
                            let activeCard = response.data[0].activeCardNo
                            this.consentRequest.activeCardNumber=activeCard;
                            if (!this.clientUtils.isNullOrEmpty(response.data)) {
                                this.profileCreatedConfirm(response.data[0]);
                            } else {
                                this.navCtrl.pop({ animate: true, keyboardClose: true });
                            }
                        }
                        if(!this.termsFlag){
                            this.consentRequest.consentStatus='Y';
                            this.userUtils.postConsentDate(this.consentRequest,
                                (result: any) => {
                                }, (error: ServiceErrorInfo) => {
                            });
                        }
                    }, (error: ServiceErrorInfo) => {
                        this.mcfLoadService.hide();
                        let msg = '';
                        if (error && error.message && (error.message.trim().length > 0)) {
                            msg = error.message.trim();
                        } else {
                            msg = this.translate.instant('SOMETHING_WENT_WRONG');
                        }
                        this.clientUtils.showAlert(msg);
                        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(),
                            (((this.sessionUtils.isUserLoggedIn()) == true) ?
                                this.appConstants.EDIT_PROFILE_UNSUCCESSFUL_EVENT :
                                this.appConstants.ENROLLMENT_UNSUCCESSFUL_EVENT), msg);
                    });
            } else {
                this.mcfLoadService.show('');
                this.changePassword();
            }
        } else {
            this.clientUtils.showAlert(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
        }
    }

    profileCreatedConfirm(profileInfo: MemberInfo) {
        this.activeCardNo = profileInfo.activeCardNo;
        this.saveMemberSecurityQuestion(profileInfo);
        this.confirmMsg = profileInfo.message;
        this.pageState = 5;
        this.googleAnalyticsUtils.trackPage(this.appConstants.ENROLLMENT_SUCCESSFUL_WELCOME_SCREEN);
    }

    profileUpdated() {
        let memberInfo: MemberInfo = this.sessionUtils.getMemberInfo();
        this.saveMemberSecurityQuestion(memberInfo);
        this.mcfLoadService.hide();
        this.clientUtils.showAlert(this.translate.instant('You have successfully edited your profile.'),
            null, null, [],
            (buttonText: string) => {
                this.navCtrl.pop({ animate: true, keyboardClose: true });
            });
    }

    changePassword() {
        if ((this.currentPasswordText && this.currentPasswordText.trim().length > 0) &&
            (this.passwordText && this.passwordText.trim().length > 0)) {
            let memberInfo: MemberInfo = this.sessionUtils.getMemberInfo();
            let profileInfo: MemberInfo = new MemberInfo();
            profileInfo.username = memberInfo.activeCardNo;
            profileInfo.personId = memberInfo.personId;
            profileInfo.oldPassword = this.currentPasswordText.trim();
            profileInfo.newPassword = this.passwordText.trim();
            this.userUtils.changePassword(profileInfo,
                (response: EnrollResponse) => {
                    this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.EDIT_PASSWORD_SUCCESSFUL_EVENT);
                    this.profileUpdated();
                }, (error: ServiceErrorInfo) => {
                    this.mcfLoadService.hide();
                    let msg = '';
                    if (error && error.message && (error.message.trim().length > 0)) {
                        msg = error.message.trim();
                    } else {
                        msg = this.translate.instant('SOMETHING_WENT_WRONG');
                    }
                    // this.clientUtils.showAlert(msg);
                    this.clientUtils.showToast(msg);
                    this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(),
                        this.appConstants.EDIT_PASSWORD_UNSUCCESSFUL_EVENT, msg);
                });
        } else {
            this.profileUpdated();
        }
    }

    saveMemberSecurityQuestion(memberInfo: MemberInfo) {
        if (this.selectedQuestion && this.selectedQuestion.code) {
            if (this.answerText && this.answerText.trim().length > 0) {
                let profileInfo: MemberInfo = new MemberInfo();
                profileInfo.activeCardNo = memberInfo.activeCardNo;
                profileInfo.personId = memberInfo.personId;
                profileInfo.questionId = this.selectedQuestion.code;
                profileInfo.answer = this.answerText.trim();
                this.userUtils.saveMemberSecurityQuestion(profileInfo, this.recievedMemberAnswer,
                    (response: any) => {
                        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(), this.appConstants.SECURITY_QUESTION_UPDATE_SUCCESSFUL_EVENT);
                    }, (error: ServiceErrorInfo) => {
                        let msg = '';
                        if (error && error.message && (error.message.trim().length > 0)) {
                            msg = error.message.trim();
                        } else {
                            msg = this.translate.instant('SOMETHING_WENT_WRONG');
                        }
                        this.googleAnalyticsUtils.trackEvent(this.analyticsPageTag(),
                            this.appConstants.SECURITY_QUESTION_UPDATE_UNSUCCESSFUL_EVENT, msg);
                    });
            }
        }
    }

    loginButtonTapped() {
        this.googleAnalyticsUtils.trackEvent(this.appConstants.ENROLLMENT_SUCCESSFUL_WELCOME_SCREEN, this.appConstants.LOGIN_EVENT);
        if (this.passwordText && this.passwordText.trim().length > 0) {
            if (this.networkService.isOnline()) {
                this.mcfLoadService.show('');
                let password: string = this.passwordText.trim();
                this.userUtils.doLogin(this.activeCardNo, password,
                    (result: LoginResponse) => {
                        this.mcfLoadService.hide();
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.ENROLLMENT_SUCCESSFUL_WELCOME_SCREEN, this.appConstants.LOGIN_SUCCESSFUL);
                        this.navCtrl.pop({ animate: true, keyboardClose: true });
                    }, (error: ServiceErrorInfo) => {
                        this.mcfLoadService.hide();
                        let msg = '';
                        if (error && error.message && (error.message.trim().length > 0)) {
                            msg = error.message.trim();
                        } else {
                            msg = this.translate.instant('SOMETHING_WENT_WRONG');
                        }
                        this.clientUtils.showAlert(msg, null, null, [],
                            (buttonText: string) => {
                                this.navCtrl.pop({ animate: true, keyboardClose: true });
                            });
                        this.googleAnalyticsUtils.trackEvent(this.appConstants.ENROLLMENT_SUCCESSFUL_WELCOME_SCREEN,
                            this.appConstants.LOGIN_UNSUCCESSFUL, msg);
                    });
            } else {
                this.clientUtils.showToast(this.translate.instant('PLEASE_CHECK_NETWORK_CONNECTION'));
                this.navCtrl.pop({ animate: true, keyboardClose: true });
            }
        } else {
            this.navCtrl.pop({ animate: true, keyboardClose: true });
        }
    }
    getTncConsentDate(activeCardNo) {
        let consentConfig = this.configUtils.getTncConsentObj();
        let reqObj = {
            "activeCardNumber": activeCardNo,
            "consentCode": consentConfig.tncCode
        }
        this.userUtils.getConsentDate(reqObj,
            (result: any) => {
                if (consentConfig.tncFlag) {
                    if (result.consentStatus) {
                         this.termsFlag = result.consentStatus=='Y'?true:false;
                    } else {
                        this.termsFlag = false;
                    }
                }
            }, (error: ServiceErrorInfo) => {
                this.termsFlag = false;
            });
    }
}