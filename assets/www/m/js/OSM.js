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

    getURL: function (bounds, imgDiv) {
        if (this.map.getZoom() > 18) {
            return app.blankImageURL;
        } else {
            if(window.requestFileSystem){
                var url = OpenLayers.Layer.OSM.prototype.getURL.apply(this, arguments);
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
                    fs.root.getFile("Android/com.camptocamp.phonegap/" + urlFriendly(url), {}, function(entry){
                        entry.file(function(){
                            var reader = new FileReader();
                            reader.onloadend = function(e){
                                imgDiv.src = e.target.result;
                            }
                            reader.readAsDataURL(file);
                        }, function(){
                            imgDiv.src = url;
                        });
                    }, function(){
                        imgDiv.src = url;
                    });
                }, function(){
                    if(imgDiv != null){
                        imgDiv.src = url;
                    }
                });
            }
            return app.blankImageURL;
        }
    },

    CLASS_NAME: "app.OSM"
});
