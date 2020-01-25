let earthquakelink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";
renderMap(earthquakelink);

function renderMap(earthquakelink) {

    // Performs GET request for the earthquake URL
    d3.json(earthquakelink, function(data) {
      console.log(earthquakelink)
      // Stores response into earthquakeData
      let earthquakeData = data;
  
        // Passes data into createFeatures function
        createFeatures(earthquakeData);
      });
    };
  
    // Function to create features
    function createFeatures(earthquakeData) {
  
      // Defines two functions that are run once for each feature in earthquakeData
      // Creates markers for each earthquake and adds a popup describing the place, time, and magnitude of each
      function onEachQuakeLayer(feature, layer) {
        return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
          fillOpacity: 1,
          color: chooseColor(feature.properties.mag),
          fillColor: chooseColor(feature.properties.mag),
          radius:  markerSize(feature.properties.mag)
        });
      }
      function onEachEarthquake(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
      }
  
    
  
      // Creates a GeoJSON layer containing the features array of the earthquakeData object
      // Run the onEachEarthquake & onEachQuakeLayer functions once for each element in the array
      let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachEarthquake,
        pointToLayer: onEachQuakeLayer
      });
  


      createMap(earthquakes);
    }
  
    // Function to create map
    function createMap(earthquakes) {
      // Define outdoors, satellite, and darkmap layers
      // Outdoors layer
      let outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
          "access_token=pk.eyJ1IjoianNraWNrIiwiYSI6ImNrM3J5Y2Q1MzAxOGIzY3FtYzB2NjhtNDAifQ.3uJhhfMbnPNdND8nUsGIZQ");
        // Satellite layer
      let satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
          "access_token=pk.eyJ1IjoianNraWNrIiwiYSI6ImNrM3J5Y2Q1MzAxOGIzY3FtYzB2NjhtNDAifQ.3uJhhfMbnPNdND8nUsGIZQ");
        // Darkmap layer
      let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
          "access_token=pk.eyJ1IjoianNraWNrIiwiYSI6ImNrM3J5Y2Q1MzAxOGIzY3FtYzB2NjhtNDAifQ.3uJhhfMbnPNdND8nUsGIZQ");
  
      // Define a baseMaps object to hold base layers
      let baseMaps = {
        "Outdoors": outdoors,
        "Satellite": satellite,
        "Dark Map": darkmap,
      };
  
      // Create overlay object to hold overlay layers
      let overlayMaps = {
        "Earthquakes": earthquakes,
      };
  
      // Create map, default settings: outdoors and faultLines layers display on load
      let map = L.map("map", {
        center: [39.8283, -98.5785],
        zoom: 3,
        layers: [outdoors],
        scrollWheelZoom: false
      });
  
      // Create a layer control
      // Pass in baseMaps and overlayMaps
      // Add the layer control to the map
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
      }).addTo(map);
  
      // Adds Legend
      let legend = L.control({position: 'bottomright'});
      legend.onAdd = function(map) {
        let div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
  
        for (let i = 0; i < grades.length; i++) {
          div.innerHTML += '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                  grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
  
        return div;
      };
      legend.addTo(map);
  
      // Adds timeline and timeline controls
      let timelineControl = L.timelineSliderControl({
        formatOutput: function(date) {
          return new Date(date).toString();
        }
      });
      timelineControl.addTo(map);
      timelineControl.addTimelines(timelineLayer);
      timelineLayer.addTo(map);
    }
    function chooseColor(magnitude) {
        return magnitude > 5 ? "red":
          magnitude > 4 ? "orange":
            magnitude > 3 ? "gold":
              magnitude > 2 ? "yellow":
                magnitude > 1 ? "yellowgreen":
                  "greenyellow"; // <= 1 default
    }
    function markerSize(magnitude) {
        return magnitude * 5;
      }
  