$(document).ready(function(){
    var TVGuide = window.TVGuide;

    /* Get important DOM elements */
    var main = document.getElementById('main');
    var toggle_debug_btn = document.getElementById('toggle_debug_btn');
    var debug_widgets = document.getElementById('debug_widgets');
    var debug_info = document.getElementById('debug_info');
    var refresh_debug_info_btn = document.getElementById('refresh_debug_info_btn');
    var clear_btn = document.getElementById('clear_btn');
    var generate_20_btn = document.getElementById('generate_20_btn');
    var ms_w_inpt = document.getElementById('ms_w_inpt');
    var row_h_inpt = document.getElementById('row_h_inpt');
    var limit_to_view_check = document.getElementById('limit_to_view_check');
    var api_load_btn = document.getElementById('api_load_btn');
    var load_on_scroll_check = document.getElementById('load_on_scroll_check');
    var debug_scroll_check = document.getElementById('debug_scroll_check');
    var filter_by_user_inpt = document.getElementById('filter_by_user_inpt');

    var debug_widgets_visible = false;

    /* The TVGuide, view, and controller */
    var tvguide = new TVGuide();
    var view = tvguide.get_simple_view();
    var controller = new TVGuide.SimpleController(view);

    /* Attach datemarker and view element */
    debug_widgets.insertBefore(view.render_datemarker(), debug_widgets.firstChild);
    main.appendChild(view.get_elem());

    /* Widgets' initial state */
    ms_w_inpt.value = view.ms_w;
    row_h_inpt.value = view.row_h;
    load_on_scroll_check.checked = controller.active;
    debug_scroll_check.checked = controller.DEBUG_SCROLL;
    filter_by_user_inpt.value =
        render_int_or_null(controller.filter_by_user);


    /*************
     * Utilities *
     *************/

    function render_int_or_null(x){
        if(x === null)return "";
        return String(x|0);
    }

    function parse_int_or_null(x){
        if(x === "")return null;
        return x|0;
    }


    /********************
     * Widget functions *
     ********************/

    function create_random_events(n, limit_to_view){
        var start, duration;
        if(limit_to_view){
            start = view.get_start();
            duration = view.get_duration();
        }else{
            start = view.start;
            duration = view.duration;
        }
        var events_data = TVGuide.Event.random_events_data(n, start, duration);
        tvguide.add_events(events_data);
        view.update();
    }
    function load_api_events(){
        var start = view.get_start();
        var duration = view.get_duration();
        var end = moment(start + duration);

        var query = {
            start__lte: end.format(),
            end__gte: start.format()
        };

        var filter_by_user =
            parse_int_or_null(filter_by_user_inpt.value);
        if(filter_by_user !== null){
            query.user = filter_by_user;
        }

        th_api.events.get_all(query).then(function(data){
            var events_data = data.results;
            tvguide.add_events(events_data);
            view.update();
        });
    }
    function clear_events(){
        tvguide.clear();
        view.update();
    }
    function crop_events(){
        var start = view.get_start();
        var end = view.get_end();
        tvguide.crop(start, end);
        view.update();
    }


    /*******************
     * Event listeners *
     *******************/

    toggle_debug_btn.onclick = function(event){
        debug_widgets_visible = !debug_widgets_visible;
        if(debug_widgets_visible){
            debug_widgets.style.display = "";
        }else{
            debug_widgets.style.display = "none";
        }
    }
    refresh_debug_info_btn.onclick = function(event){
        debug_info.value =
            "Number of events: " + String(tvguide.events.length)
            + "\nNumber of rows: " + String(tvguide.rows.length)
            + "\nNumber of API calls: " + String(controller.n_api_calls)
        ;
    }
    clear_btn.onclick = function(event){
        clear_events();
    }
    crop_btn.onclick = function(event){
        crop_events();
    }
    generate_20_btn.onclick = function(event){
        create_random_events(20, limit_to_view_check.checked);
    }
    api_load_btn.onclick = function(event){
        load_api_events();
    }
    ms_w_inpt.onchange = function(event){
        var ms_w = parseFloat(ms_w_inpt.value);
        if(ms_w){
            view.ms_w = ms_w;
            view.update();
        }
    }
    row_h_inpt.onchange = function(event){
        var row_h = parseInt(row_h_inpt.value);
        if(row_h){
            view.row_h = row_h;
            view.update();
        }
    }
    load_on_scroll_check.onclick = function(event){
        controller.active = load_on_scroll_check.checked;
    }
    debug_scroll_check.onclick = function(event){
        controller.DEBUG_SCROLL = debug_scroll_check.checked;
    }
    filter_by_user_inpt.onchange = function(event){
        controller.filter_by_user =
            parse_int_or_null(filter_by_user_inpt.value);
    }

});
