/**
 * Salesforce Module
 *
 * Copyright (c) 2011-2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 *
 * This module provides access to the Force.com REST API. To use this module:
 *
 * 1. Require the module
 *    var Salesforce = require('appcelerator.salesforce');
 *
 * 2. Create a 'connected app' object for each salesforce app instance
 *
 *    var connectedApp = new Salesforce.ConnectedApp({
 *            consumerKey : <DEVELOPER CONSUMER KEY>,
 *            consumerSecret : <DEVELOPER CONSUMER SECRET>
 *        });
 *
 * 3. Login using either the username-password (API) or user-agent flow (web page)
 *
 *    	connectedApp.securityToken = <SECURITY TOKEN>;
 *      connectedApp.loginApi({
 *          username : <USERNAME>,
 *          password : <PASSWORD>,
 *          success : function(e, meta) {...},
 *          error : function(e, meta) {...}
 *      });
 *
 *      -or-
 *
 *      connectedApp.login({
 *          success : function(e, meta) {...},
 *          error : function(e, meta) {...}
 *      });
 *
 *  All of the exposed methods accepts a dictionary of arguments for extensibility.
 *  Required dictionary properties are validated and optional properties are
 *  utilized when provided or passed on through to the http request.
 *
 *  Refer to the documentation for details about each method.
 *
 *  NOTE: For security reasons, the module does not persist any of the authentication
 *  information itself. If the application requires persistence of authentication
 *  information it must do that itself and set the properties on the ConnectedApp
 *  object.
 */

var DEFAULT_INSTANCE_URL = 'http://na1.salesforce.com';
var DEFAULT_API_VERSION = 'v26.0';
var DEFAULT_LOGINAPI_URL = 'https://login.salesforce.com/services/oauth2/token';
var DEFAULT_LOGIN_URL = 'https://login.salesforce.com/services/oauth2/authorize';
var DEFAULT_REDIRECT_URI = 'https://login.salesforce.com/services/oauth2/success';
var DEFAULT_TIMEOUT = 5000;
var STATUS_OK = 'HTTP/1.1 200 OK';
var STATUS_ERROR = 'ERROR';

//-----------------------------------------------------------------------------
// Organization APIs
//-----------------------------------------------------------------------------

exports.versions = function(args) {
	// This api does not require authentication, so we let the caller specify the
	// instance URL and fall back to the default URL if not set
	var instanceUrl = args.instanceUrl || DEFAULT_INSTANCE_URL;
	httpRequest({
		type: 'GET',
		url: instanceUrl + '/services/data/',
		success: args.success,
		error: args.error,
		progress: args.progress,
		beforeSend: args.beforeSend,
		accept: args.accept || 'application/json'
	 });
};

//-----------------------------------------------------------------------------
// ConnectedApp
//
// This class provides all of the APIs for an individual connected app instance.
//
// The general flow of each API call should be:
//   this.operations.validate(args, {
//     ...<validations>...
//   }).then(function() {
//     ...<request preparation>...
//   }).sendRequest(args, {
//     ...<request>
//   });
//-----------------------------------------------------------------------------

exports.ConnectedApp = ConnectedApp;

function ConnectedApp(args) {
	args = args || {};

	if (!args.consumerKey) {
		Ti.API.warn('consumerKey is missing');
	}
	if (!args.consumerSecret) {
		Ti.API.warn('consumerSecret is missing.');
	}

	// General properties
	this.apiVersion = args.apiVersion || DEFAULT_API_VERSION;
	this.instanceUrl = null;
	this.timeout = args.timeout || DEFAULT_TIMEOUT;

	// Authentication properties
	this.consumerKey = args.consumerKey;
	this.consumerSecret = args.consumerSecret;
	this.currentUser = args.currentUser || null;
	this.securityToken = args.securityToken || '';
	this.accessToken = args.accessToken;
	this.refreshToken = args.refreshToken;
	this.isLoggedIn = false;
	this.loginUrl = args.loginUrl;
	this.redirectUri = args.redirectUri || DEFAULT_REDIRECT_URI;
	this.headers = null;
	this.contentType = args.contentType || 'application/json';
	this.accept = args.accept || 'application/json';

	// Cascading operations controller
	this.operations = new Operations(this);
}

