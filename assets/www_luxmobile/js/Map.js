app.Map = function(div) {


    // Private

    var tilecache_url =  [
            'http://tile1.geoportail.lu',
            'http://tile2.geoportail.lu',
            'http://tile3.geoportail.lu',
            'http://tile4.geoportail.lu'
        ],
        style = {
            fillOpacity: 0.1,
            fillColor: '#000',
            strokeColor: '#f00',
            strokeOpacity: 0.6
        },
        vector;

    var map = new OpenLayers.Map({
        div: div,
        theme: null,
        controls: [
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    interval: 100,
                    enableKinetic: true
                }
            })//,
	    //new OpenLayers.Control.Permalink({anchor: true})
        ],
        projection: new OpenLayers.Projection("EPSG:2169"),
        displayProjection: new OpenLayers.Projection("EPSG:2169"),
        units: "m",
        maxExtent: OpenLayers.Bounds.fromArray([48000,57000,107000,139000]),
        restrictedExtent: OpenLayers.Bounds.fromArray([40000,50000,120000,150000]),
        resolutions: [500.0, 250.0, 150.0, 100.0, 50.0, 20.0, 10.0, 5.0, 2.0, 1.0, 0.5]
    });
    var getLayers = function() {

        var pixelmapsColor = new OpenLayers.Layer.TileCache(
            "pixelmaps-color",
            tilecache_url,
            'topo',
            {
                format: 'image/png',
                buffer: 1,
                transitionEffect: 'resize',
                tileLoadingDelay: 125
            }
        );
        var topo_mobile = new OpenLayers.Layer.TileCache(
            "topo_mobile",
            tilecache_url,
            'topo_mobile',
            {
                format: 'image/jpeg',
                buffer: 1,
                transitionEffect: 'resize',
                tileLoadingDelay: 125
            }
        );
        var aerial = new OpenLayers.Layer.TileCache(
            "aerial",
            tilecache_url,
            'ortho',
            {
                format: 'image/jpeg',
                buffer: 0,
                transitionEffect: 'resize',
                tileLoadingDelay: 125
            }
        );
       var parcels = new OpenLayers.Layer.TileCache(
            "parcels",
            tilecache_url,
            'cadastre',
            {
                format: 'image/png',
                buffer: 0,
                transitionEffect: 'resize',
                tileLoadingDelay: 125
            }
        );
        
        var streets = new OpenLayers.Layer.TileCache(
            "streets",
            tilecache_url,
            'streets_jpeg',
            {
                format: 'image/jpeg',
                buffer: 0,
                transitionEffect: 'resize',
                tileLoadingDelay: 125
            }
        );
        

        vector = new OpenLayers.Layer.Vector('vector');

        return [streets,topo_mobile, topo_mobile, aerial, vector,parcels];

    }

    var setMarker = function(p, accuracy) {
        vector.removeAllFeatures();
        var marker = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(p.x, p.y),
            {},
            {
                graphicName: 'cross',
                strokeColor: '#f00',
                strokeWidth: 2,
                fillOpacity: 0,
                pointRadius: 10
            }
        );
        // Display accuracy
        var circle =  new OpenLayers.Feature.Vector(
            OpenLayers.Geometry.Polygon.createRegularPolygon(
                new OpenLayers.Geometry.Point(p.x, p.y),
                accuracy/2,
                50,
                0
            ),
            {},
            style
        );
        vector.addFeatures([circle, marker]);
        map.zoomToExtent(circle.geometry.getBounds());
    };

    var format = new OpenLayers.Format.GeoJSON();

    // Init
    map.addLayers(getLayers());
    map.zoomToMaxExtent();


    // Public

    /**
     * {OpenLayers.Map} The OpenLayers' Map instance
     */
    this.map = map;

    /**
     * ApiMethod: set map base layer
     */
    this.setLayer = function(layer) {
        map.setBaseLayer(
            map.getLayersByName(layer)[0]
        );
    };

    /**
     * ApiMethod: recenter on user position
     */
    this.geolocate = function(position) {
        var accuracy = position.coords.accuracy;
        var point =  new OpenLayers.Geometry.Point(
         position.coords.longitude,	  
         position.coords.latitude	  
        ).transform(
      new OpenLayers.Projection('EPSG:4326'),
           map.getProjectionObject()
       );
;
	 setMarker(point, accuracy);
    };

    /**
     * ApiMethod: recenter search result
     */
    this.recenter = function(coords) {
        var bounds = OpenLayers.Bounds.fromArray(coords);
        map.zoomToExtent(bounds);
    };

    /**
     * ApiMethod: display passed feature geometry on map
     */
    this.displayFeature = function(data) {
        vector.removeAllFeatures();
        if (data) {
            vector.addFeatures(format.read(data));
        }
    };


};
