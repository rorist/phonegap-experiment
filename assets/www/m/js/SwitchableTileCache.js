/**
 * Class: app.SwitchableTileCache
 * TileCache Layer that can be "switched", which means its layers and/or URL are
 * dependent of special string called "switch".
 *
 * Typical usage:
 * (start code)
 * var myLayer = new app.SwitchableTileCache("myLayer", url, "foobar", {
 *     switches: ['1', '2']
 * });
 * map.addLayer(myLayer);
 * myLayer.doSwitch('2');
 * (end)
 *
 * Inherits from:
 *  - {<OpenLayers.Layer.TileCache>}
 */
app.SwitchableTileCache = OpenLayers.Class(OpenLayers.Layer.TileCache, {

    /**
     * APIProperty: switches
     * {Array(<String>)} List of possible switches
     */
    switches: null,

    /**
     *
     * @type
     */
    newSwitch: null,

    /**
     * Postfix for layers names
     */
    postfix: "",

    /**
     * Constructor: app.SwitchableTileCache
     *
     * Parameters:
     * options {Object} Optional object whose properties will be set on the
     *     instance
     *
     * Returns:
     * {<app.SwitchableTileCache>}
     */

    /**
     * APIMethod: getURL
     * Call parent getURL with updated params
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} 
     *
     * Returns:
     * {String}
     */
    getURL:function(bounds) {
        var oldLayername = this.layername;
        this.layername += this.newSwitch + this.postfix;
        var url = OpenLayers.Layer.TileCache.prototype.getURL.apply(this, [bounds]);
        this.layername = oldLayername;
        return url;
    },

    /**
     * Method: doSwitch
     * Unpdates URL and layers with new switch string.
     *
     * Parameters:
     * s {String} Switch string
     */
    doSwitch: function(s) {
        if (s == 9) {
            s = 'all';
        }
        this.newSwitch = s;
        return this.redraw();
    },

    CLASS_NAME: "app.SwitchableTileCache"
});

