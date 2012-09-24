// !USAGE: node app.js --key=<attClientId> --secret=<attClientSecret> --port=<examplePort> --foursquareKey=<4sqClientId> --foursquareSecret=<4sqClientSecret> --foursquareRedirect=<4sqCallbackUrl>

// !SETUP: Dependencies
/*
 * Express: 	Minimal web application framework
 * FS:			Node.js File System module
 * Optimist: 	Lightweight option parsing
 * HBS: 		Express View Engine wrapper for Handlebars
 * node-4sq: 	API Wrapper for Foursquare
 * Watson.js:	Simple API Wrapper for the AT&T Speech API
 */
var express = require('express')
  , argv = require("optimist").argv
  , fs = require("fs")
  , hbs = require("hbs")
  , WatsonClient = require("watson-js");

// !SETUP: Process argv and set Defaults as needed
var attClientId 			= argv.key || 'd2d3ab774ea939a3307c1c732ddc3ebe'
  , attClientSecret 		= argv.secret || 'c19263f11746f1da'
  , foursquareClientId 		= argv.foursquareKey || ''
  , foursquareClientSecret	= argv.foursquareSecret || ''
  , foursquareRedirect 		= argv.foursquareRedirect || 'http://localhost:3000/callback'
  , appPort 				= argv.port || '3000';

// !SETUP: Foursquare Configuration Options
var foursquareConfig = {
	"secrets": {
		"clientId": foursquareClientId,
		"clientSecret": foursquareClientSecret,
		"redirectUrl": foursquareRedirect
	}
};

// !SETUP: File Copying Convenience Function
function cp(source, destination, callback) {

	// Read a buffer from `source`
	fs.readFile(source, function(err, buf) {
		if (err) { return callback(err); }
		
		// Write that buffer to the new file `destination`
		fs.writeFile(destination, buf, callback);
	})
}
// !AT&T API: Instantiate an instance of the Watson Node.js API Wrapper
var Watson = new WatsonClient.Watson({ client_id: attClientId, client_secret: attClientSecret, context: "BusinessSearch" });

// !4SQ API: Instantiate an instance of the Foursquare Node.js API Wrapper
var Foursquare = require("node-4sq")(foursquareConfig);

// !EXPRESS: Create the Express app server
var app = express();

// !EXPRESS: Configure the Express app server
app.configure(function() {
	
	// Set the location of views and type of view engine
	app.set('views', __dirname + '/app/views');
	app.set('view engine', 'html');
	app.engine('html', require('hbs').__express);
	
	// Set up a standard Express configuration
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({
		secret: "This is the advanced example."
	}));
	app.use(app.router);

	// Set the location of static assets
	app.use(express.static(__dirname + '/public'));
});

// !GET '/': Render the start template
app.get('/', function(req, res) {
	res.render('layout', { foursquare: req.session.foursquare });
});

// !POST '/upload': Endpoint for saving the audio file to disk
app.post('/upload', function(req, res) {

	// Copy the temp file to the placeholder destination
	cp(req.files.upload_file.filename.path, __dirname + req.files.upload_file.filename.name, function() {
	
		// Send a message to the front-end to acknowledge the save action
		res.send({ saved: 'saved' });
	});
});

// !POST '/speechToText': Endpoint for sending the SpeechToText API Call
app.post('/speechToText', function(req, res) {

	// Traditionally, you would store this access token somewhere safe like a database. For the purposes of this example, we're going to generate a new one on the first request and store it in the session so we don't have to deal with a database or tracking expiry and refreshing access tokens.
	if(!req.session.accessToken) {

		// !AT&T API: Get Access Token
		Watson.getAccessToken(function(err, accessToken) {
			if(err) {
				// Handle an error getting an access token
				res.send(err);
				return;
			} else {
				// AT&T API: Save the Access Token to the Session
				req.session.accessToken = accessToken;
				
				// !AT&T API: Speech to Text, after getting an access token.
				Watson.speechToText(__dirname + '/public/audio/audio.wav', req.session.accessToken, function(err, reply) {
					if(err) {
						// Handle errors from the Speech to Text API
						res.send(err);
						return;
					}
					// Return the AT&T Speech API's reply to the $.ajax request
					res.send(reply);
					return;
				});
			}
		});
	} else {
		// !AT&T API: Speech to Text, with a previously established access token.
		Watson.speechToText(__dirname + '/public/audio/audio.wav', req.session.accessToken, function(err, reply) {
			if(err) {
				// Handle errors from the Speech to Text API
				res.send(err);
				return;
			}
			// !AT&T API: This is where you would 
			// Return the AT&T Speech API's reply to the $.ajax request
			res.send(reply);
			return;
		});
	}
});

// !GET '/login': Redirect the user to login with 4sq
app.get('/login', function(req, res) {
	var foursquareLocation = Foursquare.getAuthClientRedirectUrl();
	res.writeHead(303, { "location": foursquareLocation });
	res.end();
});

// !GET '/restart': Clear the session variable and start over
app.get('/restart', function(req, res) {
	// Kill the foursquare object in the session
	req.session.foursquare = null;
	// Redirect the user back to the start page
	res.redirect('/');
})

// !GET '/callback': Provide a 4sq redirect URL
app.get('/callback', function(req, res) {
	// !4SQ API: Get the users Access Token using the 4sq authorization code	
	Foursquare.getAccessToken({ code: req.query.code }, function (error, accessToken) {
		if(error) {
			// Handle an error getting an access token
			res.send("An error was thrown: " + error.message);
			return;
		} else {
			// Save the access token to the session
			req.session.foursquare = accessToken;

			// Redirect the user back to the start page
			res.redirect('/');
		}
	});
});

// !POST '/search': Endpoint for searching Foursquare with the result of Speech to Text
app.post('/search', function(req, res) {
	// !4SQ API: Search the 4sq Venues Platform using the URL "search" parameter
	Foursquare.Venues.search(req.param('latitude'), req.param('longitude'), '', { query: req.param('search') }, req.session.foursquare, function(error, results) {
		if(error) {
			// Handle an error while searching for venues
			res.send("An error was thrown: " + error.message);
			return;
		} else {
			// Return the results to the AJAX $.ajax request
			res.send(results);
			return;
		}
	});
});

// !POST '/checkin': Endpoint for checking into a venue on Foursquare
app.post('/checkin', function(req, res) {
	var userLatLong = req.param('latitude') + ',' + req.param('longitude');
	
	// !4SQ API: Check in on Foursquare publicly with a shout at the selected venue
	Foursquare.Core.postApi('/checkins/add', req.session.foursquare, { ll: userLatLong, broadcast: 'public', shout: 'Checked in via AT&T Speech API.', venueId: req.param('checkin') }, function(error, results) {
		if(error) {
			// Handle an error while trying to check in
			res.send("An error was thrown: " + error.message);
			return;
		} else {
			// Return the results to the AJAX $.ajax request
			res.send(results);
			return;
		}
	});
});

// !EXPRESS: Start the app listening on the requested port
app.listen(appPort);
console.log('AT&T Speech API Advanced Walkthrough App started on Port ' + appPort + '.');
