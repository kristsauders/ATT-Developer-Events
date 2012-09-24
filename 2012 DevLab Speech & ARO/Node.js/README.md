## DevLab by AT&T

The examples contained within are four examples of how to use the AT&T Speech API on Node.js, simplified by the [Watson.js](http://github.com/mowens/watson-js/) Node.js module (`watson-js` on NPM). These examples were prepared for the [2012 AT&amp;T DevLab](http://2012devlab.com) by [Michael Owens](https://github.com/mowens).

1. [Basic Walkthrough](#example-1-basic-walkthrough): Learn how to interact with the AT&amp;T Speech API with a basic walkthrough that steps through using the AT&amp;T Speech API in the web browser on Node.js.
2. [Speech API + Sphero](#example-2-speech-api--sphero): Control a Sphero robotic ball with your voice and create custom voice commands to control your Sphero robotic ball.
3. [Advanced Walkthrough](#example-3-advanced-walkthrough): Learn about how to integrate the AT&T Speech API with Third-Party APIs with a more advanced walkthrough that steps through using the AT&amp;T Speech API with the Foursquare API in the web browser on Node.js.
4. [VocaLocal](#example-4-vocalocal): Explore a live example application that allows a user to search for a location and check into it on Foursquare by voice command.

_**Please Note:** All dependencies (a.k.a `node_modules`) are included in this repository already except for `node-sphero` which requires being installed via a build script. Separate repos are available for the individual examples better suited for boilerplate applications, if that is what you are after._

### Getting Started

In order to run all of the examples, you should have the following:

- AT&T Developer Account [http://j.mp/ATTDevSignUp](http://j.mp/ATTDevSignUp)
- AT&T Application API Key & Secret Key [https://devconnect-api.att.com/](https://devconnect-api.att.com/)
- Node.js (≥ 0.8.6): [http://nodejs.org/](http://nodejs.org/)
- NPM (≥ 1.1.4): _installed with Node.js_
- Adobe Flash Player (≥ 11.4): [http://get.adobe.com/flashplayer/](http://get.adobe.com/flashplayer/)
- Microphone (a headset or boom mic is recommended)
- _**For Sphero Only**_ Sphero device [http://www.gosphero.com](http://www.gosphero.com)
- _**For Sphero Only**_ Bluetooth Connection (confirmed to work on Windows 7/8 and OS X 10.6+)
- _**For Sphero on Windows Only**_ Python 2.7.x [http://www.python.org/download/releases/2.7.3/](http://www.python.org/download/releases/2.7.3/)
- _**For Sphero on Windows Only**_ Microsoft Visual Studio Express C++ Edition [http://microsoft.com/visualstudio/en-us/products/2010-editions/express](http://www.microsoft.com/visualstudio/en-us/products/2010-editions/express)
- _**For Sphero on Mac Only**_ XCode Command-Line Developer Tools [https://developer.apple.com/xcode/](https://developer.apple.com/xcode/)
- _**For Advanced/VocaLocal**_ Foursquare Developer Account [https://developer.foursquare.com/](https://developer.foursquare.com/)
- _**For Advanced/VocaLocal**_ Foursquare Client ID & Client Secret [https://foursquare.com/developers/apps](https://foursquare.com/developers/apps)
- _**Optional**_ git (≥ 1.7.12): [http://git-scm.com](http://git-scm.com)
- _**Optional**_ GitHub account: [https://github.com](https://github.com)
- Download/unpack or clone the [2012DevLabExamples repo from GitHub](https://github.com/mowens/2012DevLabExamples).
	- For example, in Terminal on OS X: `git clone https://github.com/mowens/2012DevLabExamples.git`

### Miscellaneous

If you are running Mountain Lion (OS X 10.8), the version of Flash shipped with most versions of Chrome are bugged and do not allow the Permissions Dialog to be clicked. Using the latest version of the Flash plugin in either Firefox or Safari has been confirmed to work.

If you are running Internet Explorer, some versions of ActiveX-enabled Flash (specifically the latest version in IE10) will ignore the transparency values of both images in Flash object and of Flash objects themselves. If this is the case, you may see a white box instead of a "Save" or "Search" button on some of the examples.

You might be wondering what is with the `// !`-style comments throughout the examples. These are Comment Bookmarks designed to work with code navigators in some text editors (like [Coda](http://www.panic.com/coda/)).

Currently, there is limited logging or stdout in the example apps. There is limited stdout caused by dependencies, but if you want a logging solution to show you more of the raw output, I recommend using [Bunyan](https://npmjs.org/package/bunyan) with its CLI tool or [Log4JS](https://npmjs.org/package/log4js) to help make the service-level output more clear. On the two Foursquare-enabled examples, [Log4JS](https://npmjs.org/package/log4js) is inherited from the `node-4sq` module.

-------------------------

## Example 1: Basic Walkthrough

The Basic Walkthrough is the application walked through during the AT&amp;T Speech API Deep Dive Presentation. It's a step-by-step walkthrough of the individual events as they happen. Realistically, many of these steps can be automated and/or consolidated into three steps:

1. Retrieve audio from audio source.
2. Send audio to the AT&T Speech API.
3. Use API Response to do something.

### Using the Basic Example

From the directory you unpacked or cloned the example code into, navigate to `example-basic` (i.e., `cd example-basic`). Once there, we can run the example's `app.js` file using Node.js. We're using [Optimist](https://npmjs.org/package/optimist), so we can easily append our OAuth 2.0 Client Key (AT&T's "API Key") and Client Secret (AT&T's "Secret Key") along with our preferred port (by default, it uses port `3000`) to customize the example when we run it:

	node app.js --key=ATT_API_KEY --secret=ATT_SECRET_KEY --port=3000
	
Once the app is running, navigate to [http://localhost:3000](http://localhost:3000) (or wherever you are running the app, if not developing locally).

### How It Works

#### Require Dependencies

```javascript
var express = require('express')
  , argv = require("optimist").argv
  , fs = require("fs")
  , hbs = require("hbs")
  , WatsonClient = require("watson-js");
```

- `express`: [Express.js](http://expressjs.com) simplifies routing and creating a simple API for the front-end of our web application.
- `argv`: [Optimist](https://npmjs.org/package/optimist) allows us to parse command-line arguments, allowing customization of defaults without having to edit the application file.
- `fs`: The [Node.js File System](http://nodejs.org/api/fs.html) module allows us to manipulate audio file streams and buffers.
- `hbs`: [HBS](https://npmjs.org/package/hbs) is a view engine that renders [Handlebars.js](http://handlebarsjs.com/) templates in Express.js.
- `WatsonClient`: [Watson.js](https://npmjs.org/package/watson-js) simplifies handling of HTTP requests and OAuth flows with the AT&T Speech API.

#### Configure Defaults

```javascript
var clientId 		= argv.key || ''
  , clientSecret 	= argv.secret || ''
  , appPort 		= argv.port || '3000';
```
	
- `clientId`: OAuth 2.0 Client ID, known as the "API Key" in the AT&T Developer Portal. Defaults to an empty string, so you must either edit the file or provide the `--key` parameter when running the app.
- `clientSecret`: OAuth 2.0 Client Secret, known as the "Secret Key" in the AT&T Developer Portal. Defaults to an empty string, so you must either edit the file or provide the `--secret` parameter when running the app.
- `appPort`: The port upon which the application will run. Defaults to port `3000`. If running other apps on your server, you may need to change the default or provide a different `--port` parameter when running the app.

#### Instantiate an AT&T Speech API Client

```javascript
var Watson = new WatsonClient.Watson({
					client_id: clientId,
					client_secret: clientSecret
				});
```
	
The AT&T Speech API Client can take a variety of parameters:

- `client_id`: **Required.** OAuth 2.0 Client ID. Defaults to `null`.
- `client_secret`: **Required.** OAuth 2.0 Client Secret. Defaults to `null`.
- `access_token`: Optional. If you already have an access token from the OAuth 2.0 Client Credentials flow, you can pre-set it when instantiating the client. Defaults to `null`.
- `context`: Optional. Sets the optimized speech context for the translation. Defaults to `Generic`. In the Advanced example, we use the `BusinessSearch` context to optimize for search for places.
- `scope`: Optional. If you need to customize your app's `X-OAuth-Scope` to access more than just the AT&T Speech API, you can do so by setting this to a comma-separated list of scope values. Defaults to `SPEECH`, the only scope required for any of the examples.
- `access_token_url`: Optional. This is the URL from which the OAuth client will request an access token. Defaults to the OAuth 2.0 access token URL for AT&T's API Platform (`https://api.att.com/oauth/token`).
- `api_domain`: Optional. This is the domain against which the API Client will make requests. Defaults to AT&T's API Platform (`api.att.com`).

Once you have the AT&T Speech API Client created, you can call the methods `getAccessToken` and `speechToText` as needed.

#### Set up the Express.js Application

```javascript
var app = express();
app.configure(function() { … });
```

If you're familiar with Express.js, you've likely got your personally preferred method of configuring Express, but the method included is a pretty standard setup. If you want to learn more about what the individual configuration settings do, the [Express.js API Reference](http://expressjs.com/api.html) is very well documented.

The big thing to note is that views are stored in `app/views/` and static files are stored in `public/` (i.e., `public/flash/`, `public/images/`,  `public/styles/`).

#### Set Up Web Application Routes

`GET '/'`: Defines the base URL. The view is located in the standard Express.js views folder `app/views/` in the `layout.html` file, since we only have the one view.

`POST '/upload'`: Endpoint for saving an audio file to disk. Required for `recorder.swf` to save files to a place that Node.js can access them. In an advanced implementation, this POST is combined with the SpeechToText API Call or unnecessary when using a Streaming Protocol.

`POST '/speechToText'`: Endpoint for sending the AT&T SpeechToText API Call. In this case, we either send back `err` upon an unsuccessful API Call or `reply` upon a successful API Call.

#### Start the Web Application

```javascript
app.listen(appPort);
```
	
The Express Web Application starts listening on whatever port you specified, and now you can visit the web application in the browser.

-------------------------

## Example 2: Speech API + Sphero

The Speech API + Sphero app is the application used at AT&amp;T's DevLab 2012 team hack session. It allows the developer to control their Sphero from their web browser with their voice or some basic user interface controls.

The developers can also construct Sphero Macros and dig into the code to create their own speech commands.

### Using the Speech API + Sphero Example

Connect your Sphero to your computer using Bluetooth. To do so, shake your Sphero until it is blinking various colors. Once it is blinking, you should be able to use your computer's Bluetooth Utility to discover and pair the Sphero to your computer. Once done, you can run the Speech API + Sphero Example to access and control the Sphero.

From the directory you unpacked or cloned the example code into, navigate to `example-sphero` (i.e., `cd example-sphero`). From within this directory, run the package's installation and build scripts (you may require `sudo` when installing in some locations):

	npm install

Once NPM completes its installation and build script, we can run the example's `app.js` file using Node.js. We're using [Optimist](https://npmjs.org/package/optimist), so we can easily append our OAuth 2.0 Client Key (AT&T's "API Key") and Client Secret (AT&T's "Secret Key") along with our preferred port (by default, it uses port `3000`) to customize the example when we run it:

	node app.js --key=ATT_API_KEY --secret=ATT_SECRET_KEY --port=3000

Once the app is running, navigate to [http://localhost:3000](http://localhost:3000) (or wherever you are running the app, if not developing locally).

_Reminder: If you are not running the app locally, your server must have at least one Sphero connected to it via Bluetooth._

### How It Works

#### Require Dependencies

```javascript
var express = require('express')
  , argv = require("optimist").argv
  , fs = require("fs")
  , hbs = require("hbs")
  , Sphero = require("node-sphero")
  , WatsonClient = require("watson-js");
```

- `express`: [Express.js](http://expressjs.com) simplifies routing and creating a simple API for the front-end of our web application.
- `argv`: [Optimist](https://npmjs.org/package/optimist) allows us to parse command-line arguments, allowing customization of defaults without having to edit the application file.
- `fs`: The [Node.js File System](http://nodejs.org/api/fs.html) module allows us to manipulate audio file streams and buffers.
- `hbs`: [HBS](https://npmjs.org/package/hbs) is a view engine that renders [Handlebars.js](http://handlebarsjs.com/) templates in Express.js.
- `Sphero`: [node-sphero](https://npmjs.org/package/node-sphero) handles the serial connection with the Sphero and sending commands back and forth to the Sphero device.
- `WatsonClient`: [Watson.js](https://npmjs.org/package/watson-js) simplifies handling of HTTP requests and OAuth flows with the AT&T Speech API.

#### Configure Defaults

```javascript
var clientId 		= argv.key || ''
  , clientSecret 	= argv.secret || ''
  , appPort 		= argv.port || '3000';
```
	
- `clientId`: OAuth 2.0 Client ID, known as the "API Key" in the AT&T Developer Portal. Defaults to an empty string, so you must either edit the file or provide the `--key` parameter when running the app.
- `clientSecret`: OAuth 2.0 Client Secret, known as the "Secret Key" in the AT&T Developer Portal. Defaults to an empty string, so you must either edit the file or provide the `--secret` parameter when running the app.
- `appPort`: The port upon which the application will run. Defaults to port `3000`. If running other apps on your server, you may need to change the default or provide a different `--port` parameter when running the app.

#### Instantiate an AT&T Speech API Client

```javascript
var Watson = new WatsonClient.Watson({
					client_id: clientId,
					client_secret: clientSecret
				});
```
	
The AT&T Speech API Client can take a variety of parameters:

- `client_id`: **Required.** OAuth 2.0 Client ID. Defaults to `null`.
- `client_secret`: **Required.** OAuth 2.0 Client Secret. Defaults to `null`.
- `access_token`: Optional. If you already have an access token from the OAuth 2.0 Client Credentials flow, you can pre-set it when instantiating the client. Defaults to `null`.
- `context`: Optional. Sets the optimized speech context for the translation. Defaults to `Generic`. In the Advanced example, we use the `BusinessSearch` context to optimize for search for places.
- `scope`: Optional. If you need to customize your app's `X-OAuth-Scope` to access more than just the AT&T Speech API, you can do so by setting this to a comma-separated list of scope values. Defaults to `SPEECH`, the only scope required for any of the examples.
- `access_token_url`: Optional. This is the URL from which the OAuth client will request an access token. Defaults to the OAuth 2.0 access token URL for AT&T's API Platform (`https://api.att.com/oauth/token`).
- `api_domain`: Optional. This is the domain against which the API Client will make requests. Defaults to AT&T's API Platform (`api.att.com`).

Once you have the AT&T Speech API Client created, you can call the methods `getAccessToken` and `speechToText` as needed.

#### Instantiate a Sphero Connection

```javascript
var bot = new Sphero.Sphero();
	bot.connect();
```

This will create a new Sphero server and connect to any Sphero devices available on the computer's Bluetooth connections. Once this is done, you can start sending commands to the Sphero in the form of `bot.command(options)`, where "command" includes the basic commands available to the Sphero device: `roll`, `setHeading`, `setBackLED`, `setRGBLED`, etc.

#### Set up the Express.js Application

```javascript
var app = express();
app.configure(function() { … });
```

If you're familiar with Express.js, you've likely got your personally preferred method of configuring Express, but the method included is a pretty standard setup. If you want to learn more about what the individual configuration settings do, the [Express.js API Reference](http://expressjs.com/api.html) is very well documented.

The big thing to note is that views are stored in `app/views/` and static files are stored in `public/` (i.e., `public/flash/`, `public/images/`,  `public/styles/`).

#### Set Up Web Application Routes

`GET '/'`: Defines the base URL. The view is located in the standard Express.js views folder `app/views/` in the `layout.html` file, since we only have the one view.

`POST '/upload'`: Endpoint for saving an audio file to disk. Required for `recorder.swf` to save files to a place that Node.js can access them. In an advanced implementation, this POST is combined with the SpeechToText API Call or unnecessary when using a Streaming Protocol.

`POST '/speechToText'`: Endpoint for sending the AT&T SpeechToText API Call. In this case, we either send back `err` upon an unsuccessful API Call or `reply` upon a successful API Call.

`POST '/sphero'`: Endpoint for sending core, singular actions to the Sphero device with parameters matching the UI forms on the front-end of the application. Sends back a JSON object with either a success or error message.

`POST '/macro'`: Endpoint for receiving text commands and interpreting them as specific command sets (a.k.a. "macros") for the Sphero device. Intended input is the interpreted text commands from the SpeechToText API Call.

#### Start the Web Application

```javascript
app.listen(appPort);
```
	
The Express Web Application starts listening on whatever port you specified, and now you can visit the web application in the browser.

#### Extending the Web Application with New Macros

Inside the `POST '/macro'` route, there is a `switch` statement that contains all pre-defined macros for the Web Application.

```javascript
app.post('/macro', function(req, res) {
	...
	switch(req.param('command')) {
		case "color red":
			bot.setRGBLED(255, 0, 0, false);
			if(!reply.error && !reply.message) {
				reply.message = 'Color set to red.';
			}
			break;
		…
		case "custom phrase":
			bot.roll(0, 1.0, function() {
				delayer(1000, function() {
					bot.roll(0,0);
				});
			});
			break;
		default:
			break;
	}
	...
});
```

To create a new macro that is activated using the voice command `custom phrase`, you would add a `case` label with the text for the desired phrase, the desired action or actions, and then a `break` to exit the `switch` statement. If you want multiple phrases to match a single macro, you can do that by writing it like the following:

```javascript
case "custom phrase one":
case "custom phrase two":
case "custom phrase three":
	bot.roll(0, 1.0, function() {
		delayer(1000, function() {
			bot.roll(0,0);
		});
	});
	break;
```

#### Sphero API Quick Reference

In all cases, in order to chain commands, you must use the Node.js `callback` paradigm to force the commands to be run in serial. Otherwise, they will run nearly at the same time, out of order, or without a delay. In all of these functions, `callback` is the function to be executed after issuing the command; it defaults to `null`.

- `delayer(delay, callback)`: Not unique to Sphero, this is a convenience closure used to properly set delay timers in Node.js without having to write the closure boilerplate every time
	- `delay`: desired delay in milliseconds (ms) before executing the passed `callback`
- `roll(heading, speed, callback)`: Make the Sphero roll
	- `heading`: heading clockwise relative to the original heading at the time of command issuance (0-359) where 90 is right, 180 is behind, and 270 is left
	- `speed`: speed from 0 (full stop) to 1.0 (full speed ahead)
- `setHeading(heading, callback)`: Make the Sphero turn
	- `heading`: heading clockwise relative to the original heading at the time of command issuance (0-359) where 90 is right, 180 is behind, and 270 is left
- `setBackLED(luminosity, callback)`: Turn the tail light on or off
	- `luminosity`: brightness of LED from 0 (fully off) to 1.0 (fully on)
- `setRGBLED(red, green, blue, persist, callback)`: Change the color of the Sphero's main LEDs
	- `red`: RGB component value for red (0-255)
	- `green`: RGB component value for green (0-255)
	- `blue`: RGB component value for blue (0-255)
	- `persist`: Boolean that defines whether or not the light remains on; does not seem to respond to change in value, though


-------------------------

## Example 3: Advanced Walkthrough

The Advanced Walkthrough is the application to help DevLab attendees understand the integration points for using the Speech API with other platforms, like the [Foursquare API](http://developers.foursquare.com). It's a step-by-step walkthrough of the individual events as they happen. Like the Basic Walkthrough, many of these steps can be automated and/or consolidated into a smaller number of steps:

1. Authorize user's third-party account.
2. Retrieve audio from audio source.
3. Send audio to the AT&T Speech API.
4. Use API Response to do something with third-party service.
5. Use third-party service API Response to do something else.

### Using the Advanced Example

From the directory you unpacked or cloned the example code into, navigate to `example-advanced` (i.e., `cd example-advanced`). Once there, we can run the example's `app.js` file using Node.js. We're using [Optimist](https://npmjs.org/package/optimist), so we can easily append our OAuth 2.0 Client ID (AT&T's "API Key") and Client Secret (AT&T's "Secret Key") along with our preferred port (by default, it uses port `3000`) and Foursquare configuration details to customize the example when we run it:

	node app.js --key=ATT_API_KEY --secret=ATT_SECRET_KEY --port=PORT --foursquareKey=FOURSQUARE_CLIENT_ID --foursquareSecret=FOURSQUARE_CLIENT_SECRET --foursquareRedirect=FOURSQUARE_CALLBACK_URL

Make sure to set the "Callback url" in your Foursquare App's configuration details to whatever URL you are using for the `foursquareRedirect` URL Parameter (and what you set it in your app's routes). By default, the example uses `http://localhost:PORT/callback` where PORT is the port you set (3000 by default).

Once the app is running, navigate to [http://localhost:3000](http://localhost:3000) (or wherever you are running the app, if not developing locally).

### How It Works

#### Require Dependencies

```javascript
var express = require('express')
  , argv = require("optimist").argv
  , fs = require("fs")
  , hbs = require("hbs")
  , WatsonClient = require("watson-js");
```

- `express`: [Express.js](http://expressjs.com) simplifies routing and creating a simple API for the front-end of our web application.
- `argv`: [Optimist](https://npmjs.org/package/optimist) allows us to parse command-line arguments, allowing customization of defaults without having to edit the application file.
- `fs`: The [Node.js File System](http://nodejs.org/api/fs.html) module allows us to manipulate audio file streams and buffers.
- `hbs`: [HBS](https://npmjs.org/package/hbs) is a view engine that renders [Handlebars.js](http://handlebarsjs.com/) templates in Express.js.
- `WatsonClient`: [Watson.js](https://npmjs.org/package/watson-js) simplifies handling of HTTP requests and OAuth flows with the AT&T Speech API.
- Note: [node-4sq](https://npmjs.org/package/node-4sq) is a dependency, but is required in-line when the Foursquare Client is initialized.

#### Configure Defaults

```javascript
var attClientId 			= argv.key || ''
  , attClientSecret 		= argv.secret || ''
  , foursquareClientId 		= argv.foursquareKey || ''
  , foursquareClientSecret	= argv.foursquareSecret || ''
  , foursquareRedirect 		= argv.foursquareRedirect || 'http://localhost:3000/callback'
  , appPort 		= argv.port || '3000';
```
	
- `attClientId`: AT&T OAuth 2.0 Client ID, known as the "API Key" in the AT&T Developer Portal. Defaults to an empty string, so you must either edit the file or provide the `--key` parameter when running the app.
- `attClientSecret`: AT&T OAuth 2.0 Client Secret, known as the "Secret Key" in the AT&T Developer Portal. Defaults to an empty string, so you must either edit the file or provide the `--secret` parameter when running the app.
- `appPort`: The port upon which the application will run. Defaults to port `3000`. If running other apps on your server, you may need to change the default or provide a different `--port` parameter when running the app.
- `foursquareClientId`: Foursquare OAuth 2.0 Client ID. Defaults to an empty string, so you must either edit the file or provide the `--foursquareKey` parameter when running the app.
- `foursquareClientSecret`: Foursquare OAuth 2.0 Client Secret. Defaults to an empty string, so you must either edit the file or provide the `--foursquareSecret` parameter when running the app.
- `foursquareRedirect`: Foursquare OAuth 2.0 Callback URL. Defaults to `http://localhost:3000/callback` to match the default port. If you override the port your app runs on, you should override this value as well. It must match the "Callback url" value in your Foursquare app's configuration.

#### Instantiate an AT&T Speech API Client

```javascript
var Watson = new WatsonClient.Watson({
					client_id: attClientId,
					client_secret: attClientSecret,
					context: "BusinessSearch"
				});
```
	
The AT&T Speech API Client can take a variety of parameters:

- `client_id`: **Required.** OAuth 2.0 Client ID. Defaults to `null`.
- `client_secret`: **Required.** OAuth 2.0 Client Secret. Defaults to `null`.
- `access_token`: Optional. If you already have an access token from the OAuth 2.0 Client Credentials flow, you can pre-set it when instantiating the client. Defaults to `null`.
- `context`: Optional. Sets the optimized speech context for the translation. Defaults to `Generic`. In the Advanced example, we use the `BusinessSearch` context to optimize for search for places.
- `scope`: Optional. If you need to customize your app's `X-OAuth-Scope` to access more than just the AT&T Speech API, you can do so by setting this to a comma-separated list of scope values. Defaults to `SPEECH`, the only scope required for any of the examples.
- `access_token_url`: Optional. This is the URL from which the OAuth client will request an access token. Defaults to the OAuth 2.0 access token URL for AT&T's API Platform (`https://api.att.com/oauth/token`).
- `api_domain`: Optional. This is the domain against which the API Client will make requests. Defaults to AT&T's API Platform (`api.att.com`).

Once you have the AT&T Speech API Client created, you can call the methods `getAccessToken` and `speechToText` as needed.

#### Instantiate a Foursquare API Client

```javascript
var foursquareConfig = {
	"secrets": {
		"clientId": foursquareClientId,
		"clientSecret": foursquareClientSecret,
		"redirectUrl": foursquareRedirect
	}
};
var Foursquare = require("node-foursquare-2")(foursquareConfig);
```

The Foursquare API Client can take a variety of parameters, but the `secrets` object is the only one that we really care about for the purposes of this example:

- `secrets`: **Required.** This is a wrapper for the OAuth-specific configuration settings.
	- `clientId`: **Required.** Foursquare OAuth 2.0 Client ID.
	- `clientSecret`: **Required.** Foursquare OAuth 2.0 Client Secret.
	- `redirectUrl`: Optional. This is the Callback URL for the OAuth 2.0 Authorization flow. By default, it is set in the example app as `http://localhost:3000/callback` but this may need to be modified to match your configuration (both your Foursquare config and development environment).

Once you have the Foursquare API Client created, you can call the various methods associated with it as needed. The version of the Foursquare API Wrapper included is a modified version of the `node-foursquare-2` that includes Checkin Write capabilities with `Core.postApi`, which is not included in the read-only `node-foursquare-2`. These modifications allow POST access to the Foursquare API, but it does not include any shorthand/convenience methods for interacting with the API in this fashion.

#### Set up the Express.js Application

```javascript
var app = express();
app.configure(function() { … });
```

If you're familiar with Express.js, you've likely got your personally preferred method of configuring Express, but the method included is a pretty standard setup. If you want to learn more about what the individual configuration settings do, the [Express.js API Reference](http://expressjs.com/api.html) is very well documented.

The big thing to note is that views are stored in `app/views/` and static files are stored in `public/` (i.e., `public/flash/`, `public/images/`,  `public/styles/`).

#### Set Up Web Application Routes

`GET '/'`: Defines the base URL. The view is located in the standard Express.js views folder `app/views/` in the `layout.html` file, since we only have the one view.

`POST '/upload'`: Endpoint for saving an audio file to disk. Required for `recorder.swf` to save files to a place that Node.js can access them. In an advanced implementation, this POST is combined with the SpeechToText API Call or unnecessary when using a Streaming Protocol.

`POST '/speechToText'`: Endpoint for sending the AT&T SpeechToText API Call. In this case, we either send back `err` upon an unsuccessful API Call or `reply` upon a successful API Call.

`GET '/login'`: Defines the login URL behavior. It first gets the Foursquare OAuth Authorization Redirect URL then redirects the user's web browser to the Foursquare OAuth Authorization page.

`GET '/restart'`: Defines the restart URL behavior. Unlike the Basic Walkthrough that just required a page refresh to start over, the Advanced Walkthrough benefits from wiping out the Foursquare session variable to start the process over. _Note: This does not reauthorize the app on Foursquare. It simply requires the web app to revalidate the user's authorization._

`GET '/callback'`: Defines the callback URL behavior. Completes the Foursquare OAuth 2.0 Authorization grant type flow, sets the user's access token to the Foursquare session variable, and then redirects the user to the primary view.

`POST '/search'`: Endpoint for searching the Foursquare API Venues Platform using the following passed parameters: `latitude`, `longitude`, and `search`. The `latitude` and `longitude` parameters are defined by the HTML5 Geolocation API upon loading the primary view and the `search` parameter is the word or phrase returned by the AT&T SpeechToText API Call.

#### Start the Web Application

```javascript
app.listen(appPort);
```
	
The Express Web Application starts listening on whatever port you specified, and now you can visit the web application in the browser.

-------------------------

## Example 4: VocaLocal

VocaLocal is a stripped-down demo application to help DevLab attendees start working with the Speech API without the extra user interface elements. It is an extension of the Advanced Walkthrough that adds Checkin functionality and displays the results of the two APIs in ways that are contextually relevant to the user.

1. Authorize user's Foursquare account.
2. Retrieve audio from audio source.
3. Send audio to the AT&T Speech API.
4. Use AT&T Speech API Response to search the Venues Platform.
5. Use the Foursquare API Response to display Venues in a list.
6. Check user into the selected Venue using the Foursquare API.

### Using VocaLocal

From the directory you unpacked or cloned the example code into, navigate to `example-vocalocal` (i.e., `cd example-vocalocal`). Once there, we can run the example's `app.js` file using Node.js. We're using [Optimist](https://npmjs.org/package/optimist), so we can easily append our OAuth 2.0 Client ID (AT&T's "API Key") and Client Secret (AT&T's "Secret Key") along with our preferred port (by default, it uses port `3000`) and Foursquare configuration details to customize the example when we run it:

	node app.js --key=ATT_API_KEY --secret=ATT_SECRET_KEY --port=PORT --foursquareKey=FOURSQUARE_CLIENT_ID --foursquareSecret=FOURSQUARE_CLIENT_SECRET --foursquareRedirect=FOURSQUARE_CALLBACK_URL

Make sure to set the "Callback url" in your Foursquare App's configuration details to whatever URL you are using for the `foursquareRedirect` URL Parameter (and what you set it in your app's routes). By default, the example uses `http://localhost:PORT/callback` where PORT is the port you set (3000 by default).

Once the app is running, navigate to [http://localhost:3000](http://localhost:3000) (or wherever you are running the app, if not developing locally).

### How It Works

#### Require Dependencies

```javascript
var express = require('express')
  , argv = require("optimist").argv
  , fs = require("fs")
  , hbs = require("hbs")
  , WatsonClient = require("watson-js");
```

- `express`: [Express.js](http://expressjs.com) simplifies routing and creating a simple API for the front-end of our web application.
- `argv`: [Optimist](https://npmjs.org/package/optimist) allows us to parse command-line arguments, allowing customization of defaults without having to edit the application file.
- `fs`: The [Node.js File System](http://nodejs.org/api/fs.html) module allows us to manipulate audio file streams and buffers.
- `hbs`: [HBS](https://npmjs.org/package/hbs) is a view engine that renders [Handlebars.js](http://handlebarsjs.com/) templates in Express.js.
- `WatsonClient`: [Watson.js](https://npmjs.org/package/watson-js) simplifies handling of HTTP requests and OAuth flows with the AT&T Speech API.
- Note: [node-4sq](https://npmjs.org/package/node-4sq) is a dependency, but is required in-line when the Foursquare Client is initialized.

#### Configure Defaults

```javascript
var attClientId 			= argv.key || ''
  , attClientSecret 		= argv.secret || ''
  , foursquareClientId 		= argv.foursquareKey || ''
  , foursquareClientSecret	= argv.foursquareSecret || ''
  , foursquareRedirect 		= argv.foursquareRedirect || 'http://localhost:3000/callback'
  , appPort 		= argv.port || '3000';
```
	
- `attClientId`: AT&T OAuth 2.0 Client ID, known as the "API Key" in the AT&T Developer Portal. Defaults to an empty string, so you must either edit the file or provide the `--key` parameter when running the app.
- `attClientSecret`: AT&T OAuth 2.0 Client Secret, known as the "Secret Key" in the AT&T Developer Portal. Defaults to an empty string, so you must either edit the file or provide the `--secret` parameter when running the app.
- `appPort`: The port upon which the application will run. Defaults to port `3000`. If running other apps on your server, you may need to change the default or provide a different `--port` parameter when running the app.
- `foursquareClientId`: Foursquare OAuth 2.0 Client ID. Defaults to an empty string, so you must either edit the file or provide the `--foursquareKey` parameter when running the app.
- `foursquareClientSecret`: Foursquare OAuth 2.0 Client Secret. Defaults to an empty string, so you must either edit the file or provide the `--foursquareSecret` parameter when running the app.
- `foursquareRedirect`: Foursquare OAuth 2.0 Callback URL. Defaults to `http://localhost:3000/callback` to match the default port. If you override the port your app runs on, you should override this value as well. It must match the "Callback url" value in your Foursquare app's configuration.

#### Instantiate an AT&T Speech API Client

```javascript
var Watson = new WatsonClient.Watson({
					client_id: attClientId,
					client_secret: attClientSecret,
					context: "BusinessSearch"
				});
```
	
The AT&T Speech API Client can take a variety of parameters:

- `client_id`: **Required.** OAuth 2.0 Client ID. Defaults to `null`.
- `client_secret`: **Required.** OAuth 2.0 Client Secret. Defaults to `null`.
- `access_token`: Optional. If you already have an access token from the OAuth 2.0 Client Credentials flow, you can pre-set it when instantiating the client. Defaults to `null`.
- `context`: Optional. Sets the optimized speech context for the translation. Defaults to `Generic`. In the Advanced example, we use the `BusinessSearch` context to optimize for search for places.
- `scope`: Optional. If you need to customize your app's `X-OAuth-Scope` to access more than just the AT&T Speech API, you can do so by setting this to a comma-separated list of scope values. Defaults to `SPEECH`, the only scope required for any of the examples.
- `access_token_url`: Optional. This is the URL from which the OAuth client will request an access token. Defaults to the OAuth 2.0 access token URL for AT&T's API Platform (`https://api.att.com/oauth/token`).
- `api_domain`: Optional. This is the domain against which the API Client will make requests. Defaults to AT&T's API Platform (`api.att.com`).

Once you have the AT&T Speech API Client created, you can call the methods `getAccessToken` and `speechToText` as needed.

#### Instantiate a Foursquare API Client

```javascript
var foursquareConfig = {
	"secrets": {
		"clientId": foursquareClientId,
		"clientSecret": foursquareClientSecret,
		"redirectUrl": foursquareRedirect
	}
};
var Foursquare = require("node-foursquare-2")(foursquareConfig);
```

The Foursquare API Client can take a variety of parameters, but the `secrets` object is the only one that we really care about for the purposes of this example:

- `secrets`: **Required.** This is a wrapper for the OAuth-specific configuration settings.
	- `clientId`: **Required.** Foursquare OAuth 2.0 Client ID.
	- `clientSecret`: **Required.** Foursquare OAuth 2.0 Client Secret.
	- `redirectUrl`: Optional. This is the Callback URL for the OAuth 2.0 Authorization flow. By default, it is set in the example app as `http://localhost:3000/callback` but this may need to be modified to match your configuration (both your Foursquare config and development environment).

Once you have the Foursquare API Client created, you can call the various methods associated with it as needed. The version of the Foursquare API Wrapper included is a modified version of the `node-foursquare-2` that includes Checkin Write capabilities with `Core.postApi`, which is not included in the read-only `node-foursquare-2`. These modifications allow POST access to the Foursquare API, but it does not include any shorthand/convenience methods for interacting with the API in this fashion.

#### Set up the Express.js Application

```javascript
var app = express();
app.configure(function() { … });
```

If you're familiar with Express.js, you've likely got your personally preferred method of configuring Express, but the method included is a pretty standard setup. If you want to learn more about what the individual configuration settings do, the [Express.js API Reference](http://expressjs.com/api.html) is very well documented.

The big thing to note is that views are stored in `app/views/` and static files are stored in `public/` (i.e., `public/flash/`, `public/images/`,  `public/styles/`).

#### Set Up Web Application Routes

`GET '/'`: Defines the base URL. The view is located in the standard Express.js views folder `app/views/` in the `layout.html` file, since we only have the one view.

`POST '/upload'`: Endpoint for saving an audio file to disk. Required for `recorder.swf` to save files to a place that Node.js can access them. In an advanced implementation, this POST is combined with the SpeechToText API Call or unnecessary when using a Streaming Protocol.

`POST '/speechToText'`: Endpoint for sending the AT&T SpeechToText API Call. In this case, we either send back `err` upon an unsuccessful API Call or `reply` upon a successful API Call.

`GET '/login'`: Defines the login URL behavior. It first gets the Foursquare OAuth Authorization Redirect URL then redirects the user's web browser to the Foursquare OAuth Authorization page.

`GET '/restart'`: Defines the restart URL behavior. Unlike the Basic Walkthrough that just required a page refresh to start over, the Advanced Walkthrough benefits from wiping out the Foursquare session variable to start the process over. _Note: This does not reauthorize the app on Foursquare. It simply requires the web app to revalidate the user's authorization._

`GET '/callback'`: Defines the callback URL behavior. Completes the Foursquare OAuth 2.0 Authorization grant type flow, sets the user's access token to the Foursquare session variable, and then redirects the user to the primary view.

`POST '/search'`: Endpoint for searching the Foursquare API Venues Platform using the following passed parameters: `latitude`, `longitude`, and `search`. The `latitude` and `longitude` parameters are defined by the HTML5 Geolocation API upon loading the primary view and the `search` parameter is the word or phrase returned by the AT&T SpeechToText API Call.

`POST '/checkin'`: Endpoint for checking into a Venue via the Foursquare API. Creates a `latitude` and `longitude` object (`LatLng` or `ll`) using the HTML5 Geolocation API data and combines this with the selected `VenueId` to check the user into the selected venue.

#### Start the Web Application

```javascript
app.listen(appPort);
```
	
The Express Web Application starts listening on whatever port you specified, and now you can visit the web application in the browser.
