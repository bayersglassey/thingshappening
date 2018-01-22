
from django.views.generic import TemplateView
from django.views.generic.edit import FormView
from django.contrib.auth.forms import UserCreationForm


class index(TemplateView):
    template_name = "index.html"

class SignupView(FormView):
    template_name = 'form.html'
    form_class = UserCreationForm
    success_url = '/'
