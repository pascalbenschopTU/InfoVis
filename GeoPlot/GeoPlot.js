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

var color = d3.scaleSequential(d3.interpolateBlues);

var width = 1100,
    height = 900;

var projection = d3.geoMercator()
    .scale(10700) // 10700
    .translate([width / 2, height / 2])
    .center([5.4, 52.2]);

var projection2 = d3.geoMercator()
    .scale(12000) // 10700
    .translate([width / 2, height / 2])
    .center([52.15517440, 5.38720621]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.queue()
    .defer(d3.json, "data/nlgemeenten2009.json")
    .defer(d3.csv, "data/nappeilmerken.csv")
    .await(ready);

function ready(error, nlgemeenten2009, nappeilmerken) {
    if (error) 
        return console.log(error);

    console.log(nlgemeenten2009);
    console.log(nappeilmerken);
    
    var gemeenten = topojson.feature(nlgemeenten2009, nlgemeenten2009.objects.gemeenten);



    svg.append("g")
        .attr("class", "land")
        .selectAll("path")
        .data(gemeenten.features)
        .enter().append("path")
        .attr("d", path)
        .attr("title", function(d) { return d.properties.gemeente; })
        .on("mouseover", function(d) {
            var xPosition = d3.mouse(this)[0];
            var yPosition = d3.mouse(this)[1] - 30;
            svg.append("text")
                .attr("class", "info")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .text(d.properties.gemeente + " (" + thsd(d.properties.inwoners) + " inwoners)");
            d3.select(this)
                .attr("class", "selected");
        })
        .on("mouseout", function(d) {
            d3.select("#tooltip").remove();
            d3.select(this)
            .transition()
            .attr("class", "land")
            .duration(250)
        });

    svg.selectAll("circle")
        .data(nappeilmerken).enter()
        .append("circle")
        .attr("cx", function(d) {
            var c = rijksdriehoekToGeo(d.x_rd, d.y_rd)
            p = projection2(c);
            return p[0];
        })
        .attr("cy", function(d) {
            var c = rijksdriehoekToGeo(d.x_rd, d.y_rd)
            p = projection2(c);
            return p[1]
        })
        .attr("r", "3px")
        .style("fill", d => color(d.nap_hoogte))
}

d3.select(self.frameElement).style("height", height + "px");


  
//   d3.json("data/nlgemeenten2009.json", function(error, nlgemeenten2009) {
//       if (error) return console.error(error);
//       // console.log(nlgemeenten2009);
//       var gemeenten = topojson.feature(nlgemeenten2009, nlgemeenten2009.objects.gemeenten);
  
//       console.log(gemeenten.features)
  
//       svg.append("g")
//           .attr("class", "land")
//           .selectAll("path")
//           .data(gemeenten.features)
//           .enter().append("path")
//           .attr("d", path)
//           .attr("title", function(d) { return d.properties.gemeente; })
//           .on("mouseover", function(d) {
//               var xPosition = d3.mouse(this)[0];
//               var yPosition = d3.mouse(this)[1] - 30;
//               svg.append("text")
//                   .attr("class", "info")
//                   .attr("id", "tooltip")
//                   .attr("x", xPosition)
//                   .attr("y", yPosition)
//                   .text(d.properties.gemeente + " (" + thsd(d.properties.inwoners) + " inwoners)");
//               d3.select(this)
//                   .attr("class", "selected");
//           })
//           .on("mouseout", function(d) {
//               d3.select("#tooltip").remove();
//               d3.select(this)
//               .transition()
//               .attr("class", "land")
//               .duration(250)
//           });
//   });
  
  