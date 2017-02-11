var express = require('express')
var app = express()

var port = process.env.PORT || 443;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/modules', require('./server/routes/modules'));
app.use('/fleet', require('./server/routes/admin'));

app.listen(port, function () {
  console.log('Example app listening on port 8080!')
});