ConnectedApp.prototype.sobjects = function(args) {
	this.operations.validate(args, {
		authorized: true
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/'
	});
};

ConnectedApp.prototype.metadata = function(args) {
	this.operations.validate(args, {
		authorized: true,
		required: [ 'name' ]
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + args.name
	});
};

ConnectedApp.prototype.describe = function(args) {
	this.operations.validate(args, {
		authorized: true,
		required: [ 'name' ]
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + args.name + '/describe'
	});
};

ConnectedApp.prototype.create = function(args) {
	this.operations.validate(args, {
		authorized: true,
		required: [ 'name', 'data' ]
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + args.name,
		type: 'POST',
		data: args.data
	});
};

ConnectedApp.prototype.retrieve = function(args) {
	var url;

	this.operations.validate(args, {
		authorized: true,
		required: [ 'name', 'id' ]
	}).then(function() {
		url = this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + args.name + '/' + args.id;
		// Handle optional args
		if (args.fields) {
			if (args.fields instanceof Array) {
				url += '?fields=' + args.fields.join(',');
			} else {
				url += '?fields=' + args.fields;
			}
		}
	}).sendRequest(args, {
		url: url
	});
};

ConnectedApp.prototype.update = function(args) {
	this.operations.validate(args, {
		authorized: true,
		required: [ 'name', 'id', 'data' ]
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + args.name + '/' + args.id + '?_HttpMethod=PATCH',
		type: 'POST',
		data: args.data
	});
};

ConnectedApp.prototype.remove = function(args) {
	this.operations.validate(args, {
		authorized: true,
		required: [ 'name', 'id' ]
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + args.name + '/' + args.id,
		type: 'DELETE'
	});
};

ConnectedApp.prototype.upsertBlob = function(args) {
	var url, contentType;
	var encodedBlob, blobElement, textNode;

	this.operations.validate(args, {
		authorized: true,
		required: [ 'name', 'data', 'blob', 'blobField' ]
	}).then(function() {
		url = this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + args.name;
		// If an id is provided then this is an update request -- adjust the URL accordingly
		if (args.id) {
			url += '/' + args.id + '?_HttpMethod=PATCH';
		}

		contentType = args.contentType || this.contentType;

		// Set the blob field value
		// Base64 encode the blob data
		encodedBlob = '' + Ti.Utils.base64encode(args.blob);

		if (isJSON(contentType)) {
			args.data[args.blobField] = encodedBlob;
		} else if (isXML(contentType)) {
			blobElement = args.data.createElement(args.blobField);
			textNode = args.data.createTextNode(encodedBlob);
			blobElement.appendChild(textNode);
			args.data.documentElement.appendChild(blobElement);
		}
	}).sendRequest(args, {
		url: url,
		type: 'POST',
		data: args.data
	}).then(function() {
		// Remove the value that we added for the request
		if (isJSON(contentType)) {
			delete args.data[args.blobField];
		} else if (isXML(contentType)) {
			args.data.documentElement.removeChild(blobElement);
		}
	});
};

ConnectedApp.prototype.retrieveBlob = function(args) {
	this.operations.validate(args, {
		authorized: true,
		required: [ 'name', 'id', 'blobField' ]
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + args.name + '/' + args.id + '/' + args.blobField
	});
};

ConnectedApp.prototype.retrieveExternal = function(args) {
	this.operations.validate(args, {
		authorized: true,
		required: [ 'name', 'fieldName', 'fieldValue' ]
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + args.name + '/' + args.fieldName + '/' + args.fieldValue
	});
};

