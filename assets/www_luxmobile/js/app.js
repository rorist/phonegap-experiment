var app = {};

app.bodFeatureURI = '/bodfeature/geometry?layers=locations';

$(document).ready(function(){

    // Start on map
    if (window.location.hash && window.location.hash!='#map') {
        $.mobile.changePage('map', 'flip');
    }

    // Map
    var mapManager  = new app.Map('olmap'),
        map         = app.map = mapManager.map;

    // Search
    var search = new app.Search({
        form       : 'search_form',
        list       : 'results',
        alert      : 'search_alert',
        mapManager : mapManager
    });

    // Map zoom in/out
    $("#plus .ui-btn-inner").unbind().click(function(){
        map.zoomIn();
    });
    $("#minus .ui-btn-inner").unbind().click(function(){
        map.zoomOut();
    });

    // Layer selector
    $('#layerselector').change(function(){
        mapManager.setLayer(this.value);
    });

    // Geolocation
    var watchId = null;
    if (!navigator.geolocation) {
        $('#location').hide();
    } else {
        $("#location .ui-btn-inner").unbind().click(function(){
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                // hide location marker and reset button color
                mapManager.displayFeature(null);
                $(this).css('background', 'inherit');
                return;
            }
            watchId = navigator.geolocation.watchPosition(
                mapManager.geolocate,
                function() {
                    alert('Impossible to get current position');
                },
                {
                    enableHighAccuracy : true,
                    maximumAge         : 30000,
                    timeout            : 27000
                }
            );
            $(this).css('background', 'red');
        });
    }

});
