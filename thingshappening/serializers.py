
from rest_framework import serializers

from .models import THUser, Event


class THUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = THUser
        fields = (
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'date_joined',
            'is_active',
        )


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = (
            'id',
            'title',
            'description',
            'host',
        )

    host = serializers.PrimaryKeyRelatedField(read_only=True)