ConnectedApp.prototype.upsertExternal = function(args) {
	this.operations.validate(args, {
		authorized: true,
		required: [ 'name', 'fieldName', 'fieldValue', 'data' ]
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + args.name + '/' + args.fieldName + '/' + args.fieldValue + '?_HttpMethod=PATCH',
		type: 'POST',
		data: args.data
	});
};

ConnectedApp.prototype.query = function(args) {
	//DOC: If the initial query returns only part of the results, the end of the response will contain a field called nextRecordsUrl.
	// In such cases, request the next batch of records and repeat until all records have been retrieved. These requests use nextRecordsUrl, and do not include any parameters.
	var url = null;

	this.operations.validate(args, {
		authorized: true,
		required: [ 'soql' ]
	}).then(function() {
		if (args.nextRecordsUrl) {
			url = this.instanceUrl + args.nextRecordsUrl;
		} else {
			url = this.instanceUrl + '/services/data/' + this.apiVersion + '/query?q=' + encodeURIComponent(args.soql || '');
		}
	}).sendRequest(args, {
		url: url
	});
};

ConnectedApp.prototype.searchQuery = function(args) {
	this.operations.validate(args, {
		authorized: true,
		required: [ 'sosl' ]
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/search?q=' + encodeURIComponent(args.sosl || '')
	});
};

ConnectedApp.prototype.searchScopeOrder = function(args) {
	this.operations.validate(args, {
		authorized: true
	}).sendRequest(args, {
		url: this.instanceUrl + '/services/data/' + this.apiVersion + '/search/scopeOrder'
	});
};

ConnectedApp.prototype.loginApi = function(args) {
	var argsProp = null, host = this;

	this.operations.validate(args, {
		required: [ 'username', 'password' ]
	}).then(function() {
		// Shallow copy the arguments since we need to override the success callback
		argsProp = copyProperties(args);
		argsProp.success = function(e, meta) {
			parseAuthResponse.call(host, e);
			args.success && args.success(e, meta);
		};
	}).sendRequest(argsProp, {
		url: this.loginUrl || DEFAULT_LOGINAPI_URL,
		type: 'POST',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		accept: 'application/json',
		headers: [],
		data: {
			grant_type: "password",
			username: args.username,
			password: args.password + (args.securityToken || this.securityToken || ''),
			client_id: this.consumerKey,
			client_secret: this.consumerSecret
		}
	});
};

