from django.conf.urls import patterns, url

from sffoodtrucks import views

urlpatterns = patterns('',
    url(r'^$', views.index),
    url(r'^foodtrucks/?$', views.foodtrucks),
)