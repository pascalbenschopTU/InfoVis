// global variables
let predictionRange = 0.0;
let predictionType = 2;
let graphRain = null;
let graphTemp = null;
let graphSeaLevel = null;
let slopeValues = [-0.0075, -0.005, 0, 0.02, 0.05];

class GraphWrapper{
    constructor(data, color_points, color_trendline, thresholdHeight, svgName = ".scatterplot", measurement="mm") {
        this.data = data;
        this.color_points = color_points;
        this.color_trendline = color_trendline;
        this.svgName = svgName
        this.measurement = measurement;
        this.graph_name = svgName + "_graph";
        this.graph_name_xAxis = this.graph_name + "_x";
        this.graph_name_yAxis = this.graph_name + "_y";
        this.graph_name_predictionG = this.graph_name + "_predG";
        this.xScale = null;
        this.yScale = null;
        this.xAxis = null;
        this.yAxis = null;
        this.xOffset = 0;
        this.predictionType = 2;
        this.root_group = null;
        this.svg = d3.select(this.svgName).append("svg").attr("width", scatterWidth + scatterMargin.left + scatterMargin.right).attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom).attr("id", this.graph_name);
        this.thresholdHeight = thresholdHeight;
    }

    // plots the graph
    plotDataGraph(){
        let polyFit = calculateRegression(this.data);
        let polyFitPred = null;
        let predP = null;

        // if plot already exists, remove it first
        if (this.root_group != null){
            this.root_group.remove();
        }

        this.root_group = this.svg.append("g").attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

        // plot normal trendline
        this.calculateAxisScaling(this.data);

        var plotData = polyFit[0].map(function (x, y) {
            return [x,polyFit[1][y]] ;
        });

        if (this.xOffset > 0) {
            predP = this.predictPoints(polyFit);
            plotData.push.apply(plotData, predP);
            this.calculateAxisScaling(plotData);
            polyFitPred = calculateRegression(predP);
        }

        this.plotDataPoints();
        this.plotLine(plotData, this.color_trendline);
       
        // plot threshold height line if it is defined
        if(this.thresholdHeight) {
            this.plotDataThresholdLine(this.thresholdHeight);
        }

        // add mouse hover event and create legend
        this.addMouseHover(plotData);
        this.createLegend();
    }

    // method creates legend
    createLegend() {
        // remove old legend
        this.svg.selectAll(".legend").remove();
        var dataColor = [["Dataset points","blue"], ["Trendline","green"]];

        // if threshold height is defined add it to the legend
        if (this.thresholdHeight){
            dataColor.push(["Land height", "red"]);
        }

        // Add one dot in the legend for each name.
        var size = 20;
        this.svg.selectAll("mydots")
            .data(dataColor)
            .enter()
            .append("rect")
            .attr("class", "legend")
            .attr("x", 150)
            .attr("y", function(d,i){ return 50 + i*(size+5)})
            .attr("width", size)
            .attr("height", size)
            .style("fill", function(d){ return d[1]});

        // Add one dot in the legend for each name.
        this.svg.selectAll("mylabels")
            .data(dataColor)
            .enter()
            .append("text")
            .attr("class", "legend")
            .attr("x", 150 + size*1.2)
            .attr("y", function(d,i){ return 50 + i*(size+5) + (size/2)})
            .text(function(d){ return d[0]})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
    }

    // update graph methods
    updateGraphByRange(range) {
        this.xOffset = range;
        this.plotDataGraph();
    }

    updateGraphByType(type) {
        this.predictionType = type;
        this.plotDataGraph();
    }

    // resets graph
    resetGraph() {
        // if graph is defined remove it
        if (this.svg != null){
            this.svg.remove();
        }

        // revert to basic settings
        this.xOffset = 0;
        this.svg = d3
            .select(this.svgName)
            .append("svg")
            .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
            .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
            .attr("id", this.graph_name);

        // finally plot the graph
        this.plotDataGraph();
    }

    // method that predicts the future points
    predictPoints(polyfitData, scale=0.1){
        if (this.xOffset <= 0){
            return [];
        }

        const dataZip = polyfitData[0].map(function (x, y) {
            return [x, polyfitData[1][y]];
        });

        const slope = dataZip.slice(-1)[0][1] - dataZip.slice(-2)[0][1];
        const points = dataZip.slice(-10);
        let slopeFunction = null;

        // predict based on the prediction type
        switch (this.predictionType){
            case 0:
                slopeFunction = function (d) {
                    return Math.max(slope + slopeValues[0] * d,0);
                }
                break;
            case 1:
                slopeFunction = function (d) {
                    return Math.max(slope + slopeValues[1] * d,0);
                }
                break;
            case 2:
                slopeFunction = function (d) {
                    return Math.max(slope + slopeValues[2] * d,0);
                }
                break;
            case 3:
                slopeFunction = function (d) {
                    return Math.max(slope + slopeValues[3] * d,0);
                }
                break;
            case 4:
                slopeFunction = function (d) {
                    return Math.max(slope + slopeValues[4] * d,0);
                }
                break;
            default:
                return [];
        }

        for(let i = 1; i < this.xOffset; i++){
            let year = parseInt(points.slice(-1)[0][0]) + 1;
            let yVal = points.slice(-1)[0][1] + slopeFunction(i);
            points.push([year, yVal]);
        }

        return points;
    }

    calculateAxisScaling(data){
        // scale data to axis
        this.xScale = d3.scaleLinear().domain([d3.min(data, (d) => d[0]), d3.max(data, (d) => d[0])]).range([0, scatterWidth]);
        let maxY;
        let minY;

        if (this.thresholdHeight){
            maxY = Math.max(d3.max(data, (d) => parseFloat(d[1])), this.thresholdHeight);
            minY = Math.min(d3.min(data, (d) => parseFloat(d[1])), this.thresholdHeight);
        } else {
            maxY = d3.max(data, (d) => parseFloat(d[1]));
            minY = d3.min(data, (d) => parseFloat(d[1]));
        }

        this.yScale = d3.scaleLinear().domain([minY - maxY * 0.1, maxY + maxY * 0.1]).range([scatterHeight, 0]);
        this.xAxis = d3.axisBottom().scale(this.xScale).tickFormat(d3.format("d"));
        this.yAxis = d3.axisLeft().scale(this.yScale).tickFormat(d3.format("d"));
    }

    // plot the data points
    plotDataPoints() {
        // add axis to svg group
        this.makeXaxis()
        this.makeYaxis()
        const group = this.root_group.append("g");

        const marks = group
            .selectAll("circle")
            .data(this.data)
            .enter().append("circle")
            .attr("r", 3.5)
            .attr("cx", d => this.xScale(d[0]))
            .attr("cy", d => this.yScale(d[1]))
            .style("fill", this.color_points);
    }

    // Make X axis and X label
    makeXaxis() {
        this.root_group.append("g")
            .classed("xaxis", true)
            .attr("transform", `translate(0,${scatterHeight - 10})`)
            .attr("id", this.graph_name_xAxis)
            .call(this.xAxis)
            .selectAll("text")
            .style("font-size", "15px")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        this.root_group.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", scatterWidth)
            .attr("y", scatterHeight + 60)
            .text("years");
    }

    // Make Y axis and Y label
    makeYaxis() {
        this.root_group.append("g")
            .classed("yaxis", true)
            .attr("transform", `translate(0, -10)`)
            .attr("id", this.graph_name_yAxis)
            .call(this.yAxis)
            .style("font-size", "15px");

        this.root_group.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", -50)
            .attr("y", 0)
            .text(this.measurement);
    }

    plotLine(data, color="green", thickness=6) {
        var lineFunction = d3.line()
            .x(d => this.xScale(d[0]))
            .y(d => this.yScale(d[1]))
            .curve(d3.curveBasis);

        this.root_group.append("path")
            .attr('class', 'regression-path')
            .datum(data)
            .attr('d', lineFunction)
            .attr("stroke", color)
            .attr("stroke-width", thickness)
            .attr("fill", "none");
    }

    // plot threshold line
    plotDataThresholdLine(height, color="red", thickness=5) {
        // trendline with simple statistics
        if (this.root_group != null){
            var datapoints = [[this.data[0][0], height], [this.data.slice(-1)[0][0]+this.xOffset, height]];
            var line = d3.line()
                .curve(d3.curveBasis)
                .x(d => this.xScale(parseFloat(d[0])))
                .y(d => this.yScale(parseFloat(d[1])));
            this.root_group.append("path").datum(datapoints).attr("d", line).attr("stroke", color).attr("stroke-width", thickness).attr("id", this.graph_name_predictionG).style("fill", "none");
        }
    }

    // mouse hover event
    addMouseHover(data) {
        const mouse_g = this.root_group.append('g').classed('mouse', true).style('display', 'none');
        mouse_g.append('rect').attr('width', 2).attr('x',-4).attr('y', 10).attr('height', scatterHeight).attr('fill', 'lightgray');

        var t1 = mouse_g.append('text');
        var t2 = mouse_g.append('text');

        this.root_group.on("mouseover", function(mouse) {
            mouse_g.style('display', 'block');
        });

        const min_year = data[0][0];
        const max_year = data.slice(-1)[0][0];
        const min_y = Math.min(...data.map(d => d[1]));
        const max_y = Math.max(...data.map(d => d[1]));
        var xScale = this.xScale;
        var yScale = this.yScale;

        this.root_group.on("mousemove", function(mouse) {
            const [x_cord,y_cord] = d3.pointer(mouse);
            const ratio = x_cord / scatterWidth;
            const current_year = min_year + Math.round(ratio * (max_year - min_year));
            const current_y = min_y + Math.round(ratio * (max_y - min_y));
            mouse_g.attr('transform', `translate(${xScale(current_year)},${0})`);
            t1.text(`Year: ${current_year}`).attr('text-anchor', current_year < (min_year + max_year) / 2 ? "start" : "end");
            t2.text(`Height: ${Math.round(current_y)} mm`).attr('text-anchor', current_year < (min_year + max_year) / 2 ? "start" : "end").attr("dy", 20);
        });

        this.root_group.on("mouseout", function(mouse) {
            mouse_g.style('display', 'none');
        });
    }
}

