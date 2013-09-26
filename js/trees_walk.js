dojo.require("esri.map");

// Global variables
var map;
var graphic;
var maxZoom = 20;

function init() {
	map = new esri.Map("map",{
			center:[-71.0971,42.3711], //long, lat
			zoom: maxZoom,
			sliderStyle:"small",
			logo: false
		});

	map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer("http://gis.cambridgema.gov/arcgis/rest/services/CDDBasemap/MapServer"));

	var imageParameters = new esri.layers.ImageParameters();
	imageParameters.layerIds = [0];
	imageParameters.layerOption = esri.layers.ImageParameters.LAYER_OPTION_SHOW;
	map.addLayer(new esri.layers.ArcGISDynamicMapServiceLayer("http://gis.cambridgema.gov/arcgis/rest/services/DPWEmbeddedLayers/MapServer",
															  {"imageParameters":imageParameters}));

	if(window.onorientationchange !== undefined){
		dojo.connect(dojo.global, "onorientationchange", orientationChanged);
	}else{
		dojo.connect(dojo.global, "onresize", orientationChanged);
	}

	initLocation();
}

// This function runs when the page loads
function initLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
		navigator.geolocation.watchPosition(zoomToLocation, locationError);
	} else {
		alert('Browser doesn nott support Geolocation.  See http://caniuse.com/#feat=geolocation for supported browser versions.');
	}
}

function locationError(error) {
	switch (error.code) {

	case error.PERMISSION_DENIED:
		alert("Location permission denied.");
		break;

	case error.POSITION_UNAVAILABLE:
		alert("Current location not available.");
		break;

	case error.TIMEOUT:
		alert("Location acquisition timed out.");
		break;
		
	default:
		alert("Unkown error");
		break;
	}
}

function zoomToLocation(location) {
	//zoom to the users location and add a graphic
	var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
	if (!graphic) {
		addGraphic(pt);
	}
	else { //move the graphic if it already exists
		graphic.setGeometry(pt);
	}
	map.centerAndZoom(pt, maxZoom);
}
      
function addGraphic(pt){
	var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, 
													new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
																					 new dojo.Color([210, 105, 30, 0.5]), 8), 
													new dojo.Color([210, 105, 30, 0.9])
													);
	graphic = new esri.Graphic(pt, symbol);
	map.graphics.add(graphic);
}

function orientationChanged() {
	if(map) {
		map.reposition();
		map.resize();
	}
}

dojo.ready(init);
