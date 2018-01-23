
window.th_calendar = (function($){
    var th_calendar = {};
    th_calendar.CalendarMonth = CalendarMonth;

    function CalendarMonth(year, month){
        /*
            Usage example:

                var jan = new CalendarMonth(2018, 0);
                jan.add_events([
                    {...}
                ]);
                document.body.append(jan.elem_table);
        */

        /* E.g. for Jan 2018, year = 2018; month = 0 */
        var d = moment([year, month]);
        var n_dates = d.daysInMonth();
        var date_offset = (d.day() + 7 - 1) % 7;

        var n_tds_required = n_dates + date_offset;

        /* One column for each day of the week */
        var n_cols = 7;

        /* 6 rows by 7 cols is enough to fit the days of any month */
        var n_rows = Math.ceil(n_tds_required / n_cols);

        var elem_table = document.createElement('table');
        //elem_table.setAttribute('class', 'calendar table table-bordered');
        elem_table.setAttribute('class', 'calendar');

        var elem_thead = document.createElement('thead');
        var elem_tbody = document.createElement('tbody');
        elem_table.append(elem_thead);
        elem_table.append(elem_tbody);

        var elem_tr = document.createElement('tr');
        var elem_th = document.createElement('th');
        elem_th.textContent = d.format("MMM YYYY");
        elem_th.setAttribute('colspan', n_cols);
        elem_tr.append(elem_th);
        elem_thead.append(elem_tr);

        var weekdays = moment.weekdays();
        var n_weekdays = weekdays.length;
        for(var i = 0; i < n_weekdays; i++){
            weekdays[i] = weekdays[i][0];
        }

        var elem_tr = document.createElement('tr');
        for(var j = 0; j < n_cols; j++){
            var elem_th = document.createElement('th');
            elem_th.textContent = weekdays[(j + 1) % 7];
            elem_tr.append(elem_th);
        }
        elem_thead.append(elem_tr);

        var n_tds = n_cols * n_rows;
        var tds = new Array(n_tds);

        for(var i = 0; i < n_rows; i++){
            var elem_tr = document.createElement('tr');
            for(var j = 0; j < n_cols; j++){
                var k = i * n_cols + j;
                var elem_td = document.createElement('td');
                tds[k] = elem_td;
                elem_td.setAttribute('class', k % 2 == 0? 'zebra1': 'zebra2');
                elem_td.th_events = [];
                elem_tr.append(elem_td);
            }
            elem_tbody.append(elem_tr);
        }

        elem_table.append(elem_thead);
        elem_table.append(elem_tbody);

        for(var i = 0; i < n_dates; i++){
            var td = tds[i + date_offset];
            var elem_daynumber = document.createElement('div');

            elem_daynumber.textContent = i + 1;
            elem_daynumber.setAttribute('class', 'calendar-daynumber');

            td.elem_daynumber = elem_daynumber;
            td.append(elem_daynumber);
        }

        /* Set attributes of 'this': */
        this.d = d;
        this.n_dates = n_dates;
        this.date_offset = date_offset;
        this.n_rows = n_rows;
        this.n_cols = n_cols;
        this.tds = tds;
        this.elem_table = elem_table;
    }

    CalendarMonth.prototype.add_events = function(events){
        var n_events = events.length;
        for(var i = 0; i < n_events; i++){
            var event = events[i];

            /* Figure out start/end indices into this.tds */
            var start = moment(event.start);
            var end = moment(event.end);
            var start_date = start.date();
            var end_date = end.date();
            var start_td_i = this.date_offset + start_date;
            var end_td_i = this.date_offset + end_date;

            /* Add event to <td>s for the dates it covers */
            var tds = this.tds;
            for(var td_i = start_td_i; td_i <= end_td_i; td_i++){
                var td = tds[td_i];
                td.th_events.push(td);
            }
        }

        var tds = this.tds;
        var n_tds = tds.length;
        for(var i = 0; i < n_tds; i++){
            var td = tds[i];
            var events = td.th_events;
            if(events.length > 0){
                td.elem_daynumber.style.fontWeight = "bold";
            }
        }
    }

    $(document).ready(function(){
        var jan_events = [
            {
                "id": 1,
                "title": "Going to the Park",
                "description": "Join us! We're all going to the park today.",
                "user_id": 1,
                "start": "2018-01-22T17:42:04.337652Z",
                "end": "2018-01-22T17:41:42.044126Z"
            },
            {
                "id": 29,
                "title": "Professional Blag",
                "description": "Test event",
                "user_id": 29,
                "start": "2020-01-08T18:15:00Z",
                "end": "2020-01-10T12:00:00Z"
            },
            {
                "id": 30,
                "title": "Cooking Party",
                "description": "Test event",
                "user_id": 53,
                "start": "2019-01-04T05:45:00Z",
                "end": "2020-01-21T09:00:00Z"
            }
        ];
        var jan = new CalendarMonth(2018, 0);
        var feb = new CalendarMonth(2018, 1);
        jan.add_events(jan_events);
        $("#main").append(jan.elem_table);
        $("#main").append(feb.elem_table);
    });


    return th_calendar;
})(jQuery);
