function Model() {
	this.map = [];
	this.posMarker = [];
	this.markers = [
	{text:"Estelle",pos:{lat:59.333357, lng:18.057294},description:"Wayne's Coffee",type:1},
	{text:"Céline",pos:{lat:59.342290, lng:18.051862},description:"Café Pascal",type:0}
	];

	/* INIT THE MAP */
	this.initMap = function(mapDiv,mapOptions) {
		this.map.push(new google.maps.Map(mapDiv,mapOptions));
		// Setting a marker for our current position
		var i = 
		this.posMarker.push(new google.maps.Marker({
			map: this.map[0],
			icon: {
				url:"./static/images/double.png",
				scaledSize:new google.maps.Size(25,25)
			},
			draggable: false,	// Marker draggable or not
			animation: google.maps.Animation.DROP,
			position: mapOptions.center
		}));
		this.notifyObservers();
	}

	/* CREATE A STATIC MARKER */
	this.createMarker = function(_text,_pos,_description,_type) {
		var marker = {text: _text, pos: _pos, description: _description, type: _type};
		this.markers.push(marker);
		this.notifyObservers();
	}

	/* MODIFY A MARKER */
	this.modifyMarker = function(index,_text,_description,_type) {
		this.markers[index].text = _text;
		this.markers[index].description = _description;
		this.markers[index].type = _type;
		this.notifyObservers();
	}

	/* REMOVE A MARKER */
	this.removeMarker = function(index) {
		this.markers.splice(index,1);
		this.notifyObservers();
	}

	/* REPLACE A MARKER */
	this.moveMarker = function(index,_pos) {
		this.markers[index].pos = _pos;
		this.notifyObservers();
	}

	/* SAVE MARKER LIST INTO COOKIES */
	this.saveCookies = function() {
		if(model.markers != null) {
			model.deleteCookies();
			model.markers.forEach(function(element,index,array) {
				Cookies.set("marker-"+index,element);
			});
		}
	}

	/* DELETE COOKIES */
	this.deleteCookies = function() {
		if (init) { // If we haven't initialized yet, we don't clear the cache
			Object.getOwnPropertyNames(Cookies.getJSON()).forEach(function(element,index,array) {
				if (element.indexOf("marker-") >= 0 && element != "pnctest")
					Cookies.remove(element);
			});
		}
	}

	/* LOAD COOKIES MARKERS */
	this.loadCookies = function() {
		if (Cookies.getJSON().hasOwnProperty("marker-0")) {
			model.markers = [];
			Object.getOwnPropertyNames(Cookies.getJSON()).forEach(function(element,index,array) {
				if (element.indexOf("marker-") >= 0 && element != "pnctest")
					model.markers.push(Cookies.getJSON(element));
			});
		}
		init = true;
	}

	//*** OBSERVABLE PATTERN ***
	var listeners = [this.saveCookies];
	
	this.notifyObservers = function (args) {
		for (var i = 0; i < listeners.length; i++){
			listeners[i](args);
		}
	};
	
	this.addObserver = function (listener) {
		listeners.push(listener);
	};
	//*** END OBSERVABLE PATTERN ***
}