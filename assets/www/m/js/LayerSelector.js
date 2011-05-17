app.LayerSelector = function(options) {

    var floorSelector     = $('#'+options.floorselector).parent().parent(),
        baseFloorSelector = $('#'+options.floorselector),
        layergroup        = $('#'+options.layergroup);
        layerselector     = $('#'+options.layerselector),
        switchFloor       = options.switchFloor,
        switchBaseLayer   = options.switchBaseLayer;

    options = null;

    // initial translation
    layerselector.find('.ui-btn-text').text(OpenLayers.i18n('ortho'));

    layerselector.unbind().click(function(e){

        // Disable standard jquery button
        e.preventDefault();
        e.stopPropagation();

        // don’t highlight button
        $(this).removeClass('ui-btn-active');

        // move hidden button for better toolbar redraw
        var next;
        if ($(this).attr('href')==='ortho') {
            next = 'plan';
            floorSelector.hide().appendTo(document.body);
        } else {
            next = 'ortho';
            floorSelector.show().prependTo(layergroup);
            $(this).removeClass('ui-corner-left');
        }
        $(this).attr('href', next);
        $(this).find('.ui-btn-text').text(OpenLayers.i18n(next));

        // switch base layer
        switchBaseLayer();

        // Refresh toolbar
        baseFloorSelector.select('refresh');
        layergroup.controlgroup('refresh');
    });

    floorSelector.change(function(){
        switchFloor($(this).find('select').val());
        window.scrollTo(0,1);
    });

};
