// set the dimensions and margins of the graph
const margin = {top: 30, right: 50, bottom: 10, left: 50},
  width = 660 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#pcp-plot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("testDataSet.csv").then(function(data) {
 
    dimensions = [ "AvgRain", "AvgTemp", "avgCO2World"]

    var y = {}
    y["AvgTemp"] = d3.scaleLinear().domain( [0,40] ).range([height, 0])
    y["AvgRain"] = d3.scaleLinear().domain([0, 1300]).range([height, 0])
    y["avgCO2World"] = d3.scaleLinear().domain([-3, 50]).range([height,0])
  
    x = d3.scalePoint()
    .range([0, width])
    .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(function(p) {return [x(p), y[p](d[p])]; }));
    }

      // Highlight the specie that is hovered
  var highlight = function(d){
    year = d.path[0].__data__.Year;

    // first every group turns grey
    d3.selectAll(".line")
      .transition().duration(200)
      .style("stroke", "#FFFFFF")
      .style("opacity", "0.5")
    // Second the hovered specie takes its color
    d3.selectAll("#id-"+year)
      .transition().duration(200)
      .style("stroke", "#000B76")
      .style("opacity", "1")
  }

  // Unhighlight
  var doNotHighlight = function(d){
    d3.selectAll(".line")
      .transition().duration(200).delay(1000)
      .style("stroke", "#FFFFFF")
      .style("opacity", "1")
  }

    // Draw the lines
  svg
    .selectAll("myPath")
    .data(data)
    .join("path")
    .attr("class", function (d) { return "line"} )
    .attr("id", function(d) {return "id-"+ d.Year})
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", "#FFFFFF")
    .style("opacity", 1)
    .on("mouseover", highlight)
    .on("mouseleave", doNotHighlight )
   
// // Draw the axis:
svg.selectAll("myAxis")
  // For each dimension of the dataset I add a 'g' element:
  .data(dimensions).enter()
  .append("g")
  // I translate this element to its right position on the x axis
  .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
  // And I build the axis with the call function
  .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
  // Add axis title
  .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) { return d; })
    .style("fill", "black")
})  

