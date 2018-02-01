
from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic import TemplateView

from rest_framework import routers

from . import views, viewsets


router = routers.DefaultRouter()
router.register(r'users', viewsets.THUserViewSet)
router.register(r'events', viewsets.EventViewSet)
api_urls = router.urls + [
]


urlpatterns = [
    url(r'^$', views.index.as_view(), name='index'),
    url(r'^auth/', include('django.contrib.auth.urls', namespace='auth')),
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include(api_urls, namespace='api')),
    url(r'^calendar_test', TemplateView.as_view(template_name="calendar_test.html"), name='calendar_test'),
    url(r'^tvguide_test', TemplateView.as_view(template_name="tvguide_test.html"), name='tvguide_test'),
]

