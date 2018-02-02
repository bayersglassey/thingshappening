
from urllib.parse import urlencode

from rest_framework import serializers

from .models import THUser, Event


class HyperlinkedQueryParamRelatedField(serializers.HyperlinkedIdentityField):

    def __init__(self, *args, query_param, **kwargs):
        super().__init__(*args, **kwargs)
        self.query_param = query_param

    def get_url(self, obj, view_name, request, format):
        """
        Redefinition of super's version
        """
        # Unsaved objects will not yet have a valid URL.
        if hasattr(obj, 'pk') and obj.pk in (None, ''):
            return None

        lookup_value = getattr(obj, self.lookup_field)
        kwargs = {self.lookup_url_kwarg: lookup_value}
        url = self.reverse(view_name, request=request, format=format)
        query = {self.query_param: lookup_value}
        return "{}?{}".format(url, urlencode(query))


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
            'events_link',
            'absolute_url',
        )

    events_link = HyperlinkedQueryParamRelatedField(query_param='user',
        view_name='api:event-list')

    absolute_url = serializers.URLField(source='get_absolute_url', read_only=True)


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = (
            'id',
            'title',
            'description',
            'user_id',
            'user_link',
            'start',
            'end',
            'image_url',
            'absolute_url',
        )

    user_link = serializers.HyperlinkedRelatedField(source='user',
        read_only=True, view_name='api:thuser-detail')

    absolute_url = serializers.URLField(source='get_absolute_url', read_only=True)


