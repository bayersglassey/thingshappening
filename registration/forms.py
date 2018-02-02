
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from thingshappening.models import THUser


class THUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = THUser
        fields = UserCreationForm.Meta.fields + (
            'email',
            'first_name',
            'last_name',
        )

class THUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = THUser

