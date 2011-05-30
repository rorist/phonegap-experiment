var _jsonp_counter = 0;
var _jsonp_busy = false;
var _jsonp_queue = [];

function JSONP(url, callback) {
    if (!navigator.onLine) { return; }
    
    if (_jsonp_busy) {
        found = false;
        for (index in _jsonp_queue) {
            if (_jsonp_queue[index].url == url) {
                found = true;
                break;
            }
        }
        if (!found) {
            _jsonp_queue.push({"url":url, "callback":callback});
        }
        return;
    }
    _jsonp_busy = true;
    
    var headID = document.getElementsByTagName("head")[0];
    
    ticks =  (new Date()).getTime();
    jsonp_id = "jsonp_" + ticks + "_" + _jsonp_counter;
    _jsonp_counter++;
    jsonp_script = document.getElementById(jsonp_id);
    if (jsonp_script) { headID.removeChild(jsonp_script); }
    jsonp_script = document.createElement("script");
    jsonp_script.id = jsonp_id;
    jsonp_script.type = "text/javascript";
    jsonp_script.src = url + "&jsoncallback=jsoncallback&ticks=" + ticks;
    timer = setTimeout("cancelJSONP(" + jsonp_id + ")", 5000);
    this["jsoncallback"] = function(result) { 
        callback(result);
        _jsonp_busy = false;
        next = _jsonp_queue.pop();
        if (next) { JSONP(next.url, next.callback); }
    }
    headID.appendChild(jsonp_script);
}

function cancelJSONP(jsonp_id) {
    jsonp_script = document.getElementById(jsonp_id);
    if (jsonp_script) {
        jsonp_script.parentNode.removeChild(jsonp_script);
    }
    _jsonp_busy = false;
    next = _jsonp_queue.pop();
    if (next) { JSONP(next.url, next.callback); }
}