ConnectedApp.prototype.login = function(args) {
	var host = this, loggedIn = false, response = {};
	var modal, webView, closeButton;
	var redirectUri = this.redirectUri;
	var meta = {
		url: getAuthorizeUrl(this.loginUrl || DEFAULT_LOGIN_URL, this.consumerKey, this.redirectUri)
	};

	// If the caller provides a window then use it; otherwise, create the default window
	if (args.window) {
		modal = args.window;
	} else {
		modal = Ti.UI.createWindow({
			title: args.title || 'salesforce',
			width: args.width || '100%',
			height: args.height || '100%'
		});

		if (Ti.Platform.osname != 'android') {
			closeButton = Ti.UI.createButton({
				title: 'Close'
			});
			closeButton.addEventListener('click', function(){
				modal.close();
			});
			modal.leftNavButton = closeButton;
		}
	}
	modal.addEventListener('close', closeHandler);

	// If the caller provides a webView then use it; otherwise, create the default webView
	if (args.webView) {
		webView = args.webView;
	} else {
		webView = Ti.UI.createWebView({
			scalesPageToFit: args.scalesPageToFit || true,
			showScrollbars: args.showScrollbars || true
		});
	}
	webView.url = meta.url;
	webView.addEventListener('beforeload', checkResponse);
	webView.addEventListener('load', checkResponse);

	// Create the loading indicator
	var loading = Ti.UI.createLabel({
		text: 'Loading, please wait...',
		color: 'black',
		width: Ti.UI.SIZE || 'auto',
		height: Ti.UI.SIZE || 'auto',
		zIndex: 100
	});

	function closeHandler() {
		Ti.API.debug("SalesForce Login Successful - Token: " + host.accessToken);

		if (loggedIn) {
			meta.status = 200;
			meta.statusText = STATUS_OK;
			args.success && args.success(response, meta);
		} else {
			meta.status = 401;
			meta.statusText = STATUS_ERROR;	// Cancelled
			if (response && !response.message) {
				response.message = 'Login cancelled';
			}
			args.error && args.error(response, meta);
		}

		webView = modal = loading = response = null;
	}

	modal.add(webView);
	modal.add(loading);
	modal.open({
		modal: true
	});

	function decodeOAuthResponse(fragment) {
		var result = {};
		if (fragment) {
			var nvps = fragment.split('&');
			for (var nvp in nvps) {
				if (nvps.hasOwnProperty(nvp)) {
					var parts = nvps[nvp].split('=');
					result[parts[0]] = decodeURIComponent(parts[1]);
				}
			}
		}

		if (typeof result['access_token'] === 'undefined') {
			result.message = 'OAuth access token is undefined';
		} else {
			parseAuthResponse.call(host, result);
			host.oauthHeader = "OAuth "+host.accessToken;
			loggedIn = true;
		}

		return result;
	}

	function checkResponse(e) {
		var url = decodeURIComponent(e.url);

		// If the url is the redirectUri then we have our response
		if (url.lastIndexOf(redirectUri + '#', 0) === 0) {
			var result = url.substring(redirectUri.length + 1);
			if (result && result.length > 0) {
				response = decodeOAuthResponse(result);
			}
			// We received either a 'success' or 'cancel' response
			webView.removeEventListener('beforeload', checkResponse);
			webView.removeEventListener('load', checkResponse);

			modal && modal.close();
		}

		if (loading && (e.type == 'load')) {
			modal.remove(loading);
			loading = null;
		}
	}
};

ConnectedApp.prototype.logout = function(args) {
	this.instanceUrl = null;
	this.accessToken = null;
	this.refreshToken = null;
	this.isLoggedIn = false;
	Ti.API.debug("SalesForce logout Successful");
	args.success && args.success({},
		{
			status: 200,
			statusText: STATUS_OK
		}
	);
};

ConnectedApp.prototype.refresh = function(args) {
	var argsProp = null, host = this;

	// Shallow copy the arguments since we need to override the success callback
	argsProp = copyProperties(args);
	argsProp.success = function(e, meta) {
		parseAuthResponse.call(host, e);
		args.success && args.success(e, meta);
	};
	this.operations.sendRequest(argsProp, {
		url: this.loginUrl || DEFAULT_LOGINAPI_URL,
		type: 'POST',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		accept: 'application/json',
		data: {
			grant_type: "refresh_token",
			refresh_token: args.refreshToken || this.refreshToken,
			client_id: this.consumerKey,
			client_secret: this.consumerSecret
		}
	});
};

//-----------------------------------------------------------------------------
// Operations
//
// This class provides support for cascading / chained operations
//-----------------------------------------------------------------------------

function Operations(host) {
	this.host = host;
}

Operations.prototype.nop = function() {
	// A 'nop' operation object can be returned when the caller wants to abort
	// any remaining operations in the chain.
	return {
		then: function() { return this; },
		validate: function() { return this; },
		sendRequest: function() { return this; }
	};
};

Operations.prototype.then = function(func) {
	// Call the next operation in the chain in the context of the host object
	return func.apply(this.host, arguments) || this;
};

