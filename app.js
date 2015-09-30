var map = L.map('map', {
    attributionControl: false
})
    .setView([38.046408, -84.497083], 11);

L.control.attribution().addAttribution("<a href='http://www.census.gov/' target='_blank'>United States Census Bureau</a>").addTo(map);

var base = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

var grapi;
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = (props ?
        '<h3>Tract ' + props.TRACTCE + ', Blockgroup ' + props.BLKGRPCE + '</h3><hr /><b>' 
        + props.PrcntAbv30 + '%</b> of households (<b>' + props.TtlAbv30 + '</b> of <b>' + props.TtlHouses + '</b> total) have a gross rent as percent of income greater than 30%.'
        : 'Hover over a block group');
};

info.addTo(map)

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 1.5,
        color: '#FFFF33',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
	grapi.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function getColor(d) {
	return d > 60 ? "#d7191c":
		d > 45 ? "#fdae61":
		d > 30 ? "#ffffbf":
		d > 15 ? "#abd9e9":
		d >= 0 ? "#2c7bb6":
			"#fff";
}

function style(feature) {
	return {
		fillColor:getColor(feature.properties.PrcntAbv30),
		weight: 1,
		opacity: 1,
		color: "white",
		fillOpacity: 0.6
	}
}

grapi = new L.GeoJSON.AJAX("grapi-filter.geojson", {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend'),
	grades = [0, 15, 30, 45, 60],
	labels = [];
	div.innerHTML = '<h4>% of households where GRAPI > 30% (2013)</h4>'
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML += '<i style="background:' + getColor(grades[i]+1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i+1] + '<br>' : '+');
	}

	return div;
};
legend.addTo(map);