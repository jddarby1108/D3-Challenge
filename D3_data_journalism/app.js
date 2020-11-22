// Load data from data.csv
d3.csv("d3_data_journalism/data.csv").then(function(censusData) {

    console.log(censusData);
  
    // log a list of names
    var ids = censusData.map(data => data.id);
    console.log("names", ids);
  
    // Cast each hours value in tvData as a number using the unary + operator
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.poverty = +data.age;
      
    });
  });