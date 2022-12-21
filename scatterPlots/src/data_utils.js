function loadCSVData(filename, callback){
    d3.csv(filename).then((csv) =>{
        console.log("Loaded data from %s!", filename);
        callback(csv)
    }).catch((error) =>{
        console.log(error);
        console.log("Failed to load data from %s!", filename);
    });
}