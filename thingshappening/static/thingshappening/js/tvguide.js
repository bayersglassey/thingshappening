
/*
    TODO:

    TVGuide.cols should not be a circular buffer.
    It should just be an array.
    this.d is a moment representing col 0.
    NOTE: When we say col i, we mean "logical" col i:
        this.cols[i - this.col_offset]

    We need TVGuide.rows, too.
    In fact, do we need an array of cols at all?..
*/



window.TVGuide = (function($){
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
        /* ... */

        /* Array of events */
        this.events = [];
    }
    Row.prototype = {
        add_event: function(new_event){
            this.events.push(new_event);
        }
    };

    function TVGuide(){
        /* Array of Rows */
        this.rows = [];

        /* Map from IDs to Events */
        this.events = {};
    }
    TVGuide.prototype = {
        add_random_events: function(n, min_start, max_start, min_w, max_w){
            /* Add random events for testing */

            min_start = min_start || +moment();
            max_start = max_start || min_start + 1000 * 60 * 60 * 24;
            min_w = min_w || 1000 * 60 * 15;
            max_w = max_w || 1000 * 60 * 60 * 2;

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
                var data = {
                    title: "Test Event",
                    description: "For testing purposes",
                    start: start,
                    end: end
                };

                /* Add event */
                this.add_event(data);
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
            Useful for testing - see add_random_events. */
            if(id !== undefined && event !== undefined){
                /* Event already exists, update it */

                /* If start/end have changed, we need to move the event */
                var start = moment(data.start);
                var end = moment(data.end);
                var move_event =
                    start.diff(event.start) || end.diff(event.diff);
                console.log("move_event", move_event);

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

            /* Create element for view */
            var view_elem = document.createElement('div');
            view_elem.setAttribute('class', 'tvguide-simpleview');
            view_elem.style.height = as_px(n_rows * row_h);

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
                    event_elem.textContent = "E-" + Number(event.id);
                    event_elem.style.left = as_px((event_start_ms - start_ms) * ms_w);
                    event_elem.style.width = as_px(event_w_ms * ms_w);
                    event_elem.style.height = as_px(row_h);
                    row_elem.append(event_elem);
                }
            }

            /* Return element representing view */
            return view_elem;
        }
    };

    return TVGuide;
})(jQuery);
