var fs = require("fs");
var express = require("express");
var app = express();

function loadJsonFromFile(jsonPath, req, res) {

  fs.readFile(jsonPath, function(err, data) {
    if (err) {
      res.end(err.message);
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data.toString());
    }
  });
}

app.use(express.static(__dirname));

app.get("/", function (req, res) {
  res.render("index.html");
});

app.get("/loadedTypes", function(req, res) {
  loadJsonFromFile("./docs/RawTypeData.json", req, res);
});

app.get("/layoutSpecs", function(req, res) {
  loadJsonFromFile("./docs/LayoutSpecs.json", req, res);
});

app.listen(3456, function () {
  console.log('Library hosting service listening on port 3456');
});
