import { PageInfo } from './common.dto';
import { ServiceResponseStatus } from './common.dto';


export class OfferResquest {
    data: OfferInfo;
    pageInfo: PageInfo;
}

export class OfferResponse {
    data: Array<OfferInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class OfferInfo {
    active: string;
    addId: number;
    addressId: number;
    allPartnerLocation: string;
    banner: string;
    bannerFname: string;
    campaignCode: string;
    campaignEnd: string;
    campaignStart: string;
    description: string;
    earnBurnFlag: string;
    earnBurnPoints: number;
    endDate: string;
    featured: string;
    fileName: string;
    forGoal: string;
    id: number;
    image: string;
    imgPath: string;
    intCode: string;
    isFavorite: string;
    isTarget: string;
    latitude: number;
    locationName: string;
    logo: string;
    logoFileName: string;
    logoPath: string;
    longitude: number;
    memberUid: number;
    offerBannerPath: string;
    offerCode: string;
    offerForGoal: string;
    offerId: number;
    offerLogoPath1: string;
    offerLogoPath: string;
    offerName: string;
    offerPartnerLocation: number;
    offerPoints: number;
    partnerCode: string;
    partnerLoationCount: string;
    partnerLogoPath: string;
    partnerName: string;
    partnerOfferId: number;
    priority: number;
    ptnrId: string;
    quantity: number;
    searchKey: string;
    special: string;
    startDate: string;
    street: string;
    terms: string;
    termsType: string;
    town: string;
    targetId: number;
    type: any;
    userId: any;
}
