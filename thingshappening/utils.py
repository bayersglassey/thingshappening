
from random import randint
from datetime import datetime, timedelta

from django.db.models import Q
from django.utils import timezone
from django.conf import settings

from .models import Event, THUser

FIRST_NAMES = [
    'Tim',
    'Bob',
    'Janet',
    'Mark',
    'David',
    'Spencer',
    'Libby',
    'Rocko',
    'Jarvis',
    'Fred',
    'Frederick',
    'Patrick',
    'Pat',
    'Mike',
    'Lou',
    'Emmy Sue',
    'Harper',
    'Geraldo',
    'Xi',
    'Taro',
]

LAST_NAMES = [
    'Liu',
    'Thompson',
    'Smith',
    'Potts',
    'Levenstein',
    'Law',
    'Baker',
    'Honda',
    'di Salis',
    'le Greve',
    'de la Manche',
    'X',
    'Chawla',
    'Hartford',
    'Bos',
    'Jefferson',
    'van der Meer',
    'Hoevig',
    'Crest',
    'Harper',
]

ADJECTIVES = [
    'Spiffy',
    'Rad',
    'Cars',
    'New-Age',
    'Awesome',
    'Networking',
    'Professional',
    'Pets',
    'Nature',
    'Finance',
    'Self-Help',
    'Family-Friendly',
    'Sports',
    'Music',
    'Cooking',
    'Eventful',
    'Politics',
    'Entertainment',
    'Tech',
    'Games',
]

NOUNS = [
    'Park',
    'Event',
    'Gathering',
    'Get-Together',
    'Party',
    'Concert',
    'Viewing',
    'Shindig',
    'Thing',
    'Thang',
    'Dinner',
    'Lunch',
    'Brunch',
    'Breakfast',
    'Show',
    'Movie',
    'Blog',
    'Blag',
    'Song',
    'Sing-Along',
]


STOCK_IMAGES = [
    'canyon.jpg',
    'dragonfly.jpg',
    'hill-town.jpg',
    'rain-on-sea.jpg',
    'compy-chips.jpg',
    'eagle.jpg',
    'frog.jpg',
    'rain-on-leaf.jpg',
    'tulips.jpg',
]


def pick_one(options):
    return options[randint(0, len(options) - 1)]

def random_chars(n=1, from_chars=None):
    if from_chars is None:
        from_chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    chars = [from_chars[randint(0, len(from_chars) - 1)] for i in range(n)]
    return "".join(chars)

def random_first_name():
    return pick_one(FIRST_NAMES)

def random_last_name():
    return pick_one(LAST_NAMES)

def random_title():
    adj = pick_one(ADJECTIVES)
    noun = pick_one(NOUNS)
    return "{} {}".format(adj, noun)

def random_duration(min, max):
    # expects 2 timedeltas, returns a timedelta
    return timedelta(
        seconds=randint(
            0,
            int((max-min).total_seconds())
        )
    )

def random_datetime(min, max):
    # expects 2 datetimes, returns a datetime
    return min + random_duration(timedelta(), max-min)

def random_range(range_start=None, range_end=None):
    if range_start is None:
        range_start = timezone.now()
    if range_end is None:
        range_end = range_start + timedelta(weeks=1)

    range_start = range_start.replace(minute=0, second=0, microsecond=0)
    range_end = range_end.replace(minute=0, second=0, microsecond=0)

    delta = range_end - range_start
    delta_quarter_hours = delta.total_seconds() / 60 / 4

    quarter_hour1 = randint(0, delta_quarter_hours - 1)
    quarter_hour2 = randint(0, delta_quarter_hours - 1)

    start = range_start + timedelta(minutes=quarter_hour1*15)
    end = range_start + timedelta(minutes=quarter_hour2*15)

    if start > end:
        start, end = end, start
    return start, end

def random_image_url():
    return '{}thingshappening/img/{}'.format(settings.STATIC_URL, pick_one(STOCK_IMAGES))

def create_random_users(n=1):
    users = []
    for i in range(n):
        first_name = random_first_name()
        last_name = random_last_name()

        username = username0 = "{}{}".format(
            first_name[0], last_name.replace(' ', '')).lower()
        while THUser.objects.filter(username=username).exists():
            username = "{}-{}".format(username0, random_chars(10))

        suffix = "@example.com"
        email = email0 = "{}.{}".format(
            first_name[0], last_name.replace(' ', '.')).lower()
        while THUser.objects.filter(email=email+suffix).exists():
            email = "{}.{}".format(email0, random_chars(5))
        email += suffix

        user = THUser.objects.create(
            first_name=first_name,
            last_name=last_name,
            username=username,
            email=email,
        )
        users.append(user)
    return users

def create_random_events(n=1, start=None, duration=None, event_duration_min=None, event_duration_max=None, user=None):

    if start is None:
        start = timezone.now()
    if duration is None:
        duration = timedelta(days=7)
    if event_duration_min is None:
        event_duration_min = timedelta(minutes=15)
    if event_duration_max is None:
        event_duration_max = timedelta(hours=2)

    # If you don't pass a user to this function, it will choose a random
    # one for each event.
    # If you do pass a user, it will be used for all events.
    users = None
    if user is None:
        users = THUser.objects.all()

    events = []
    for i in range(n):
        if users is not None:
            user = pick_one(users)
        event_duration = random_duration(event_duration_min, event_duration_max)
        event_start = random_datetime(start, start + duration - event_duration)
        event_end = event_start + event_duration
        event = Event.objects.create(
            user=user,
            title=random_title(),
            description="Test event",
            start=event_start,
            end=event_end,
            image_url=random_image_url(),
        )
        events.append(event)
    return events

def crop_events(start=None, end=None):
    # Removes events *outside* of start/end

    filter = Q()
    if start:
        filter |= Q(end__lt=start)
    if end:
        filter |= Q(start__gt=end)

    return Event.objects.filter(filter).delete()

def crop_old_events():
    return crop_events(start=timezone.now())
