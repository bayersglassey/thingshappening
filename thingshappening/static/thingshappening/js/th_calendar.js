
window.th_calendar = (function($){
    var th_calendar = {};

    th_calendar.make_month = function(year, month){
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

            td.append(elem_daynumber);
        }

        return elem_table;
    }

    $(document).ready(function(){
        $("#main").append(th_calendar.make_month(2018, 0));
        $("#main").append(th_calendar.make_month(2018, 1));
    });


    return th_calendar;
})(jQuery);
