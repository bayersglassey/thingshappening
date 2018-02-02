
from django.db.models import Q
from django.urls import resolve, reverse
from django.views.generic import (TemplateView,
    ListView, DetailView, CreateView, UpdateView)

from .models import Event, THUser


class IndexView(TemplateView):
    template_name = "index.html"


EVENT_FIELDS = ('title', 'start', 'end', 'description', 'image_url')

class EventListView(ListView):
    queryset = Event.objects.order_by('start')
    context_object_name = 'events'
    template_name = "thingshappening/event_list.html"
    def get_queryset(self):
        queryset = super().get_queryset()
        request = self.request
        if 'user_id' in request.GET:
            user_id = request.GET['user_id']
            queryset = queryset.filter(user_id=user_id)
        return queryset

class EventDetailView(DetailView):
    model = Event
    context_object_name = 'event'
    template_name = "thingshappening/event_detail.html"

class EventCreateView(CreateView):
    model = Event
    fields = EVENT_FIELDS
    template_name = "thingshappening/event_create.html"
    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.user = self.request.user
        self.object.save()
        return super().form_valid(form)

class EventUpdateView(UpdateView):
    model = Event
    fields = EVENT_FIELDS
    template_name = "thingshappening/event_edit.html"



class THUserListView(ListView):
    queryset = THUser.objects.order_by('id')
    context_object_name = 'users'
    template_name = "thingshappening/user_list.html"

class THUserDetailView(DetailView):
    model = THUser
    context_object_name = 'user'
    template_name = "thingshappening/user_detail.html"
