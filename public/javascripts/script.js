document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('locBtn').onclick = () => {
    locationCheck();
  }
  console.log('JS imported successfully!');

}, false);


let map, infoWindow, heatmap;

initMap = () => {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 25.7617,
      lng: -80.1918
    },
    zoom: 12
  });

  getPoints = () => {
    return [
      new google.maps.LatLng(25.8173669, -80.3302065),
      new google.maps.LatLng(37.782745, -122.444586),
    ]
  }

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: getPoints(),
    map: map
  });



  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      let pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Current Location.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, () => {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

handleLocationError = (browserHasGeolocation, infoWindow, pos) => {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}


locationCheck = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {

      const center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      document.getElementById('latReq').value = center.lat;
      document.getElementById('lonReq').value = center.lng;

      console.log('center: ', center)
    }, () => {
      console.log('Error in the geolocation service.');
    });
  } else {
    console.log('Browser does not support geolocation.');
  }
}