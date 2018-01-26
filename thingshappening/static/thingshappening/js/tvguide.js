
window.TVGuide = (function(){
    function randInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function as_px(x){
        /* Convert integer to "pixels" value (suitable for use with CSS) */
        return String(x) + 'px';
    }

    function Event(data){
        /*
        Represents an event within a specific TVGuide widget
        Params:
            data: parsed event JSON
        */
        this.update(data);
    }
    Event.random_events_data = function(n, min_start, max_start, min_w, max_w){
        /* Create random event data for testing.
        The data is suitable for use with TVGuide.add_events(). */

        n = n | 1;
        min_start = min_start || +moment();
        max_start = max_start || min_start + 1000 * 60 * 60 * 24;
        min_w = min_w || 1000 * 60 * 15;
        max_w = max_w || 1000 * 60 * 60 * 2;

        var events_data = [];
        for(var i = 0; i < n; i++){
            /* Random width in milliseconds */
            var w = randInt(min_w, max_w);

            /* Random start/end times */
            var min_start_ms = +min_start;
            var max_start_ms = +max_start;
            var start_ms = randInt(min_start_ms, max_start_ms);
            var start = moment(start_ms);
            var end = moment(start_ms + w);

            /* Create test data */
            var event_data = {
                title: "Test Event",
                description: "For testing purposes",
                start: start,
                end: end
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

            /* Save the raw data too, just in case... */
            this.data = data;
        },
        overlaps: function(other){
            /* 'this' and 'other' are both Events */
            return this.end > other.start && other.end > this.start;
        }
    };

    function Row(){
        /* Array of events */
        this.events = [];
    }
    Row.prototype = {
        clear: function(){
            this.events.length = 0;
        },
        add_event: function(new_event){
            this.events.push(new_event);
        },
        crop: function(start, duration){
            var end = start + duration;

            var events = this.events;
            var n_events = events.length;
            for(var i = n_events - 1; i >= 0; i--){
                var event = events[i];
                if(event.end.isBefore(start) || event.start.isAfter(end)){
                    this.remove_event(i);
                }
            }
        },
        remove_event: function(i){
            this.events.splice(i, 1);
        }
    };

    function TVGuide(){
        /* Array of Rows */
        this.rows = [];

        /* Map from IDs to Events */
        this.events = {};
    }
    TVGuide.Event = Event;
    TVGuide.Row = Row;
    TVGuide.prototype = {
        clear: function(){
            this.rows.length = 0;
            this.events = {};
        },
        crop: function(start, duration){
            var rows = this.rows;
            var n_rows = rows.length;
            for(var i = 0; i < n_rows; i++){
                var row = rows[i];
                row.crop(start, duration);
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
            var event = this.events[id];

            /* NOTE: If data.id is undefined, we still add an event.
            It's guaranteed not to update an existing event.
            Useful for testing - see Event.random_events_data(). */
            if(id !== undefined && event !== undefined){
                /* Event already exists, update it */

                /* If start/end have changed, we need to move the event */
                var start = moment(data.start);
                var end = moment(data.end);
                var move_event =
                    start.diff(event.start) || end.diff(event.diff);
                console.log("move_event", move_event, event, data);

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

                if(id !== undefined){
                    /* Add event to this.events */
                    this.events[id] = new_event;
                }

                /* Add event to a row */
                this.place_event(new_event);
            }
        },
        place_event: function(new_event){
            /* Figure out which row to put event into, and put it there.
            Event is assumed to not currently be in any row. */

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
            var row = new Row();
            this.rows.push(row);
            row.add_event(new_event);
        },
        get_simple_view: function(){
            return new SimpleView(this);
        }
    };

    function SimpleView(tvguide, start, ms_w, row_h){
        this.tvguide = tvguide;

        /* Time represented by x-position 0 */
        this.start = start || moment();

        /* Width of a millisecond in pixels */
        this.ms_w = ms_w || 1 / 1000 / 60;

        /* Row height in pixels */
        this.row_h = row_h || 20;
    }
    SimpleView.prototype = {
        get_x_time: function(x){
            return moment(this.start + x / this.ms_w);
        },
        get_w_ms: function(w){
            return w / this.ms_w;
        },
        render: function(){
            /* Creates & returns a <div> representing the view.
            Maybe todo: instead use a this.elem, and have this.update() which
            updates it?.. */

            /* Pull some values of 'this' into variables */
            var tvguide = this.tvguide;
            var start = this.start;
            var row_h = this.row_h;
            var ms_w = this.ms_w;

            var start_ms = +start;

            var rows = tvguide.rows;
            var n_rows = rows.length;

            /* Create elements for view */
            var view_container_elem = document.createElement('div');
            view_container_elem.setAttribute('class', 'tvguide-simpleview-container');
            var view_elem = document.createElement('div');
            view_elem.setAttribute('class', 'tvguide-simpleview');
            view_elem.style.height = as_px(n_rows * row_h);
            view_elem.style.top = as_px(row_h);
            view_container_elem.append(view_elem);

            /* Create datemarker element */
            var datemarker = document.createElement('span');
            datemarker.setAttribute('class', 'tvguide-simpleview-datemarker');
            datemarker.style.height = as_px(row_h);
            datemarker.style.position = 'absolute';
            datemarker.style.top = 0;
            view_container_elem.append(datemarker);

            /* Update datemarker position & text when mouse moves */
            var view = this;
            view_container_elem.onmousemove = function(event){
                var view_rect = view_elem.getBoundingClientRect();
                var x = event.clientX - view_rect.x;
                datemarker.style.left = as_px(x);
                datemarker.textContent = view.get_x_time(x);
            }

            /* Loop over all rows */
            for(var i = 0; i < n_rows; i++){
                var row = rows[i];

                /* Create element for row */
                var row_elem = document.createElement('div');
                row_elem.setAttribute('class', 'tvguide-simpleview-row');
                row_elem.style.top = as_px(i * row_h);
                row_elem.style.height = as_px(row_h);
                view_elem.append(row_elem);

                /* Loop over row's events */
                var events = row.events;
                var n_events = events.length;
                for(var j = 0; j < n_events; j++){
                    var event = events[j];
                    var event_start = event.start;
                    var event_end = event.end;

                    /* Time calculations */
                    var event_start_ms = +event.start;
                    var event_end_ms = +event.end;
                    var event_w_ms = event_end_ms - event_start_ms;

                    /* Create element for event */
                    var event_elem = document.createElement('div');
                    event_elem.setAttribute('class', 'tvguide-simpleview-event');
                    event_elem.textContent = event.title;
                    event_elem.style.left = as_px((event_start_ms - start_ms) * ms_w);
                    event_elem.style.width = as_px(event_w_ms * ms_w);
                    event_elem.style.height = as_px(row_h);
                    row_elem.append(event_elem);
                }
            }

            /* Return element representing view */
            return view_container_elem;
        }
    };

    return TVGuide;
})();
