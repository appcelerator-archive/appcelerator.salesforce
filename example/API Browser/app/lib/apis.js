var salesforce = require('appcelerator.salesforce');

// Create an instance of our connected application
var connectedApp = new salesforce.ConnectedApp({
	clientId : Alloy.CFG.clientId,
	clientSecret : Alloy.CFG.clientSecret,
	securityToken : Alloy.CFG.securityToken,
	apiVersion : 'v26.0'
});

var lastId = Ti.App.Properties.getString('lastId');
var lastImageId = Ti.App.Properties.getString('lastImageId');

exports.versions = function(logResults) {
	salesforce.versions({
		success : logResults,
		error : logResults
	});
};

exports.login = function(logResults) {
	connectedApp.login({
		success : logResults,
		error : logResults
	});
};

exports.loginApi = function(logResults) {
	connectedApp.loginApi({
		username : Alloy.CFG.username,
		password : Alloy.CFG.password,
		success : logResults,
		error : logResults
	});
};

exports.logout = function(logResults) {
	connectedApp.logout({
		success : logResults,
		error : logResults
	});
};

exports.refresh = function(logResults) {
	connectedApp.refresh({
		success : logResults,
		error: logResults
	});
};

exports.sobjects = function(logResults) {
	connectedApp.sobjects({
		success : logResults,
		error : logResults
	});
};

exports.metadata = function(logResults) {
	connectedApp.metadata({
		name: 'Account',
		success : logResults,
		error : logResults
	});
};

exports.describe = function(logResults) {
	connectedApp.describe({
		name: 'Account',
		success : logResults,
		error : logResults
	});
};

exports.create = function(logResults) {
	connectedApp.create({
		name: 'Account',
		data: {
			"Name" : "Express Logistics and Transport"
		},
		success : function(results, meta) {
			logResults(results,  meta);
			lastId = results.id;
			// Persist the id 
			Ti.App.Properties.setString('lastId', lastId);
		},
		error : logResults
	});
};

exports.retrieve = function(logResults) {
	connectedApp.retrieve({
		name: 'Account',
		id: lastId,
		success : logResults,
		error : logResults,
		progress: function(progress) {
			Ti.API.info((progress * 100) + '%');
		}
	});
};

exports.update = function(logResults) {
	connectedApp.update({
		name: 'Account',
		id: lastId,
		data: {
		    "BillingCity" : "San Francisco"
		},
		success : logResults,
		error : logResults
	});
};

exports.remove = function(logResults) {
	connectedApp.remove({
		name: 'Account',
		id: lastId,
		success : logResults,
		error : logResults
	});
};

exports.query = function(logResults) {
	connectedApp.query({
		soql: 'SELECT name from Account',
		success : logResults,
		error : logResults
	});
};

exports.searchQuery = function(logResults) {
	connectedApp.searchQuery({
		sosl: 'FIND {express}',
		success : logResults,
		error : logResults
	});
};

exports.searchScopeOrder = function(logResults) {
	connectedApp.searchScopeOrder({
		success : logResults,
		error : logResults
	});
};

exports.upsertBlob = function(logResults) {
	var file = Ti.Filesystem.getFile('appIcon.png');
	if (!file.exists()) {
		throw new Error('Missing `appicon.png` file');
	}
	var blob = file.read();

	connectedApp.upsertBlob({
		name: 'Document',
		blobField: 'Body',
		data: {
			"Name" : "App Icon",
			"FolderId": "00li0000000UAFuAAO",
			"Body": blob,
			"Type": 'png'
			// ContentType automatically determined from blob's mime type
		},
		success : function(results, meta) {
			logResults(results, meta);
			lastImageId = results.id;
			// Persist the image id
			Ti.App.Properties.setString('lastImageId', lastImageId);
		},
		error : logResults
	});
};

exports.retrieveBlob = function(logResults) {
	connectedApp.retrieveBlob({
		name: 'Document',
		id: lastImageId,
		blobField: 'Body',
		success : function(results, meta) {
			logResults(results, meta);
		},
		error : logResults,
		progress: function(progress) {
			Ti.API.info((progress * 100) + '%');
		}
	});
};

exports.upsertExternal = function(logResults) {
	connectedApp.upsertExternal({
		name: 'Account',
		fieldName: 'customExtIdField__c',
		fieldValue: '11999',
		data: {
			"Name" : "California Wheat Corporation",
			"Type" : "New Customer"
		},
		success : logResults,
		error : logResults
	});
};

exports.retrieveExternal = function(logResults) {
	connectedApp.retrieveExternal({
		name: 'Account',
		fieldName: 'customExtIdField__c',
		fieldValue: '11999',
		success : logResults,
		error : logResults
	});
};
