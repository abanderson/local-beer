var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var memoryCache = require("memory-cache");

require("dotenv").config();

var app = express();

var api = require("./routes/api.js");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(function(req, res, next) {
    let duration = 86400; // Cache data for 24 hours (86400 seconds)
    let key = "__express__" + req.originalUrl || req.url;
    let cachedBody = memoryCache.get(key);
    if (cachedBody) {
        res.json(JSON.parse(cachedBody));
        console.log("Sending cached content");
        return;
    } else {
        res.sendResponse = res.send;
        res.send = body => {
            memoryCache.put(key, body, duration * 1000);
            console.log("Added data to cache");
            res.sendResponse(body);
        };
        next();
    }
});

app.use("/api", api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
