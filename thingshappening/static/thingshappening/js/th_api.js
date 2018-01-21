

(function(){

var th_api = window.th_api = {};

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


th_api.get_users = function(){
    return th_api.request("GET", th_api.USERS_URL);
}

th_api.get_user = function(id){
    return th_api.request("GET", th_api.USERS_URL + "/" + id);
}

th_api.post_user = function(data){
    return th_api.request("POST", th_api.USERS_URL, data);
}

})();
