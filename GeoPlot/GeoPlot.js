var nl_NL = {
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["€", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%-d-%-m-%Y",
    "time": "%-H:%M:%S",
    "periods": ["vm", "nm"],
    "days": ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
    "shortDays": ["zo", "ma", "di", "wo", "do", "vr", "za"],
    "months": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
    "shortMonths": ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]
};

var NL = d3.timeFormatDefaultLocale(nl_NL);

const slider = document.getElementById('selectYear')
const button = document.getElementById('toggleDensity')


var thsd = d3.format("d"); 

// Scaling is from -40cm NAP to 200cm NAP
var waterColor = d3.scaleLinear().domain([-50 ,0, 200, 4000]).range(["blue", "green", "yellow", "orange"])
// var waterColor = d3.scaleLinear().domain([-50 ,0, 50, 200, 4000]).range(["#00008B", "blue", "lightblue", "green", "yellow"])
var densityColor = d3.scaleLinear().domain([50, 100, 500]).range(["lightblue", "green", "brown"])

var width = 900,
    height = 900;

var projection = d3.geoMercator()
    .scale(10700)
    .translate([width / 2, height / 2])
    .center([5.4, 52.2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select(".holder").append("svg")
    .attr("width", width)
    .attr("height", height)

Promise.all([
    d3.json("https://cartomap.github.io/nl/wgs84/gemeente_2022.topojson"),
    d3.json("data/population_density.json"),
    d3.csv('data/waterlevels.csv')
]).then(function(data) {
    
    function showNetherlands(data) {
        // For 2009 version use:
        // var gemeenten = topojson.feature(nlgemeenten2009, nlgemeenten2009.objects.gemeenten);
        var gemeenten = topojson.feature(data[0], data[0].objects.gemeente_2022);
    
        svg.append("g")
            .attr("class", "land")
            .selectAll("path")
            .data(gemeenten.features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", "#85BB65")
            .style("stroke", "#9B65BA")
    }
    
    function showDensity(data) {
        var density = topojson.feature(data[1], data[1].objects.population_density);

        svg.append("g")
                .attr("class", "density")
                .attr("id", "density")
                .selectAll("path")
                .data(density.features)
                .enter().append("path")
                .attr("d", path)
                .style("fill", function(data) {
                    return densityColor(data.properties.aantal_inwoners)
                })
    }

    function showWaterLevels(data) {
        svg.selectAll("circle")
            .data(data[2]).enter()
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
            // Define color based on water level -> NUMERIEKEWAARDE
            .style("fill", d => waterColor(d['2015']))
            .style("stroke", "black")
            .style("position", "absolute")
            // Show the water level when hovering over a point
            .on("mouseover", function(d) {
                var xPosition = d.x - 300;
                var yPosition = d.y > 250 ? d.y - 200 : d.y - 100;
                svg.append("text")
                    .attr("class", "info")
                    .attr("id", "tooltip")
                    .attr("x", xPosition)
                    .attr("y", yPosition)
                    .text("Water level above NAP: " + d.target.__data__['2015'])
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

        slider.addEventListener('input', event => {
            // Transform water level points
            svg.selectAll(".waterlevel")
                .on("mouseover", function(d) {
                
                    var xPosition = d.x - 300;
                    var yPosition = d.y > 250 ? d.y - 200 : d.y - 100;
                    svg.append("text")
                        .attr("class", "info")
                        .attr("id", "tooltip")
                        .attr("x", xPosition)
                        .attr("y", yPosition)
                        .text("Water level above NAP: " + d.target.__data__[event.target.value])
                        .style("fill", "white")
                        .style("text-shadow", "0.07em 0 black, 0 0.07em black, -0.07em 0 black, 0 -0.07em black")
                    d3.select(this)
                        .attr("class", "selected");
                })
            svg.selectAll(".waterlevel").transition()
                .duration(750)
                
                .attr("cx", function(data) {
                    var c = Utm2Wgs(data.X, data.Y, 31)
                    var p = projection(c)
                    return p[0]
                })
                .attr("cy", function(data) {
                    var c = Utm2Wgs(data.X, data.Y, 31)
                    var p = projection(c)
                    return p[1]
                })
                .style("fill", function(data) {
                    return waterColor(data[event.target.value])
                })
                .style("display", function(data) {
                    if (data[event.target.value] == "") {
                        return "None";
                    }
                    return "Block";
                })
                    

            const display = document.getElementById('display')
            display.innerText = event.target.value;
        })
    }
    
    button.addEventListener("click", _ => {
        if (button.value=="on") {
            button.value="off";
            document.getElementById("density").remove();
            
        }
        else if (button.value=="off") {
            button.value="on";
            svg.selectAll("circle").remove()
            showDensity(data)
            showWaterLevels(data)
        }
    })

    showNetherlands(data)
    showWaterLevels(data)

    svg.selectAll(".waterlevel")
        .on("click", e => focusOnDataPoint(e))

    function focusOnDataPoint(event) {
        var X = event.target.__data__.X
        var Y = event.target.__data__.Y

        svg.selectAll(".highlighted").remove()

        svg.append("circle")
            .attr("class", "highlighted")
            .attr("cx", function() {
                var c = Utm2Wgs(X, Y, 31)
                var p = projection(c)
                return p[0]
            })
            .attr("cy", function(data) {
                var c = Utm2Wgs(X, Y, 31)
                var p = projection(c)
                return p[1]
            })
            .attr("r", "14px")
            .attr("fill", "none")
            .attr("stroke", "purple")
            .attr("stroke-width", "5px")

        
        // focusHeightMap(X, Y)
        plotWaterLevelGraph(X)
    }

    function plotWaterLevelGraph(X) {
        var waterlevels = data[2].find(item => item.X == X)
        var waterlevel_data = []
        for (var i = 2010; i <= 2022; i++) {
            if (waterlevels[i] != "") {
                waterlevel_data.push([i, waterlevels[i]])
            }
        }

        var w = new WeatherGraph(waterlevel_data, "waterlevels", "blue", "red")
        
        w.plotDataGraph()
    }

    function focusHeightMap(X,Y) {
        var wgs = Utm2Wgs(X, Y, 31)
        var rd = rijksdriehoek(wgs[0], wgs[1])
        
        var src = "https://ahn.arcgisonline.nl/ahnviewer/?center=" + rd[0] + "%2C"+ rd[1] + "%2C28992&level=6&locale=en"
        iframe.src = src
    }
})

var svg_ = d3.select(".holder").append("svg")
    .attr("width", 100)
    .attr("height", 400)
    .attr("")

// create a list of keys
var keys = waterColor.domain()
svg.append("text")
    .attr("x", 100)
    .attr("y", 80)
    .text("Water height above NAP")

// Add one dot in the legend for each name.
var size = 20
svg.selectAll("mydots")
  .data(keys)
  .enter()
  .append("rect")
    .attr("x", 100)
    .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return waterColor(d)})

// Add one dot in the legend for each name.
svg.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
    .attr("x", 100 + size*1.2)
    .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    // .style("fill", function(d){ return waterColor(d)})
    .text(function(d){ return d + " cm"})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")