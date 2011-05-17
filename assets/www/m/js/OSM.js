/**
 * Class: app.OSM
 * Application-specific OSM layer type. An app.OSM instance
 * requests "blank tiles" when the zoom level is greater
 * than 18.
 *
 * Inherits from:
 * - {OpenLayers.Layer.OSM}
 */
app.OSM = OpenLayers.Class(OpenLayers.Layer.OSM, {

    initialize: function(options) {
    
        options.numZoomLevels = 23;

        var newArguments = [options.name, options.url, options];
        OpenLayers.Layer.OSM.prototype.initialize.apply(this, newArguments);

        this.attribution = "Data CC-By-SA by OpenStreetMap";
    },

    getURL: function (bounds) {
        if (this.map.getZoom() > 18) {
            return app.blankImageURL;
        } else {
            return OpenLayers.Layer.OSM.prototype.getURL.apply(this, arguments);
        }
    },

    CLASS_NAME: "app.OSM"
});
