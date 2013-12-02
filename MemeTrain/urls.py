from django.conf.urls import patterns, include, url
from courses.models import Deck, Course, Card
from courses import views
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'MemeTrain.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^api/v1/course_list$', views.course_all),
    url(r'^$', views.main_ember),
    url(r'^admin/', include(admin.site.urls)),
)
