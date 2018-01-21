
from django.conf.urls import url, include
from django.contrib import admin

from rest_framework import routers

from . import views, viewsets


router = routers.DefaultRouter()
router.register(r'users', viewsets.THUserViewSet)
router.register(r'events', viewsets.EventViewSet)
api_urls = router.urls + [
]


urlpatterns = [
    url(r'^$', views.index.as_view(), name='index'),
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include(api_urls, namespace='api')),
]

