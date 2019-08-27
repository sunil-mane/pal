/**
 * Created by sandip on 1/15/17.
 */


export class GeocodeResponse {
    results: Array<GeocodeInfo>;
    status: string;
}

export class GeocodeInfo {
    address_components: Array<GeocodeAddressComponent>;
    formatted_address: string;
    geometry: GeocodeGeometryInfo;
    place_id: string;
    types: Array<string>;
}

export class GeocodeGeometryInfo {
    location: GeocodeLocationInfo;
    location_type: string;
}

export class GeocodeLocationInfo {
    lat: number;
    lng: number;
}

export class GeocodeAddressComponent {
    long_name: string;
    short_name: string;
    types: Array<string>;
}
