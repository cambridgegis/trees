const [Map, FeatureLayer, Basemap, TileLayer, VectorTileLayer] = await $arcgis.import([
"@arcgis/core/Map.js",
"@arcgis/core/layers/FeatureLayer.js",
"@arcgis/core/Basemap.js",
"@arcgis/core/layers/TileLayer.js",
"@arcgis/core/layers/VectorTileLayer.js",
]);

const viewElement = document.querySelector("arcgis-map");
viewElement.center = [-71.0971,42.3711];
viewElement.zoom = 20;

// Set up the basemap
const vectorTileLayer = new VectorTileLayer({
portalItem: {
	id: "ff81a3dd9e2c402e88f4277ff3b278f3", // Cambridge GIS Vector Basemap
}
});
const basemap = new Basemap({ baseLayers: [vectorTileLayer] });

// Set up the tree layer
const labelClass = {
symbol: {
	type: "text", // autocasts as new TextSymbol()
	color: [38,38,38,255],
	font: {
	family: "Roboto", // autocasts as new Font()
	size: 9.75,
	style: "italic",
	},
	haloColor: [247,247,247,255],
	haloSize: 1.5
},
labelExpressionInfo: {
	expression: "$feature.CommonName",
},
};
const trees = new FeatureLayer({
url: "https://services1.arcgis.com/WnzC35krSYGuYov4/ArcGIS/rest/services/Trees/FeatureServer/0",
labelingInfo: labelClass
});

// Create the map object and add the layers
viewElement.map = new Map({
basemap: basemap,
layers: [trees]
});