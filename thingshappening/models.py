
from django.db import models
from django.contrib.auth.models import AbstractUser



class THUser(AbstractUser):
    email = models.EmailField()

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    host = models.ForeignKey('thingshappening.thuser')


