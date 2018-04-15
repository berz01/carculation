const nconf = require('nconf');
var express = require('express');
var request = require('request');
var worldpayApi = require('../server/routes/worldpay.js');
var bodyParser = require('body-parser');
var rp = require('request-promise');
var Chance = require('chance');
var chance = new Chance();
var autoApi = require('./api');

var api = express.Router();

// worldpay API headers
username = "8008942";
password = "cRC70MgtHKW7";
auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

api.use(bodyParser.json());


exports.auth = function(req, res, next) {
  const code = req.query.code;

  function saveToken(error, result) {
    if (error) {
      console.log('Access token error', error.message);
      res.send('Access token error: ' + error.message);
      return;
    }

    // Attach `token` to the user's session for later use
    // This is where you could save the `token` to a database for later use
    req.session.token = oauth2.accessToken.create(result);
    console.log("CAPTURED TOKEN", req.session.token);

    return res.redirect('http://carculation.diameter.tech.s3-website-us-east-1.amazonaws.com#accessToken=' + req.session.token);
  }

  oauth2.authCode.getToken({
    code: code
  }, saveToken);

  return res.redirect('/home');
};


// OLD ROUTES SHOULD STILL WORK
exports.index = (req, res, next) => {
  res.render('index.pug', {
    loggedIn: true,
    menu: 'summary'
  });
};

exports.login = (req, res, next) => {
  res.render('login.pug');
};

exports.audit = (req, res, next) => {

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
    res.render('audit.ejs', {
      transactions: response.body.transactions
    });
  });
};

exports.redirect = (req, res, next) => {
  res.redirect('/home');
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

exports.script = function(req, res, next) {
  // {Math.round(distance * .75 * 100)/100}

  rp.get({
    uri: "https://api.automatic.com/trip/",
    headers: {
      Authorization: 'Bearer ' + req.user.accessToken
    },
    json: true
  }).then(function(body) {
    var total = 0;
    var trips = body.results;


    for (var i = 0; i < trips.length; i++) {
      console.log("This is the amount of trips coming from automatic: " + trips.length)
      console.log("Async THIS dude: " + i);
      var localTotal = ((trips[i].distance_m / 1609.34) * 0.75).toFixed(2);
      total += localTotal;

      rp.post({
        url: "https://carculation.herokuapp.com/api/chargeVault/" + localTotal,
        method: "POST",
        json: true
      }, function(error, response, body) {
        console.log("How many times did this f'n run bro: " + i);

      });
    }
  });
};

exports.revenue = (req, res, next) => {

  var myJSONObject = {

    customerId: '5000006',
    startDate: '02/12/2017',
    endDate: '02/12/2017',
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

exports.summary = (req, res, next) => {
  res.render('summary.ejs');
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