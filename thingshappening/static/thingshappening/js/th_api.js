

window.th_api = (function(){
var th_api = {};

th_api.BASE_URL = "/api";
th_api.USERS_URL = "/users";
th_api.EVENTS_URL = "/events";

th_api.request = function(method, url, data){
    var full_url = th_api.BASE_URL + url;
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

th_api.make_resource = function(url){
    return {
        get_all: function(){
            return th_api.request("GET", url);
        },
        get: function(id){
            return th_api.request("GET", url + "/" + id);
        },
        post: function(data){
            return th_api.request("POST", url, data);
        }
    }
}

th_api.users = th_api.make_resource(th_api.USERS_URL);
th_api.events = th_api.make_resource(th_api.EVENTS_URL);

return th_api;
})();
