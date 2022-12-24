const dataChronologicalSlider = document.getElementById('selectYear');
const densityButton = document.getElementById('toggleDensity');
const dataSelectionSelectors = document.getElementsByClassName("selectDataSelection");
const dataSelectionValue = document.querySelector("input[name='selectDataSelection']:checked").value;
const scenarioSelectionSlider = document.getElementById('selectScenario');
let focussedX = null;

const dataSelection = {
	waterlevel: 0,
	landheight: 1,
	difference: 2,
}

const scenarioSelection = {
    0: "Low",
    1: "IntermediateLow",
    2: "Normal",
    3: "IntermediateHigh",
    4: "High"
}

const scenarioSelectionText = {
    0: "Low",
    1: "Intermediate Low",
    2: "Normal",
    3: "Intermediate High",
    4: "High"
}

// Mode for showing which data is displayed
var mode = dataSelection.difference;

// Scenario for predictions
var scenario = scenarioSelection[2];

// Save the average water heights over time here
var avgWaterHeights = [];

// Scaling is from -40cm NAP to 200cm NAP
var dataColor = d3.scaleLinear().domain([-200 ,0, 50]).range(["white", "yellow", "red"]);

var densityColor = d3.scaleLinear().domain([50, 500, 2000]).range(["lightblue", "blue", "red"]);

// Width and Height of the map
var width = 900,
    height = 900;

