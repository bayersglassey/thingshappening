
from thingshappening.settings import *

DEBUG = False
ALLOWED_HOSTS = ['thingshappening.bayersglassey.com']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
