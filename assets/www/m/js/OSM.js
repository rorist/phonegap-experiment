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
        var ctxt = this;
        if (this.map.getZoom() > 18) {
            return app.blankImageURL;
        } else {
            if(window.requestFileSystem){
                var url = OpenLayers.Layer.OSM.prototype.getURL.apply(this, arguments);
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
                    fs.root.getFile("Android/com.camptocamp.phonegap/tiles/" + urlFriendly(url), {}, function(entry){
                        entry.file(function(){
                            var reader = new FileReader();
                            reader.onloadend = function(e){
                                imgDiv.src = e.target.result;
                            }
                            reader.readAsDataURL(file);
                        }, function(){
                            imgDiv.onload = function(){ctxt.saveImage(imgDiv, url);};
                            imgDiv.src = url;
                        });
                    }, function(){
                        imgDiv.onload = function(){ctxt.saveImage(imgDiv, url);};
                        imgDiv.src = url;
                    });
                }, function(){
                    if(imgDiv != null){
                        imgDiv.onload = OpenLayers.Function.bindAsEventListener(ctxt.saveImage, imgDiv);
                        imgDiv.src = url;
                    }
                });
            }
            return app.blankImageURL;
        }
    },
    
    saveImage: function(imgDiv){
    
        var error = function(e){
            console.log("error "+e.code);
        }
        
        var url = imgDiv.src;
        var cnv = document.createElement("canvas");
        cnv.width = imgDiv.offsetWidth;
        cnv.height = imgDiv.offsetHeight;
        var ctx = cnv.getContext("2d");
        ctx.drawImage(imgDiv, 0, 0);
        
        window.plugins.canvas.toDataURL(cnv, "image/png", function(arg){
            var data = arg.data.replace(/^data:image\/png;base64,/, "");
            console.log(data);
            if(data=="data:,"){
                return;
            }
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
                fs.root.getFile("Android/com.camptocamp.phonegap/tiles/" + urlFriendly(url), {create: true}, function(entry){
                    entry.createWriter(function(writer){
                        writer.onwrite = function(e){
                            console.log("written");
                        };
                        writer.write(data);
                    }, error);
                }, error);
            }, error);
        }, error);
    },

    CLASS_NAME: "app.OSM"
});
