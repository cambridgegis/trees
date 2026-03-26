dojo.require("esri.map");
// Identity Mangager will automatically handle token-based authentication for secured ArcGIS Server 10.1 services
dojo.require("esri.IdentityManager");
// FeatureLayer and Editor-all will allow for editing
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.dijit.editing.Editor-all");

// Global variables
var map;
var graphic;

function init() {
	// Pointer to the Geometry Server is required by the Editor widget
	esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://gis.cambridgema.gov/ArcGIS/rest/services/Geometry/GeometryServer");

	map = new esri.Map("map",{
			center:[-71.0971,42.3711], //long, lat
			zoom:18,
			sliderStyle:"small",
			logo: false
		});

	dojo.connect(map, "onLayersAddResult", initEditor);

	// add the basemap - token not required
	map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer("http://gis.cambridgema.gov/arcgis/rest/services/CDDBasemap/MapServer"));

	// add secure service (addLayers fires onLayersAddResult but addLayer does not)
	map.addLayers([new esri.layers.FeatureLayer("http://gis.cambridgema.gov/arcgis/rest/services/DPWEdit/DPWEditLayersForestry/FeatureServer/0",
												{outFields:["*"]})]);
}

// This function runs when the location button is clicked
function initLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
	} else {
		alert("Browser doesn't support Geolocation.  See http://caniuse.com/#feat=geolocation for supported browser versions.");
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
	map.centerAndZoom(pt, 18);
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

function initEditor(results) {
	// Format the template layers list for input into the TemplatePicker
	var templateLayers = dojo.map(results, function(result) {
			return result.layer;
		});

	var templatePicker = new esri.dijit.editing.TemplatePicker({
			featureLayers: templateLayers,
			grouping: false,
			rows: 'auto',
			columns: 1,
			maxLabelLength: 0
		}, 'templatePickerDiv');

	templatePicker.startup();

	// Format the layers list for input into the Editor
	var layers = dojo.map(results, function(result) {
 			return {"featureLayer": result.layer}
		});

	var settings = {
		templatePicker: templatePicker,
		map: map,
		layerInfos: layers
	};

	var params = {settings: settings};
	var myEditor = new esri.dijit.editing.Editor(params);
	myEditor.startup();
}

dojo.ready(init);
