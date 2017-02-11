var express = require('express');
var pages = express.Router();


pages.get('panel', function(req, res) {
    res.send("Fleet admin trip viewer panel");
});

// other pages for fleet admin routes go here


module.exports = pages;