Operations.prototype.validate = function(args, validations) {
	var message = null;
	var missing = [];

	if (validations) {
		for (v in validations) {
			if (validations.hasOwnProperty(v)) {
				switch (v) {
					case 'authorized': {
						if (!this.host.isLoggedIn) {
							message =  'Not authorized. Please log in.';
						}
						break;
					}

					case 'required': {
						validations[v].forEach(function(element) {
							if (!args[element]) {
								missing.push(element);
							}
						});
						if (missing.length > 0) {
							message = 'Missing parameter(s): ' + missing.join(',');
						}
						break;
					}

					default: {
						throw ('Unknown validation: ' + v);
					}
				}
			}

			if (message) {
				Ti.API.error(message);
				args.error && args.error({ message: message	}, {});
				return this.nop();
			}
		}
	}
	return this;
};

Operations.prototype.sendRequest = function(args, request) {
	request.type = request.type || 'GET';
	request.headers = request.headers || this.host.headers;
	request.timeout = request.timeout || args.timeout || this.host.timeout;
	request.success = request.success || args.success;
	request.error = request.error || args.error;
	request.progress = request.progress || args.progress;
	request.beforeSend = request.beforeSend || args.beforeSend;

	request.contentType = request.contentType || args.contentType || this.host.contentType;
	request.accept = request.accept || args.accept || this.host.accept;

	httpRequest(request);

	return this;
};

//-----------------------------------------------------------------------------
// Utility functions
//-----------------------------------------------------------------------------

function getAuthorizeUrl(loginUrl, consumerKey, redirectUri) {
    return loginUrl + '?display=touch'
        + '&response_type=token&client_id='+encodeURIComponent(consumerKey)
        + '&redirect_uri='+encodeURIComponent(redirectUri);
}

function parseAuthResponse(data) {
	// NOTE You should never reveal these in the console while in production

	this.accessToken = data.access_token || null;
	this.instanceUrl = data.instance_url || null;

	this.currentUser = null;
	if (data.id) {
		var re = /\/id\/(.*)$/;
		var result = re.exec(data.id);
		if (result && result.length == 2) {
		    this.currentUser = result[1];
		}
		Ti.API.debug(this.currentUser);
	}

	// Only set the refresh_token if available. The response from 'refresh' does not include the
	// refresh token so we don't want to clear it out by accident.
	if (data.refresh_token) {
		this.refreshToken = data.refresh_token;
	}

	this.isLoggedIn = true;

	// Update the headers based on the new accessToken
	this.headers = [
		{ name: "Authorization", value: "OAuth "+ this.accessToken },
		{ name: "X-User-Agent", value: "salesforce-toolkit-rest-javascript/" + this.apiVersion }
	];
}

function copyProperties(src) {
	var tgt = {};

	// Shallow copy the object's properties
	for (var prop in src) {
		if (src.hasOwnProperty(prop)) {
			tgt[prop] = src[prop];
		}
	}

	return tgt;
}

function isJSON(str) {
	return str && str.match(/application\/json/i);
}

function isXML(str) {
	return str && str.match(/application\/xml/i);
}

//-----------------------------------------------------------------------------
// HTTP Request
//-----------------------------------------------------------------------------

var	errorDetails=  {
	400: 'The request could not be understood, usually because the JSON or XML body has an error.',
	401: 'The account used has expired or is invalid.',
	403: 'The request has been refused. Verify that the logged-in user has appropriate permissions.',
	404: '404: Resource not found.',
	405: 'The method specified in the Request-Line is not allowed for the resource specified in the URI.',
	415: 'The entity specified in the request is in a format that is not supported by specified resource for the specified method.',
	500: 'An error has occurred within Force.com, so the request could not be completed.'
};

/**
 * Standard HTTP Request
 * @params {Object} params
 * @description The following are valid options:
 *  params.type		    : string GET/POST
 *  params.data		    : mixed The data to pass
 *  params.url			: string The url source to call
 *  params.timeout      : request Request timeout in ms
 *  params.error		: function Function to execute when there is an XHR error
 *  params.success		: function Function to execute on success
 *  params.progress     : function Function to callback with upload/download progress
 *  params.beforeSend   : function Function to call right before sending the request
 *  params.headers      : array Headers to associate with the request
 *  params.contentType  : string Content-Type header
 */

