// Create Object 'mainMarkers' to store the # of markers, the start marker position ...
const mainMarkers = {
  count: 0,
  start: 0,
  markers: [],
  positions: [],
  labels: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  labelIndex: 0
};

// Assign false if one marker does not have a 'place_id' (Decides to use directions with place IDs or latlng coordinates)
let placeIdExists = true;

// Assign important variables that will be altered later 
let orderedMarkersDone = []; // Needed to reset markers after optimization has been completed
let optimizeCheck = false; // Set to true upon completion of optimization

// Create custom controls 'Left Bottom' and 'Right Top' div elements to attach to Google map controls
const customControlsLB = document.createElement("div");
const customControlsRT = document.createElement("div");

function initMain() {
  mapDiv = document.getElementById("map");
  const map = new google.maps.Map(mapDiv, {
    center: { lat: 38.123, lng: -98.134 },
    zoom: 4.25,
    mapTypeId: "roadmap",
    fullscreenControl: false
  });
  mapGlobal = map;

  // Create autocomplete search box and link it to the UI input
  input = document.getElementById("pac-input");
  card = document.getElementById("pac-card");
  allowedSearchInput = input.onclick;

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(card);
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo("bounds", map);
  autocomplete.setFields(["place_id", "formatted_address", "geometry", "icon", "name"]);

  // Add custom_controls DIV elements defined in .js files in 'static' folder to their designated location on the screen
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(customControlsLB);
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(customControlsRT);

  // Initialize Directions API classes and choose map for rendering directions
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true
  })

  // Create custom text, polyline and marker options and set for DirectionsRenderer
  directionsRenderer.setMap(map)
  directionsRenderer.setPanel(document.getElementById("directions-body"));

  // Initialize Geocoder API class to reverse geocode marker positions.
  const geocoder = new google.maps.Geocoder;

  // Create class to handle marker deletion with custom overlay 
  class MarkerBox extends google.maps.OverlayView {
      
    constructor(marker) {
      super();
      this.markerStart = document.createElement("li");
      this.markerStart.innerHTML = "Set Start Location";
      this.markerDelete = document.createElement("li");
      this.markerDelete.innerHTML = "Delete Location";
      this.markerBox = document.createElement("div");
      this.markerBox.appendChild(this.markerStart); this.markerBox.appendChild(this.markerDelete);
      this.markerBox.className = "marker-box";

      /// Add event handlers for the marker box list elements:
      // Set current marker as the start marker 
      this.markerStart.addEventListener("click", () => {
        if (mainMarkers.markers.indexOf(marker) == 0) { // If the marker you're setting is already the start marker,
          marker.setIcon({ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }) // ensure the start marker icon is set,
          this.close(marker) // close the box and, 
          return // do nothing
        }

        // Swap start location (startMarker) with current location (marker) within mainMarkers.markers and mainMarkers.positions
        let startMarker = mainMarkers.markers[0] // Starting marker
        let startPosition = mainMarkers.positions[0] // Starting marker position 
        
        let index = mainMarkers.markers.indexOf(marker) // Index of current marker which has just been right-clicked
        mainMarkers.markers[0] = marker
        mainMarkers.positions[0] = mainMarkers.positions[index]

        mainMarkers.markers[index] = startMarker
        mainMarkers.positions[index] = startPosition

        mainMarkers.markers[index].setIcon(marker.getIcon())
        mainMarkers.markers[index].setAnimation(google.maps.Animation.DROP)

        mainMarkers.markers[0].setIcon({ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" })
        mainMarkers.markers[0].setAnimation(google.maps.Animation.DROP)

        mainMarkers.start = 0;

      });

      this.markerDelete.addEventListener("click", () => {
        this.removeMarker(marker);
      });
    }

    onAdd() {
      this.getPanes().floatPane.appendChild(this.markerBox); 
    }

    onRemove() {
      if (divListener) {
        google.maps.event.removeListener(divListener);
      }
      if (this.markerBox) {
        this.markerBox.parentNode.removeChild(this.markerBox);
      }
      this.set("position", null);
      this.set("marker", null);
    }
  
    open(map, marker) {
      this.set("marker", marker)
      this.set("position", marker.position)
      this.setMap(map)
      this.draw()
    }

    close(marker) {
      marker.setAnimation(null)
      this.setMap(null)
    }

    draw() {
      const position = this.get("position")
      const projection = this.getProjection()
  
      if (!position || !projection) {
        return;
      }
      const point = projection.fromLatLngToDivPixel(position)
      this.markerBox.style.left = point.x + "5px"
      this.markerBox.style.top = point.y + "5px"
    }

    removeMarker(marker) {
      let index = mainMarkers.markers.indexOf(marker)
      if (mainMarkers.start == index) {
        mainMarkers.start = null;
      }
      mainMarkers.markers.splice(index, 1)
      mainMarkers.positions.splice(index, 1)
      mainMarkers.count -= 1
      marker.setMap(null)
      this.close(marker)
    }
  }

  const infowindow = new google.maps.InfoWindow();
  
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  autocomplete.addListener("place_changed", () => {
    if (optimizeCheck == true) {
      return
    }
    infowindow.close(); // Close any currently open infowindow instance 
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      console.error("ERROR: Place contains no geometry");
      return
    }

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
    }

    // Create a marker for each place
    var marker = new google.maps.Marker({
      map,
      title: place.name,
      animation: google.maps.Animation.DROP,
      position: place.geometry.location
    })

    if (place.place_id) {
      marker.setPlace({
        placeId: place.place_id,
        location: place.geometry.location
      })
    } else {
      placeIdExists = false;
    }

    if (mainMarkers.count == 0) {
      mainMarkers.start = 0;
      marker.setIcon({ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" })
    } 

    let coordinatesJSONString = JSON.stringify(marker.position);  // Convert Marker Object position to JSON string,
    let coordinatesJSONObject = JSON.parse(coordinatesJSONString);  // Convert the JSON string to JSON object,
    let coordinatesString = String(coordinatesJSONObject.lat) + "," + String(coordinatesJSONObject.lng);  // Construct string destination for Google API url request from properties 'lat' and 'lng', and
    if (mainMarkers.positions.includes(coordinatesString)) { // ...
      alert("This location has already been added, please try another.")
      marker.setMap(null);
      return
      
    } else {
      mainMarkers.count += 1;
      mainMarkers.markers.push(marker)
      mainMarkers.positions.push(coordinatesString)  // Store destination in Array 'positions'
      addLocation(marker);
    }

    let markerCoordinates = coordinatesJSONObject.lat + '° <b>N</b>, ' + coordinatesJSONObject.lng + '° <b>W</b>';

    let contentString = 
    '<div class="marker-click">' + 
    '<span style="font-size:x-large; font-weight: 7.5px;" class="marker-letters">'+marker.title+'</span>' +
    '<br>' + 
    '<span style="font-size:large;" class="marker-letters">'+place.formatted_address+'</span>' +
    '<br>' + '<br>' +
    '<span class="marker-letters">' + markerCoordinates + '</span>'+
    '</span>' +
    '</div>'
      
      
    // Add click function to marker to display address
    marker.addListener("click", function() {
      infowindow.setContent(contentString);
      infowindow.open(map, marker);
    })
        
    // Add delete function to marker
    marker.addListener("rightclick", event => {
      if (marker.position == undefined) {
        return;
      }
      if (optimizeCheck == false) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        var markerBox = new MarkerBox(marker);
        markerBox.open(map, marker)

        // click anywhere on the map except on MarkerBox instance to close the box
        divListener = google.maps.event.addDomListener(mapDiv, "click", event => {
          if (event.target != markerBox) {
            markerBox.close(marker)
            markerBox.setMap(null)
          }
        });

      } else {
        return
      }
      
    })

  });
    
}

