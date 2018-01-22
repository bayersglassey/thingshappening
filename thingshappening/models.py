
from django.db import models
from django.contrib.auth.models import AbstractUser

def fmt_datetime(d):
    return d.strftime("%h %d %Y %T")


class THUser(AbstractUser):
    email = models.EmailField()

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    user = models.ForeignKey('thingshappening.thuser')
    start = models.DateTimeField()
    end = models.DateTimeField()
    def __str__(self):
        return "{} ({} - {})".format(self.title,
            fmt_datetime(self.start), fmt_datetime(self.end))


