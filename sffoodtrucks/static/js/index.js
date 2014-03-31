var map;

// marker icon for current location and search results
var markerIconUser = '/static/images/myLocationMarker.png';

// marker icon for food trucks with status 'APPROVED'
var markerIconApproved = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569",
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34));

// marker icon for food trucks with stats 'EXPIRED' or 'REQUESTED'
var markerIconExpired = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|A8A8A8",
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34));

// initialize the map
function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(37.7577, -122.4376),
    zoom: 12
  };
  map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
  // markers for search box results
  var markers = [];
  // Create the search box and link it to the UI element.
  var input = (document.getElementById('pac-input'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  var searchBox = new google.maps.places.SearchBox((input));
  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();
    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }
    // For each place, get place name and location and give it a customized icon.
    markers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
        url: markerIconUser,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(50, 50)
      };
      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: map,
        icon: image,
        title: place.name,
        position: place.geometry.location
      });
      // make sure this marker is on top of food truck markers so that it is visible.
      marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
      markers.push(marker);
      bounds.extend(place.geometry.location);
    }
    map.fitBounds(bounds);
  });
  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
  });
  // if Google maps zoom too much into one location, widen the view
  google.maps.event.addListener(searchBox, 'places_changed', function() {
    if (map.getZoom()>16){
        map.setZoom(16);
    }
  });
  // load food trucks data and draw them on the map
  retrieveFoodtruckData();
}

google.maps.event.addDomListener(window, 'load', initialize);

// set up info window (it displays info about a food truck on user click)
var infoWindow = new google.maps.InfoWindow({
  content: ''
});

// pop up info window on click
var createMarkerWindowHandler= function(marker, content) {
  infoWindow['content'] = content;
  infoWindow.open(map, marker);
};

// draw foodtrucks on the map
function drawFoodtruckMarkers(result) {
  var numFoodTrucks = result.length;
  for (var i = 0; i < numFoodTrucks; i++) {
    var foodTruck = result[i]; 
    var foodTruckLatlng = new google.maps.LatLng(foodTruck['latitude'], foodTruck['longitude']);
    var foodServed;
    if (foodTruck['fooditems'] == null){
      foodServed = '';
    } else {
      foodServed = foodTruck['fooditems'].replace(/:/g,',');
    }
    var contentString = '<div class="infoContent">'+
                        '<h1 class="ftName">'+foodTruck['applicant']+'</h1>'+
                        '<div id="bodyContent">'+
                        '<p><b>Serves: </b>'+foodServed+'</p>'
    var pinImage = markerIconApproved;
    if (foodTruck['status'] != 'APPROVED') {
      contentString += '<p>This food truck\'s permit has EXPIRED. However, you may still find it open.</p>'
      pinImage = markerIconExpired;
    }
    contentString += 'Address:'+foodTruck['address']+'<br />'+
                     '<a href='+foodTruck['schedule']+'>Schedule</a></div></div>';
    var marker = new google.maps.Marker({
      position: foodTruckLatlng,
      map: map,
      icon: pinImage,
      title: foodTruck['applicant']
    });
    google.maps.event.addListener(marker, 'click', createMarkerWindowHandler.bind(this, marker, contentString));
  }
}

// retrieve foodtruck data from API
function retrieveFoodtruckData() {
  $.ajax({url:"foodtrucks",success:function(result){
    $('#loadingPage').fadeOut(1000, function(){
      $('#myLocation').show();
    });
    drawFoodtruckMarkers(result);
  }, error:function(e){
    $('#loadingPage').fadeOut(1000, function(){
      $('#myLocation').show();
      alert('Oops, we cannot find any food trucks at this point. Please come back later!');
    });
  }});
} 

// error handler for geolocation
function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }
  alert(content);
}

// go to user's geolocation on the map
function goToGeolocation() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'You',
        icon: markerIconUser
      });
      // make sure this marker is on top of food truck markers so that it is visible.
      marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}

$('#myLocation').on('click', goToGeolocation);