/*function reverseGeocode(marker, geocoder) {
  geocoder.geocode({ location: marker.position.toJSON() }, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        marker.address = results[0].formatted_address;
      } else { 
        console.error("ERROR: No results found")
      }
    } else {
      console.error("ERROR: Failure of 'geocode' function due to "+status)
    }
  });
}*/

function setupDirections(orderedLocations) {
  const waypoints = [];
  for (let i = 1; i < orderedLocations.length; i++) {
    waypoints.push(
      {
        location: orderedLocations[i],
        stopover: true
      }
    )
  }
  return waypoints
}

function requestDirections(directionsService, directionsRenderer, markersOrdered) {
  
  let orderLength = markersOrdered.length;
  let orderedIds = [];
  let orderedPositions = [];
  for (let i = 0; i < orderLength; i++) {
    orderedIds.push({ placeId: markersOrdered[i].place.placeId })
    orderedPositions.push(markersOrdered[i].position)
  }
  if (orderLength >= 3) {
    if (placeIdExists) {
      var startEnd = orderedIds[0]
      var waypts = setupDirections(orderedIds)
    } else {
      var startEnd = orderedPositions[0]
      var waypts = setupDirections(orderedPositions)
    }
    directionsService.route(
      {
        origin: startEnd,
        destination: startEnd,
        waypoints: waypts,
        optimizeWaypoints: false, // This App performs the route optimization on this server, not on Google's.
        travelMode: google.maps.TravelMode.DRIVING
      },
      (response, status) => {
        if (status === "OK") {

          disableSearch(input, card);
          presentDirections();
          
          mainMarkers.markers[0].setIcon(undefined) // Default icon is undefined icon
          directionsRenderer.setMap(mapGlobal);
          directionsRenderer.setDirections(response)
          markersOrdered.forEach(marker => {
            let label = { text: mainMarkers.labels[mainMarkers.labelIndex++ % mainMarkers.labels.length], 
                          color: "white" 
                        };
            marker.setLabel(label)
            marker.setVisible(true)
            marker.setAnimation(google.maps.Animation.DROP)
            orderedMarkersDone.push(marker)
          })
          document.getElementById("directions-modal").style.display = "block";

          markersOrdered = [];
          mainMarkers.labelIndex = 0;
          
          optimizeCheck = true;

        } else {
          console.error("ERROR: directions could not be fetched due to " + status);
        }
      }
    )

  } else {
    alert("Sorry, you must add two or more markers to calculate directions.")
  }
  
}

