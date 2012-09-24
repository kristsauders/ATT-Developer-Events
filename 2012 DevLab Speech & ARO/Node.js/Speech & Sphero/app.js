// !USAGE: node app.js --key=<clientId> --secret=<clientSecret> --port=<examplePort>

// !SETUP: Dependencies
/*
 * Express: 	Minimal web application framework
 * FS:			Node.js File System module
 * Optimist: 	Lightweight option parsing
 * HBS: 		Express View Engine wrapper for Handlebars
 * node-sphero: Server and API Wrapper for the Sphero device
 * Watson.js:	Simple API Wrapper for the AT&T Speech API
 */
var express = require('express')
  , argv = require("optimist").argv
  , fs = require("fs")
  , hbs = require("hbs")
  , Sphero = require("node-sphero")
  , WatsonClient = require("watson-js");

// !Process argv and set Defaults as needed
var clientId 		= argv.key || '406c20a3d5321d342c99693d512486f6'
  , clientSecret 	= argv.secret || '07df435513a2c509'
  , appPort 		= argv.port || '3000';

// !Instantiate an instance of the Watson Node.js API Wrapper
var Watson = new WatsonClient.Watson({ client_id: clientId, client_secret: clientSecret, context: "UverseEpg", xarg: "task=ToySphero" });

// !Instantiate an instance of the relevant Sphero objects
var bot = new Sphero.Sphero();
	bot.connect();
					
// !Create the Express app server
var app = express();

// !Configure the Express app server
app.configure(function() {
	
	// !Set the location of views and type of view engine
	app.set('views', __dirname + '/app/views');
	app.set('view engine', 'html');
	app.engine('html', require('hbs').__express);
	
	// !Set up a standard Express configuration
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({
		secret: "This is a test."
	}));
	app.use(app.router);
	// !Set the location of static assets
	app.use(express.static(__dirname + '/public'));
});

// !GET '/': Render the start template
app.get('/', function(req, res) {
	res.render('layout');
});

// !POST '/upload': Endpoint for saving the audio file to disk
app.post('/upload', function(req, res) {

	// !Copy the temp file to the placeholder destination
	cp(req.files.upload_file.filename.path, __dirname + req.files.upload_file.filename.name, function() {
	
		// !Send a message to the front-end to acknowledge the save action
		res.send({ saved: 'saved' });
	});
});

// !POST '/speechToText': Endpoint for sending the SpeechToText API Call
app.post('/speechToText', function(req, res) {
	// !API Call: Get Access Token
	Watson.getAccessToken(function(err, accessToken) {
		
		console.log("ACCESS TOKEN: " + accessToken);
		
		// Traditionally, you would store this access token somewhere safe like a database or at the very least in memory. For the purposes of the demo, we're just going to generate a new one every request so we don't have to deal with tracking and refreshing access tokens.
		
		if(err) {
			// !Handle an error getting an access token
			res.send(err);
			return;
		} else {
			// !API Call: Speech to Text, currently using a simple filename to pipe the file from the temp directory to the AT&T API.
			Watson.speechToText(__dirname + '/public/audio/audio.wav', accessToken, function(err, reply) {
				console.log("CALLBACK: reply = " + JSON.stringify(reply));
				if(err) {
					// !Handle errors from the Speech to Text API
					res.send(err);
					return;
				}
				// !Return the AT&T Speech API's reply to the $.ajax request
				res.send(reply);
				return;
			});
		}
	});
});

app.post('/sphero', function(req, res) {
	var reply = {};
	
	switch(req.param('command')) {
	
		case "color":
			bot.setRGBLED(req.param('red'), req.param('green'), req.param('blue'));
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to rgb(' + req.param('red') + ',' + req.param('green') + ',' + req.param('blue') + ').';
			}
			break;
		case "backled":
			bot.setBackLED(req.param('luminosity'));
			if(!reply.error && !reply.message) {
				reply.message = 'Back LED set to Luminosity of ' + req.param('luminosity') + '.';
			}
			break;
		case "turn":
			bot.setHeading(req.param('heading'));
			if(!reply.error && !reply.message) {
				reply.message = 'Heading set to ' + req.param('heading') + ').';
			}
			break;
		case "roll":
			bot.roll(req.param('heading'), req.param('speed'));
			if(!reply.error && !reply.message) {
				reply.message = 'Rolling at heading ' + req.param('heading') + ' with speed ' + req.param('speed') + '.';
			}
			break;
		case "stop":
			bot.roll(0, 0);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero stopped.';
			}
			break;
		case "stabilize":
			bot.setStabilization(1);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero stabilization to ' + req.param('stability');
			}
			break;
		default:
			reply = { error: 'Command not understood.' };
			break;
	}
	
	// Send reply to front-end
	res.send(reply);
	return;
});

