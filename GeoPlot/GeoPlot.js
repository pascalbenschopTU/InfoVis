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

d3.queue()
    .defer(d3.json, "data/nlgemeenten2009.json")
    .defer(d3.csv, "data/waterlevel20221124_041.csv")
    .await(ready);

function ready(error, nlgemeenten2009, waterlevel2022) {
    if (error) 
        return console.log(error);

    console.log(nlgemeenten2009);
    console.log(waterlevel2022);
    
    var gemeenten = topojson.feature(nlgemeenten2009, nlgemeenten2009.objects.gemeenten);

    svg.append("g")
        .attr("class", "land")
        .selectAll("path")
        .data(gemeenten.features)
        .enter().append("path")
        .attr("d", path)
        .attr("title", function(d) { return d.properties.gemeente; })

        // These functions define whether the map is interactible, turned off for now

        // .on("mouseover", function(d) {
        //     var xPosition = d3.mouse(this)[0];
        //     var yPosition = d3.mouse(this)[1] - 30;
        //     svg.append("text")
        //         .attr("class", "info")
        //         .attr("id", "tooltip")
        //         .attr("x", xPosition)
        //         .attr("y", yPosition)
        //         .text(d.properties.gemeente + " (" + thsd(d.properties.inwoners) + " inwoners)");
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

    // Add water level points
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
            var xPosition = d3.mouse(this)[0];
            var yPosition = d3.mouse(this)[1] - 30;
            svg.append("text")
                .attr("class", "info")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .text("Water level above NAP: " + d.NUMERIEKEWAARDE)
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

  
  