
from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import urls as auth_urls
from django.views.generic import TemplateView

from rest_framework import routers

from . import views, viewsets
from registration import views as registration_views


auth_urlpatterns = auth_urls.urlpatterns + [
    url(r'^signup/?$', registration_views.SignupView.as_view(), name='signup'),
]

router = routers.DefaultRouter()
router.register(r'users', viewsets.THUserViewSet)
router.register(r'events', viewsets.EventViewSet)
api_urls = router.urls + [
]


urlpatterns = [
    # url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^$', TemplateView.as_view(template_name="tvguide_test.html"), name='index'),

    url(r'^auth/', include(auth_urlpatterns, namespace='auth')),
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include(api_urls, namespace='api')),
    url(r'^calendar_test/?$', TemplateView.as_view(template_name="calendar_test.html"), name='calendar_test'),
    url(r'^tvguide_test/?$', TemplateView.as_view(template_name="tvguide_test.html"), name='tvguide_test'),

    url(r'^events/?$', views.EventListView.as_view(), name='event-list'),
    url(r'^events/new/?$', views.EventCreateView.as_view(), name='event-create'),
    url(r'^events/(?P<pk>[0-9]+)/?$', views.EventDetailView.as_view(), name='event-detail'),
    url(r'^events/(?P<pk>[0-9]+)/edit/?$', views.EventUpdateView.as_view(), name='event-update'),

    url(r'^users/?$', views.THUserListView.as_view(), name='user-list'),
    url(r'^users/(?P<pk>[0-9]+)/?$', views.THUserDetailView.as_view(), name='user-detail'),
]

