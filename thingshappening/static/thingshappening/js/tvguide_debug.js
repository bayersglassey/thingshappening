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
    var generate_on_scroll_check = document.getElementById('generate_on_scroll_check');
    var load_on_scroll_check = document.getElementById('load_on_scroll_check');
    var debug_scroll_check = document.getElementById('debug_scroll_check');

    var debug_widgets_visible = false;

    /* The TVGuide, view, and controller */
    var tvguide = new TVGuide();
    var view = tvguide.get_simple_view();
    var controller = new TVGuide.SimpleController(view);
    controller.active = false;
    ms_w_inpt.value = view.ms_w;
    row_h_inpt.value = view.row_h;

    /* Attach view element */
    main.append(view.get_elem());

    /* Add some events */
    create_random_events(50, false);


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

});