// calculate regression
function calculateRegression(data){
    var coeff = generateFit(data);
    var xdata = data.map(d => d[0]);
    var ydata = yHat(xdata, coeff);
    return [xdata, ydata, coeff];
}

// load and show the weather dataset
function showWeatherData(data){
    // plot temp data, x years, y avg temp
    const dataTemp = data.map(d => [parseFloat(d.Year), parseFloat(d.AvgTemp)]);
    graphTemp = new GraphWrapper(dataTemp, "temp_graph", "red", "orange");
    graphTemp.plotDataGraph();

    // plot rain data, x years, y avg rain
    const dataRain = data.map(d => [parseFloat(d.Year), parseFloat(d.AvgRain)]);
    graphRain = new GraphWrapper(dataRain, "rain_graph", "blue", "green");
    graphRain.plotDataGraph();
}

// load and show the sealevel dataset
function showSeaLevelData(data, thresholdHeight=null, svgName=".scatterplot", parse=true, keep_ref=true, measurement="mm") {
    let dataSealevel = data;

    if(parse) {
        dataSealevel = data.map(d => [parseFloat(d.Year), parseFloat(d.SeaLevel)]);
    }
   if (keep_ref) {
       graphSeaLevel = new GraphWrapper(dataSealevel,"blue", "green", thresholdHeight, svgName, measurement);
       graphSeaLevel.plotDataGraph();
   } else {
       const graphSeaLevel = new GraphWrapper(dataSealevel,"blue", "green", thresholdHeight, svgName, measurement);
       graphSeaLevel.plotDataGraph();
       return graphSeaLevel;
   }
}

