const nconf = require('nconf');
var express = require('express');
var request = require('request');
var worldpayApi = require('../server/routes/worldpay.js');
var bodyParser = require('body-parser');
var rp = require('request-promise');
var Chance = require('chance');
var chance = new Chance();
var autoApi = require('./api');
var helper = require('../public/javascripts/helper');

var api = express.Router();

// worldpay API headers
username = "8008942";
password = "cRC70MgtHKW7";
auth = "Basic " + new Buffer(username + ":" + password).toString("base64");


api.use(bodyParser.json());

exports.index = (req, res, next) => {
    res.render('index.pug', {
        loggedIn: true,
        menu: 'summary'
    });
};


exports.login = (req, res, next) => {
    res.render('login.pug');
};


exports.redirect = (req, res, next) => {
    res.redirect('/trips');
};


exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    if (req.xhr) {
        const error = new Error('Not logged in');
        error.setStatus(401);
        return next(error);
    }
    return res.redirect('/login');
};


exports.logout = (req, res, next) => {
    req.logout();
    res.redirect('/');
};


exports.trips = (req, res, next) => {
    res.render('trips.pug', {
        loggedIn: true,
        menu: 'trips',
        mapboxAccessToken: nconf.get('MAPBOX_ACCESS_TOKEN')
    });
};


exports.trip = (req, res, next) => {
    res.render('trip.pug', {
        trip_id: req.params.id,
        loggedIn: true,
        menu: 'trips',
        mapboxAccessToken: nconf.get('MAPBOX_ACCESS_TOKEN')
    });
};

exports.script = function(req, res, next){
   // {Math.round(distance * .75 * 100)/100}

   rp.get({
       uri: "https://api.automatic.com/trip/",
       headers: {
           Authorization: 'Bearer ' + req.user.accessToken
       },
       json: true
   }).then(function(trips){
     var total = 0;
     console.log(trips);
     
     trips.forEach(function(trip){
        var localTotal = (helper.mToMi(trip.distance_m) * 0.75).toFixed(2);
        total += localTotal;
        console.log(localTotal);
     })

     console.log(total);

     res.json(trips);
   });
};


exports.revenue = (req, res, next) => {

    var myJSONObject = {

        customerId: '5000006',
        startDate: '01/01/2017',
        endDate: '2/11/2017',
        developerApplication: {
            developerId: 12345678,
            version: '1.2'
        }
    };

    request({
        url: "https://gwapi.demo.securenet.com/api/transactions/Search",
        method: "POST",
        headers: {
            Authorization: auth,
            SecurenetID: '8008942'
        },
        json: true,
        body: myJSONObject
    }, function(error, response, body) {
        //console.log(response.body);
        var names = [];
        for (var i = 0; i < response.body.transactions.length; i++) {
            names.push({
                firstName: chance.first(),
                lastName: chance.last()
            });
        }

        var vehicleNames = [{
            name: "Kia Optima"
        }, {
            name: "Toyota Camery"
        }, {
            name: "Chevrolet Camaro"
        }, {
            name: "Tame Impala"
        }, {
            name: "Nissan Altima"
        }, ]
        var vehicles = [];
        var hundo = [100, 0, 0, 0, 0];
        for (var i = 0; i < 5; i++) {
            vehicles.push({
                name: vehicleNames[i].name,
                percent: hundo[i]
              });
        }
        console.log(response.body.transactions[0].transactionId);
        res.render('revenue.ejs', {
            transactions: response.body.transactions,
            names: names,
            vehicles: vehicles
        });
    });


};

exports.home = (req, res, next) => {
    res.render('home.ejs');
};


exports.vehicles = (req, res, next) => {
    res.render('vehicles.pug', {
        loggedIn: true,
        menu: 'vehicles'
    });
};


exports.force_https = (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        res.redirect(`https://${req.headers.host}${req.path}`);
    } else {
        next();
    }
};


exports.check_dev_token = (req, res, next) => {
    if (process.env.TOKEN) {
        req.login({
            accessToken: process.env.TOKEN
        }, next);
    } else {
        next();
    }
};
