app = window.app || {};
//var pinch; // PhoneGap
$(document).ready(function(){
    OpenLayers.Lang.setCode(app.lang);
    $.mobile.defaultTransition = 'pop';

    // Start with the map page
    if (window.location.hash && window.location.hash!='#mappage') {
        $.mobile.changePage('mappage', 'flip');
    }

    $('.toggle').hide();
    $('#routing_form').hide();
 
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

    var refresh = function(){
    	map.layers[3].events.triggerEvent("refresh", {force: true});
    }
    
    $("#refresh .ui-btn-inner").unbind().click(function(e){
        refresh();
    });
    
    
    $("#pic .ui-btn-inner").unbind().click(function(e){
    	// Clean form
        $('#picname')[0].value = '';
        $('#picdesc')[0].value = '';
        $('#piclat')[0].value = 0;
        $('#piclon')[0].value = 0;
        $('#picdata')[0].value = 0;
        $('#myImage')[0].src = '';
    	// Load data
        $.mobile.pageLoading();
        navigator.camera.getPicture(onSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.DATA_URL }); 
        function onSuccess(imageData) {
        	var data = "data:image/jpeg;base64,"+imageData;
            $('#myImage')[0].src = data;
            $('#picdata')[0].value = data;
        	// Position by GPS
            navigator.geolocation.getCurrentPosition(
                function(pos){
                	// Success
                	$.mobile.pageLoading(true);
                	var nw = new OpenLayers.LonLat(pos.coords.longitude, pos.coords.latitude);
                	var nwGoo = nw.transform(
                	   new OpenLayers.Projection("EPSG:4326"), 
                	   new OpenLayers.Projection("EPSG:900913"));
                    $('#piclat')[0].value = nwGoo.lat;
                    $('#piclon')[0].value = nwGoo.lon;
                },
                function(error){
                	// Error
                	$.mobile.pageLoading(true);
                	alert(error.message);
                });
        }
        function onFail(message) {
            alert('Failed because: ' + message);
            $.mobile.pageLoading(true);
            $.mobile.changePage($('#mappage'));
        }
    });
   $('#form1').unbind().submit(function(e) {
   	    var ctxt = map;
        e.stopPropagation();
        e.preventDefault();
   	    // Some kind of validation
        if($('#picname')[0].value == ""){
            alert('You must provide a name!');
            return;
        }
        if($('#picdata')[0].value == "" || $('#picdata')[0].value == "0"){
            alert('There is no photo!');
            return;
        }
        if($('#piclat')[0].value == "" || $('#piclon')[0].value == ""){
        	alert('Geolocation problem!');
        	return;
        }
        if($('#picdesc')[0].value == ""){
            $('#picdesc')[0].value = "None";
        }
        // Position choice
        if($('#radio-choice-2').attr('checked')){
            // Position of the map center
            c = ctxt.getCenter();
            $('#piclat')[0].value = c.lat;
            $('#piclon')[0].value = c.lon;
        }
        // Send data
   	    $.mobile.pageLoading();
		$.ajax({
	      crossDomain: true,
		  url: 'http://10.27.10.22:3000',
		  type: 'POST',
		  data: $(this).serialize(),
		  complete: function(res){
            $.mobile.pageLoading(true);
            refresh();
            // Add point to map
            /*
            var style = {
            	externalGraphics: $('#picdata')[0].value,
                graphicHeight: 64,
                graphicWidth: 64,
                graphicXOffset: -32,
                graphicYOffset: -32,
            };
            var point = new OpenLayers.Geometry.Point($('#piclon')[0].value, $('#piclat')[0].value);
            var pointFeature = new OpenLayers.Feature.Vector(point, null, style);
            ctxt.layers[3].addFeatures([pointFeature]);
            */
            // Feedback to user
            alert(res.responseText);
		  	$.mobile.changePage($('#mappage'));
		  },
		});
    });
// END PhoneGap

});
