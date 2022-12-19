const margin = { top: 50, bottom: 40, left: 50, right: 50 };
const graph_width = 300 - margin.left - margin.right;
const graph_height = 300 - margin.top - margin.bottom;

class WeatherGraph{
    constructor(data, graph_name, color_points, color_trendline) {
        this.data = data;
        this.color_points = color_points;
        this.color_trendline = color_trendline;
        this.xScale = null;
        this.yScale = null;
        this.xAxis = null;
        this.yAxis = null;
        this.lRL = null;
        this.xOffset = 0;
        this.yOffset = 0;
        this.yMax = Math.max(...data.map(d => d[1]))
        this.predictionType = 1; // 0 == bad, 1 == normal, 2 == good
        this.root_group = null;
        this.svg = d3.select(".focusScatterplot").append("svg").attr("width", graph_width + margin.left + margin.right).attr("height", graph_height + margin.top + margin.bottom).attr("id", this.graph_name);
        this.graph_name = graph_name;
        this.graph_name_xAxis = graph_name + "_x";
        this.graph_name_yAxis = graph_name + "_y";
        this.graph_name_predictionG = graph_name + "_predG";
    }
    plotDataGraph(){
        //TODO: this is broken
        if (this.root_group != null){
            this.root_group.remove();
        }else{
            this.lRL = this.calculateRegression(this.data)
        }
        
        this.root_group = this.svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
        // plot normal trendline
        const xCoordinates = [parseFloat(this.data[0][0]), parseFloat(this.data.slice(-1)[0][0])];
        const reg_points = xCoordinates.map(d => [d, this.lRL(d)])
        let predP = this.predictPoints()
        this.plotDataPoints()
        this.plotDataTrendline(reg_points, this.color_trendline);

        // plot prediction trendline
        if (this.xOffset > 0){
            this.plotDataTrendline(predP, this.color_trendline)
        }

    }

    calculateRegression(data, offset=0){
        const lR = ss.linearRegression(data.map(d => [parseFloat(d[0]), parseFloat(d[1])]));
        return ss.linearRegressionLine(lR);
    }

    updateGraphByRange(range){
        this.xOffset = range;

        this.plotDataGraph()
    }
    updateGraphByType(type){
        this.predictionType = type;

        this.plotDataGraph()
    }
    resetGraph(){
        if (this.svg != null){
            this.svg.remove();
        }
        this.xOffset = 0
        this.yOffset = 0
        this.svg = d3
            .select("body")
            .append("svg")
            .attr("width", graph_width + margin.left + margin.right)
            .attr("height", graph_height + margin.top + margin.bottom)
            .attr("id", this.graph_name);
        this.plotDataGraph();
    }
    predictPoints(scale=0.1){
        if (this.xOffset <= 0){
            return []
        }
        const slope = this.lRL(this.data.slice(-1)[0][0]) - this.lRL(this.data.slice(-2)[0][0]);
        var points = [[this.data.slice(-1)[0][0], this.lRL(this.data.slice(-1)[0][0])]]
        var slopeFunction = null
        switch (this.predictionType){
            case 0: // Going down
                slopeFunction = function (d, scale) {
                    let modifier = (1 / (Math.exp(d * scale) - 1))
                    return Math.min(slope * modifier, slope)
                }
                break;
            case 1: // Straight
                slopeFunction = function (d, scale) {
                    return slope
                }
                break;
            case 2: // Going up
                slopeFunction = function (d, scale) {
                    return Math.max((slope + slope * d) * scale, slope)
                }
                break;
            default:
                return [];

        }
        for(let i = 1; i < this.xOffset; i++){
            let year = parseInt(points[0][0]) + i
            let yVal = points.slice(-1)[0][1] + slopeFunction(i, scale)
            points.push([year, yVal])
        }

        this.yOffset = Math.max(0,points.slice(-1)[0][1] - this.yMax)
        return points
    }

    plotDataPoints(){
        // scale data to axis
        this.xScale = d3.scaleLinear().domain([d3.min(this.data, (d) => d[0]), d3.max(this.data, (d) => d[0]) + this.xOffset]).range([0, graph_width]);
        this.yScale = d3.scaleLinear().domain([0, d3.max(this.data, (d) => parseFloat(d[1])) + this.yOffset]).range([graph_height, 0]);
        this.xAxis = d3.axisBottom().scale(this.xScale);
        this.yAxis = d3.axisLeft().scale(this.yScale);
        // add axis to svg group
        this.root_group.append("g").classed("xaxis", true).attr("transform", `translate(0,${graph_height})`).attr("id", this.graph_name_xAxis).call(this.xAxis);
        this.root_group.append("g").classed("yaxis", true).attr("id", this.graph_name_yAxis).call(this.yAxis);
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

    plotDataTrendline(datapoints, color="green"){
        // trendline with simple statistics
        if (this.root_group != null){
            // const line = d3.line().x(d => this.xScale(parseFloat(d[0]))).y(d => this.yScale(parseFloat(d[1])));
            var line = d3.line()
                .curve(d3.curveLinear)
                .x(d => this.xScale(parseFloat(d[0])))
                .y(d => this.yScale(parseFloat(d[1])));
            this.root_group.append("path").datum(datapoints).attr("d", line).attr("stroke", color).attr("stroke-width", 3).attr("id", this.graph_name_predictionG);
        }
    }
}