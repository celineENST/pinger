var map,marker,watchProcess;

// Animation of the markers
function toggleBounce(marker) {
	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}
}

// Panning controls
function PanControl(mapDiv,map) {
	// Creating container
	var panContainer = document.createElement("div");
	panContainer.setAttribute("id","panContainer");

	// We want something like that : 	.    UP   .
	// 								   LEFT  .  RIGHT
	// 									.  DOWN	  .							
	// So we need to create four empty spaces (the . places)

	// First empty space
	var e = document.createElement("div")
	e.setAttribute("class","empty");
	panContainer.appendChild(e);

	// Creating pan up button
	var panUp = document.createElement("div");
	panUp.setAttribute("id","panUp");
	panUp.setAttribute("class","controls");
	panUp.appendChild(document.createTextNode("\u21e1"));
	panContainer.appendChild(panUp);

	// Second empty space
	var e2 = document.createElement("div")
	e2.setAttribute("class","empty");
	panContainer.appendChild(e2);

	// Creating pan left button
	var panLeft = document.createElement("div");
	panLeft.setAttribute("id","panLeft");
	panLeft.setAttribute("class","controls");
	panLeft.appendChild(document.createTextNode("\u21e0"));
	panContainer.appendChild(panLeft);

	// Third empty
	var e3 = document.createElement("div")
	e3.setAttribute("class","empty");
	e3.appendChild(document.createTextNode("."));
	panContainer.appendChild(e3);

	// Creating pan right button
	var panRight = document.createElement("div");
	panRight.setAttribute("id","panRight");
	panRight.setAttribute("class","controls");
	panRight.appendChild(document.createTextNode("\u21e2"));
	panContainer.appendChild(panRight);	


	// Fourth empty
	var e4 = document.createElement("div")
	e4.setAttribute("class","empty");
	e4.appendChild(document.createTextNode(" . "));
	panContainer.appendChild(e4);

	// Creating pan down button
	var panDown = document.createElement("div");
	panDown.setAttribute("id","panDown");
	panDown.setAttribute("class","controls");
	panDown.appendChild(document.createTextNode("\u21e3"));
	panContainer.appendChild(panDown);

	mapDiv.appendChild(panContainer);

	// panning function, direction controlled by the matrice
	function panTo(matrice, map) {
		var offset = 100;
		var scale = Math.pow(2,map.getZoom());
		var center = map.getCenter();
		var newCenterPoint = new google.maps.Point(
			center.lat() + offset/scale * matrice[0],
			center.lng() + offset/scale * matrice[1]
		);
		map.panTo({lat: newCenterPoint.x,lng: newCenterPoint.y});
	}

	// Listeners
	google.maps.event.addDomListener(panUp,"click",function() {panTo([1,0],map);});
	google.maps.event.addDomListener(panDown,"click",function() {panTo([-1,0],map);});
	google.maps.event.addDomListener(panLeft,"click",function() {panTo([0,-1],map);});
	google.maps.event.addDomListener(panRight,"click",function() {panTo([0,1],map);});
}

// Zooming controls
function ZoomControl(mapDiv,map) {
	// Creating container
	var zoomContainer = document.createElement("div");
	zoomContainer.style.width = zoomContainer.style.height = "10em";
	zoomContainer.style.padding = "1em";

	// Creating zoom in button
	var zoomIn = document.createElement("div");
	zoomIn.setAttribute("id","zoomIn");
	zoomIn.setAttribute("class","controls");
	zoomIn.appendChild(document.createTextNode("+"));
	zoomContainer.appendChild(zoomIn);

	// Creating zoom out button
	var zoomOut = document.createElement("div");
	zoomOut.setAttribute("id","zoomOut");
	zoomOut.setAttribute("class","controls");
	zoomOut.appendChild(document.createTextNode("-"));
	zoomContainer.appendChild(zoomOut);

	mapDiv.appendChild(zoomContainer);

	// Listeners
	google.maps.event.addDomListener(zoomIn,"click",function() { map.setZoom(map.getZoom()+1); });
	google.maps.event.addDomListener(zoomOut,"click",function() { map.setZoom(map.getZoom()-1); });
}

function initialize() {

	var browserCenter;

	// We wait for the page to be ready then we try to get the geolocation
	$(window).ready(initiateGeolocation);

	// Initiate the geolocation treatment
	function initiateGeolocation() {
		navigator.geolocation.getCurrentPosition(initGeolocation,handleErrors);
		navigator.geolocation.watchPosition(handleGeolocation,handleErrors);
		$("#stopTracking").click(toggleHandleGeolocation);
	}

	// Handle geolocation errors
	function handleErrors(error) {
		switch(error.code) {
			case error.PERMISSION_DENIED: 
				alert("Please share your geolocation data");
				break;
			case error.POSITION_UNAVAILABLE:
				alert("Could not detect current position");
				break;
			case error.TIMEOUT:
				alert("Retrieving position timed out, please try again");
				break;
			default:
				alert("Please try again");
				break;
		}
	}

	// Toggle the tracking of our position
	function toggleHandleGeolocation(position) {
		if (watchProcess == true) {
			watchProcess = false;
			navigator.geolocation.clearWatch(watchProcess);
			$(this).html("Start Tracking");
		} else {
			watchProcess = true;
			navigator.geolocation.watchPosition(handleGeolocation,handleErrors);
			$(this).html("Stop Tracking");
		}
	}

	// We load the map and place the marker where we are
	function initGeolocation(position) {
		watchProcess = true;
		browserCenter = {lat: position.coords.latitude,lng:position.coords.longitude};
		initMap();
	}

	// We follow our position
	function handleGeolocation(position){
		browserCenter = {lat: position.coords.latitude,lng:position.coords.longitude};
		marker.setPosition(browserCenter);
	}

	// Creating a custom marker
	function customMarker(text,pos,color) {
		var m = new google.maps.Marker({
			map: map,
			position: pos,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				fillColor: color,
				fillOpacity: .3,
				scale: 10,
				strokeColor: color,
				strokeWeight: 3,
			},
			label: {
				color: 'white',
				fontWeight: 'bold',
				text: text,
			},
			draggable: false
		});
		$("#center-"+text).click(function() { map.setCenter(pos);});
	}

	// Initialization of the map 
	function initMap() {
		/* CREATE THE MAP */
		var mapDiv = document.getElementById('map');
		var mapOptions = {
			center: browserCenter,
			zoom: 18,
			disableDefaultUI: true,	// Hiding the default control buttons
			mapTypeId: google.maps.MapTypeId.HYBRID,	// Satellite & Hybrid support tilt imagery
			draggable: true
		};
		map = new google.maps.Map(mapDiv,mapOptions);

		/* SETTING TWO STATIC MARKERS - FAVORITE PLACES - */
		customMarker("E",{lat:59.333357, lng:18.057294},"gold");
		customMarker("C",{lat:59.342290, lng:18.051862},"pink");

		/* SETTING A MARKER FOR OUR CURRENT POSITION*/
		marker = new google.maps.Marker({
			map: map,
			draggable: false,	// Marker draggable or not
			animation: google.maps.Animation.DROP,
			position: browserCenter
		});
		marker.addListener('click', function() {toggleBounce(marker);});

		// Zoom controls
		var zoomControlDiv = document.createElement("div");
		var zoomControl = new ZoomControl(zoomControlDiv,map);
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(zoomControlDiv);

		//Pan controls
		var panControlDiv = document.createElement("div");
		var panControl = new PanControl(panControlDiv,map);
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(panControlDiv);
	}
}

initialize();