
from rest_framework import viewsets, filters, pagination
from django_filters import rest_framework as more_filters

from .models import THUser, Event
from .serializers import THUserSerializer, EventSerializer

class THPagination(pagination.PageNumberPagination):
    # For debugging purposes!..
    page_size = 500

class THViewSetMixin:
    pagination_class = THPagination
    filter_backends = (more_filters.DjangoFilterBackend, filters.SearchFilter)

class THViewSet(THViewSetMixin, viewsets.ModelViewSet):
    pass


class THUserViewSet(THViewSet):
    queryset = THUser.objects.order_by('id')
    serializer_class = THUserSerializer
    filter_fields = ('username', 'email', 'first_name', 'last_name')
    search_fields = ('username', 'email', 'first_name', 'last_name')


class EventViewSet(THViewSet):
    queryset = Event.objects.order_by('id')
    serializer_class = EventSerializer
    filter_fields = {
        'user__username': ['exact'],
        'user': ['exact'],
        'start': ['exact', 'lte', 'gte'],
        'end': ['exact', 'lte', 'gte'],
    }
    search_fields = ('title', 'user__username')

