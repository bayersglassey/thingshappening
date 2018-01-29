
window.TVGuide = (function(){

    function randInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function as_px(x){
        /* Convert integer to "pixels" value (suitable for use with CSS) */
        return String(x) + 'px';
    }

    /* Conversions from milliseconds */
    function seconds(x){
        return x * 1000;
    }
    function minutes(x){
        return x * 1000 * 60;
    }
    function hours(x){
        return x * 1000 * 60 * 60;
    }
    function days(x){
        return x * 1000 * 60 * 60 * 24;
    }

    function Event(data){
        /*
        Represents an event within a specific TVGuide widget
        Params:
            data: parsed event JSON
        */

        /* index of row we're in */
        this.row_i = null;

        this.update(data);
    }
    Event.random_events_data = function(n, start, duration, min_event_duration, max_event_duration){
        /* Create random event data for testing.
        The data is suitable for use with TVGuide.add_events(). */

        n = n || 1;
        start = start || moment();
        duration = duration || days(1);
        min_event_duration = min_event_duration || minutes(15);
        max_event_duration = max_event_duration || hours(2);

        var events_data = [];
        for(var i = 0; i < n; i++){

            /* Random event duration in milliseconds */
            var event_duration = randInt(min_event_duration, max_event_duration);

            /* Random event start */
            var event_start = moment(start + randInt(0, duration - event_duration));

            /* Create test data */
            var event_data = {
                id: null,
                title: "Test Event",
                description: "For testing purposes",
                start: event_start,
                end: event_start + event_duration,
                // image_url: "/static/thingshappening/img/rain-on-leaf.jpg"
            };
            events_data.push(event_data);
        }

        return events_data;
    }
    Event.prototype = {
        update: function(data){
            this.id = data.id;
            this.title = data.title;
            this.description = data.description;
            this.start = moment(data.start);
            this.end = moment(data.end);
            this.image_url = data.image_url;

            /* Save the raw data too, just in case... */
            this.data = data;
        },
        overlaps: function(other){
            /* 'this' and 'other' are both Events */
            return this.end > other.start && other.end > this.start;
        }
    };

    function Row(i){
        /* Row index */
        this.index = i;

        /* Array of events */
        this.events = [];
    }
    Row.prototype = {
        add_event: function(new_event){
            new_event.row_i = this.index;
            this.events.push(new_event);
        },
        remove_event: function(event){
            /* Returns bool: whether event was found & removed */
            var i = this.events.indexOf(event);
            if(i >= 0){
                event.row_i = null;
                this.events.splice(i, 1);
                return true;
            }
            return false;
        }
    };

    function TVGuide(){
        this.rows = [];
        this.events = [];
        this.events_by_id = {};
    }
    TVGuide.prototype = {
        clear: function(){
            this.rows.length = 0;
            this.events.length = 0;
            this.events_by_id = {};
        },
        remove_event: function(event){
            /* Remove from this.events_by_id */
            if(event.id !== null){
                delete this.events_by_id[event.id];
            }

            /* Remove from this.events */
            var i = this.events.indexOf(event);
            if(i >= 0)this.events.splice(i, 1);

            /* Unplace */
            this.unplace_event(event);
        },
        crop: function(start, end){
            /* Removes all events *outside* the given start/end times */
            var events = this.events;
            var n_events = events.length;
            for(var i = n_events - 1; i >= 0; i--){
                var event = events[i];
                if(event.end.isBefore(start) || event.start.isAfter(end)){
                    this.remove_event(event);
                }
            }
        },
        add_events: function(data){
            var n_events = data.length;
            for(var i = 0; i < n_events; i++){
                this.add_event(data[i]);
            }
        },
        add_event: function(data){
            var id = data.id;
            var event = this.events_by_id[id];

            /* NOTE: If data.id is null, we still add an event.
            It's guaranteed not to update an existing event.
            Useful for testing - see Event.random_events_data(). */
            if(id !== null && event !== undefined){
                /* Event already exists, update it */

                /* If start/end have changed, we need to move the event */
                var start = moment(data.start);
                var end = moment(data.end);
                var move_event =
                    (start - event.start != 0) ||
                    (end - event.end != 0);

                /* FOR DEBUGGING PURPOSES */
                move_event = true;

                if(move_event){
                    /* Simple move strategy: first remove it, then put it back
                    as if it were new */
                    this.unplace_event(event);
                }

                event.update(data);

                if(move_event){
                    /* Simple move strategy: first remove it, then put it back
                    as if it were new */
                    this.place_event(event);
                }
            }else{
                /* Event doesn't exist yet: create it */
                var new_event = new Event(data);

                this.events.push(new_event);

                if(id !== null){
                    /* Add event to this.events_by_id */
                    this.events_by_id[id] = new_event;
                }

                /* Add event to a row */
                this.place_event(new_event);
            }
        },
        unplace_event: function(event){
            /* Remove from row */
            var row = this.rows[event.row_i];
            row.remove_event(event);
        },
        place_event: function(new_event){
            /* Figure out which row to put event into, and put it there.
            Event is assumed to not currently be in any row.
            Preconditions:
                * new_event.row_i === null
                * new_event is not in any row's array of events
            Postconditions:
                * new_event is in one row's array of events
                * new_event.row_i === that row's index
            */

            /* Try to fit the event into an existing row */
            var rows = this.rows;
            var n_rows = rows.length;
            for(var i = 0; i < n_rows; i++){

                /* Check whether event overlaps with any in the row */
                var row = rows[i];
                var events = row.events;
                var n_events = events.length;
                for(var j = 0; j < n_events; j++){
                    var event = events[j];
                    if(event.overlaps(new_event))break;
                }

                /* Event didn't overlap with any in the row, so add it */
                if(j == n_events){
                    row.add_event(new_event);
                    return;
                }
            }

            /* Event didn't fit in any existing rows, so add a new Row with
            just the new event */
            var row = new Row(this.rows.length);
            this.rows.push(row);
            row.add_event(new_event);
        },
        get_simple_view: function(){
            return new SimpleView(this);
        }
    };

    function SimpleView(tvguide, start, duration, ms_w, row_h){
        this.tvguide = tvguide;

        /* Time represented by x-position 0 */
        this.start = start || moment();

        /* Duration represented by width */
        this.duration = duration || days(2);

        /* Width of a millisecond in pixels */
        this.ms_w = ms_w || 1 / seconds(30);

        /* Row height in pixels */
        this.row_h = row_h || 30;

        /* Create DOM elements */
        this.render();
    }
    SimpleView.prototype = {

        get_elem: function(){
            /* Get topmost DOM element representing this view */
            return this.view_container_elem;
        },
        get_start: function(){
            /* Get start time according to DOM element's scroll position */
            return this.px_to_moment(this.view_container_elem.scrollLeft);
        },
        get_duration: function(){
            /* Get duration according to DOM element's width */
            /* NOTE: When SimpleView is first created, its element's clientWidth
            is 0 until the first time it's rendered.
            I guess this is a common Javascript issue, but I don't know how to
            get around it. */
            return this.px_to_duration(this.view_container_elem.clientWidth);
        },
        get_end: function(){
            /* Get end time according to DOM element's scroll position + width */
            return moment(this.get_start() + this.get_duration());
        },


        /* Conversions between pixels and moments/durations */
        px_to_moment: function(x){
            return moment(this.start + x / this.ms_w);
        },
        moment_to_px: function(start){
            return (start - this.start) * this.ms_w;
        },
        px_to_duration: function(w){
            return w / this.ms_w;
        },
        duration_to_px: function(duration){
            return duration * this.ms_w;
        },


        /*****************************
         * SIMPLEVIEW: DEBUG MARKERS *
         *****************************/

        add_debug_marker: function(name, x0, x1, background){
            var w = x1 - x0;

            background = background || '#f00';

            /* Create & attach marker */
            var elem = document.createElement('div');
            elem.setAttribute('className', 'debug-marker');
            elem.style.background = background;
            elem.style.position = 'absolute';
            elem.style.width = as_px(w);
            elem.style.height = '10px';
            elem.style.top = as_px(0);
            elem.style.left = as_px(x0);
            this.view_elem.append(elem);

            /* Keep track of markers, move them instead of creating new ones */
            if(name){
                this.debug_markers = this.debug_markers || {};
                if(this.debug_markers[name])this.debug_markers[name].remove();
                this.debug_markers[name] = elem;
            }

            return elem;
        },
        mark_time: function(name, start, background){
            /* Get x position for marker */
            var x = this.moment_to_px(start);

            /* Add marker */
            return this.add_debug_marker(name, x-2, x+2, background);
        },
        mark_range: function(name, start, end, background){
            /* Get x positions for marker */
            var x0 = this.moment_to_px(start);
            var x1 = this.moment_to_px(end);

            /* Add marker */
            return this.add_debug_marker(name, x0, x1, background);
        },


        /************************************
         * SIMPLEVIEW: RENDERING & UPDATING *
         ************************************/

        render: function(){
            /* Creates & returns a DOM element representing the view.
            WARNING: Don't call this yourself!.. it should only be called
            once, by the constructor.
            After that, call this.update() to "re-render" any changes to
            this.tvguide */

            /* Create toplevel element for this widget */
            var view_container_elem = document.createElement('div');
            view_container_elem.setAttribute('class',
                'tvguide-simpleview-container');

            /* Create inner element */
            var view_elem = document.createElement('div');
            view_elem.setAttribute('class', 'tvguide-simpleview');
            view_container_elem.append(view_elem);

            /* Create pseudo-row element for containing datemarker */
            var datemarker_container_elem = document.createElement('div');
            datemarker_container_elem.setAttribute('class',
                'tvguide-simpleview-datemarker-container');
            datemarker_container_elem.style.height = as_px(this.row_h);
            view_elem.append(datemarker_container_elem);

            /* Create datemarker element */
            var datemarker = document.createElement('span');
            datemarker.setAttribute('class',
                'tvguide-simpleview-datemarker');
            datemarker.style.position = 'absolute';
            datemarker.style.top = 0;
            datemarker_container_elem.append(datemarker);

            /* Update datemarker position & text when mouse moves */
            var view = this;
            view_container_elem.onmousemove = function(event){
                var view_rect = view_elem.getBoundingClientRect();
                var x = event.clientX - view_rect.x;
                datemarker.style.left = as_px(x);
                datemarker.textContent = view.px_to_moment(x);
            }

            /* Store elements */
            this.view_container_elem = view_container_elem;
            this.view_elem = view_elem;
            this.datemarker = datemarker;
        },
        update: function(){
            /* Re-renders data */

            /* Pull some values of 'this' into variables */
            var view_container_elem = this.view_container_elem;
            var view_elem = this.view_elem;
            var datemarker = this.datemarker;
            var tvguide = this.tvguide;
            var start = this.start;
            var duration = this.duration;
            var row_h = this.row_h;
            var ms_w = this.ms_w;

            var rows = tvguide.rows;
            var n_rows = rows.length;

            /* Update view width */
            view_elem.style.width = as_px(this.duration_to_px(duration));

            /* Clear previously rendered rows & their events */
            var row_elems = view_elem.getElementsByClassName('tvguide-simpleview-row');
            while(row_elems.length > 0)row_elems[0].remove();

            /* Loop over all rows, rendering their events */
            for(var i = 0; i < n_rows; i++){
                var row = rows[i];

                /* Create element for row */
                var row_elem = document.createElement('div');
                row_elem.setAttribute('class', 'tvguide-simpleview-row');
                row_elem.style.height = as_px(row_h);
                view_elem.append(row_elem);

                (function(row_elem){
                    row_elem.onmouseover = function(event){
                        row_elem.style.height = as_px(row_h * 3);
                    }
                    row_elem.onmouseout = function(event){
                        row_elem.style.height = as_px(row_h);
                    }
                })(row_elem);

                /* Loop over row's events */
                var events = row.events;
                var n_events = events.length;
                for(var j = 0; j < n_events; j++){
                    var event = events[j];
                    var event_start = event.start;
                    var event_end = event.end;
                    var event_duration = event_end - event_start;

                    /* Create element for event */
                    var event_elem = document.createElement('div');
                    event_elem.setAttribute('class', 'tvguide-simpleview-event');
                    event_elem.style.top = as_px(0);
                    event_elem.style.left = as_px((event_start - start) * ms_w);
                    event_elem.style.width = as_px(event_duration * ms_w);
                    if(event.image_url){
                        event_elem.style.backgroundImage = 'url("' + event.image_url + '")';
                    }

                    /* Create 'veil' element (transparent overlay over the background image) */
                    var event_veil_elem = document.createElement('div');
                    event_veil_elem.setAttribute('class', 'tvguide-simpleview-event-veil');
                    event_elem.append(event_veil_elem);

                    /* Create element for event title */
                    var event_title_elem = document.createElement('span');
                    event_title_elem.setAttribute('class', 'tvguide-simpleview-event-title');
                    event_title_elem.textContent = event.title;
                    event_elem.append(event_title_elem);

                    /* Attach event element to row element */
                    //$(event_elem).hide();
                    row_elem.append(event_elem);
                    //$(event_elem).fadeIn();
                }
            }
        }
    };


    SimpleController = function(view){
        this.active = true;

        this.n_api_calls = 0;
        this.n_successful_api_calls = 0;

        /* view should be a SimpleView (for now) */
        this.view = view;
        this.start = view.get_start();
        this.duration = view.get_duration();

        var controller = this;
        view.get_elem().onscroll = function(event){
            controller.onscroll();
        }
    }
    SimpleController.prototype = {
        onscroll: function(){

            var view = this.view;

            var old_start = this.start;
            var old_duration = this.duration;
            var old_end = moment(old_start + old_duration);

            var new_start = view.get_start();
            var new_duration = view.get_duration();
            var new_end = moment(new_start + new_duration);

            var start_diff = new_start - old_start;
            var end_diff = new_end - old_end;

            if(this.DEBUG_SCROLL){
                this.view.mark_range('L', new_start, old_start, 'green');
                this.view.mark_range('R', old_end, new_end, 'red');
            }

            if(this.active && (start_diff < 0 || end_diff > 0)){

                this.view.tvguide.crop(this.view.get_start(), this.view.get_end());

                if(start_diff < 0){
                    /* Add events to start */
                    this.load_events(new_start, old_start);
                }

                if(end_diff > 0){
                    /* Add events to end */
                    this.load_events(old_end, new_end);
                }
            }

            /* Update start & duration */
            this.start = new_start;
            this.duration = new_duration;
        },
        load_events: function(start, end){
            /* Load events via the API, and update the view with them */

            var query = {
                start__lte: end.format(),
                end__gte: start.format()
            };

            var view = this.view;
            th_api.events.get_all(query).then(function(data){
                this.n_successful_api_calls++;
                var events_data = data.results;
                view.tvguide.add_events(events_data);
                view.update();
            });
            this.n_api_calls++;
        }
    };


    TVGuide.Event = Event;
    TVGuide.Row = Row;
    TVGuide.SimpleView = SimpleView;
    TVGuide.SimpleController = SimpleController;

    return TVGuide;
})();
