/// Create 'settingsBtn' DOM (div-like button) to adjust user settings
const settingsBtn = document.createElement("div");
settingsBtn.id = "settings-btn";
settingsBtn.title = "Adjust your travel settings";

// settingsBtn SVG
const settingsBtnSVG = document.querySelector("#settings-icon svg");
settingsBtn.appendChild(settingsBtnSVG);
customControlsRT.appendChild(settingsBtn);

// SETTINGS ANIMATION: SPIN GEAR AND PAUSE/RESUME UPON MOUSE LEAVE/ENTER
let settingsAnimation = anime({ 
    targets: settingsBtnSVG,
    duration: 8000,
    rotate: 360,
    loop: true,
    autoplay: false,
    easing: 'linear',
})

function animateGearSVG(settingsAnimation, bool) {
  if (bool) {
    settingsBtnSVG.style.fill = "black";
    return settingsAnimation.play();
  } else {
    settingsBtnSVG.style.fill = "";
    return settingsAnimation.pause();
  } 
}

settingsBtn.addEventListener("mouseenter", () => { animateGearSVG(settingsAnimation, true) });

settingsBtn.addEventListener("mouseleave", () => { animateGearSVG(settingsAnimation, false) });
