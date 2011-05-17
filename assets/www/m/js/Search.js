app = window.app || {};
app.Search = function(options) {

    var search   = $('#'+options.form),
        results  = $('#'+options.list),
        alertbox = $('#'+options.alert),
        callback = options.callback,
        links    = $('#'+options.list+' a'),
        format   = new OpenLayers.Format.GeoJSON();
    options      = null;

    search.find('a[data-icon=delete]').click(function(e){
        e.preventDefault();
        e.stopPropagation();
        // change bottom toolbar for routing
        search.children(':not(.toggle)').show();
        search.children('.toggle').hide();
        
    });

    // On search result selection
    var selectResult = function(id) {
        
        var f = format.read(app.results[id])[0];

        $.ajax({
            url: app.infoURL,
            data: {
                lang: app.lang,
                layer: f.attributes.layer,
                id: f.attributes.id
            },
            dataType: 'jsonp',
            jsonp: 'cb',
            crossDomain: true,
            success  : function(data) {
                var parts = [];
                $(data.properties.content).find('.griddescr').each(function() {
                    var p = $(this).text().replace(/\n/,'');
                    if (p !== '') {
                        parts.push(p);
                    }
                });

                // Display marker
                var content;
                if (f.attributes.layer === 'Batiments_epfl') {
                    content = '';
                } else {
                    content = f.attributes.text;
                    content += (parts.length===0) ? '' : ' ('+parts.join(', ')+')';
                }
                callback(f, content);

                // change bottom toolbar for routing
                search.children(':not(.toggle)').hide();
                search.children('.toggle').show();
            }
        });
    };

    // Unbind jQuery standard form submit listener
    search.die('submit');

    search.live('submit', function(e){

        $('#keyword').blur();

        // Prevent form send
        e.preventDefault();

        // Show loader, empty alert message and empty results list
        $.mobile.pageLoading();
        results.empty();
        alertbox.empty();

        $.ajax({
            url      : search.attr('action')+'?'+search.serialize(),
            dataType : 'jsonp',
            jsonp    : 'cb',
            success  : function(data) {
                app.results = {};
                if (data.features.length === 0) {
                    $('<div>'+ OpenLayers.i18n('no_results')+'</div>').appendTo(alertbox);
                    $.mobile.pageLoading(true);
                    return;
                }
                // results grouping
                var types = {};
                $(data.features).each(function(i, place){
                    if (!types[place.properties.layer]) {
                        types[place.properties.layer] = [];
                    }
                    types[place.properties.layer].push(place);
                    // global lookup
                    app.results[place.id] = place;
                });

                // Update results ul with types dividers
                $.each(types, function(i, type){
                    results.append(
                        $('<li data-role="list-divider">'+i+'</li>')
                    );
                    $(type).each(function(i, place){
                        results.append($(
                            '<li><a href="#" id="f_'+place.id+'">'+
                            place.properties.text+
                            '</a></li>'
                        ));
                    });
                });

                // Refresh markup & hide loader
                if (1 === data.features.length) {
                    selectResult(data.features[0].id);
                } else {
                    $.mobile.changePage('searchpage');
                    results.listview('refresh');
                }
                $.mobile.pageLoading(true);
            }
        });

    });

    // Recenter on results
    links.live('click', function(e) {
        $.mobile.changePage('mappage', 'flip');
        selectResult($(this).attr('id').substr(2));
    });

}