function httpRequest(params) {
	var i, len, body;
	var response = {};
	var meta =  {
		url: params.url,
		bytesSent: 0,
		bytesReceived: 0,
		time: 0
	};

	// Setup the xhr object
	var xhr = Ti.Network.createHTTPClient();

	// Set the timeout or a default if one is not provided
	xhr.timeout = params.timeout || DEFAULT_TIMEOUT;

	// For mobile web CORs
	if(Ti.Platform.osname === "mobileweb") {
		xhr.withCredentials = true;
	}

	function parseResponse(xhr, useData) {
		var text;
		meta.contentType = xhr.getResponseHeader('Content-Type');
		text = xhr.responseText;
		if (text && text.length > 0) {
			meta.bytesReceived = text.length;
		}
		if (isJSON(meta.contentType)) {
			try {
				response = JSON.parse(text);
			} catch (e) {
				response = {};
			}
		} else if (isXML(meta.contentType)) {
			response = xhr.responseXML;
		} else if (useData && meta.contentType) {
			response = xhr.responseData || {};
			meta.bytesReceived = response ? response.length : 0;
		}
		text = null;
	}

	xhr.onload = function() {
		parseResponse(this, true);
		meta.status = this.status;
		meta.statusText = this.statusText;
		Ti.API.debug('Request succeeded (' + meta.bytesReceived + ' bytes, ' + meta.time + ' ms)');

		params.success && params.success(response, meta);
		response = meta = null;
	};

	xhr.onerror = function(e) {
		e = e || {};
		parseResponse(this, false);
		if (response && response instanceof Array) {
			response = response[0] || {};
		}
		meta.status = this.status;
		meta.statusText = this.statusText;
		response.errorCode = response.errorCode || e.code;
		response.details = errorDetails[this.status];
		response.message = response.message || e.error || response.details || 'HTTP/S request failed';
		Ti.API.debug('Network error: ' + response.message + ' (' + meta.bytesReceived + ' bytes, ' + meta.time + ' ms)');

		params.error && params.error(response, meta);
		response = meta = null;
	};

	xhr.onreadystatechange =  function () {
		switch (this.readyState) {
			case 1: // OPENED
				meta.time = new Date();
				break;
			case 4: // DONE
				meta.time = new Date() - meta.time;
				break;
		}
	};

	params.type = params.type ? params.type : "GET";

	// Set the progress callback depending on if this is a download or upload request
	if (params.progress) {
		if (params.type.match(/get/i)) {
			xhr.ondatastream = function(e) {
				params.progress(e.progress);
			};
		} else if (params.type.match(/post/i)) {
			xhr.onsendstream = function(e) {
				params.progress(e.progress);
			};
		}
	}

	// Open the remote connection
	Ti.API.debug('reqUri: ' + params.url);
	xhr.open(params.type, params.url);

	// Attach headers to the request
	if (params.headers) {
		for (i = 0, len = params.headers.length; i < len; i++) {
			xhr.setRequestHeader(params.headers[i].name, params.headers[i].value);
		}
	}

	if (params.accept) {
		xhr.setRequestHeader('Accept', params.accept);
	}

	body = params.data;
	if (body && params.contentType) {
		xhr.setRequestHeader('Content-Type', params.contentType);
		if (typeof body === 'object') {
			if (isJSON(params.contentType)) {
				body = JSON.stringify(body);
			} else if (isXML(params.contentType)) {
				body = Ti.XML.serializeToString(body);
			}
		}
	}

	// Enable compression
	xhr.setRequestHeader('Accept-Encoding', 'gzip');

	meta.bytesSent = (body && body.length) || 0;

	// Allow the application a chance to modify any of the network properties before sending.
	if (params.beforeSend) {
		params.beforeSend(xhr);
	}

	Ti.API.debug('Sending request (' + meta.bytesSent + ' bytes)');
	xhr.send(body);
}