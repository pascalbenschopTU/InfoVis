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

var thsd = d3.format("d"); 

// Scaling is from -40cm NAP to 200cm NAP
var waterColor = d3.scaleLinear().domain([-50 ,0, 4000]).range(["red", "white", "blue"])
var densityColor = d3.scaleLinear().domain([50, 100, 500]).range(["yellow", "orange", "red"])

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
// 'https://cartomap.github.io/nl/wgs84/gemeente_2022.topojson'
d3.json("data/nlgemeenten2009.json").then(function(nlgemeenten2009) {
    // var gemeenten = topojson.feature(nlgemeenten2009, nlgemeenten2009.objects.gemeente_2022);
    var gemeenten = topojson.feature(nlgemeenten2009, nlgemeenten2009.objects.gemeenten);
    
    svg.append("g")
        .attr("class", "land")
        .selectAll("path")
        .data(gemeenten.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "#85BB65")
        .style("stroke", "#9B65BA")
        // .on("mouseover", function(d) {
        //     var xPosition = d.x - 200;
        //     var yPosition = d.y > 150 ? d.y - 100 : d.y;
        //     svg.append("text")
        //         .attr("class", "info")
        //         .attr("id", "tooltip")
        //         .attr("x", xPosition)
        //         .attr("y", yPosition)
        //         .text(d.target.__data__.properties.gemeente + " (" + thsd(d.target.__data__.properties.inwoners) + " inwoners)");
        //     d3.select(this)
        //         .attr("class", "selected");
        // })
        // .on("mouseout", function(d) {
        //     d3.select("#tooltip").remove();
        //     d3.select(this)
        //     .transition()
        //     .attr("class", "land")
        //     .duration(250)
        // });


    d3.json("data/population_density.json").then(function(population_density) {
        // var gemeenten = topojson.feature(nlgemeenten2009, nlgemeenten2009.objects.gemeente_2022);
        var gemeenten = topojson.feature(population_density, population_density.objects.population_density);
    
        svg.append("g")
            // .attr("class", "land")
            .selectAll("path")
            .data(gemeenten.features)
            .enter().append("path")
            .attr("d", path)
            // .style("opacity", 0.5)
            .style("fill", function(data) {
                return densityColor(data.properties.aantal_inwoners)
            })
    
    
        d3.csv('data/waterlevels.csv').then(function(waterlevels) {
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
                // Define color based on water level -> NUMERIEKEWAARDE
                .style("fill", d => waterColor(d['2022']))
                .style("stroke", "black")
                // Show the water level when hovering over a point
                .on("mouseover", function(d) {
                    var xPosition = d.x - 200;
                    var yPosition = d.y > 150 ? d.y - 100 : d.y;
                    svg.append("text")
                        .attr("class", "info")
                        .attr("id", "tooltip")
                        .attr("x", xPosition)
                        .attr("y", yPosition)
                        .text("Water level above NAP: " + d.target.__data__['2022'])
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
                svg.selectAll("circle")
                    .on("mouseover", function(d) {
                    
                        var xPosition = d.x - 200;
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
            
        });
    });
});






  
  