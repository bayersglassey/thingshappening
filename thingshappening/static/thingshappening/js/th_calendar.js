
window.th_calendar = (function($){
    var th_calendar = {};
    th_calendar.CalendarMonth = CalendarMonth;

    function CalendarMonth(year, month){
        /*
            Usage example:

                var jan_2018 = new CalendarMonth(2018, 0);
                jan_2018.add_events([
                    {...}
                ]);
                document.body.appendChild(jan_2018.elem_table);
        */

        /* Turn year, month params into a date object */
        var d = moment([year, month]);
        var n_dates = d.daysInMonth();
        var date_offset = (d.day() + 7 - 1) % 7;

        var n_datecells_required = n_dates + date_offset;

        /* One column for each day of the week */
        var n_cols = 7;

        /* 6 rows by 7 cols is enough to fit the days of any month */
        var n_rows = Math.ceil(n_datecells_required / n_cols);

        /* Create the table */
        var elem_table = document.createElement('table');
        elem_table.setAttribute('class', 'calendar');

        /* Create the <table>'s <thead> and <tbody> */
        var elem_thead = document.createElement('thead');
        var elem_tbody = document.createElement('tbody');
        elem_table.appendChild(elem_thead);
        elem_table.appendChild(elem_tbody);

        /* Create the title row (e.g. "Jan 2018") in thead */
        var elem_tr = document.createElement('tr');
        var elem_th = document.createElement('th');
        elem_th.textContent = d.format("MMM YYYY");
        elem_th.setAttribute('colspan', n_cols);
        elem_tr.appendChild(elem_th);
        elem_thead.appendChild(elem_tr);

        /* Get the first letter of each weekday, save them in an array */
        var weekdays = moment.weekdays();
        var n_weekdays = weekdays.length;
        for(var i = 0; i < n_weekdays; i++){
            weekdays[i] = weekdays[i][0];
        }

        /* Generate a table row showing the first letter of each weekday */
        var elem_tr = document.createElement('tr');
        for(var j = 0; j < n_cols; j++){
            var elem_th = document.createElement('th');
            elem_th.textContent = weekdays[(j + 1) % 7];
            elem_tr.appendChild(elem_th);
        }
        elem_thead.appendChild(elem_tr);

        /* Create the table cells representing the dates of the month */
        var n_datecells = n_cols * n_rows;
        var datecells = new Array(n_datecells);
        for(var i = 0; i < n_rows; i++){
            var elem_tr = document.createElement('tr');
            for(var j = 0; j < n_cols; j++){
                var k = i * n_cols + j;

                /* Create <td> representing datecell */
                var elem_td = document.createElement('td');
                elem_td.setAttribute('class', 'zebra' + String(k % 2));
                elem_tr.appendChild(elem_td);

                /* Create datecell */
                var datecell = datecells[k] = {
                    td: elem_td,
                    events: []
                };
            }
            elem_tbody.appendChild(elem_tr);
        }

        /* Create the numbers in the table cells showing the dates of the month */
        for(var i = 0; i < n_dates; i++){
            var datecell = datecells[i + date_offset];
            var elem_daynumber = document.createElement('div');

            elem_daynumber.textContent = i + 1;
            elem_daynumber.setAttribute('class', 'calendar-daynumber');

            datecell.elem_daynumber = elem_daynumber;
            datecell.td.appendChild(elem_daynumber);
        }

        /* Set attributes of 'this' */
        this.d = d;
        this.n_dates = n_dates;
        this.date_offset = date_offset;
        this.n_rows = n_rows;
        this.n_cols = n_cols;
        this.datecells = datecells;
        this.elem_table = elem_table;
    }

    CalendarMonth.prototype.add_events = function(events){

        /* Attach events to dates of the month */
        var n_events = events.length;
        for(var i = 0; i < n_events; i++){
            var event = events[i];

            /* Figure out start/end indices into this.datecells */
            var start = moment(event.start);
            var end = moment(event.end);
            var start_date = start.date();
            var end_date = end.date();
            var j0 = this.date_offset + start_date;
            var j1 = this.date_offset + end_date;

            /* Add event to datecells for the dates it covers */
            var datecells = this.datecells;
            for(var j = j0; j <= j1; j++){
                var datecell = datecells[j];
                datecell.events.push(event);
            }
        }

        /* Update any table cells containing events */
        var datecells = this.datecells;
        var n_datecells = datecells.length;
        for(var i = 0; i < n_datecells; i++){
            var datecell = datecells[i];
            var events = datecell.events;
            if(events.length > 0){
                datecell.elem_daynumber.style.fontWeight = "bold";
            }
        }

    }

    return th_calendar;
})(jQuery);
