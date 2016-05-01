var init = false;
var model = new Model();
var view = new exampleView($("#container"),model);
var controller = new exampleViewController(view,model);

var pinColors = ["Pink","Blue","Red","Yellow","Green"];

model.loadCookies();
// We wait for the page to be ready then we try to get the geolocation
$(window).ready(controller.initiateGeolocation);