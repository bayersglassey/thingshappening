
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Event, THUser


class THUserAdmin(UserAdmin):
    pass

class EventAdmin(admin.ModelAdmin):
    pass


admin.site.register(THUser, THUserAdmin)
admin.site.register(Event, EventAdmin)

