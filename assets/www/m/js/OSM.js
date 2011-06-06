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
    
    deviceready: false,
    
    getURLasync: function(bounds, scope, prop, callback){
    	bounds = this.adjustBounds(bounds); // FIXME ?
        var ctxt = this;
        var imgDiv = scope[prop];
        var url = OpenLayers.Layer.OSM.prototype.getURL.apply(this, arguments);
        var save = function(){
            imgDiv.onload = function(){
            	ctxt.saveImage(url, imgDiv)
            };
            imgDiv.src = url;
            callback.apply(scope);
	    };
	    
	    function onDeviceReady(){
	    	this.deviceready = true;
	        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
	            fs.root.getFile("Android/com.camptocamp.phonegap/" + urlFriendly(url),
	            {}, 
	            function(entry){
	                entry.file(function(file){
	                    var reader = new FileReader();
	                    reader.onloadend = function(e){
	                        imgDiv.src = e.target.result;
	                        callback.apply(scope);
	                        console.log("!!!CACHE USED!!! "+e.target.result);
	                    }
	                    reader.readAsText(file);
	                }, function(error){save();});
	            }, function(error){
				    $.mobile.pageLoading();
				    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
					    function(fs) {
					        fs.root.getDirectory("Android/com.camptocamp.phonegap", {create: true}, function(){
					            save();
					            $.mobile.pageLoading(true);
					        });
					    }, function(){});
	            });
	        }, function(error){
	        	save();
	        	console.log("Filesystem request error");
	        });
        }
        
        if(!this.deviceready){
        	// We need to wait PhoneGap library to be fully loaded
           document.addEventListener("deviceready", onDeviceReady, false);
        } else {
           onDeviceReady();
        }
    },
    
    saveImage: function(url, imgDiv){    	
        var cnv = document.createElement("canvas");
        cnv.width = imgDiv.offsetWidth;
        cnv.height = imgDiv.offsetHeight;
        var ctx = cnv.getContext("2d");
        ctx.drawImage(imgDiv, 0, 0);
        
        var success = false;
        try {
            var data = cnv.toDataUrl();
            if(data!="data:,"){
                success = true;
                writeFile(url, data);
            }
        } catch(ex) {
        } finally {
            if(!success){
                JSONP("http://jsonfree.appspot.com/geturl?url=" + url + "&b64=true", 
                    function(result) {
                    	writeFile(url, result.data);
                    }
                );
            }
        }
        
        var writeFile = function(url, data){
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
               fs.root.getFile("Android/com.camptocamp.phonegap/" + urlFriendly(url),
                   {create: true, exclusive: true},
                   function(entry){
                        if(entry.createWriter){
                            entry.createWriter(function(writer){
                                writer.onwrite = function(e){
                                    console.log("written "+url);
                                };
                                writer.write(data);
                            }, function(error){console.log("error createWriter");});
                        } else {
                        	console.log("entry is not a FileEntry path=" + entry.fullPath+", url="+url);
                        }
                   }, function(error){console.log("error getFile");});
            }, function(error){console.log("error requestFileSystem");});
        };
    },

    CLASS_NAME: "app.OSM"
});
