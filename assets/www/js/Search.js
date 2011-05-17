app.Search = function(options) {

    var search     = $('#'+options.form),
        results    = $('#'+options.list),
        alertbox   = $('#'+options.alert),
        mapManager = options.mapManager,
        links      = $('#'+options.list+' a');
    options = null;

    // Unbind jQuery standard form submit listener
    search.die('submit');

    search.live('submit', function(e){

        // Prevent form send
        e.preventDefault();

        // Show loader, empty alert message and empty results list
        $.mobile.pageLoading();
        results.empty();
        alertbox.empty();

        $.getJSON(search.attr('action')+'?'+search.serialize(), function(data) {
            app.results = data.results;
            if (app.results.length === 0) {
                $('<div>No results</div>').appendTo(alertbox);
                $.mobile.pageLoading(true);
                return;
            }
            // results grouping
            var types = {};
            $(data.results).each(function(i, place){
                if (!types[place.type]) {
                    types[place.type] = [];
                }
                types[place.type].push(place);
            });

            // Update #results ul with types dividers
            $.each(types, function(i, type){
                results.append($('<li data-role="list-divider">'+i+'</li>'));
                $(type).each(function(i, place){
                    results.append(
                        $('<li><a href="#" id="f_'+place.id+'" rel="'+place.bbox.join(',')+'">'+place.listlabel+'</a></li>')
                    );
                });
            });

            // Refresh markup & hide loader
            results.listview('refresh');
            $.mobile.pageLoading(true);
        });

    });

    // Recenter on results
    links.live('click', function(e) {
        e.preventDefault();
        $.mobile.changePage('map', 'flip');
        // Recenter map
        mapManager.recenter($(this).attr('rel').split(','));
        // Display results geometry
        var id = $(this).attr('id').substr(2);
        $(app.results).each(function(i, feature) {
            if (feature.id == id && feature.type=='Adresse') {
                $.getJSON(
                    app.bodFeatureURI+'&ids='+feature.id, 
                    mapManager.displayFeature
                );
                return false;
            }
        });
    });

}
