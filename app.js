const express = require("express");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const {connectMongoDb} = require('./connection');
const { socketHandler } = require('./socket');
var cors = require('cors');

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/public", express.static("public"));
app.use("/public/uploads", express.static("public/uploads"));

connectMongoDb("mongodb://localhost:27017/usersDB");

const http = require('http');
const httpServer = createServer(app);
const io = socketHandler(httpServer);


const appRoutes = require('./routes');

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/Index.html");
});

app.get("/login.html", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/signup.html", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.use(appRoutes);

httpServer.listen(3000, () => {
  console.log('server running on 3000')
})




