document.addEventListener('DOMContentLoaded', () => {
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

  document.getElementById('locBtn').onclick = () => {
    locationCheck();
  }

}, false);



parseLoc = (str) => {
  arr = str.split(",");
  floatArr = [];
  for (i = 0; i < arr.length; i++) {
    floatArr.push(parseFloat(arr[i]));
  }
  return floatArr;
}

const hiddenList = document.querySelector("#hidden-list").innerText;
const locArr = parseLoc(hiddenList);
getPoints = (locArr) => {
  coords = [];
  for (i = 0, j = 1; i <= locArr.length - 2; i++, j++) {
    coords.push(new google.maps.LatLng(locArr[i], locArr[j]))
  }
  return coords;
}

var map, infoWindow, heatmap;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 25.7617,
      lng: -80.1918
    },
    zoom: 12,
    styles: [
      {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}]
      }
    ]
  });

  // function getPoints() {
  //   return [
  //     new google.maps.LatLng(25.8173669, -80.3302065),
  //     new google.maps.LatLng(25.8174344, -80.3302039)
  //   ]
  // }

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: getPoints(locArr),
    map: map
  });

  infoWindow = new google.maps.InfoWindow;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Current Location.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

const tickets = document.getElementsByClassName("tickets");
const ticketSum = document.getElementById('ticket-sum');
const parkingSum = document.getElementById('parking-sum');
const net = document.getElementById("net");

sumTickets = () => {
  let sum = 0;
  for (i = 0; i < tickets.length; i++) {
    sum += parseFloat(tickets[i].innerText);
  }
  return sum;
}

ticketSum.innerText = `$ ${sumTickets()}`;

net.innerText = `$ ${parseFloat(parkingSum.innerText) - sumTickets()}`;