var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  console.log(chosenXAxis);
  console.log(censusData);
  // create scales
  var xLinearScale = d3.scaleLinear()
  .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
   d3.max(censusData, d => d[chosenXAxis]) *1.2
   ])
  .range([0, chartWidth]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateTooltip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = 'poverty';
  }
  else {
    var label = 'age';
  }

  var tooltip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.abbr}<br>${d[label]} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(tooltip);

  circlesGroup.on("mouseover", function (data) {
    tooltip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function (data) {
      tooltip.hide(data, this);
    });

  return circlesGroup;
};

// Load data from data.csv
d3.csv("d3_data_journalism/data.csv").then(censusData=> {

  //console.log(censusData);

  // log a list of names
  var ids = censusData.map(data => data.id);
  console.log("ids", ids);

  // Cast each hours value in censuData as a number using the unary + operator
  censusData.forEach(function (data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.obese = +data.obesity;
    data.smoker = +data.smokes;
    data.noHealthcare = +data.healthcare;
    data.abbr = data.abbr;
    data.income = +data.income;
   // console.log(poverty, age, obese, smoker, noHealthcare, abbr, income);
  });
  // xLinearScale function above csv import
  // console.log(censusData);
  var xLinearScale = xScale(censusData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d.obesity)])
    .range([chartHeight, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-margin.right)
    .attr("x", 0 - (chartHeight / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obese (%)");

  // updateTooltip function above csv import
  var circlesGroup = updateTooltip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateTooltip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "poverty") {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        }
      }
    });
}).catch(function (error) {
  console.log(error);
});
