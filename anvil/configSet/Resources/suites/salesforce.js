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
    this.init = function (testUtils) {
        finish = testUtils.finish;
        valueOf = testUtils.valueOf;
        salesforce = require('appcelerator.salesforce');
    };

    this.name = "salesforce";

    // Test that module is loaded
    this.testModule = function (testRun) {
        // Verify that the module is defined
        valueOf(testRun, salesforce).shouldBeObject();
        finish(testRun);
    };
 
	// Populate the array of tests based on the 'hammer' convention
	this.tests = require('hammer').populateTests(this);
}
