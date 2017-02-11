var express = require('express');
var pages = express.Router();


pages.get('register', function(req, res) {
    res.send("Register credit card info module page");
});

pages.get('confrimation', function(req, res){
    res.send("Trip payment confirmation module page");
});

module.exports = pages;