app.post('/macro', function(req, res) {
	var reply = {};
	
	switch(req.param('command')) {
		case "color red":
			bot.setRGBLED(255, 0, 0);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to red.';
			}
			break;
		case "color green":
			bot.setRGBLED(0, 255, 0);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to green.';
			}
			break;
		case "color blue":
			bot.setRGBLED(0, 0, 255);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to blue.';
			}
			break;
		case "color yellow":
			bot.setRGBLED(255, 255, 0);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to yellow.';
			}
			break;
		case "color purple":
			bot.setRGBLED(255, 0, 255);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to purple.';
			}
			break;
		case "color cyan":
			bot.setRGBLED(0, 255, 255);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to cyan.';
			}
			break;
		case "color orange":
			bot.setRGBLED(255, 125, 0);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to orange.';
			}
			break;
		case "color violet":
			bot.setRGBLED(125, 0, 255);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to violet.';
			}
			break;
		case "color white":
			bot.setRGBLED(255, 255, 255);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to white.';
			}
			break;
		case "color random":
			var randomColor = {};
				randomColor.red = Math.floor(Math.random()*256);
				randomColor.green = Math.floor(Math.random()*256);
				randomColor.blue = Math.floor(Math.random()*256);
			bot.setRGBLED(randomColor.red, randomColor.green, randomColor.blue);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set randomly.';
			}
			break;
		case "color off":
			bot.setRGBLED(0, 0, 0);
			if(!reply.error && !reply.message) {
				reply.message = 'Color turned off.';
			}
			break;
		case "stop":
			bot.roll(0, 0);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero stopped.';
			}
			break;
		case "roll left":
			bot.roll(270, 1.0);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero rolling left.';
			}
			break;
		case "roll right":
			bot.roll(90, 1.0);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero rolling right.';
			}
			break;
		case "roll forward":
			bot.roll(0, 1.0);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero rolling forward.';
			}
			break;
		case "roll backward":
			bot.roll(180, 1.0);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero rolling backward.';
			}
			break;
		case "turn left":
			bot.setHeading(270);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero turning left.';
			}
			break;
		case "turn right":
			bot.setHeading(90);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero turning right.';
			}
			break;
		case "turn forward":
			bot.setHeading(0);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero turning forward.';
			}
			break;
		case "turn backward":
			bot.setHeading(180);
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero turning backward.';
			}
			break;
		case "tail light on":
			bot.setBackLED(1.0);
			if(!reply.error && !reply.message) {
				reply.message = 'Tail light turned on.';
			}
			break;
		case "tail light off":
			bot.setBackLED(0);
			if(!reply.error && !reply.message) {
				reply.message = 'Tail light turned off.';
			}
			break;
		case "stars and stripes":
			if(!reply.error && !reply.message) {
				reply.message = 'Sphero is changing red, white, and blue while spinning in a circle.';
			}
			bot.setRGBLED(255, 0, 0, false, function() {
			bot.roll(0, 1.0, function() {
			delayer(1000, function() {
			bot.setRGBLED(255, 255, 255, false);
			bot.setHeading(90, function() {
			delayer(1000, function() {
			bot.setRGBLED(0, 0, 255, false);
			bot.setHeading(90, function() {
			delayer(1000, function() {
			bot.setRGBLED(255, 0, 0, false);
			bot.setHeading(90, function() {
			delayer(1000, function() {
			bot.setRGBLED(255, 255, 255, false);
			bot.setHeading(90, function() {
			delayer(1000, function() {
			bot.setRGBLED(0, 0, 255, false);
			bot.roll(0, 0, function() {
			delayer(1000, function() {
			bot.setRGBLED(0, 0, 0, false);
			}); // end delayer
			}); // end roll
			}); // end delayer
			}); // end setHeading
			}); // end delayer
			}); // end setHeading
			}); // end delayer
			}); // end setHeading
			}); // end delayer
			}); // end setHeading
			}); // end delayer
			}); // end roll
			}); // end setRGBLED
			break;
		default:
			reply = { error: 'Command not understood.' };
			break;
	}
	
	// Send reply to front-end
	res.send(reply);
	return;
});

// !Start the app listening on the requested port
app.listen(appPort);

// !File Copying Convenience Function
function cp(source, destination, callback) {
	// !Read a buffer from `source`
	fs.readFile(source, function(err, buf) {
		if (err) { return callback(err); }
		// !Write that buffer to the new file `destination`
		fs.writeFile(destination, buf, callback);
	})
}

// !Delay Closure
var delayer = function(delaytime, callback) {
	setTimeout(callback, delaytime);
}
