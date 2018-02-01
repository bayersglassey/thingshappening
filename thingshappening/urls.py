
from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.views.generic import TemplateView

from rest_framework import routers

from . import views, viewsets


router = routers.DefaultRouter()
router.register(r'users', viewsets.THUserViewSet)
router.register(r'events', viewsets.EventViewSet)
api_urls = router.urls + [
]

auth_urls = [
    url(r'^login/$', auth_views.LoginView.as_view(template_name="login.html"), name='login'),
    url(r'^logout/$', auth_views.LogoutView.as_view(template_name="logged_out.html"), name='logout'),
    url(r'^signup/$', views.SignupView.as_view(), name='signup'),
]


urlpatterns = [
    url(r'^$', views.index.as_view(), name='index'),
    url(r'^account/', include(auth_urls, namespace='account')),
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include(api_urls, namespace='api')),
    url(r'^calendar_test', TemplateView.as_view(template_name="calendar_test.html"), name='calendar_test'),
    url(r'^tvguide_test', TemplateView.as_view(template_name="tvguide_test.html"), name='tvguide_test'),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

