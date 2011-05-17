/**
 * Function: app.POISelector
 * Calling this function will "enhance" the POIs listview
 * so new layers are added/removed from the POI layer's
 * layers param when checkboxes are checked/unchecked.
 *
 * Parameters:
 * options - {Object} Options objects with these properties:
 *  - mapManager - {app.Map} The map manager
 *  - poiselector - {Element} The id of listview DOM element
 */
app.POISelector = function(options) {
    var checkboxes = $("#" + options.poiselector + " input[type='checkbox']");
    checkboxes.change(function() {
        var layers = [];
        checkboxes.each(function() {
            if (this.checked) {
                layers.push(this.name);
            }
        });
        options.mapManager.mergePOILayers(layers);
    });

    var displayLegend = function(e){
        var line = $(this).closest('.ui-checkbox');
        if (!line.hasClass('expanded')) {
            line.find('.ui-btn-text p').show();
        } else {
            line.find('.ui-btn-text p').hide();
        }
        line.toggleClass('expanded');
        e.preventDefault();
        e.stopPropagation();
    };
    $('#'+options.poiselector+' a.ui-link')
        .unbind()
        .click(displayLegend)
        .tap(displayLegend);
};
