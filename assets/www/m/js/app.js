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
    
// PhoneGap
    $("#pic .ui-btn-inner").unbind().click(function(e){
        navigator.camera.getPicture(onSuccess, onFail, { quality: 5, destinationType: Camera.DestinationType.DATA_URL }); 
        function onSuccess(imageData) {
        	var data = "data:image/jpeg;base64,"+imageData;
            $('#myImage')[0].src = data;
            $('#picdata')[0].value = data;            
        }
        function onFail(message) {
            alert('Failed because: ' + message);
        }
    });
   $('#form1').unbind().submit(function(e) {
   	    $.mobile.pageLoading();
		$.ajax({
	      crossDomain: true,
		  url: 'zuort.wrk.lsn.camptocamp.com',
		  type: 'POST',
		  data: $(this).serialize(),
		  success: function(data){
		  	$.mobile.pageLoading(true);
		  	alert(data);
		  }
		});
        e.stopPropagation();
        e.preventDefault();
    });
// END PhoneGap

});
