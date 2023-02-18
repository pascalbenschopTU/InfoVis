// set the dimensions and margins of the graph
const pcpMargin = { top: 30, right: 50, bottom: 10, left: 50 },
  pcpWidth = 900 - pcpMargin.left - pcpMargin.right,
  pcpHeight = 900 - pcpMargin.top - pcpMargin.bottom;

// Parse the Data
d3.csv("data/pcpDataSet.csv").then(function (data) {

  // set up the dimensions
  dimensions = ["Year", "AvgRain", "AvgTemp", "avgCO2World", "seaLevel"];

  var y = {};
  y["Year"] = d3.scaleLinear().domain([1990, 2014]).range([pcpHeight, 0]);
  y["AvgTemp"] = d3.scaleLinear().domain([0, 15]).range([pcpHeight, 0]);
  y["AvgRain"] = d3.scaleLinear().domain([400, 1500]).range([pcpHeight, 0]);
  y["avgCO2World"] = d3.scaleLinear().domain([-3, 50]).range([pcpHeight, 0]);
  y["seaLevel"] = d3.scaleLinear().domain([180, 250]).range([pcpHeight, 0]);

  x = d3.scalePoint()
    .range([0, pcpWidth])
    .domain(dimensions);

  // draw the graph
  draw_graph();


  // method to draw the line
  function path(d) {
    return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
  }

  // highlight
  var highlight = function (d) {
    document.getElementById("#pcp-data-text").innerHTML = "In the year <strong>" + d.Year + "</strong> on average <strong>" + d.AvgRain + " mm</strong> of rain fell, the average temprature was <strong>" + d.AvgTemp + " °C</strong> the average co2 in the world was <strong>" + Math.round(d.avgCO2World * 100) / 100 + "% increased from 1990</strong> and the sealevel rose <strong>" +  Math.round(d.seaLevel) + " mm</strong> compared to 1883";

    year = d.Year;

    d3.selectAll(".line")
      .transition().duration(200)
      .style("stroke", "#FFFFFF")
      .style("opacity", "0.5");
    
      d3.selectAll("#id-" + year)
      .transition().duration(200)
      .style("stroke", "#000B76")
      .style("opacity", "1");
  }

  // Unhighlight
  var doNotHighlight = function (d) {
    d3.selectAll(".line")
      .transition().duration(200).delay(1000)
      .style("stroke", "#FFFFFF")
      .style("opacity", "1");
  }

  function update_axis(d) {
    d3.selectAll("#pcp-plot>svg").remove();
    draw_graph();
  }

  function invert_axis(d) {
    range = y[d].range();

    y[d].range([range[1], range[0]]);
  }

  // get the new dimension order
  function getNewDimensionOrder(i, d) {
    temp_array = Array(dimensions.length);
    counter = 0;
    while (dimensions.length > 0) {
      if (counter == i) {
        temp_array[counter] = d;
        counter += 1;
      }

      element = dimensions.shift();

      if (element != d) {
        temp_array[counter] = element;
        counter += 1;
      }
    }

    if (!temp_array[temp_array.length - 1]) {
      temp_array[counter] = d;
    }

    return temp_array;
  }

  // method to draw the graph
  function draw_graph() {
    x = d3.scalePoint()
      .range([0, pcpWidth])
      .domain(dimensions);

    // make the plot 
    var svg = d3.select("#pcp-plot")
      .append("svg")
      .attr("width", pcpWidth + pcpMargin.left + pcpMargin.right)
      .attr("height", pcpHeight + pcpMargin.top + pcpMargin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + pcpMargin.left + "," + pcpMargin.top + ")");

    // make the lines
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
      .on("mouseover", function(event, d) {
        highlight(d);
      })
      .on("mouseleave", function(event, d){
        doNotHighlight();
      });
      
    // make the axis
    svg.selectAll("myAxis")
      .data(dimensions).enter().append("g")
      .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
      .attr("class", "axis")
      .each(function (d) { d3.select(this).call(d3.axisLeft().ticks(5).tickFormat(d3.format("d")).scale(y[d])); })
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
            newPos = dimensions.indexOf(d) + Math.round(event.x / (pcpWidth / (dimensions.length - 1)))
            newPos = Math.max(0, newPos)
            newPos = Math.min(dimensions.length - 1, newPos)
            dimensions = getNewDimensionOrder(newPos, d)
          }

          update_axis(d);
          delete this.__dragged__;
        }));
  }
})

