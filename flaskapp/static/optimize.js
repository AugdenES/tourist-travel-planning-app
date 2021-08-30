/// Create 'optimizeBtn' DOM (div-like button) to optimize directions
const optimizeBtn = document.createElement("div");
optimizeBtn.style.color = "rgb(101,101,101)";
optimizeBtn.id = "optimize-btn";
optimizeBtn.title = "Optimize your route";
optimizeBtn.innerHTML = "Optimize";
customControlsLB.appendChild(optimizeBtn);

// optimizeBtn SVG
// ...

// Add event listeners to buttons to execute their functions
optimizeBtn.addEventListener("mouseenter", () => {
    optimizeBtn.style.color = "black";
})
  
optimizeBtn.addEventListener("mouseleave", () => {
    optimizeBtn.style.color = "rgb(101,101,101)";
})

optimizeBtn.addEventListener("click", () => {
  if (optimizeCheck == true) {
    return 
  }
  
  if (mainMarkers.start == null) {
    alert("Sorry! No starting location found. Please right-click on a location to select one ")
    return
  }

  if (mainMarkers.markers.length < 3) {
    alert("Three or more locations required.")
    return
  }

  optimizeBtn.style.backgroundColor = "silver";
  optimizeBtn.style.cursor = "default";
  optimizeBtn.style.pointerEvents = "none";
  optimizeBtn.style.color = "rgb(101,101,101)";

  $(document).ready(function() {
    $.ajax({
      type: "POST",
      url: "/",
      data: JSON.stringify({ path_positions: mainMarkers.positions }),
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      success: function (response) {
        const markersOrdered = getResponseRoutes(response)
        requestDirections(directionsService, directionsRenderer, markersOrdered) 
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("ERROR: " + errorThrown)
        alert("ERROR: " + errorThrown + "\n" + textStatus)
      }
    });
  })
  function getResponseRoutes(response) {
      var markersOrdered = [];
      Object.entries(response).forEach(pair => {
        markersOrdered[pair[0]] = mainMarkers.markers[pair[1]]
      })
      return markersOrdered
    }
})