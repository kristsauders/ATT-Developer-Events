// !example-advanced.js
/*
 * In practice, most of the jQuery serves no purpose but to change visual indicators; there is no real state management here.
 * In a real app, you would want most of this to be handled by something like Backbone or Ember to manage state for real.
 */

// !FUNC: Syntax Highlighter
function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// !GEO: Activate the HTML5 Geolocation API
function getLocation() {
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(geoPosition, geoError, {enableHighAccuracy:true, timeout:30000, maximumAge:60000 }
);
	} else {
		geoError();
	}
}

// !GEO: Interpret the Geolocation data from the HTML5 Geolocation API, set the hidden inputs (geoDataHTML), and set the Geolocation Status details (geoStatusHTML)
function geoPosition(position) {
	var geoDataHTML = '';
	var geoStatusHTML = 'waiting';
	if (!window.count) window.count = 0;

	if(position.coords.latitude!=null) {
		geoDataHTML += '<input type="hidden" id="latitude" name="latitude" value="' + position.coords.latitude + '" />';
		geoStatusHTML = '';
		geoStatusHTML += 'located: ('  + position.coords.latitude + ',';
	} else {
		geoDataHTML += '<input type="hidden" id="latitude" name="latitude" value="" />';
		geoStatusHTML = 'Unable to determine location';
		$('#status-geolocation').attr('class', 'alert alert-error');
	}
	if(position.coords.longitude!=null) {
		geoDataHTML += '<input type="hidden" id="longitude" name="longitude" value="' + position.coords.longitude + '" />';
		geoStatusHTML += ' ' + position.coords.longitude + ')';
		$('#status-geolocation').attr('class', 'alert alert-success');
	} else {
		geoDataHTML += '<input type="hidden" id="longitude" name="longitude" value="" />';
		geoStatusHTML = 'Unable to determine location';
		$('#status-geolocation').attr('class', 'alert alert-error');
	}
	if(position.coords.altitude!=null) {	
		geoDataHTML += '<input type="hidden" name="altitude" value="' + position.coords.altitude + '" />';
	} else {
		geoDataHTML += '<input type="hidden" name="altitude" value="" />';
	}
	if(position.coords.accuracy!=null) {	
		geoDataHTML += '<input type="hidden" name="accuracy" value="' + position.coords.accuracy + '" />';
	} else {
		geoDataHTML += '<input type="hidden" name="accuracy" value="" />';
	}
	if(position.coords.altitudeAccuracy!=null) {	
		geoDataHTML += '<input type="hidden" name="altitudeAccuracy" value="' + position.coords.altitudeAccuracy + '" />';
	} else {
		geoDataHTML += '<input type="hidden" name="altitudeAccuracy" value="" />';
	}
	if(position.coords.heading!=null && position.coords.heading!=NaN) {
		geoDataHTML += '<input type="hidden" name="heading" value="' + position.coords.heading + '" />';
	} else {
		geoDataHTML += '<input type="hidden" name="heading" value="" />';
	}
	if(position.coords.speed!=null) {	
		geoDataHTML += '<input type="hidden" name="speed" value="' + position.coords.speed + '" />';
	} else {
		geoDataHTML += '<input type="hidden" name="speed" value="" />';
	}
	$('#geoDataResults').html(geoDataHTML);
	$('#status-geolocation strong').html(geoStatusHTML);
}

// !GEO: Geolocation error handling function.
function geoError() {
    return false;
}

