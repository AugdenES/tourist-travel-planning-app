const modalClose = document.getElementsByClassName("modal-close")
const modals = document.querySelectorAll(".modals")

window.addEventListener("click", event => {
  if (event.target == locationsModal || event.target == directionsModal) {
    locationsModal.style.display = "none";
    directionsModal.style.display = "none";
    //settingsModal.style.display = "none"
  }
});
  
for (let i = 0; i < modalClose.length; i++) {
  modalClose[i].addEventListener("click", () => {
    modals[i].style.display = "none";
  })
}