function generateFit(data, modelDegree=2) {
    var A = getVandermonde(data.map(d => d[0]), modelDegree);
    return backslash(A, data.map(d => d[1]));
}

function backslash(A, b) {
    var gram = numeric.dot(numeric.transpose(A), A);
    var pinvA = numeric.dot(numeric.inv(gram), numeric.transpose(A));
    return numeric.dot(pinvA, b);
  }

function getVandermonde(xdata, degree) {
    var A = [];
    for (var i = 0; i < xdata.length; i++) {
        var row = [];
        for (var j = 0; j <= degree; j++) {
        row.push(Math.pow(xdata[i], j));
        }
        A.push(row);
    }
    return A;
}

function yHat(xdata, coefficients) {
    var A = getVandermonde(xdata, coefficients.length-1);
    return numeric.dot(A, coefficients);
  }

function plotFit(main, points, coefficients) {
    main.selectAll('path.regression-path').remove();
    var xmin = 0;
    var xmax = 1;
    var xdata = [];
    for (var x = xmin; x < xmax; x += 0.01) {
        xdata.push(x);
    }

    var ydata = yHat(xdata, coefficients);
    // x and y scales
    var x = d3.scale.linear()
        .domain([d3.min(xdata), d3.max(xdata)])  // the range of the values to plot
        .range([ 0, width ]);        // the pixel range of the x-axis

    var y = d3.scale.linear()
        .domain([d3.min(points.ydata), d3.max(points.ydata)])
        .range([ height, 0 ]);

    var lineFunction = d3.svg.line()
        .x(function(d, i) { return x(xdata[i]); })
        .y(function(d, i) { return y(ydata[i]); })
        .interpolate("linear");
    var lineGraph = main.append('path')
        .attr('class', 'regression-path')
        .attr('d', lineFunction(ydata))
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none");
}