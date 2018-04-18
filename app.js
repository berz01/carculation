const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const nconf = require('nconf');
const session = require('express-session');
const passport = require('passport');
const AutomaticStrategy = require('passport-automatic').Strategy;
var NestStrategy = require('passport-nest').Strategy;
const engines = require('consolidate');
const http = require('http');
var EventSource = require('eventsource');
var openurl = require('openurl');

// This API will emit events from this URL.

nconf.env().argv();
nconf.file('./config.json');

nconf.set('API_URL', 'https://api.automatic.com');
var NEST_API_URL = 'https://developer-api.nest.com';

const routes = require('./routes');
const api = require('./routes/api');

const app = express();


// View engine setup
app.set('views', path.join(__dirname, 'views'));

app.engine('pug', engines.pug);
app.engine('ejs', engines.ejs);


// Use the AutomaticStrategy within Passport
passport.use('automatic', new AutomaticStrategy({
  clientID: nconf.get('AUTOMATIC_CLIENT_ID'),
  clientSecret: nconf.get('AUTOMATIC_CLIENT_SECRET'),
  scope: ['scope:trip', 'scope:location', 'scope:vehicle:profile', 'scope:vehicle:events', 'scope:behavior']
},
  (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    return done(null, profile);
  }
));

// ~*~*~*~ BEGIN NEST CODE ~*~*~*~*~

var passportOptions = {
  failureRedirect: '/auth/failure', // Redirect to another page on failure.
};

passport.use('nest', new NestStrategy({
  // clientID: process.env.NEST_ID,
  // clientSecret: process.env.NEST_SECRET
  clientID: '4320769d-d858-455f-9ecb-e8ca1cc5965c',
  clientSecret: 'RXxngYFrELgj51xx1qHxsAwoK'
}));

function startStreaming(token) {
  var source = new EventSource(NEST_API_URL + '?auth=' + token);

  source.addEventListener('put', function(e) {
    console.log('\n' + e.data);
  });

  source.addEventListener('open', function(e) {
    console.log('Connection opened!');
  });

  source.addEventListener('auth_revoked', function(e) {
    console.log('Authentication token was revoked.');
    // Re-authenticate your user here.
  });

  source.addEventListener('error', function(e) {
    if (e.readyState == EventSource.CLOSED) {
      console.error('Connection was closed! ', e);
    } else {
      console.error('An unknown error occurred: ', e);
    }
  }, false);
}

app.get('/auth/nest', passport.authenticate('nest', passportOptions));

app.get('/auth/nest/callback', passport.authenticate('nest', passportOptions),
  function(req, res) {
    var token = req.user.accessToken;

    if (token) {
      console.log('Success! Token acquired: ' + token);
      res.send('Success! You may now close this browser window.');
      startStreaming(token);
    } else {
      console.log('An error occurred! No token acquired.');
      res.send('An error occurred. Please try again.');
    }
});

/**
 * When authentication fails, present the user with an error requesting they try the request again.
 */
app.get('/auth/failure', function(req, res) {
  res.send('Authentication failed. Please try again.');
});

// ~*~*~*~ END NEST CODE ~*~*~*~*~


passport.serializeUser((user, done) => {
  done(null, user);
});


passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(favicon(`${__dirname}/public/favicon.ico`));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: nconf.get('SESSION_SECRET'),
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 31536000000}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

if (app.get('env') !== 'development') {
  app.all('*', routes.force_https);
} else {
  app.all('*', routes.check_dev_token);
}

app.get('/script', routes.ensureAuthenticated, routes.script);
app.get('/', routes.ensureAuthenticated, routes.index);
app.get('/login', routes.login);
app.get('/trips', routes.ensureAuthenticated, routes.trips);
app.get('/trips/:id', routes.ensureAuthenticated, routes.trip);
app.get('/vehicles', routes.ensureAuthenticated, routes.vehicles);
app.get('/revenue', routes.ensureAuthenticated, routes.revenue);
app.get('/home', routes.ensureAuthenticated, routes.home);
app.get('/audit', routes.audit);
app.get('/summary', routes.summary);

app.get('/authorize/', passport.authenticate('automatic'));
app.get('/logout/', routes.logout);
app.get('/automatic/redirect', passport.authenticate('automatic', {failureRedirect: '/'}), routes.auth);
app.get('/nest/redirect', passport.authenticate('nest', {failureRedirect: '/'}), routes.auth);

app.use('/modules', require('./server/routes/modules'));
app.use('/fleet', require('./server/routes/admin'));
app.use('/api', require('./server/routes/worldpay'));

app.get('/api/trips/', routes.ensureAuthenticated, api.trips);
app.get('/api/trips/:id', routes.ensureAuthenticated, api.trip);
app.get('/api/vehicles/', routes.ensureAuthenticated, api.vehicles);
app.post('/api/trips/:id/tag', routes.ensureAuthenticated, api.tagTrip);
app.delete('/api/trips/:id/tag/:tag', routes.ensureAuthenticated, api.untagTrip);

app.get('/download/trips.csv', routes.ensureAuthenticated, api.downloadTripsCSV);
app.get('/download/trips.json', routes.ensureAuthenticated, api.trips);

// error handlers
require('./libs/errors')(app);

module.exports = app;
