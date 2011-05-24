app = window.app || {};
//var pinch; // PhoneGap
$(document).ready(function(){
    OpenLayers.Lang.setCode(app.lang);
    $.mobile.defaultTransition = 'flip';

    // Start with the map page
    if (window.location.hash && window.location.hash!='#mappage') {
        $.mobile.changePage('mappage', 'flip');
    }

    $('.toggle').hide();
 
    // We override OpenLayers' onImageLoadError function, not
    // to have the browser display broken images when the tile
    // server returns 404 responses.
    OpenLayers.Util.onImageLoadError = function() {
        this.style.display = "none";
        // set the img src or webkit will still display a "broken
        // image" icon
        this.src = app.blankImageURL;
    };

    // Map
    var mapManager  = new app.Map({
            div   : 'map',
            popup : 'popup'
        }),
        map         = app.map = mapManager.map;

    // Search
    var search = new app.Search({
        form     : 'search_form',
        list     : 'search_results',
        alert    : 'search_alert',
        callback : mapManager.addMarker
    });

    // Map zoom in/out
    $("#plus .ui-btn-inner").unbind().click(function(e){
        map.zoomIn();
        e.stopPropagation();
        e.preventDefault();
    });
    $("#minus .ui-btn-inner").unbind().click(function(e){
        map.zoomOut();
        e.stopPropagation();
        e.preventDefault();
    });

    // Layer selector
    var layerSelector = new app.LayerSelector({
        layerselector: 'layerselector',
        layergroup: 'layergroup',
        floorselector: 'floorselector',
        switchFloor: mapManager.switchFloor,
        switchBaseLayer: mapManager.switchBaseLayer
    });

    // POI selector
    var poiSelector = new app.POISelector({
        poiselector   : 'poiselector',
        mapManager    : mapManager
    });

    // Zone selector
    var zoneSelector = new app.ZoneSelector({
        list        : 'zones-list',
        mapManager  : mapManager
    });

    // Geolocation
    if (!navigator.geolocation) {
        $('#locate').hide();
    } else {
        $("#locate .ui-btn-inner").unbind().click(function() {
            if (mapManager.toggleGeolocate()) {
                $(this).css('background', 'red');
            } else {
                $(this).css('background', 'inherit');
            }
        });
    }
    
// PhoneGap

    $("#pic .ui-btn-inner").unbind().click(function(e){

        //navigator.camera.getPicture(onSuccess, onFail, { quality: 50 });
        navigator.camera.getPicture(onSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI }); 
        
        function onSuccess(imageURI) {
            var image = document.getElementById('myImage');
            image.src = imageURI;
            
            
        }
        
        function onFail(message) {
            alert('Failed because: ' + message);
        }
        
        /*
        // Android Only
        navigator.device.capture.captureImage(onSuccess, onFail, {limit:1});
        function onSuccess(mediaFiles) {
            var image = document.getElementById('myImage');
            var i, path, len;
            for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                image.src = mediaFiles[i].fullPath;
            }
        }
        */

    });
    
/*
    OpenLayers.Event.isMultiTouch = function() {
        return true;
    }
    var callbacks = {
        start: function(){},
        move: function(){},
        done: function(){}
    };
    var control = new OpenLayers.Control();
    map.addControl(control);
    pinch = new OpenLayers.Handler.Pinch(control);
    pinch.activate();
*/
    
// END PhoneGap

});
