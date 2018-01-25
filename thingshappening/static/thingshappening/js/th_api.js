

window.th_api = (function(){
var th_api = {};

th_api.BASE_URL = "/api";
th_api.USERS_URL = "/users";
th_api.EVENTS_URL = "/events";

th_api.get_full_url = function(url, params){
    var full_url = url;
    var separator = "?";
    if(params){
        for(var param_name in params){
            if(params.hasOwnProperty(param_name)){
                var param_value = params[param_name];
                full_url += separator + param_name + "=" + param_value;
                separator = "&";
            }
        }
    }
    return full_url;
}

th_api.request = function(method, url, params, data){
    var full_url = th_api.get_full_url(th_api.BASE_URL + url, params);
    var headers = new Headers();
    var options = {};
    if(data !== undefined){
        headers.set('Content-Type', 'application/json');
        options.data = JSON.stringify(data);
    }
    headers.set('Accept', 'application/json');
    options.method = method;
    options.headers = headers;
    var request = new Request(full_url, options);
    return fetch(request).then(function(response){
        return response.json();
    });
}

th_api.make_resource = function(url, query_params){
    return {
        get_all: function(params){
            var full_url = th_api.get_full_url(url, params);
            return th_api.request("GET", url, params);
        },
        get: function(id, params){
            return th_api.request("GET", url + "/" + id, params);
        },
        post: function(params, data){
            return th_api.request("POST", full_url, params, data);
        }
    }
}

th_api.users = th_api.make_resource(th_api.USERS_URL);
th_api.events = th_api.make_resource(th_api.EVENTS_URL);

return th_api;
})();
