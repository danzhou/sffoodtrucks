from django.shortcuts import render
from django.http import HttpResponse
import urllib

def index(request):
  return render(request, 'index.html')

# set up a /foodtrucks API endpoint that sends back an array of food truck objects
def foodtrucks(request):
	r = urllib.urlopen('http://data.sfgov.org/resource/rqzj-sfat.json')
	return HttpResponse(r.read(), content_type='application/json')