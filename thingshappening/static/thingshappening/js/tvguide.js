
/*
    TODO:

    TVGuide.cols should not be a circular buffer.
    It should just be an array.
    this.d is a moment representing col 0.
    NOTE: When we say col i, we mean "logical" col i: this.cols[i - this.col_offset]

    We need TVGuide.rows, too.
    In fact, do we need an array of cols at all?..
*/



window.TVGuide = (function($){
    function Event(parent, data){
        /*
        Represents an event within a specific TVGuide widget
        Params:
            parent: TVGuide
            data: parsed JSON
        */

        /* Basic attrs */
        this.parent = parent;
        this.data = data;

        /* Row index (set by Col.add_event) */
        this.row_i = null;

        /* Parse start, end into datetimes */
        this.start = moment(data.start);
        this.end = moment(data.end);

        /* Create event DOM representation */
        var elem = document.createElement('div');
        elem.setAttribute('class', 'tvguide-event');
        elem.style.height = parent.row_h;
        this.elem = elem;

        /* Number of columns of the widget containing this event */
        this.refcount = 0;
    }
    Event.prototype = {
        attach: function(){
            this.refcount++;
        },
        detach: function(){
            this.refcount--;
            if(this.refcount <= 0){
                $(this.elem).fadeOut().remove()
            }
        }
    };

    function Col(parent){
        this.parent = parent;
        this.events = [];
    }
    Col.prototype = {
        add_event: function(event){
            /* Determine event's row */
            var events = this.events;
            var n_events = events.length;
            for(var i = 0; i < n_events; i++){
                var event = events[i];
            }

            /* Attach event */
            event.attach();
            this.events.push(event);
        },
        clear: function(){
            var events = this.events;
            var n_events = events.length;
            for(var i = 0; i < n_events; i++){
                var event = events[i];
                event.detach();
            }
            this.events = [];
        }
    }

    function TVGuide(options){
        if(options === undefined)options = {};

        /* Create DOM element for widget */
        var elem = document.createElement('div');
        elem.setAttribute('class', 'tvguide');

        /* Circular buffer of columns */
        var n_cols = options.n_cols || 40;
        var cols = Array(n_cols);
        var col_offset = 0;

        /* Populate with empty columns */
        for(var i = 0; i < n_cols; i++){
            cols[i] = new Col(this);
        }

        /* Width of a column in milliseconds */
        var col_t = options.col_t || 15 * 60 * 60;

        /* Width of a column, height of row (in pixels) */
        var col_w = options.col_w || 20;
        var row_h = options.row_h || 20;

        /* Datetime represented by column 0 */
        var d = moment() || options.d;

        /* Mapping from event IDs to events */
        var events = {};

        /* Set attributes of 'this' */
        this.elem = elem;
        this.n_cols = n_cols;
        this.cols = cols;
        this.col_offset = col_offset;
        this.col_t = col_t;
        this.col_w = col_w;
        this.d = d;
        this.events = events;
    }
    TVGuide.prototype = {
        get_col: function(i){
            if(i < 0 || i >= this.n_cols)return null;
            return this.cols[i];
        },
        datetimes_to_col_range: function(d0, d1){
            /* Milliseconds away from col 0 */
            var delta0 = d0 - this.d;
            var delta1 = d1 - this.d;

            /* Start and end columns */
            var i0 = Math.floor(delta0 / this.col_t);
            var i1 = Math.floor(delta1 / this.col_t);

            return [i0, i1];
        },
        add_event: function(data){
            /* Get a range of columns covered by event */
            var event = new Event(this, data);

            var start = event.start;
            var end = event.end;
            var col_range = datetimes_to_col_range(start, end);
            var i0 = col_range[0];
            var i1 = col_range[1];

            /* Add event to columns */
            for(var i = i0; i < i1; i++){
                var col = this.get_col(i);
                if(col === null)continue;
                col.add_event(event);
            }
        },
        add_events: function(events){
            var n_events = events.length;
            for(var i = 0; i < n_events; i++){
                this.add_event(events[i]);
            }
        }
    };

    return TVGuide;
})(jQuery);
