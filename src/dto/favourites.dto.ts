/**
 * Created by C00121 on 14/12/2016.
 */
import { PageInfo } from './common.dto';

export class FavouriteLocationRequest{
    data: FavouriteLocation;
    pageInfo: PageInfo;
}

export class FavouriteLocation {
    memberUid: number;
    addressId: number;
    active: string;
}

export class FavouriteOffersInfo {
    active: string;
    offerId: number;
    appId: number;
    favouriteOfferId: number;
    memberUid: number;
}

export class FavouriteOffersRequest {
    data: FavouriteOffersInfo;
    pageInfo: PageInfo;
}