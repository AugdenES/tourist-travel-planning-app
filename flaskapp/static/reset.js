/// Create 'resetBtn' DOM (div-like button) to remove all markers and create a new route to optimize
const resetBtn = document.createElement("div");
resetBtn.id = "reset-btn";
resetBtn.title = "Reset current locations and start from scratch";
resetBtn.style.marginLeft = "10px";

// resetBtn SVG
const resetBtnSVG = document.querySelector("#reset-icon svg");
resetBtn.appendChild(resetBtnSVG);
customControlsLB.appendChild(resetBtn);

// resetModal, yes and no button reference
const resetModal = document.getElementById("reset-modal")
const yesBtn = document.getElementById("yes")
const noBtn = document.getElementById("no")

// Add event listeners to buttons to execute their functions

resetBtn.addEventListener("click", () => {
        
// RESET ANIMATION: GRADUALLY LOWER MARKER OPACITY AND FINALLY REMOVE UPON RESET

  function animateMarkerOpacity(marker, timeout) {
    window.setTimeout(() => {
      let count = 0                                
      for (let l = 1.0; l > -0.025; l -= 0.025) {  // We decrease opacity by 2.5% every 0.023 seconds
        window.setTimeout(() => {
          marker.setOpacity(l)
        }, (count+=1) * 23) // 23 milliseconds = 0.023 seconds
      }
    }, timeout)
  }
       
  resetModal.style.display = "block";
  yesBtn.addEventListener("click", () => {

    directionsRenderer.setMap(null);

    let markers = mainMarkers.markers;
    let cycleMarkerTime = 75;
    let cycleFinishDelay = 2000;

    // Function removeMarkers() used for handling the 'then' promise callback and the 'catch' promise rejection.
    function removeMarkers() {
      for (let i = 0; i < markers.length; i++) {
        if (optimizeCheck == false) {
          markers[i].setMap(null)
        } else {
          orderedMarkersDone[i].setVisible(false)  
        }
      }
    }

    const fadeOutMarkers = new Promise((resolve, reject) => {
      for (let i = 0; i < markers.length; i++) {
        let scaledTime = i * cycleMarkerTime;
        if (optimizeCheck == false) {
          animateMarkerOpacity(markers[i], scaledTime)  
        } else {      
          animateMarkerOpacity(orderedMarkersDone[i], scaledTime)            
        }
      }
                     
      resolve(true)
      reject(new Error("ERROR: fadeOutMarkers Promise was rejected"))
            
    })

    fadeOutMarkers.then((resolved) => {
      window.setTimeout(() => {
        removeMarkers();
      }, markers.length * cycleMarkerTime + cycleFinishDelay)
    })

    fadeOutMarkers.catch((error) => {
      console.log(error)
      removeMarkers();
    })

    // Reset mainMarkers Object to original state, as well as orderedMarkersDone
    mainMarkers.count = 0; mainMarkers.markers = []; mainMarkers.positions = [];
    orderedMarkersDone = [];

    // Reset optimizeCheck to original state
    optimizeCheck = false;

    // Reset changed styles to original states
    optimizeBtn.style = "";
    directionsModal.style = "";
    resetModal.style.display = "";
          
    input.style = "";
    input.onclick = allowedSearchInput;
          
  })

  noBtn.addEventListener("click", () => {
    resetModal.style.display = ""
  })
        
})

// RESET ANIMATION: ROTATE/CHANGE COLOR OF RESET ARROW SVG UPON MOUSEENTER AND MOUSELEAVE

function animateArrowSVG(rotation) {
  if (rotation > 0) {
    resetBtnSVG.style.fill = "black";
  } else {
    resetBtnSVG.style.fill = "";
  }

  anime({ 
    targets: resetBtnSVG,
    duration: 6000,
    rotate: rotation,
  });
}

resetBtn.addEventListener("mouseenter", () => { animateArrowSVG(360) });

resetBtn.addEventListener("mouseleave", () => { animateArrowSVG(-360) });

      // RESET ANIMATION: LINE THROUGH 'remove' AND OPACITY CHANGE UPON MOUSEOVER

      //function animateRemove(direction) {
        //anime({
          //targets: '.line-thru',
          //direction: direction,
          //scaleX: [0,1],
          //opacity: [0.5,1],
          //easing: "easeOutExpo",
          //duration: 800,
          //offset: '-=875'
        //})
      //}

      //var remove = document.querySelector(".line-thru");

      //remove.addEventListener("mouseenter", animateRemove('normal'));

      //remove.addEventListener("mouseenter", animateRemove('reverse'));