// !RECORDER: Event Handler
function microphone_recorder_events() {

  $('#status-mic').html("Audio Status: <strong>" + arguments[0] + "</strong>");

  switch(arguments[0]) {
  
  // !RECORDER: ready -> Set up the Recorder
  case "ready":
  	// Define defaults for the Recorder.
    var width = parseInt(arguments[1]);
    var height = parseInt(arguments[2]);
    Recorder.uploadFormId = "#uploadForm";
    Recorder.uploadFieldName = "upload_file[filename]";
    Recorder.connect("recorderApp", 0);
    Recorder.recorderOriginalWidth = width;
    Recorder.recorderOriginalHeight = height;
    $('#play_button').css({'margin-left': width + 8});
    $('#save_button').css({'width': width, 'height': height});
  	$('#status-mic').attr('class', 'alert alert-info');
  break;

  // !RECORDER: no_microphone_found -> No Microphone was found by Flash to even ask for permissions
  case "no_microphone_found":
  	$('#progress-indicator').attr('class', 'progress progress-striped progress-danger');
  	$('#status-mic').attr('class', 'alert alert-error');
  	$('#status-mic').attr('class', 'alert alert-error');
    break;

  // !RECORDER: microphone_user_request -> Flash is requesting permission to access the microphone
  case "microphone_user_request":
    Recorder.showPermissionWindow();
  	$('#progress-indicator').attr('class', 'progress progress-striped active');
  	$('#status-mic').attr('class', 'alert alert-warning');
    break;

  // !RECORDER: microphone_connected -> Microphone was successfully accessed
  case "microphone_connected":
    var mic = arguments[1]; // The microphone object
    Recorder.defaultSize();
  	$('#status-mic').attr('class', 'alert alert-success');
  	$('#button-connect').attr('disabled', 'disabled');
  	$('#button-connect .action').text('Connected');
  	$('#button-connect .icon-white').attr('class', 'icon-white icon-ok');
  	$('#button-recorder').removeAttr('disabled');
  	$('#button-recorder').attr('class', 'btn btn-large btn-success');
  	$('#button-recorder .icon-music').attr('class', 'icon-music icon-white');
  	$('#progress-02').attr('class', 'completed');
  	$('#progress-03').attr('class', 'active');
  	$('#progress-indicator .bar').css({'width': '25%'});
  	$('#progress-indicator').attr('class', 'progress progress-striped');
  	$('#progress-step').text('3');
  	$('#status-upload').attr('class', 'alert alert-info');
    $('#status-upload').html('Upload Status: <strong>waiting for "' + mic.name + '"</strong>');
    break;

  // !RECORDER: microphone_not_connected -> For some reason, the microphone couldn't connect
  case "microphone_not_connected":
    Recorder.defaultSize();
  	$('#progress-indicator').attr('class', 'progress progress-striped progress-danger');
  	$('#status-mic').attr('class', 'alert alert-error');
  	$('#status-upload').attr('class', 'alert alert-error');
    break;

  // !RECORDER: microphone_activity -> Audio data is successfully being detected by the microphone
  case "microphone_activity":
    $('#status-mic').append(' = <em>' + arguments[1] + '</em>');
    break;

  // !RECORDER: recording -> Microphone is currently streaming audio data to the Flash app
  case "recording":
  	// Note: If the user has previously connected and permitted the Flash app access to the mic, visual indicators need to be updated
  	if($('#progress-step').text()=='2') {
	    var mic = arguments[1];
	    Recorder.defaultSize();
	  	$('#status-mic').attr('class', 'alert alert-success');
	  	$('#button-connect').attr('disabled', 'disabled');
	  	$('#button-connect .action').text('Connected');
	  	$('#button-connect .icon-white').attr('class', 'icon-white icon-ok');
	  	$('#button-recorder').removeAttr('disabled');
	  	$('#button-recorder').attr('class', 'btn btn-large btn-success');
	  	$('#button-recorder .icon-music').attr('class', 'icon-music icon-white');
	  	$('#progress-02').attr('class', 'completed');
	  	$('#progress-03').attr('class', 'active');
	  	$('#progress-indicator .bar').css({'width': '25%'});
	  	$('#progress-indicator').attr('class', 'progress progress-striped');
	  	$('#progress-step').text('3');
	  	$('#status-upload').attr('class', 'alert alert-info');
	    $('#status-upload').html('Upload Status: <strong>waiting for "' + mic.name + '"</strong>');
  	}
  	// Visual indicators for actively recording
    Recorder.hide();
  	$('#status-mic').attr('class', 'alert alert-success');
  	$('#progress-indicator').attr('class', 'progress progress-striped active');
  	$('#button-recorder').attr('class', 'btn btn-large btn-danger');
  	$('#button-recorder .icon-white').attr('class', 'icon-stop icon-white');
  	$('#button-recorder .action').text('Stop');
    break;

  // !RECORDER: recording_stopped -> Recording has stopped.
  case "recording_stopped":
    // Make the Save button clickable
    Recorder.show();
    
    // Visual indicators to show recording stopped
  	$('#status-mic').attr('class', 'alert alert-info');
  	$('#button-recorder').attr('class', 'btn btn-large btn-success');
  	$('#button-recorder .icon-white').attr('class', 'icon-ok icon-white');
  	$('#button-recorder .action').text('Recorded');
  	$('#button-recorder').attr('disabled', 'disabled');
  	$('#button-save .btn').removeAttr('disabled');
  	$('#button-save .btn').attr('class', 'btn btn-large btn-success');
  	$('#button-save .btn .icon-download-alt').attr('class', 'icon-download-alt icon-white');
  	$('#progress-step').text('4');
  	$('#progress-03').attr('class', 'completed');
  	$('#progress-04').attr('class', 'active');
  	$('#progress-indicator .bar').css({'width': '40%'});
  	$('#progress-indicator').attr('class', 'progress progress-striped');
    break;

  // !RECORDER: save_pressed -> Detect the "Save" action in Flash
  case "save_pressed":
    Recorder.updateForm();
    break;

  // !RECORDER: saving -> Save action started
  case "saving":
  	$('#status-upload').attr('class', 'alert alert-info');
  	$('#progress-indicator').attr('class', 'progress progress-striped active');
    break;

  // !RECORDER: saved -> Response to the file upload
  case "saved":
    // Parse the JSON returned by the POST to '/upload'
    var data = $.parseJSON(arguments[2]);
    
    // If it contains a "saved" parameter, then it was successful
    if(data.saved) {
    	// Visual indicators that it saved
  		$('#status-mic').attr('class', 'alert alert-success');
  		$('#status-upload').attr('class', 'alert alert-success');
	  	$('#button-save .btn').attr('class', 'btn btn-large btn-success');
	  	$('#button-save .btn .icon-white').attr('class', 'icon-ok icon-white');
	  	$('#button-save .btn .action').text('Saved');
	  	$('#button-save .btn').attr('disabled', 'disabled');
	  	$('#button-transcribe').removeAttr('disabled');
	  	$('#button-transcribe').attr('class', 'btn btn-large btn-success');
	  	$('#button-transcribe .icon-share-alt').attr('class', 'icon-share-alt icon-white');
  		$('#progress-indicator').attr('class', 'progress progress-striped');
	  	$('#progress-step').text('5');
	  	$('#progress-04').attr('class', 'completed');
	  	$('#progress-05').attr('class', 'active');
	  	$('#progress-indicator .bar').css({'width': '50%'});
	  	Recorder.hide();
    } else {
  		$('#status-upload').attr('class', 'alert alert-error');
    }
    break;

  // !RECORDER: save_failed -> Error indicators if Save fails
  case "save_failed":
  	$('#progress-indicator').attr('class', 'progress progress-striped progress-danger');
  	$('#status-mic').attr('class', 'alert alert-error');
  	$('#status-upload').attr('class', 'alert alert-error');
    break;

  // !RECORDER: save_progress -> Saving starts
  case "save_progress":
    var name = arguments[1]; // Name of the file, if needed
    var bytesLoaded = arguments[2]; // Number of bytes uploaded
    var bytesTotal = arguments[3]; // Total size in bytes of the file
    
  	$('#status-mic').attr('class', 'alert alert-success');
  	$('#status-upload').attr('class', 'alert alert-success');
    $('#status-upload').html("File Progress: <strong>" + bytesLoaded + " / " + bytesTotal + "</strong>");
    break;
  }
}

