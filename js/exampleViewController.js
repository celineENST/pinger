function exampleViewController(view, model) {

	var creatingMarker = false;
	var currentPin,currentEdit;

/* GEOLOCATION CONTROLLERS & BEHAVIOUR */
	var watchProcess,currentPos;

	// Initiate the geolocation treatment
	this.initiateGeolocation = function() {
		// Specifies to the navigator how to treat current position
		navigator.geolocation.getCurrentPosition(initGeolocation,handleErrors);
		// The current process of watching the current position
		watchProcess = navigator.geolocation.watchPosition(handleGeolocation,handleErrors);
	}

	// Toggle the tracking of our position
	function toggleHandleGeolocation(position) {
		if (watchProcess != null) {
			navigator.geolocation.clearWatch(watchProcess);
			watchProcess = null;
			$(this).attr("class","btn btn-success");
			$(this).html("Start Tracking");
		} else {
			watchProcess = navigator.geolocation.watchPosition(handleGeolocation,handleErrors);
			model.map[0].setCenter(currentPos);
			$(this).attr("class","btn btn-danger");
			$(this).html("Stop Tracking");
		}
	}

	// We load the map and place the marker where we are
	function initGeolocation(position) {
		var mapOptions = {
			center: {lat: position.coords.latitude,lng:position.coords.longitude},
			zoom: 15,
			disableDefaultUI: true,	// Hiding the default control buttons
			mapTypeId: google.maps.MapTypeId.ROADMAP,	// Satellite & Hybrid support tilt imagery
			draggable: true,
			styles: [{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#747474"},{"lightness":"23"}]},{"featureType":"poi.attraction","elementType":"geometry.fill","stylers":[{"color":"#f38eb0"}]},{"featureType":"poi.government","elementType":"geometry.fill","stylers":[{"color":"#ced7db"}]},{"featureType":"poi.medical","elementType":"geometry.fill","stylers":[{"color":"#ffa5a8"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#c7e5c8"}]},{"featureType":"poi.place_of_worship","elementType":"geometry.fill","stylers":[{"color":"#d6cbc7"}]},{"featureType":"poi.school","elementType":"geometry.fill","stylers":[{"color":"#c4c9e8"}]},{"featureType":"poi.sports_complex","elementType":"geometry.fill","stylers":[{"color":"#b1eaf1"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":"100"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"},{"lightness":"100"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffd4a5"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffe9d2"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"weight":"3.00"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"weight":"0.30"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#747474"},{"lightness":"36"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"color":"#e9e5dc"},{"lightness":"30"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":"100"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#d2e7f7"}]}]		};
		// We create the map
		model.initMap(view.mapDiv,mapOptions);

		// We handle click event
		model.map[0].addListener('click',function(e) {
			if (creatingMarker) { // If we're in the creating marker state
				view.pinOverlay.attr("style","visibility: visible;");
				currentPin = e.latLng;
			} else {
				var currentClass = view.sidebar.attr("class");
				if (currentClass == "col-md-2 col-xs-6 col-lg-2") {
					view.sidebar.attr("class","col-0");
					$("#toolContainer").attr("class","hiddenbar");
				}
			}
		})

		// And we specify position marker animation
		model.posMarker[0].addListener('click', function() {
			if (this.getAnimation() !== null) {
				this.setAnimation(null);
			} else {
				this.setAnimation(google.maps.Animation.BOUNCE);
			}
		});
		/* MAP CONTROLLERS */
			// Pan controls
			// ** PROBLEM **
			// We shouldn't be creating any div in the controller.
			var panControlDiv = document.createElement("div");
			panControlDiv.setAttribute("id","panDiv");
			view.panBtn(panControlDiv);

			// Panning function, direction controlled by the matrice
			var panTo = function(matrice) {
				var offset = 250;
				var scale = Math.pow(2,model.map[0].getZoom());
				var center = model.map[0].getCenter();
				var newCenterPoint = new google.maps.Point(
					center.lat() + offset/scale * matrice[0],
					center.lng() + offset/scale * matrice[1]
				);
				model.map[0].panTo({lat: newCenterPoint.x,lng: newCenterPoint.y});
			}

			// Listeners
			google.maps.event.addDomListener(view.panBtns.up,"click",function() {panTo([1,0]);});
			google.maps.event.addDomListener(view.panBtns.down,"click",function() {panTo([-1,0]);});
			google.maps.event.addDomListener(view.panBtns.left,"click",function() {panTo([0,-1]);});
			google.maps.event.addDomListener(view.panBtns.right,"click",function() {panTo([0,1]);});

			// Attach to the map
			model.map[0].controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(panControlDiv);

			// Zoom Controls
			// ** PROBLEM **
			// We shouldn't be creating any div in the controller.
			var zoomControlDiv = document.createElement("div");
			zoomControlDiv.setAttribute("id","zoomDiv");
			view.zoomBtn(zoomControlDiv);

			// Listeners
			google.maps.event.addDomListener(view.zoomBtns.in,"click",function() { model.map[0].setZoom(model.map[0].getZoom()+1); });
			google.maps.event.addDomListener(view.zoomBtns.out,"click",function() { model.map[0].setZoom(model.map[0].getZoom()-1); });

			// Attach to the map
			model.map[0].controls[google.maps.ControlPosition.TOP_RIGHT].push(zoomControlDiv);

			// Tools Controls
			// ** PROBLEM **
			// We shouldn't be creating any div in the controller.
			var toolControlDiv = document.createElement("div");
			view.toolBtn(toolControlDiv);

			// Listeners
			google.maps.event.addDomListener(view.toolBtns.info,"click",function() {  $("#infoOverlay").attr("style","visibility: visible;")});
			google.maps.event.addDomListener(view.toolBtns.menupin,"click",toggleSideBar);
			// Attach to the map
			model.map[0].controls[google.maps.ControlPosition.LEFT_CENTER].push(toolControlDiv);


			// Top button saying that we're pinning
			var pinBtnDiv = document.createElement("div");
			pinBtnDiv.setAttribute("id","pinBtnDiv");
			view.pinBtn(pinBtnDiv);

			model.map[0].controls[google.maps.ControlPosition.TOP_CENTER].push(pinBtnDiv);
	}

	// We follow our position
	function handleGeolocation(position) {
		currentPos = {lat: position.coords.latitude,lng:position.coords.longitude};
		model.posMarker[0].setPosition(currentPos);
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

	// Function that we call to toggle the sidebar
	// For now, it also sets the pinning state to NONE, and the pinning button to orange.
	function toggleSideBar() {
		view.sidebar.toggleClass("col-0 col-md-2").toggleClass("col-xs-6").toggleClass("col-lg-2");
		$("#toolContainer").toggleClass("sidebar hiddenbar"); 
	}

/* CONTROLLERS LINKED TO A MARKER */
	// For each marker we add a controller to the button on the sidebar that centers the map on it.
	// And we also add a button on the info box to edit a marker
	// ** PROBLEM : Since this function is called everytime there's a model change, we bind a listener multiple times to a button… 
	// **********	That's why we had to violate the MVC model by binding the remove function directly to the button in the view… 
	updateMarkerControllersBtns = function() {
		model.markers.forEach(function(element,index,array) {
			var i = model.markers.indexOf(element);
			$("body").on("click","#center-"+i,function() { model.map[0].setCenter(element.pos);});
			$("body").on("click","#editMarker-"+i,function() { 
				view.editName.val(element.text);
				view.editType.val(pinColors[element.type]);
				view.editDescription.val(element.description);
				view.editOverlay.attr("style","visibility: visible");
				currentEdit = i;
			});
		})
	}
	model.addObserver(updateMarkerControllersBtns);

/* GENERAL CONTROLLERS */

	// Clicking anywhere on an overlay disables its view, but clicks on the panels are not propagated to the overlay.
	$(".overlay").on("click",function() { $(this).attr("style","visibility: hidden;");});
	$(".panel").on("click",function(e) { e.stopPropagation(); });

/* SIDEBAR CONTROLLERS */
	$("#startPinning").on("click",function() { 
		creatingMarker = true;
		toggleSideBar();
		$("#pinningBtn").attr("style","visibility: visible");
	});
	view.stopTrackingBtn.click(toggleHandleGeolocation);


/* CREATE A PIN OVERLAY CONTROLLERS */
	$("#cancelPin").on("click",function() { 
		if (creatingMarker)
			creatingMarker = false;
		$("#pinningBtn").attr("style","visibility: hidden");
		view.pinOverlay.attr("style","visibility: hidden;") 
	});
	$("#savePin").on("click",function() { 
		var d = view.descriptionPin.val();
		if (view.namePin.val() == 0)
			alert("You have to name your pin");
		else {
			if (view.descriptionPin.val() == "")
				d = "No description";
			model.createMarker(view.namePin.val(),currentPin,d,pinColors.indexOf(view.typePin.val()));
			toggleSideBar();
			if (creatingMarker)
				creatingMarker = false;
			$("#pinningBtn").attr("style","visibility: hidden");
			view.pinOverlay.attr("style","visibility: hidden;") 
			view.namePin.val("");
			view.descriptionPin.val("");
		}
	});

/* EDIT A PIN OVERLAY CONTROLLERS */ 
	// TO DO. Add these attributes into the view
	$("#cancelEdit").on("click",function() { 
		view.editOverlay.attr("style","visibility: hidden"); 
	});
	$("#saveEdit").on("click",function() {
		model.modifyMarker(currentEdit,view.editName.val(),view.editDescription.val(),pinColors.indexOf(view.editType.val()));
		view.editOverlay.attr("style","visibility: hidden");
	});

/* INFORMATION OVERLAY CONTROLLERS */
	$("#hideInfo").on("click",function() { $("#infoOverlay").attr("style","visibility: hidden;"); });
	$("#settingsBtn").on("click",function() {
			$("#infoOverlay").attr("style","visibility: hidden;");
			$("#settingsOverlay").attr("style","visibility: visible;");
		});

/* SETTINGS OVERLAY CONTROLLERS */ 
	$("#hideSettings").on("click",function() { $("#settingsOverlay").attr("style","visibility: hidden;"); });
	$("#customControls").on("click",function() {
		$(this).toggleClass("btn-danger btn-success").toggleClass("btn btn");
		$("#panDiv").toggleClass("show hidden"); 
		$("#zoomDiv").toggleClass("show hidden");
	})
	$("#satelliteBtn").on("click",function() {
		$(this).button("toggle");
		model.map[0].setMapTypeId(google.maps.MapTypeId.HYBRID);
	});
	$("#roadmapBtn").on("click",function() {
		$(this).button("toggle");
		model.map[0].setMapTypeId(google.maps.MapTypeId.ROADMAP);
	});

}