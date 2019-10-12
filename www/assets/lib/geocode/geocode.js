Geocode = (function () {
     function locationForAddress(address, callback) {
        var serviceURL = "https://maps.googleapis.com/maps/api/geocode/json?sensor=true&address=" + address;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                var statusCode = xmlHttp.status - 200;
                callback((statusCode >= 0 && statusCode <= 99) ? xmlHttp.responseText : null);
            }
        };
        xmlHttp.open("GET", serviceURL, true);
        xmlHttp.send(null);
    }
    
    function addressForLocation(lat, lng, callback) {
        var serviceURL = "https://maps.googleapis.com/maps/api/geocode/json?sensor=true&key=AIzaSyDRHN9ruTUk6JkVr_2EPZWGKeX_LJLQYuA&latlng=" + lat + "," + lng;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                var statusCode = xmlHttp.status - 200;
                callback((statusCode >= 0 && statusCode <= 99) ? xmlHttp.responseText : null);
            }
        };
        xmlHttp.open("GET", serviceURL, true);
        xmlHttp.send(null);
    }
    
    return {
            getLocationForAddress: locationForAddress,
            getAddressForLocation: addressForLocation
        };
}());
