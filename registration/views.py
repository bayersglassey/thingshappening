
from django.contrib.auth import login
from django.views.generic.edit import FormView, CreateView
from django.urls import resolve

from .forms import THUserCreationForm


class SignupView(CreateView):
    template_name = 'registration/signup.html'
    form_class = THUserCreationForm
    success_url = '/'

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests, instantiating a form instance with the passed
        POST variables and then checked for validity.
        (hooked from django.views.generic.edit.ProcessFormView)
        """
        form = self.get_form()
        if form.is_valid():
            response = self.form_valid(form)
            user = self.object
            login(request, user)
            return response
        else:
            return self.form_invalid(form)