// Projection focused on Netherlands
var projection = d3.geoMercator()
    .scale(10700)
    .translate([width / 2, height / 2])
    .center([5.4, 52.2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#geo-plot").append("svg")
    .attr("width", width)
    .attr("height", height);

var focusScatterPlot = null;

// Load all data for the map
Promise.all([
    d3.json("https://cartomap.github.io/nl/wgs84/provincie_2022.geojson"),
    d3.json("data/population_density.json"),
    d3.csv('data/waterlevels.csv'),
    d3.csv('data/scenarios.csv')
]).then(function(data) {
    avgWaterHeights = getAvgWaterHeights(data[2]);

    showNetherlands(data[0]);
    initializePredictedYears(data[2], data[3]);
    insertDataPoints(data[2]);
    changeDataPoints();
    defineListeners(data[1], data[2], data[3]);
})

// Display a map of the netherlands
function showNetherlands(geojson) {
    svg.append("g")
        .attr("class", "land")
        .selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "#85BB65")
        .style("stroke", "#9B65BA");
}

// Initialize the predicted years from 2023 until 2119
function initializePredictedYears(waterlevels, scenarios) {
    for (var i = 0; i < waterlevels.length; i++) {
        var accumulated_value = 0;
        for (var j = 2023; j <= 2119; j += 1) {
            accumulated_value += parseFloat(scenarios[j-2023][scenario]);
            waterlevels[i][j] =  (parseFloat(avgWaterHeights[i]) + accumulated_value).toString();
        }
    }
}

// Define whether to show water level, land height or the difference
function getWaterHeight(data, indexYear) {
    // default scaling for mode 1 and 2
    dataColor = d3.scaleLinear().domain([-50 ,0, 200, 4000]).range(["blue", "green", "yellow", "orange"]);

    if (mode == dataSelection.waterlevel) {
        createLegend("Water height above NAP");
        return data[indexYear];
    }
    if (mode == dataSelection.landheight) {
        createLegend("Land height around water height measuring points");
        return data['land_height'];
    }
    if (mode == dataSelection.difference) {
        dataColor = d3.scaleLinear().domain([-200 ,0, 50]).range(["white", "yellow", "red"]);
        createLegend("Difference between land height and water height");
        return data[indexYear] - data['land_height'];
    }
}

// Insert the waterlevel data into circles and plot them
function insertDataPoints(waterlevels) {
    svg.selectAll("circle")
        .data(waterlevels).enter()
        .append("circle")
        .attr("cx", function(d) {
            var c = Utm2Wgs(d.X, d.Y, 31)
            var p = projection(c)
            return p[0]
        })
        .attr("cy", function(d) {
            var c = Utm2Wgs(d.X, d.Y, 31)
            var p = projection(c)
            return p[1]
        })
        // Define width of each point
        .attr("r", "10px")
        .attr("class", "waterlevel")
        .style("stroke", "black")
        .style("position", "absolute")
        .on("click", e => focusOnDataPoint(e, waterlevels));    
}

// Change the data points when data has changed
function changeDataPoints() {
    svg.selectAll(".waterlevel")
        // Define color based on water level -> NUMERIEKEWAARDE
        .style("fill", function(data) {
            return dataColor(getWaterHeight(data, dataChronologicalSlider.value))
        })
        // Show the water level when hovering over a point
        .on("mouseover", function(d) {
            var xPosition = d.x - 200;
            var yPosition = d.y - 250;
            svg.append("text")
                .attr("class", "info")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .text("Water level above NAP: " + Math.round(d.target.__data__[dataChronologicalSlider.value] * 100) / 10 + " mm")
                .style("fill", "white")
                .style("text-shadow", "0.07em 0 black, 0 0.07em black, -0.07em 0 black, 0 -0.07em black")
            d3.select(this)
                .attr("class", "selected");
        })
        .on("mouseout", function(d) {
            d3.select("#tooltip").remove();
            d3.select(this)
            .transition()
            .attr("class", "waterlevel")
            .duration(250)
        });
}

// Define listeners for the sliders and buttons
function defineListeners(densityGeoJSON, waterlevels, scenarios) {
    dataChronologicalSlider.addEventListener('input', event => {
        // Transform water level points
        svg.selectAll(".waterlevel").transition()
            .duration(250)
            .style("fill", function(data) {
                return dataColor(getWaterHeight(data, event.target.value));
            })
            .style("display", function(data) {
                if (data[event.target.value] == "") {
                    return "None";
                }
                return "Block";
            })
                

        const display = document.getElementById('display');
        display.innerText = event.target.value;
    })


    for(var i = 0; i < dataSelectionSelectors.length; i++) {
        dataSelectionSelectors[i].addEventListener('input', event => {
            mode = parseInt(event.target.value);
            svg.selectAll(".waterlevel").transition()
                .duration(750)
                .style("fill", function(data) {
                    return dataColor(getWaterHeight(data, dataChronologicalSlider.value))
                });      
        })
    }
    

    scenarioSelectionSlider.addEventListener('input', event => {
        scenario = scenarioSelection[event.target.value];
        for (var i = 0; i < waterlevels.length; i++) {
            var accumulated_value = 0;
            for (var j = 2023; j <= 2119; j += 1) {
                accumulated_value += parseFloat(scenarios[j-2023][scenario]);
                waterlevels[i][j] =  (parseFloat(avgWaterHeights[i]) + accumulated_value).toString();
            }
        }
        
        if(focusScatterPlot != null) {
            plotWaterLevelGraph(focussedX, waterlevels);
        }

        document.getElementById('selectScenarionTypeLabel').innerHTML = scenarioSelectionText[event.target.value];
        changeDataPoints();
    })

    densityButton.addEventListener("click", _ => {
        if (densityButton.value=="on") {
            densityButton.value="off";
            document.getElementById("density").remove();
            
        }
        else if (densityButton.value=="off") {
            densityButton.value="on";
            svg.selectAll("circle").remove();
            showPopulationDensity(densityGeoJSON);

            // make sure data points are still shown on top
            insertDataPoints(waterlevels);
            changeDataPoints();
        }
    })
}

// When clicked on a data point highlight it and plot data over the years
function focusOnDataPoint(event, waterlevels) {
    var X = event.target.__data__.X;
    var Y = event.target.__data__.Y;

    svg.selectAll(".highlighted").remove();

    svg.append("circle")
        .attr("class", "highlighted")
        .attr("cx", function() {
            var c = Utm2Wgs(X, Y, 31)
            var p = projection(c)
            return p[0]
        })
        .attr("cy", function() {
            var c = Utm2Wgs(X, Y, 31)
            var p = projection(c)
            return p[1]
        })
        .attr("r", "14px")
        .attr("fill", "none")
        .attr("stroke", "purple")
        .attr("stroke-width", "5px");

    plotWaterLevelGraph(X, waterlevels);
}

// Plot the data over the years
function plotWaterLevelGraph(X, waterlevels) {
    var waterlevelsX = waterlevels.find(item => item.X == X);
    var waterlevel_data = [];
    for (var i = 2010; i <= 2119; i++) {
        if (waterlevelsX[i] != "") {
            waterlevel_data.push([i, parseFloat(waterlevelsX[i]) * 10]);
        }
    }

    height = parseFloat(waterlevelsX['land_height']) * 10;
    d3.select(".focusscatterplot>svg").remove();
    focusScatterPlot = showSeaLevelData(waterlevel_data, height, svgName=".focusscatterplot", parse=false, keep_ref=false);
    focussedX = X;
}

// Plot the population density
function showPopulationDensity(densityGeoJSON) {
    var density = topojson.feature(densityGeoJSON, densityGeoJSON.objects.population_density);

    svg.append("g")
            .attr("class", "density")
            .attr("id", "density")
            .selectAll("path")
            .data(density.features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(data) {
                return densityColor(data.properties.aantal_inwoners);
            })
}

// Get the water height avg over the years in the data from waterlevels.csv
function getAvgWaterHeights(waterlevels) {
    var avgWaterHeights = [];
    // Columns 2010 until 2022 of the dataset
    selectedColumns = waterlevels.columns.slice(5, 18);

    for (var i = 0; i < waterlevels.length; i++) {
        var avg = 0;
        var datapoints = 0;
        for (var j = 0; j < selectedColumns.length; j++) {
            idx = selectedColumns[j];

            // if value is NaN dont use it
            if (waterlevels[i][idx] == "") {continue;}

            datapoints += 1;
            avg += parseFloat(waterlevels[i][idx]);
        }
        avgWaterHeights.push(avg / datapoints);
    }

    return avgWaterHeights;
}


// Create legend
// Source: https://d3-graph-gallery.com/graph/custom_legend.html 
function createLegend(text) {
    // remove old legend
    svg.selectAll(".legend").remove();

    // create a list of keys
    var keys = dataColor.domain();
    svg.append("text")
        .attr("x", 15)
        .attr("y", 60)
        .attr("width", "100px")
        .attr("class", "legend")
        .text(text);

    // Add one dot in the legend for each name.
    var size = 20;
    svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("rect")
        .attr("class", "legend")
        .attr("x", 15)
        .attr("y", function(d,i){ return 80 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return dataColor(d)});

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("class", "legend")
        .attr("x", 15 + size*1.2)
        .attr("y", function(d,i){ return 80 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function(d){ return d + " cm"})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
}

createLegend("Land height around water height measuring points");