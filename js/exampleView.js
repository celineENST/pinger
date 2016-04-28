function exampleView(container,model) {
	
/* VARIABLES */
	this.mapDiv = document.getElementById('map');
	this.stopTrackingBtn = container.find("#stopTracking");
	this.panBtns = {};
	this.zoomBtns = {};
	this.toolBtns = {};
	this.pinOverlay = container.find("#pinOverlay");
	this.namePin = container.find("#namePin");
	this.descriptionPin = container.find("#descriptionPin");
	this.typePin = container.find("#typePin");
	this.editOverlay = container.find("#editOverlay");
	this.editName = container.find("#editName");
	this.editDescription = container.find("#editDescription");
	this.editType = container.find("#editType");
	this.sidebar = container.find("#sidebar");

	var infowindows = [];
	var displayedMarkers = [];

	this.updateMarkers = function() {
		// Clear previous buttons 
		$("#btn").html("");
		// Clear previous markers
		displayedMarkers.forEach(function(element,index,array) {
			element.setMap(null);
		})
		// Clear displayed marker list
		displayedMarkers = [];

		// Draw the markers
		model.markers.forEach(function(element,index,array) {
			var m = new google.maps.Marker({
				map: model.map[0],
				position: element.pos,
				icon: {
					labelOrigin: new google.maps.Point(14,14),
					url: "./static/images/marker"+element.type+".png",
					scaledSize: new google.maps.Size(28,40)
				}, 
				label: {
					color: 'rgba(255,255,255,1)',
					fontFamily: 'Georgia',
					fontWeight: 'bold',
					fontSize: '17pt',
					text: element.text.toLowerCase()
				},
				draggable: true
			});
			// Put them in the displayed markers list
			displayedMarkers.push(m);

			var i = model.markers.indexOf(element);

			// Create the new buttons
			var b = document.createElement("button");
			b.setAttribute("type","submit");
			b.setAttribute("class","btn btn-info");
			b.setAttribute("id","center-"+i);
			b.appendChild(document.createTextNode(element.text));
			$("#btn").append(b);

			// Create the info window
			var contentString = 
			'<h5>' +  element.text + '</h5>'+
			'<p>' + element.description +
			'</p>'+
			'<div class="row"><div class="col-md-6" style="text-align: right;">' +
			'<button type="button" class="btn btn-info" id="editMarker-' + i + '">Edit this Pin</button></div>' +
			'<div class="col-md-6" style="text-align: left;">' + 
			'<button type="button" class="btn btn-danger" onclick="model.removeMarker(' + i + ')" id="deletemarker-' + i + '">Remove this Pin</button></div></div>';
			var infowindow = new google.maps.InfoWindow({
    		content: contentString,
    		maxWidth: 400
  			});

  			m.addListener('click', function() {
			   infowindow.open(model.map[0], m);
			});

			m.addListener('dragend',function(e) {
				model.moveMarker(i,m.getPosition());
			});
		});
	}

	model.addObserver(this.updateMarkers);

/* PANNING BUTTONS*/ 
	this.panBtn = function(container) {
		// Creating container
		var panContainer = document.createElement("div");
		panContainer.setAttribute("id","panContainer");
		panContainer.setAttribute("class","container-fluid");

		var uRow = document.createElement("div");
		var mRow = document.createElement("div");
		var bRow = document.createElement("div");
		uRow.setAttribute("class","row");
		mRow.setAttribute("class","row");
		bRow.setAttribute("class","row");
		panContainer.appendChild(uRow);
		panContainer.appendChild(mRow);
		panContainer.appendChild(bRow);

		/* BUTTONS */
			// Creating pan up button
			var panUp = document.createElement("div");
			panUp.setAttribute("id","panUp");
			panUp.setAttribute("class","controls col-md-4 col-md-offset-4 col-xs-4 col-xs-offset-4 col-lg-4 col-lg-offset-4");
			var u = document.createElement("i");
			u.setAttribute("class","glyphicon glyphicon-arrow-up");
			panUp.appendChild(u);
			uRow.appendChild(panUp);

			// Creating pan left button
			var panLeft = document.createElement("div");
			panLeft.setAttribute("id","panLeft");
			panLeft.setAttribute("class","controls col-md-4 col-xs-4 col-lg-4");
			var l = document.createElement("i");
			l.setAttribute("class","glyphicon glyphicon-arrow-left");
			panLeft.appendChild(l);
			mRow.appendChild(panLeft);

			// Creating pan right button
			var panRight = document.createElement("div");
			panRight.setAttribute("id","panRight");
			panRight.setAttribute("class","controls col-md-4 col-md-offset-4 col-xs-4 col-xs-offset-4 col-lg-4 col-lg-offset-4");
			var r = document.createElement("i");
			r.setAttribute("class","glyphicon glyphicon-arrow-right");
			panRight.appendChild(r);
			mRow.appendChild(panRight);	

			// Creating pan down button
			var panDown = document.createElement("div");
			panDown.setAttribute("id","panDown");
			panDown.setAttribute("class","controls col-md-4 col-md-offset-4 col-xs-4 col-xs-offset-4 col-lg-4 col-lg-offset-4");
			var d = document.createElement("i");
			d.setAttribute("class","glyphicon glyphicon-arrow-down");
			panDown.appendChild(d);
			bRow.appendChild(panDown);

		this.panBtns = {left: panLeft, up: panUp, right: panRight, down: panDown};
		
		container.appendChild(panContainer);
	}

/* ZOOMING BUTTONS */
	this.zoomBtn = function(container) {
		// Creating container
		var zoomContainer = document.createElement("div");
		zoomContainer.setAttribute("id","zoomContainer");
		zoomContainer.setAttribute("class","container-fluid");

		var row = document.createElement("div");
		row.setAttribute("class","row");

		zoomContainer.appendChild(row);

		/* BUTTONS */
			// Creating zoom in button
			var zoomIn = document.createElement("div");
			zoomIn.setAttribute("id","zoomIn");
			zoomIn.setAttribute("class","controls col-md-6 col-xs-6");
			var i = document.createElement("i");
			i.setAttribute("class","glyphicon glyphicon-zoom-in");
			zoomIn.appendChild(i);
			row.appendChild(zoomIn);

			// Creating zoom out button
			var zoomOut = document.createElement("div");
			zoomOut.setAttribute("id","zoomOut");
			zoomOut.setAttribute("class","controls col-md-6 col-xs-6 col-lg-6");
			var o = document.createElement("i");
			o.setAttribute("class","glyphicon glyphicon-zoom-out");
			zoomOut.appendChild(o);
			row.appendChild(zoomOut);
		this.zoomBtns = {in: zoomIn, out: zoomOut};

		container.appendChild(zoomContainer);
	}

/* TOOL BUTTONS */
	this.toolBtn = function(container) {
		// Creating container
		var toolContainer = document.createElement("div");
		toolContainer.setAttribute("id","toolContainer");
		toolContainer.setAttribute("class","container-fluid hiddenbar");

		var row1 = document.createElement("div");
		row1.setAttribute("class","row");
		var row2 = document.createElement("div");
		row2.setAttribute("class","row");

		toolContainer.appendChild(row1);
		toolContainer.appendChild(row2);

		// Creating marker button
		var info= document.createElement("div");
		info.setAttribute("class","controls col-md-12 col-xs-12 col-lg-12");
		info.setAttribute("id","infoBtn");
		var pin = document.createElement("i");
		pin.setAttribute("class","glyphicon glyphicon-info-sign");
		info.appendChild(pin);
		row1.appendChild(info);

		// See more button
		var menupin = document.createElement("div");
		menupin.setAttribute("class","controls col-md-12 col-xs-12 col-lg-12");
		menupin.setAttribute("id","menupinBtn");
		var plus = document.createElement("i");
		plus.setAttribute("class","glyphicon glyphicon-map-marker");
		menupin.appendChild(plus);
		row2.appendChild(menupin);

		this.toolBtns = {info: info,menupin: menupin};

		container.appendChild(toolContainer);
	}

/* PINNING BUTTON */
	this.pinBtn = function(container) {
		var btn = document.createElement("button");
		btn.setAttribute("class","btn btn-success");
		btn.setAttribute("id","pinningBtn");
		btn.setAttribute("style","visibility: hidden");
		btn.appendChild(document.createTextNode("Tap & Pin!"));
		container.appendChild(btn);
	}
}