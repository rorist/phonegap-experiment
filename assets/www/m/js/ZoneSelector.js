app = window.app || {};
app.ZoneSelector = function(options) {
    var ORTHO_ZOOM_SWITCH = 19;
    var ZONES = {
        s_campus: [730154.802927831, 5863118.72088469, 733325.224489161, 5865045.8547912],
        s_neuchatel: [772223, 5940834, 773758, 5941915],
        s_ecal: [732792, 5866418, 734046, 5867381],
        s_aula: [736385, 5862548, 737667, 5863377],
        s_me: [6206739,2957591,6212180,2959626]
    };
    $("#" + options.list + " a").bind('click', function(e) {
        $.mobile.changePage('mappage', 'pop');

        // Recenter map to zone extent and floor value ORTHO_ZOOM_SWITCH
        options.mapManager.map.zoomToExtent(
            new OpenLayers.Bounds.fromArray(ZONES[$(this).attr('id')]));
        options.mapManager.switchFloor(ORTHO_ZOOM_SWITCH);
    });
};
