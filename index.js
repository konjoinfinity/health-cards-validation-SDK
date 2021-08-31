const express = require("express");
const cors = require("cors");
const parser = require("body-parser");
const methodOverride = require("method-override");
const controller = require("./controller");


const app = express();

app.use(cors());
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
app.use(methodOverride("_method"));
// app.use(passport.initialize());

app.use("/", controller);


app.set("port", process.env.PORT || 4000);

app.listen(app.get("port"), () => {
    console.log(`Running on PORT: ${app.get("port")}`);
});

// var server = app.listen(3000, '127.0.0.1',onServerListening);

// app.use('/test', router)

