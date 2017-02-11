var express = require('express');
var api = express.Router();


api.get('/payments', function(req, res) {
    res.send("JSON GOES HERE");
});

api.post('/payments', function(req, res) {
    res.send("JSON GOES HERE");
});

// other pages for fleet admin routes go here

module.exports = api;
