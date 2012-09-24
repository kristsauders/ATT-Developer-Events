## DevLab by AT&T

This is an example of how to use the AT&T Speech API on Node.js, simplified by the [Watson.js](http://github.com/mowens/watson-js/) Node.js module (`watson-js` on NPM). It was prepared for the 2012 AT&amp;T DevLab by [Michael Owens](https://github.com/mowens). It's a step-by-step walkthrough of the individual events as they happen. Realistically, many of these steps can be automated and/or consolidated into three steps:

1. Retrieve audio from audio source.
2. Send audio to the AT&T Speech API.
3. Use API Response to do something.

### Getting Started

In order to run this example, you should have the following:

- AT&T Developer Account [http://j.mp/ATTDevSignUp](http://j.mp/ATTDevSignUp)
- AT&T Application API Key & Secret Key [https://devconnect-api.att.com/](https://devconnect-api.att.com/)
- Node.js (≥ 0.8.6): [http://nodejs.org/](http://nodejs.org/)
- NPM (≥ 1.1.4): _installed with Node.js_
- Adobe Flash Player (≥ 11.4): [http://get.adobe.com/flashplayer/](http://get.adobe.com/flashplayer/)
- Microphone (a headset or boom mic is recommended)
- _**Optional**_ git (≥ 1.7.12): [http://git-scm.com](http://git-scm.com)
- _**Optional**_ GitHub account: [https://github.com](https://github.com)
- Download/unpack or clone the [2012DevLabExamples repo from GitHub](https://github.com/mowens/2012DevLabExamples).
	- For example, in Terminal on OS X: `git clone https://github.com/mowens/2012DevLabExamples.git`

### Miscellaneous

If you are running Mountain Lion (OS X 10.8), the version of Flash shipped with most versions of Chrome are bugged and do not allow the Permissions Dialog to be clicked. Using the latest version of the Flash plugin in either Firefox or Safari has been confirmed to work.

You might be wondering what is with the `// !`-style comments throughout the examples. These are Comment Bookmarks designed to work with code navigators in some text editors (like [Coda](http://www.panic.com/coda/)).

Currently, there is limited logging or stdout in the example apps. There is limited stdout caused by dependencies, but if you want a logging solution to show you more of the raw output, I recommend using [Bunyan](https://npmjs.org/package/bunyan) with its CLI tool to help make the service-level output more clear.

-------------------------

## Example: Basic Walkthrough

The Basic Walkthrough is the application walked through during the AT&amp;T Speech API Deep Dive Presentation. It's a step-by-step walkthrough of the individual events that happen 

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
- `scope`: Optional. If you need to customize your app's `X-OAuth-Scope` to access more than just the AT&T Speech API, you can do so by setting this to a comma-separated list of scope values. Defaults to `SPEECH`, the only scope required for any of the examples.
- `access_token_url`: Optional. This is the URL from which the OAuth client will request an access token. Defaults to the OAuth 2.0 access token URL for AT&T's API Platform (`https://api.att.com/oauth/token`).
- `api_domain`: Optional. This is the domain against which the API Client will make requests. Defaults to AT&T's API Platform (`api.att.com`).

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