/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

module.exports = new function () {
    var finish;
    var valueOf;
    var salesforce;
	var credentials = {};

    this.init = function (testUtils) {
        finish = testUtils.finish;
        valueOf = testUtils.valueOf;
        salesforce = require('appcelerator.salesforce');

	    credentials = {
	        consumerKey : Ti.App.Properties.getString("consumerKey"),
	 		consumerSecret : Ti.App.Properties.getString("consumerSecret"),
	 		securityToken : Ti.App.Properties.getString("securityToken"),
		    username : Ti.App.Properties.getString("username"),
		    password : Ti.App.Properties.getString("password")
	    };
    };

    this.name = "salesforce";

    // Test that module is loaded
    this.testModule = function (testRun) {
        // Verify that the module is defined
        valueOf(testRun, salesforce).shouldBeObject();
        finish(testRun);
    };

	this.testGlobalMethods = function (testRun)
	{
		valueOf(testRun, salesforce.versions).shouldBeFunction();
		valueOf(testRun, salesforce.ConnectedApp).shouldBeFunction();
		finish(testRun);
	};

	this.testConnectedApp = function (testRun) {
		// Create an instance of our connected application
		var connectedApp = new salesforce.ConnectedApp();

		valueOf(testRun, connectedApp).shouldBeObject();
		valueOf(testRun, connectedApp.consumerKey).shouldBeUndefined();
		valueOf(testRun, connectedApp.consumerSecret).shouldBeUndefined();
		valueOf(testRun, connectedApp.securityToken).shouldBe('');
		valueOf(testRun, connectedApp.apiVersion).shouldBe('v26.0');
		valueOf(testRun, connectedApp.instanceUrl).shouldBeNull();
		valueOf(testRun, connectedApp.timeout).shouldBe(5000);
		valueOf(testRun, connectedApp.currentUser).shouldBeNull();
		valueOf(testRun, connectedApp.accessToken).shouldBeUndefined();
		valueOf(testRun, connectedApp.refreshToken).shouldBeUndefined();
		valueOf(testRun, connectedApp.isLoggedIn).shouldBeFalse()
		valueOf(testRun, connectedApp.loginUrl).shouldBeUndefined();
		valueOf(testRun, connectedApp.redirectUri).shouldBe('https://login.salesforce.com/services/oauth2/success');

		valueOf(testRun, connectedApp.sobjects).shouldBeFunction();
		valueOf(testRun, connectedApp.metadata).shouldBeFunction();
		valueOf(testRun, connectedApp.describe).shouldBeFunction();
		valueOf(testRun, connectedApp.create).shouldBeFunction();
		valueOf(testRun, connectedApp.retrieve).shouldBeFunction();
		valueOf(testRun, connectedApp.update).shouldBeFunction();
		valueOf(testRun, connectedApp.remove).shouldBeFunction();
		valueOf(testRun, connectedApp.upsertBlob).shouldBeFunction();
		valueOf(testRun, connectedApp.retrieveBlob).shouldBeFunction();
		valueOf(testRun, connectedApp.retrieveExternal).shouldBeFunction();
		valueOf(testRun, connectedApp.upsertExternal).shouldBeFunction();
		valueOf(testRun, connectedApp.query).shouldBeFunction();
		valueOf(testRun, connectedApp.searchQuery).shouldBeFunction();
		valueOf(testRun, connectedApp.searchScopeOrder).shouldBeFunction();
		valueOf(testRun, connectedApp.loginApi).shouldBeFunction();
		valueOf(testRun, connectedApp.login).shouldBeFunction();
		valueOf(testRun, connectedApp.logout).shouldBeFunction();
		valueOf(testRun, connectedApp.refresh).shouldBeFunction();

		connectedApp = null;

		finish(testRun);
	};

	this.testConnectedAppInstance = function (testRun) {
		// Create an instance of our connected application
		var connectedApp = new salesforce.ConnectedApp({
			consumerKey : credentials.consumerKey,
			consumerSecret : credentials.consumerSecret,
			securityToken : credentials.securityToken,
			apiVersion : 'v26.0'
		});

		valueOf(testRun, connectedApp).shouldBeObject();
		valueOf(testRun, connectedApp.consumerKey).shouldBe(credentials.consumerKey);
		valueOf(testRun, connectedApp.consumerSecret).shouldBe(credentials.consumerSecret);
		valueOf(testRun, connectedApp.securityToken).shouldBe(credentials.securityToken);
		valueOf(testRun, connectedApp.apiVersion).shouldBe('v26.0');
		valueOf(testRun, connectedApp.instanceUrl).shouldBeNull();
		valueOf(testRun, connectedApp.timeout).shouldBe(5000);
		valueOf(testRun, connectedApp.currentUser).shouldBeNull();
		valueOf(testRun, connectedApp.accessToken).shouldBeUndefined();
		valueOf(testRun, connectedApp.refreshToken).shouldBeUndefined();
		valueOf(testRun, connectedApp.isLoggedIn).shouldBeFalse()
		valueOf(testRun, connectedApp.loginUrl).shouldBeUndefined();
		valueOf(testRun, connectedApp.redirectUri).shouldBe('https://login.salesforce.com/services/oauth2/success');

		connectedApp = null;

		finish(testRun);
	};

	this.testErrorCallback = function (testRun) {
		// Create an instance of our connected application
		var connectedApp = new salesforce.ConnectedApp();
		var errorCalled = false;

		function finished() {
			valueOf(testRun, errorCalled).shouldBeTrue();

			connectedApp = null;
			finish(testRun);
		}

		connectedApp.loginApi({
			error: function (e, meta) {
				valueOf(testRun, e.message).shouldBeString();

				errorCalled = true;
				finished();
			}
		});
	};

	this.testCallbacksAndLoginApi = function (testRun) {
		// Create an instance of our connected application
		var connectedApp = new salesforce.ConnectedApp({
			consumerKey : credentials.consumerKey,
			consumerSecret : credentials.consumerSecret,
			securityToken : credentials.securityToken,
			apiVersion : 'v26.0'
		});
		var progressCalled = false;
		var beforeSendCalled = false;
		var successCalled = false;
		var errorCalled = false;

		function finished() {
			valueOf(testRun, successCalled).shouldBeTrue();
			valueOf(testRun, progressCalled).shouldBeTrue();
			valueOf(testRun, beforeSendCalled).shouldBeTrue();
			valueOf(testRun, errorCalled).shouldBeFalse();

			connectedApp = null;
			finish(testRun);
		}

		connectedApp.loginApi({
			username: credentials.username,
			password: credentials.password,
			success: function (e, meta) {
				valueOf(testRun, e).shouldBeObject();
				valueOf(testRun, e.access_token).shouldBeString();
				valueOf(testRun, e.instance_url).shouldBeString();

				valueOf(testRun, connectedApp.currentUser).shouldBeString();
				valueOf(testRun, connectedApp.accessToken).shouldBeString();
				valueOf(testRun, connectedApp.accessToken).shouldBe(e.access_token);
				valueOf(testRun, connectedApp.instanceUrl).shouldBeString();
				valueOf(testRun, connectedApp.instanceUrl).shouldBe(e.instance_url);
				valueOf(testRun, connectedApp.isLoggedIn).shouldBeTrue();

				valueOf(testRun, meta).shouldBeObject();
				valueOf(testRun, meta.url).shouldBeString();
				valueOf(testRun, meta.bytesSent).shouldBeNumber();
				valueOf(testRun, meta.bytesReceived).shouldBeNumber();
				valueOf(testRun, meta.time).shouldBeNumber();
				valueOf(testRun, meta.contentType).shouldBeString();
				valueOf(testRun, meta.status).shouldBeNumber();
				valueOf(testRun, meta.statusText).shouldBeString();

				successCalled = true;
				finished();
			},
			error: function (e, meta) {
				errorCalled = true;
				finished();
			},
			progress: function (p) {
				valueOf(testRun, p).shouldBeNumber();
				progressCalled = true;
			},
			beforeSend: function (x) {
				valueOf(testRun, x).shouldBeObject();
				beforeSendCalled = true;
			}
		});
	};

	this.testNotAuthorized = function (testRun) {
		// Create an instance of our connected application
		var connectedApp = new salesforce.ConnectedApp();
		var index = 0;
		var errorCalled = 0;
		var apis = [
			'sobjects',
			'metadata',
			'describe',
			'create',
			'retrieve',
			'update',
			'remove',
			'upsertBlob',
			'retrieveBlob',
			'retrieveExternal',
			'upsertExternal',
			'query',
			'searchQuery',
			'searchScopeOrder'
		];

		function finished() {
			valueOf(testRun, errorCalled).shouldBe(apis.length);

			connectedApp = null;
			finish(testRun);
		}

		function callNext() {
			connectedApp[apis[index]]({
				error: function (e, meta) {
					valueOf(testRun, e.message).shouldBeString();
					valueOf(testRun, e.message).shouldBe('Not authorized. Please log in.');

					errorCalled++;
					index++;

					if (index == apis.length) {
						setTimeout(finished,1);
					} else {
						setTimeout(callNext,1);
					}
				}
			});
		};

		callNext();
	};

	this.testMissingParameters = function (testRun) {
		// Create an instance of our connected application
		var connectedApp = new salesforce.ConnectedApp();
		var index = 0;
		var errorCalled = 0;
		var apis = [
			//{ api: 'metadata', parameters: 'name' },
			{ api: 'describe', parameters: 'name' },
			{ api: 'create', parameters: 'name,data' },
			{ api: 'retrieve', parameters: 'name,id' },
			{ api: 'update', parameters: 'name,id,data' },
			{ api: 'remove', parameters: 'name,id' },
			{ api: 'upsertBlob', parameters: 'name,data,blobField' },
			{ api: 'retrieveBlob', parameters: 'name,id,blobField' },
			{ api: 'retrieveExternal', parameters: 'name,fieldName,fieldValue' },
			{ api: 'upsertExternal', parameters: 'name,fieldName,fieldValue,data' },
			{ api: 'query', parameters: 'soql' },
			{ api: 'searchQuery', parameters: 'sosl' }
		];

		function finished() {
			valueOf(testRun, errorCalled).shouldBe(apis.length);

			connectedApp = null;
			finish(testRun);
		}

		function callNext() {
			connectedApp[apis[index].api]({
				error: function (e, meta) {
					valueOf(testRun, e.message).shouldBeString();
					valueOf(testRun, e.message).shouldBe('Missing parameter(s): ' + apis[index].parameters);

					errorCalled++;
					index++;

					if (index == apis.length) {
						setTimeout(finished,1);
					} else {
						setTimeout(callNext,1);
					}
				}
			});
		};

		// Fake the module out
		connectedApp.isLoggedIn = true;
		callNext();
	};

	// Populate the array of tests based on the 'hammer' convention
	this.tests = require('hammer').populateTests(this);
}
