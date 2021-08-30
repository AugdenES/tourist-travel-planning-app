$(document).ready(function() {
  $.ajax({
    type: "POST",
    url: "/api",
    contentType: "application/json; charset=utf-8",
    success: function (response) {
        var api = document.createElement("script");
        api.async = true;
        api.src = response;
        document.head.appendChild(api);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("ERROR: " + errorThrown)
      alert("ERROR: " + errorThrown)
    }
  })
})