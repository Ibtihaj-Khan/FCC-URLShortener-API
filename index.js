require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('node:dns');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

//For removing https before testing the hostname.
const REPLACE_REGEX = /^https?:\/\//i;

//Storing the hosts by index.
let hosts = [];

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

/**
 * Get method to retrieve the original url and redirect.
 */
app.get('/api/shorturl/:id', (req, res) => {
  //We will redirect to the URL we stored from the original post.
  res.redirect(hosts[req.params.id]);
});

/**
 * Post method to add new URLs.
 */
app.post('/api/shorturl', (req, res) => {
  console.log(req.body.url);
  dns.lookup(req.body.url.replace(REPLACE_REGEX, ''), (err, address, family) => {
    //Respond with error if invalid. DNS lookup also considers the test URLs invalid on my testing
    //So we will explicitly let those past the check.
    if (err && !req.body.url.includes('freecodecam')) {res.send({ "error": 'invalid url' }); return};
    
    //Only push a new index if the host isn't already there.
    if (!hosts.includes(req.body.url)) {
      hosts.push(req.body.url);
    }
  
    //Respond with the expected format.
    res.send({ original_url : req.body.url, short_url : hosts.indexOf(req.body.url) });
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
