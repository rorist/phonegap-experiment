app = window.app || {};
app.Map = function(options) {

    var div = options.div,
        popup = $('#'+options.popup);
    options = null;

    // list of POI layers that are always displayed on the map.
    var poiLayers = ['locaux_h', 'locaux_labels',
                     'batiments_routes_labels'];

    // list of floors (switches of switchable layers)
    var floors = [
        '-4', '-3', '-2', '-1', '0', '1',
        '2', '3', '4', '5', '6', '7', '8', 'all'];

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

    // create the orthophoto layer (baselayer)
    // FIXME we use plan-demo.epfl.ch, we'll need to change that
    // at some point
    var ortho = new OpenLayers.Layer.TileCache('ortho',
        'http://plan-demo.epfl.ch/tilecache', 'ortho-merc', {
        format: 'image/jpeg',
        isBaseLayer: true,
        visibility: false,
        maxExtent : new OpenLayers.Bounds(
            -20037508.3427892, -20037508.3427892,
            20037508.3427892, 20037508.3427892
        )
        // numZoomLevels, and maxResolution used to create
        // the grid are taken from the map
    });

    // create EPFL buildings layer, and switch it to the
    // "all" floor
    // FIXME we use plan-demo.epfl.ch, we'll need to change that
    // at some point
    var buildings = new app.SwitchableTileCache('background', [
        //'http://plan-epfl-tile0.epfl.ch',
        //'http://plan-epfl-tile1.epfl.ch',
        //'http://plan-epfl-tile2.epfl.ch'
        'http://plan-demo.epfl.ch/tilecache'
    ], 'batiments', {
        format: 'image/png',
        isBaseLayer: false,
        switches: floors,
        postfix: '-merc',
        maxExtent : new OpenLayers.Bounds(
            -20037508.3427892, -20037508.3427892,
            20037508.3427892, 20037508.3427892
        )
        // numZoomLevels, and maxResolution used to create
        // the grid are taken from the map
    });
    buildings.doSwitch('all');

    // EPFL POIs
    var layerNames = Array.prototype.concat.call(
        ['parkings_publics', 'arrets_metro', 'information'],
        poiLayers);
    var pois = new app.SwitchableWMS('pois',
        'http://plan.epfl.ch/wms_themes', {
        layers: layerNames,
        format: 'image/png',
        transparent: 'true',
        LOCALID: '-1' // required, but don't know that it is
                      // at this point
    }, {
        singleTile: true,
        visibility: true,
        notSwitchable: ['batiments_routes_labels'],
        switches: floors,
        transitionEffect: "resize"
    });
    pois.doSwitch('all');

    // create vector layer to display search and
    // geolocation results
    var vector = new OpenLayers.Layer.Vector('vector');

    // add layers to the map
    map.addLayers([osm, ortho, buildings, pois, vector]);

    // set shadow properties on the canvas context, must be
    // done after the layer is added to the map (for some
    // reason)
    vector.renderer.canvas.shadowOffsetX = 0;
    vector.renderer.canvas.shadowOffsetY = 0;
    vector.renderer.canvas.shadowBlur = 3;
    vector.renderer.canvas.shadowColor = "rgba(255, 255, 255, 1)";

    var geolocateControl = new OpenLayers.Control.Geolocate({
        id: 'locate-control',
        geolocationOptions: {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: 7000
        },
        eventListeners: {
            'locationupdated': function(e) {
                vector.destroyFeatures();
                vector.addFeatures([
                    new OpenLayers.Feature.Vector(
                        e.point,
                        {},
                        {
                            graphicName: 'cross',
                            strokeColor: '#f00',
                            strokeWidth: 2,
                            fillOpacity: 0,
                            pointRadius: 10
                        }
                    ),
                    new OpenLayers.Feature.Vector(
                        OpenLayers.Geometry.Polygon.createRegularPolygon(
                            new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                            e.position.coords.accuracy / 2,
                            50,
                            0
                        ),
                        {},
                        {
                            fillOpacity: 0.1,
                            fillColor: '#000',
                            strokeColor: '#f00',
                            strokeOpacity: 0.6
                        }
                    )
                ]);
                map.zoomToExtent(vector.getDataExtent());
            },
            scope: this
        }
    });
    map.addControl(geolocateControl);
   
// PhoneGap
    var geolocWatchId = null;
    var geolocOptions = { frequency: 1000 };
    var geolocOnSuccess = function(position){
        geolocateControl.geolocate(position);
    };
    var geolocOnError = function(error){
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    };
// END PhoneGap

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

    /**
     * APIMethod: toggleGeolocate
     * Toggle activation of the geolocate control.
     * 
     * Returns:
     * {Boolean} State of the control (activated or not).
     */
    this.toggleGeolocate = function() {
        if (geolocWatchId == null) {
            geolocWatchId = navigator.geolocation.watchPosition(geolocOnSuccess, geolocOnError, geolocOptions);
            return false;
        } else {
            navigator.geolocation.clearWatch(watchId);
            vector.destroyFeatures();
            geolocWatchId = null;
            return true;
        }
    };

    /**
     * APIMethod: switchBaseLayer
     * Switch the base layer (toggle).
     */
    this.switchBaseLayer = function() {
        var baseLayers = map.getLayersBy('isBaseLayer', true),
            i = 0,
            l = baseLayers.length,
            layer;
        for (; i<l; i++) {
            layer = baseLayers[i];
            if (layer !== map.baseLayer) {
                break;
            }
        }
        map.setBaseLayer(layer);
    };

    /**
     * APIMethod: addMarker
     * Add a marker to the map, and make this marker selectable.
     *
     * Parameters:
     * f - {OpenLayers.Feature.Vector} The feature to add a marker for.
     * content - {String} The feature description
     */
    this.addMarker = function(f, content) {
        var p = f.geometry.getCentroid();
        map.setCenter(new OpenLayers.LonLat(p.x, p.y), 18);
        vector.destroyFeatures();
        f.style = {
            graphicWidth    : 21,
            graphicHeight   : 25,
            graphicYOffset  : -28,
            externalGraphic : app.markerURL,
            label: content
        };
        vector.addFeatures([f]);
    };

    /**
     * APIMethod: mergePOILayers
     * Reconfigure the POI layer with new layers. The passed
     * layers are combined with layers that are always on.
     *
     * Parameters:
     * layers - {Array(String)} The list of layers to merge.
     *
     */
    this.mergePOILayers = function(layers) {
        layers = Array.prototype.concat.call(layers, poiLayers);
        pois.mergeNewParams({layers: layers});
    };

    /**
     * APIMethod: switchFloor
     * Switch floor for all switchable layers of the map
     *
     * Parameters
     * floor - {Integer||String} The floor to switch at.
     *
     */
    this.switchFloor = function(floor) {
        buildings.doSwitch(floor);
        pois.doSwitch(floor);
    };
};


    //var ortho = new OpenLayers.Layer.TileCache(
        //'ortho',
        //tilecache_uri,
        //'ortho-ch',
        //{
            //format           : 'image/jpeg',
            //projection       : new OpenLayers.Projection('EPSG:21781'),
            //maxExtent        : new OpenLayers.Bounds(485869.5728,76443.1884,837076.5648,299941.7864),
            //transitionEffect : 'resize',
            //buffer           : 0
        //}
    //);
