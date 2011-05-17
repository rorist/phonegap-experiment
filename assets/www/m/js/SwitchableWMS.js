/**
 * Class: app.SwitchableWMS
 * WMS Layer that can be "switched", which means its layers and/or URL are
 * dependent of special string called "switch".
 *
 * Typical usage with urlSwitch == true:
 * (start code)
 * var myLayer = new app.SwitchableWMS("myLayer", url, {
 *     layers: ['foo', 'bar']
 * }, {
 *     urlSwitch: true,
 *     switches: ['1', '2']
 * });
 * map.addLayer(myLayer);
 * myLayer.doSwitch('2');
 * (end)
 *
 * Typical usage with urlSwitch == false:
 * (start code)
 * var myLayer = new app.SwitchableWMS("myLayer", url, {
 *     layers: ['foo', 'bar']    // layer foo not switched
 * }, {
 *     layersToSwitch: ['bar'],
 *     switches: ['1', '2']
 * });
 * map.addLayer(myLayer);
 * myLayer.doSwitch('2');
 * (end)
 *
 * Inherits from:
 *  - {<OpenLayers.Layer.WMS>}
 */
app.SwitchableWMS = OpenLayers.Class(OpenLayers.Layer.WMS, {

    /**
     * APIProperty: switches
     * {Array(String)} List of possible switches
     */
    switches: null,

    /**
     * APIProperty: notSwitchable
     * {Array(String)} The list of layers not to switched. By
     *     default all layers are switchable.
     */
    notSwitchable: null,

    /**
     * Property: newSwitch
     * {String}
     */
    newSwitch: null,

    /**
     * Constructor: app.SwitchableWMS
     *
     * Parameters:
     * options {Object} Optional object whose properties will be set on the
     *     instance
     *
     * Returns:
     * {<app.SwitchableWMS>}
     */
    initialize: function() {
        this.notSwitchable = [];
        OpenLayers.Layer.WMS.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: getFullRequestString
     * Call parent getFullRequestString with updated url and layers
     *
     * Parameters:
     * newParams - {Object} WMS params
     * altUrl - {String} Use this as the url instead of the layer's url
     *
     * Returns:
     * {String}
     */
    getFullRequestString: function(newParams, altUrl) {
        newParams.LAYERS = this.getSwitchedLayers();
        var newArguments = [newParams, altUrl];
        return OpenLayers.Layer.WMS.prototype.getFullRequestString.apply(
                this, newArguments);
    },

    /**
     * Method: arrayify
     * Convert a coma-separated string into an array.
     *
     * Parameters:
     * subs - {String/Array}
     *
     * Returns:
     * {Array}
     *
     */
    arrayify: function(subs) {
        if (subs == '' || subs == null) {
            return [];
        } else if (subs instanceof Array) {
            return subs;
        } else {
            return subs.split(',');
        }
    },

    /**
     * Method: getSwitchedLayers
     * Returns an array containing the switched WMS layers names.
     *
     * Returns:
     * {Array}
     */
    getSwitchedLayers: function() {
        var layers = this.arrayify(this.params.LAYERS);
        var layer, i, len = layers.length;
        var newLayers = new Array(len);
        for (var i=0; i<len; i++) {
            layer = layers[i];
            newLayers[i] = this.notSwitchable.indexOf(layer) > -1 ?
                layer : layer + this.newSwitch;
        }
        return newLayers;
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

    CLASS_NAME: "app.SwitchableWMS"
});