// !RECORDER: Create Recorder Global to receive externalInterfaceCalls from Flash
Recorder = {
  recorder: null,
  recorderOriginalWidth: 0,
  recorderOriginalHeight: 0,
  uploadFormId: null,
  uploadFieldName: null,

  connect: function(name, attempts) {
    if(navigator.appName.indexOf("Microsoft") != -1) {
      Recorder.recorder = window[name];
    } else {
      Recorder.recorder = document[name];
    }

    // If it continues to fail connecting, just stop trying to connect.
    if(attempts >= 40) {
      return;
    }

    // The Flash app needs a little bit of time to load and initialize
    if(Recorder.recorder && Recorder.recorder.init) {
      Recorder.recorderOriginalWidth = Recorder.recorder.width;
      Recorder.recorderOriginalHeight = Recorder.recorder.height;
      
      // Make sure the hidden upload form and jQuery both exist
      if(Recorder.uploadFormId && $) {
        var frm = $(Recorder.uploadFormId); 
        Recorder.recorder.init(frm.attr('action').toString(), Recorder.uploadFieldName, frm.serializeArray());
      }
      return;
    }

    // Start trying to either access the microphone or activate the Flash permissions dialog
    setTimeout(function() {Recorder.connect(name, attempts+1);}, 100);
  },
  
  record: function(name, filename) {
    Recorder.recorder.record(name, filename);
  },

  resize: function(width, height) {
    Recorder.recorder.width = width + "px";
    Recorder.recorder.height = height + "px";
  },

  defaultSize: function(width, height) {
    Recorder.resize(Recorder.recorderOriginalWidth, Recorder.recorderOriginalHeight);
  },

  show: function() {
  	// Resize the Flash app and make the stage (in this case, a transparent PNG) able to be clicked
    Recorder.resize($('#button-save').width(), $('#button-save').height());
    $('#save_button').css({ width: $('#button-save').width(), height: $('#button-save').height() });
    Recorder.recorder.show();
  },

  hide: function() {
  	// Make the stage (in this case, a transparent PNG) unable to be clicked
    Recorder.recorder.hide();
  },

  updateForm: function() {
    var frm = $(Recorder.uploadFormId); 
    Recorder.recorder.update(frm.serializeArray());
  },

  showPermissionWindow: function() {
    Recorder.resize(240, 160);
    // Give the resize function time to resize the Flash app before showing the permissions dialog
    setTimeout(function(){Recorder.recorder.permit();}, 1);
  }
}

