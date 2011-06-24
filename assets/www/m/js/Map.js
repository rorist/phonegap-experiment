app = window.app || {};
app.Map = function(options) {

    var div = options.div,
        popup = $('#'+options.popup);
    
    options = null;

    // create map
    var map = new OpenLayers.Map({
        div           : div,
        theme         : null,
        projection    : new OpenLayers.Projection('EPSG:900913'),
        numZoomLevels : 23,
        maxResolution : 156543.0339,
        maxExtent     : new OpenLayers.Bounds(
            -128 * 156543.0339,
            -128 * 156543.0339,
            128 * 156543.0339,
            128 * 156543.0339
        ),
        units         : "m",
        controls      : [
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    interval: 1,
                    enableKinetic: true
                }
            })
        ]
    });

    // create OSM layer (baselayer)
    var osm = new app.OSM({
        name: 'plan',
        url: [
            'http://plan-osm-tile0.epfl.ch/${z}/${x}/${y}.png',
            'http://plan-osm-tile1.epfl.ch/${z}/${x}/${y}.png',
            'http://plan-osm-tile2.epfl.ch/${z}/${x}/${y}.png'
        ]
    });
    
// PhoneGap
    var popup;
    var imgs = new OpenLayers.Layer.Vector("Image POIs", {
    	protocol: new OpenLayers.Protocol.HTTP({
    		url: 'http://plan-dev.epfl.ch/android/points.txt',
    		format: new OpenLayers.Format.Text()
    	}),
    	strategies: [
    	   new OpenLayers.Strategy.Fixed(),
    	   new OpenLayers.Strategy.Refresh()
        ]
    });
    var imgsCtrl = new OpenLayers.Control.SelectFeature(imgs, {
        callbacks: {
            click: function(feature){
                $('#viewimage_title').html(unescape(feature.data.title.replace(/\+/g, " ")));
                $('#viewimage_desc').html(unescape(feature.data.description.replace(/\+/g, " ")));
                $('#viewimage_img')[0].src = feature.style.externalGraphic;
                $('#imageview_close').unbind().click(function(e){
                    $('.ui-dialog').dialog('close')
                });
                $.mobile.changePage('viewimage', 'pop');
            },
            clickout: function(feature){}
        }
    });
    map.addControl(imgsCtrl);
    imgsCtrl.activate();
// END PhoneGap

    // add layers to the map
    map.addLayers([osm, imgs]);

    // map is ready, display it
    map.zoomToExtent(
        new OpenLayers.Bounds(
            729830.30059377, 5863139.2779838,
            732878.22709622, 5864882.9976914
        )
    );


    // Public

    /**
     * APIProperty: map
     * {OpenLayers.Map} The OpenLayers Map object.
     */
    this.map = map;
};
