import { PageInfo } from './common.dto';
import { ServiceResponseStatus } from './common.dto';


export class GoalRequest {
    data: GoalInfo;
    pageInfo: PageInfo;
}

export class GoalResponse {
    data: Array<GoalInfo>;
    pageInfo: PageInfo;
    status: ServiceResponseStatus;
}

export class GoalInfo {
    active: string;
    appId: number;
    earnBurnFlag: string;
    goalOfferId: number;
    isFavorite: string;
    memberUid: number;
    myTarget: number;
    offerBannerPath: string;
    offerId: number;
    partnerCode: string;
    partnerLocationCount: string;
    partnerLogoPath: string;
    partnerName: string;
    special: string;
    targetAchDel: string;
    targetCode: string;
    targetDescription: string;
    targetEndDate: string;
    targetId: number;
    targetName: string;
    targetPoints: number;
    targetPrize: number;
    targetQuantity: number;
    targetStartDate: string;
    targetStatus: string;
    targetStatusDescription: string;
    targetWithOpt: string;
    timeBoundFlag: string;
    start: number;
    end: number;
}