function disableSearch(input, card) {
  input.style.backgroundColor = "silver";
  input.onclick = function() {
    return false
  }
  card.onclick = function() {
    return false
  }
}

function presentDirections() {
  let directionsBody = document.getElementById("directions-body");
  directionsBody.innerHTML = "";
  directionsBody.style.padding = "50px";
  directionsBody.style.background= "white";
  directionsBody.style.textAlign = "left";
  let directionsHeader = document.querySelector("#directions-modal .modal-header");
  directionsHeader.style.background = "linear-gradient(360deg, #D3D3D3, white)";
}

function addLocation(marker) {

  let locationsBody = document.getElementById("locations-body")
  let locationHolder = document.createElement("div");
  locationHolder.className = "location-holder";
  let locationActual = document.createElement("div");
  locationActual.className = "location-actual";

  locationHolder.appendChild(locationActual)
  locationsBody.appendChild(locationHolder)

  if (mainMarkers.count == 1) {document.getElementById("locations-body").getElementsByTagName("p")[0].remove()}

  let innerDivs = []

  //let iconDiv = document.createElement("div"); iconDiv.className = "icon"; innerDivs.push(iconDiv)
  let titleDiv = document.createElement("div"); titleDiv.className = "title"; innerDivs.push(titleDiv)
  let streetDiv = document.createElement("div"); streetDiv.className = "street"; innerDivs.push(streetDiv)
  let townCityDiv = document.createElement("div"); townCityDiv.className = "town-city"; innerDivs.push(townCityDiv)
  let stateDiv = document.createElement("div"); stateDiv.className = "state"; innerDivs.push(stateDiv)
  let zipcodeDiv = document.createElement("div"); zipcodeDiv.className = "zipcode"; innerDivs.push(zipcodeDiv)
  let countryDiv = document.createElement("div"); countryDiv.className = "country"; innerDivs.push(countryDiv)

  for (let i = 0; i < innerDivs.length; i++) {
    locationActual.appendChild(innerDivs[i])
  }

}

function removeLocation() {

}
