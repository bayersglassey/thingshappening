
from rest_framework import viewsets

from .models import THUser, Event
from .serializers import THUserSerializer, EventSerializer


class THUserViewSet(viewsets.ModelViewSet):
    serializer_class = THUserSerializer
    queryset = THUser.objects.all()


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.all()

