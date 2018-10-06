# ThingsHappening

## What

It's an API-first event management thing.
Users can create and join events, add them to a watch list, etc.

The focus is on making it easy for users to find events they might be interested in.

## Why

This project was written as a demo for someone creating some interesting peer-to-peer technology.
Their web site wasn't doing a great job of letting users find each other.
So I whipped up a Django project with a REST backend they could plug into,
and I wrote a single Javascript widget for them to drop onto the site:
a kind of infinite scrolling TV Guide.

I was running this site off a DigitalOcean droplet for a while,
but the peer-to-peer project didn't work out, so I took it down.
If you want to get it running, it's a pretty standard Django project. Good luck!
If you do get it running, you may want to have a look at
`thingshappening.utils.create_random_users` and `thingshappening.utils.create_random_events`
to populate the database with stuff so you can play with the TV Guide widget.


## TVGuide widget

See the [Javascript source](thingshappening/static/thingshappening/js/tvguide.js).
The widget is built up from a series of classes, starting with a very abstract data structure,
and ending with something which allows a user to interact with it via their browser.
Tip of the hat to [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)!

### class TVGuide

Stores Event objects in rows. Each Event has a start & end time, and when an event is added to the TVGuide,
it's added to the first row which doesn't have another event with an overlapping time period.
(Rows are added as needed.)

### class SimpleView

Augments TVGuide class with information about widget width & height, scroll position, etc.
Knows how to create & update a DOM element representing the widget.

### class SimpleController

Allows user to control a SimpleView by scrolling the DOM element.
Also controls loading of new events via REST API calls.
Uses [a tiny JS library for accessing this project's API](thingshappening/static/thingshappening/js/th_api.js).