// !RECORDER: Set up and embed the Flash recorder
$(function() {
	var appWidth = 84;
	var appHeight = 38;
	var flashvars = {'event_handler': 'microphone_recorder_events', 'upload_image': '/images/transparent.png'};
	var params = {};
	var attributes = {'id': "recorderApp", 'name':  "recorderApp", 'wmode' : "transparent"};
	swfobject.embedSWF("/flash/recorder.swf", "flashcontent", appWidth, appHeight, "10.1.0", "", flashvars, params, attributes);
});

$(document).ready(function() {
	// !APP: Initialize the Geolocation API
	getLocation();
	
	// !APP: Set up button event handlers
	// Connect the Microphone
	$(document).on('click','#button-connect',function() {
		Recorder.record('audio', '/public/audio/audio.wav');
		return false;
	});
	
	// Start recording with the Microphone
	$(document).on('click','#button-recorder',function() {
		Recorder.record('audio', '/public/audio/audio.wav');
		return false;
	});
	
	// Make sure the save button doesn't do anything unless the Flash object is clicked
	$(document).on('click','#button-save',function() {
		return false;
	});
	
	// Redirect the web browser to the Foursquare login page
	$(document).on('click', '#button-foursquare', function() {
		window.location = 'http://' + window.location.host + '/login';
	});
	
	// Make the Transcribe button POST to the Node.js '/speechToText' route
	$(document).on('click','#button-transcribe',function() {
	
		// Visual indicators
	  	$('#button-transcribe').attr('class', 'btn btn-large btn-info');
	  	$('#button-transcribe .icon-white').attr('class', 'icon-headphones icon-white');
	  	$('#button-transcribe .action').text('Transcribing');
	  	$('#button-transcribe').attr('disabled', 'disabled');
  		$('#progress-indicator').attr('class', 'progress progress-striped active');
	  	$('#progress-step').text('6');
	  	$('#progress-indicator .bar').css({'width': '60%'});
	  	$('#progress-05').attr('class', 'completed');
	  	$('#progress-06').attr('class', 'active');

	  	// The actual POST call
		$.ajax({
			type: "POST",
			url: '/speechToText'
		}).done(function( data ) {
			// Do something with the API Response. In this case, syntax highlight it an show it on the page. Then, set the value of input#search-term to the ResultText parameter of the API response
			$('#transcribe-response').html("<pre>" + syntaxHighlight(data)  + "</pre>");
		  	$('#search-term').val(data.Recognition.NBest[0].ResultText);
			
			// Visual indicators
			$('#transcribe-container').css({ "display": "block" });
			$('#progress-indicator').attr('class', 'progress progress-striped progress-success');
			$('#button-transcribe .action').text('Transcribed');
			$('#progress-indicator .bar').css({'width': '75%'});
			$('#progress-06').attr('class', 'completed');
			$('#progress-07').attr('class', 'active');
			$('#progress-step').text('7');
		  	$('#button-transcribe').attr('class', 'btn btn-large btn-success');
		  	$('#button-transcribe .icon-white').attr('class', 'icon-ok icon-white');
		  	$('#button-search').removeAttr('disabled');
		  	$('#button-search').attr('class', 'btn btn-large btn-success');
		  	$('#button-search .icon-search').attr('class', 'icon-search icon-white');
		});
	});
	
	// Make the Search button POST to the Node.js '/search' route
	$(document).on('click','#button-search',function() {
	
		// Just more visual indicators
	  	$('#button-search').attr('class', 'btn btn-large btn-info');
	  	$('#button-search .icon-white').attr('class', 'icon-headphones icon-white');
	  	$('#button-search .action').text('Searching');
	  	$('#button-search').attr('disabled', 'disabled');
  		$('#progress-indicator').attr('class', 'progress progress-striped active');
	  	$('#progress-indicator .bar').css({'width': '90%'});
		$('#progress-step').text('8');
	  	$('#progress-07').attr('class', 'completed');
	  	$('#progress-08').attr('class', 'active');

		$.ajax({
			type: "POST",
			url: '/search',
			data: {
				latitude: $("#latitude").val(),
				longitude: $("#longitude").val(),
				search: $("#search-term").val()
			}
		}).done(function( data ) {
			// Do something with the API Response. In this case, syntax highlight it an show it on the page
			$('#search-response').html("<pre>" + syntaxHighlight(data)  + "</pre>");
			
			// Just more visual indicators
			$('#search-container').css({ "display": "block" });
			$('#progress-indicator').attr('class', 'progress progress-striped progress-success');
			$('#button-search .action').text('Searched');
			$('#progress-indicator .bar').css({'width': '100%'});
			$('#progress-08').attr('class', 'completed');
			$('#progress-title').text('Progress (Complete)');
		  	$('#button-search').attr('class', 'btn btn-large btn-success');
		  	$('#button-search .icon-white').attr('class', 'icon-ok icon-white');
		});
	});
});