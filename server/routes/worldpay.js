var express = require('express');
var api = express.Router();


api.post('payments', function(req, res) {
    res.send("JSON GOES HERE");
});

// other pages for fleet admin routes go here

module.exports = pages;
