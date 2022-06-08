const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql");
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_hor",
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err);
    return;
  }
  console.log(`Connected with threadID ${connection.threadId}`);
});
app.get("/", (req, res) => {
  res.send({
    status: 200,
    message: "Hello Lol",
  });
});

app.get("/rooms", (req, res) => {
  connection.query(
    "SELECT * FROM `room` ORDER BY `price` ASC",
    function (err, result) {
      if (err)
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });

      res.send({
        status: 200,
        message: "Found Rooms Successfully",
        data: result,
      });

      console.log(result);
    }
  );
});

app.listen(PORT, function (err) {
  if (err) {
    console.error("error connecting: " + err);
    return;
  }
  console.log(`Listening on http://localhost:${PORT} `);
});
