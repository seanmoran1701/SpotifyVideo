/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

let { PythonShell } = require('python-shell');
const fs = require("fs");
const { parse } = require("csv-parse");
var bodyParser = require('body-parser')


var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '1b4fa81586144395b6fa1ce3a8f84bc5'; // Your client id
var client_secret = 'e9273125b63d4b57b6e72a25ce91e9f8'; // Your secret

const localUrl = 'http://localhost:8888'
const publicUrl = 'http://spotifyvideo-production.up.railway.app/callback'
const frontUrl = 'https://spotify-video.vercel.app/'
var redirect_uri = publicUrl; // Your redirect uri

const videoIds = new Map();

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */

const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');

const options = new chrome.Options();
options.addArguments('--disable-dev-shm-usage')
options.addArguments('--no-sandbox')
options.addArguments('--headless')

async function getID(search) {
    let driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    //let driver = await new Builder().forBrowser("chrome").build();
    await driver.get('https://www.youtube.com/results?search_query=' + search);
    var video = await driver.findElements(By.id('video-title'));
    var url = null;
    let i = 0;
    while (url == null) {
        var url = await video[i].getAttribute("href");
        i++;
    }
    var id1 = url.split('/')
    var id2 = id1[3].split('=')
    var id3 = id2[1]
    var id4 = id3.split('&')
    var id5 = id4[0]
    console.log(id5);
    await driver.quit();

    var stream = fs.createWriteStream("videoIds.csv", { flags: 'a' });
    stream.write(search + ',' + id5 + '\n');
    stream.end();

    return id5;
}
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());


var jsonParser = bodyParser.json()
var search;
populateMap();
//video id map
function populateMap() {
    let data = fs.readFileSync("./videoIds.csv", "utf8");
    data = data.split(/\r?\n/);
    for (let i in data) {
        set = data[i].split(",");
        videoIds.set(set[0], set[1]);
    }
    console.log('CSV populated!')
    //console.log(videoIds);
}


app.post('/setID', jsonParser,function (req, res) {
    search = req.body.search;
    res.send('search set');
});

app.get('/getID', jsonParser, async function (req, res) {
    console.log(search);

    if (videoIds.has(search)) {
        console.log("found in csv")

        res.send({
            'id': videoIds.get(search)
        });
    } else {

        const id = await getID(search);
        await populateMap();

        console.log(search);
        console.log(videoIds.get(search));
        res.send({
            'id': id
        });
    }

});


app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-read-playback-state streaming';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
          res.redirect(frontUrl + '/#'+
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
          res.redirect(frontUrl + '/#'+
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

const port = process.env.PORT || 8888;
app.listen(port, "0.0.0.0", () => { console.log(port) })
