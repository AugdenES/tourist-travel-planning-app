/// Create 'directionsBtn DOM (div-like button) to view the optimally calculated directions
const directionsBtn = document.createElement("div");
directionsBtn.style.color = "rgb(101,101,101)";
directionsBtn.id = "directions-btn";
directionsBtn.title = "Display optimally routed directions";
directionsBtn.innerHTML = "Directions"; 
customControlsLB.appendChild(directionsBtn);

// directionsBtn SVG
// ...

// Grab directions modal from 'index.html'
const directionsModal = document.getElementById("directions-modal")

directionsBtn.addEventListener("mouseenter", () => {
    directionsBtn.style.color = "black";
})
  
directionsBtn.addEventListener("mouseleave", () => {
    directionsBtn.style.color = "rgb(101,101,101)";
})

directionsBtn.addEventListener("click", () => {
    directionsModal.style.display = "block";
})

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

function presentDirections() {
    let directionsBody = document.getElementById("directions-body");
    directionsBody.innerHTML = "";
    directionsBody.style.padding = "50px";
    directionsBody.style.background= "white";
    directionsBody.style.textAlign = "left";
    let directionsHeader = document.querySelector("#directions-modal .modal-header");
    directionsHeader.style.background = "linear-gradient(360deg, #D3D3D3, white)";
}