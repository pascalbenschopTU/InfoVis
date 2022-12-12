// set the dimensions and margins of the graph
const margin = { top: 30, right: 50, bottom: 10, left: 50 },
  width = 660 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#pcp-plot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")")
   
// Parse the Data
d3.csv("testDataSet.csv").then(function (data) {

  dimensions = ["AvgRain", "AvgTemp", "avgCO2World", "seaLevel"]

  var y = {}
  y["AvgTemp"] = d3.scaleLinear().domain([0, 15]).range([height, 0])
  y["AvgRain"] = d3.scaleLinear().domain([400, 1500]).range([height, 0])
  y["avgCO2World"] = d3.scaleLinear().domain([-3, 50]).range([height, 0])
  y["seaLevel"] = d3.scaleLinear().domain([180, 250]).range([height, 0])
  
  x = d3.scalePoint()
    .range([0, width])
    .domain(dimensions);

  draw_graph();

  function path(d) {
    return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
  }

  // Highlight the specie that is hovered
  var highlight = function (d) {
    console.log()
    year = d.path[0].__data__.Year;

    // first every group turns grey
    d3.selectAll(".line")
      .transition().duration(200)
      .style("stroke", "#FFFFFF")
      .style("opacity", "0.5")
    // Second the hovered specie takes its color
    d3.selectAll("#id-" + year)
      .transition().duration(200)
      .style("stroke", "#000B76")
      .style("opacity", "1")
  }

  // Unhighlight
  var doNotHighlight = function (d) {
    d3.selectAll(".line")
      .transition().duration(200).delay(1000)
      .style("stroke", "#FFFFFF")
      .style("opacity", "1")
  }

  function update_axis(d) {
    d3.selectAll("svg").remove();
    update_graph();
}

  function invert_axis(d) {
    range = y[d].range();

    y[d].range([range[1], range[0]]);
    // update_axis(d);
  }

  function getNewDimensionOrder(i, d) {
    temp_array = Array(dimensions.length);
    counter = 0
    while(dimensions.length > 0) {
        if(counter == i) {
          temp_array[counter] = d
          counter += 1
        }
        element = dimensions.shift()
        if(element != d) {
          temp_array[counter] = element
          counter += 1
        } 
    }

    if(!temp_array[temp_array.length-1]) {
      temp_array[counter] = d
    }

    return temp_array
  }
  function update_graph() {
    x = d3.scalePoint()
    .range([0, width])
    .domain(dimensions);

    var svg = d3.select("#pcp-plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


    svg
      .selectAll("myPath")
      .data(data)
      .join("path")
      .attr("class", function (d) { return "line" })
      .attr("id", function (d) { return "id-" + d.Year })
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", "#FFFFFF")
      .style("opacity", 1)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight)

    svg.selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions).enter().append("g")
      // I translate this element to its right position on the x axis
      .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
      .attr("class", "axis")
      // And I build the axis with the call function
      .each(function (d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
      // Add axis title
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function (d) { return d; })
      .style("fill", "black")
      .call(d3.drag()
        .on("start", function (d) {
          this.__dragged__ = false;

        })
        .on("drag", function (event, d) {
          this.__dragged__ = true;

        })
        .on("end", function (event, d) {
          if (Math.abs(event.x) < 20) {
            // no movement, invert axis
            var extent = invert_axis(d);
          } else {
            newPos = dimensions.indexOf(d) + Math.round(event.x / (width/(dimensions.length - 1)))
            newPos = Math.max(0, newPos)
            newPos = Math.min(dimensions.length-1, newPos)
            dimensions = getNewDimensionOrder(newPos, d)  
          }

          update_axis(d);         
          delete this.__dragged__;
        }))

  }

  function draw_graph() {
    // Draw the lines
    svg
      .selectAll("myPath")
      .data(data)
      .join("path")
      .attr("class", function (d) { return "line" })
      .attr("id", function (d) { return "id-" + d.Year })
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", "#FFFFFF")
      .style("opacity", 1)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight)

    // // Draw the axis:
    svg.selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions).enter().append("g")
      // I translate this element to its right position on the x axis
      .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
      .attr("class", "axis")
      // And I build the axis with the call function
      .each(function (d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
      // Add axis title
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function (d) { return d; })
      .style("fill", "black")
      .call(d3.drag()
        .on("start", function (d) {
          this.__dragged__ = false;

        })
        .on("drag", function (event, d) {
          this.__dragged__ = true;
        })
        .on("end", function (event, d) {
          if (Math.abs(event.x) < 20) {
            // no movement, invert axis
            var extent = invert_axis(d);
          } else {
            newPos = dimensions.indexOf(d) + Math.round(event.x / (width/(dimensions.length - 1)))
            newPos = Math.max(0, newPos)
            newPos = Math.min(dimensions.length-1, newPos)
            dimensions = getNewDimensionOrder(newPos, d)  
          }

          update_axis(d);         
          delete this.__dragged__;
        }))
  }
})

