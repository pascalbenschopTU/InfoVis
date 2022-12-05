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

var thsd = d3.format("d"); 

// Scaling is from -40cm NAP to 200cm NAP
var color = d3.scaleLinear().domain([-40,200]).range(["white", "blue"])

var width = 1100,
    height = 900;

var projection = d3.geoMercator()
    .scale(10700)
    .translate([width / 2, height / 2])
    .center([5.4, 52.2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// Get the topojson from cartomap.github.io for the map of the Netherlands
d3.json('https://cartomap.github.io/nl/wgs84/gemeente_2022.topojson').then(function(nlgemeenten2009) {
    var gemeenten = topojson.feature(nlgemeenten2009, nlgemeenten2009.objects.gemeente_2022);

    svg.append("g")
        .attr("class", "land")
        .selectAll("path")
        .data(gemeenten.features)
        .enter().append("path")
        .attr("d", path)
});

d3.csv('data/waterlevel2022.csv').then(function(waterlevel2022) {
    svg.selectAll("circle")
        .data(waterlevel2022).enter()
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
        .style("fill", d => color(d.NUMERIEKEWAARDE))
        // Show the water level when hovering over a point
        .on("mouseover", function(d) {
            
            var xPosition = d.x - 200;
            var yPosition = d.y > 250 ? d.y - 200 : d.y - 100;
            svg.append("text")
                .attr("class", "info")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .text("Water level above NAP: " + d.target.__data__.NUMERIEKEWAARDE)
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
});

// Get data from slider
const getData = value => d3.csv(`data/waterlevel${value}.csv`)
const slider = document.getElementById('selectYear')

slider.addEventListener('input', event => getData(event.target.value).then(
	data => {
        // Add new data to current water level points
        svg.selectAll("circle")
            .data(data).enter()
        // Transform water level points
        svg.selectAll("circle").transition()
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
                return color(data.NUMERIEKEWAARDE)
            })
        

        const display = document.getElementById('display')
        display.innerText = event.target.value;
  }
))


  
  