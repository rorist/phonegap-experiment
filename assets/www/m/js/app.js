app = window.app || {};
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
    
    // CACHE
    
    // Events
    function fail(e) {
        $.mobile.pageLoading(true);
        console.log(e.code);
    }
    
    $("#makefs .ui-btn-inner").unbind().click(function(e){
        $.mobile.pageLoading();
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
        function onFileSystemSuccess(fs) {
        	fs.root.getDirectory("Android/com.camptocamp.phonegap", {create: true}, function(){
        		$.mobile.pageLoading(true);
        	});
        }
        e.stopPropagation();
        e.preventDefault();
    });
    $("#delfs .ui-btn-inner").unbind().click(function(e){
        $.mobile.pageLoading();
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, fail);
        function success(fs) {
            fs.root.getDirectory("Android/com.camptocamp.phonegap", 0, function(entry){
                entry.removeRecursively(function(){
                    $.mobile.pageLoading(true);
                }, function(){
                    $.mobile.pageLoading(true);
                });
            }, function(){
                $.mobile.pageLoading(true);
            });
        }
        e.stopPropagation();
        e.preventDefault();
    });
    // END CACHE
    
    

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