// ==============================================================
// Button callbacks
// ==============================================================
function showRange(data) {
    predictionRange = parseInt(data);
    document.getElementById("predictionRangeLabel").innerText = predictionRange + " Years";
}

function showType(data) {
    predictionType = parseInt(data);
    let output = "";
    switch (predictionType) {
        case 0:
            output = "Low";
            break;
        case 1:
            output = "Intermediate Low";
            break;
        case 2:
            output = "Normal";
            break;
        case 3:
            output = "Intermediate High";
            break;
        case 4:
            output = "High";
            break;
    }

    document.getElementById("predictionTypeLabel").innerText = output;
}

function updateGraphByType(data) {
    // change the behaviour of the trendline extension based on data
    if (graphTemp != null) {
        graphTemp.updateGraphByType(parseInt(data));
    }
    if (graphRain != null) {
        graphRain.updateGraphByType(parseInt(data));
    }
    if (graphSeaLevel != null) {
        graphSeaLevel.updateGraphByType(parseInt(data));
    }
}
function updateGraphByRange(data) {
    // extend both trendlines by "data" years
    if (graphTemp != null) {
        graphTemp.updateGraphByRange(parseFloat(data));
    }
    if (graphRain != null) {
        graphRain.updateGraphByRange(parseFloat(data));
    }
    if (graphSeaLevel != null) {
        graphSeaLevel.updateGraphByRange(parseFloat(data));
    }
}

function resetGraphs() {
    if (graphTemp != null) {
        graphTemp.resetGraph();
    }
    if (graphRain != null) {
        graphRain.resetGraph();
    }
    if (graphSeaLevel != null ){
        graphSeaLevel.resetGraph();
    }

    document.getElementById("predictionTypeSlider").value = 2;
    document.getElementById("predictionRangeSlider").value = 0;
    document.getElementById("predictionTypeLabel").innerHTML = "Normal";
    document.getElementById("predictionRangeLabel").innerHTML = "0 Years";
    predictionRange = 0.0;
    predictionType = 2;
}