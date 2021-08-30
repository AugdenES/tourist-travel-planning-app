/// Create 'locationsBtn' DOM (div-like button) to view currently added locations
const locationsBtn = document.createElement("div");
locationsBtn.style.color = "rgb(101,101,101)";
locationsBtn.id = "locations-btn";
locationsBtn.title = "View your currently added locations";
locationsBtn.innerHTML = "Locations";
customControlsLB.appendChild(locationsBtn);

// locationsBtn SVG
// ...

// Grab the custom modals defined in 'index.html'
const locationsModal = document.getElementById("locations-modal")

// Add event listeners to buttons to execute their functions
locationsBtn.addEventListener("mouseenter", () => {
    locationsBtn.style.color = "black";
})
  
locationsBtn.addEventListener("mouseleave", () => {
    locationsBtn.style.color = "rgb(101,101,101)";
})
      
locationsBtn.addEventListener("click", () => {
  locationsModal.style.display = "block";
});

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