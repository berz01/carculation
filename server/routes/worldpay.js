var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

var api = express.Router();


api.use(bodyParser.json());

// worldpay API headers
username = "8008942";
password = "cRC70MgtHKW7";
auth = "Basic " + new Buffer(username + ":" + password).toString("base64");


api.get('/payments', function(req, res) {
    res.send("JSON GOES HERE");
});

api.post('/chargeVault/:amount', function(req, res) {
  var myJSONObject = {
  amount: req.params.amount,
  paymentVaultToken: {
    customerId: '5000006',
    paymentMethodId: '1',
    paymentType: 'CREDIT_CARD'
  },
  developerApplication: {
    developerId: 12345678,
    version: '1.2'
  }
}
  ;

request({
    url: "https://gwapi.demo.securenet.com/api/Payments/Charge",
    method: "POST",
    headers: {
      Authorization: auth,
      SecurenetID: '8008942'
    },
    json: true,
    body: myJSONObject
}, function (error, response, body){
    //console.log(response.body);
    res.send(response.body);
});

});


api.post('/createVaultAccount', function(req, res) {

  var myJSONObject = {
  customerId: 5000006,
  card: {
    number: '4444 3333 2222 1111',
    expirationDate: '10/2020',
    address: {
      line1: '123 Main St.',
      city: 'Austin',
      state: 'TX',
      zip: '78759'
    },
    firstname: 'Jack',
    lastname: 'Test'
  },
  phone: '512-250-7865',
  notes: 'Create a vault account',
  accountDuplicateCheckIndicator: 0,
  primary: true,
  userDefinedFields: [
    {
      udfname: 'udf1',
      udfvalue: 'udf1_value'
    },
    {
      udfname: 'udf2',
      udfvalue: 'udf2_value'
    },
    {
      udfname: 'udf3',
      udfvalue: 'udf3_value'
    },
    {
      udfname: 'udf4',
      udfvalue: 'udf4_value'
    },

  ],
  developerApplication: {
    developerId: 12345678,
    version: '1.2'
  }
};

request({
    url: "https://gwapi.demo.securenet.com/api/Customers/5000006/PaymentMethod",
    method: "POST",
    headers: {
      Authorization: auth,
      SecurenetID: '8008942'
    },
    json: true,
    body: myJSONObject
}, function (error, response, body){
    //console.log(response.body);
    res.send(response.body);
});

});

api.post('/searchTransactions', function(req, res) {

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
}, function (error, response, body){
    //console.log(response.body);
    res.send(response.body);
});

});

api.get('/searchTransactionById/:transID', function(req, res) {

request({
    url: "https://gwapi.demo.securenet.com/api/transactions/" + req.params.transID,
    method: "GET",
    headers: {
      Authorization: auth,
      SecurenetID: '8008942'
    },
    json: true

}, function (error, response, body){
    //console.log(response.body);
    res.send(response.body);
});

});


module.exports = api;
