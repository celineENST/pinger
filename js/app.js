var model = new Model();
var view = new exampleView($("#container"),model);
var controller = new exampleViewController(view,model);

var pinColors = ["Pink","Blue","Red","Yellow","Green"];

model.createMarker("Estelle",{lat:59.333357, lng:18.057294},"Wayne's Coffee",1);
model.createMarker("Celine",{lat:59.342290, lng:18.051862},"Cafe Pascal",0);

// We wait for the page to be ready then we try to get the geolocation
$(window).ready(controller.initiateGeolocation);