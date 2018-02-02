
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.urls import reverse

def fmt_datetime(d):
    return d.strftime("%h %d %Y %T")


class THUser(AbstractUser):
    email = models.EmailField()

    def get_absolute_url(self):
        return reverse('user-detail', kwargs={'pk': self.pk})
    def get_events_absolute_url(self):
        return "{}{}".format(
            reverse('event-list'),
            "?user_id={}".format(self.id))

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    user = models.ForeignKey('thingshappening.thuser')
    start = models.DateTimeField()
    end = models.DateTimeField()
    image_url = models.CharField(max_length=200, blank=True)
    def __str__(self):
        return "{} ({} - {})".format(self.title,
            fmt_datetime(self.start), fmt_datetime(self.end))

    def get_absolute_url(self):
        return reverse('event-detail', kwargs={'pk': self.pk})
    def get_update_absolute_url(self):
        return reverse('event-update', kwargs={'pk': self.pk})


