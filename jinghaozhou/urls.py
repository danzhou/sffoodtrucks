from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'jinghaozhou.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^sffoodtrucks/', include('sffoodtrucks.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
