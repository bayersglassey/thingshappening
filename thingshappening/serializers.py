
from rest_framework import serializers

from .models import THUser, Event


class THUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = THUser
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

