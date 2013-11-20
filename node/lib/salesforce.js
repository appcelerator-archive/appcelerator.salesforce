
/**
 *  Salesforce API Client
 */

/**
 * module dependencies
 */

var request = require('superagent');

// Sales force auth endpoint

var TOKEN_URL = 'https://login.salesforce.com/services/oauth2/token';

var noop = function (){};

// expose Salesforce

module.exports = Salesforce;

/**
 * [Salesforce description]
 * @param {[type]} obj [description]
 */

function Salesforce(obj) {
  this.url = obj.url;
  this.grantType = obj.grantType;
  this.consumerKey = obj.consumerKey;
  this.consumerSecret = obj.consumerSecret;
  this.username = obj.username;
  this.password = obj.password;
  this.apiVersion = obj.apiVersion || 'v27.0';
}

/**
 * [authorize description]
 * @param  {Function} fn [description]
 * @return {[type]}      [description]
 */

Salesforce.prototype.authorize = function(fn) {
  var callback = fn || noop;
  var self = this;
  var opts = {
    method: 'post',
    type: 'application/x-www-form-urlencoded',
    url: TOKEN_URL,
    data: {
      grant_type: 'password',
      client_id: this.consumerKey,
      client_secret: this.consumerSecret,
      username: this.username,
      password: this.password
    }
  };

  this._request(opts, function(err, res) {
    self.accessToken = res.body.access_token;
    self.instanceUrl = res.body.instance_url;
    callback(err, res);
  });
};

/**
 * [logout description]
 * @param  {[type]} obj [description]
 * @return {[type]}      [description]
 */

Salesforce.prototype.logout = function(fn) {
  var callback = fn || noop;
  this.instanceUrl = null;
  this.accessToken = null;
  callback();
};

/**
 * [version description]
 * @param  {Function} fn [description]
 * @return {[type]}      [description]
 */

Salesforce.prototype.version = function(fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * )
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype.describe = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + obj.name + '/describe'
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [sobjects description]
 * @param  {Function} fn [description]
 * @return {[type]}      [description]
 */

Salesforce.prototype.sobjects = function(fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/'
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [metadata description]
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype.metadata = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + obj.name
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [create description]
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype.create = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'post',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + obj.name,
    data: obj.data
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [retrieve description]
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype.retrieve = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + obj.name + '/' + obj.id
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [query description]
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype.query = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/query',
    query: obj.query
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [update description]
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype.update = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + obj.name + '/' + obj.id + '?_HttpMethod=PATCH'
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [remove description]
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype.remove = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + obj.name + '/' + obj.id
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [retrieveBlob description]
 * @param  {Function} fn [description]
 * @return {[type]}      [description]
 */

Salesforce.prototype.retrieveBlob = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + obj.name + '/' + obj.id + '/' + obj.blobField
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [retrieveExternal description]
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype.retrieveExternal = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + obj.name + '/' + obj.fieldName + '/' + obj.fieldValue
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [upsertExternal description]
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype.upsertExternal = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + obj.name + '/' + obj.fieldName + '/' + obj.fieldValue + '?_HttpMethod=PATCH'
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [searchQuery description]
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype.searchQuery = function(obj, fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/search',
    query: obj.query
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [searchScopeOrder description]
 * @param  {Function} fn [description]
 * @return {[type]}      [description]
 */

Salesforce.prototype.searchScopeOrder = function(fn) {
  var callback = fn || noop;
  var opts = {
    method: 'get',
    type: 'application/json',
    accept: 'application/json',
    url: this.instanceUrl + '/services/data/' + this.apiVersion + '/search/scopeOrder'
  };

  this._request(opts, function(err, res) {
    callback(err, res);
  });
};

/**
 * [_request description]
 * @param  {[type]}   obj [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

Salesforce.prototype._request = function(obj, fn) {
  var callback = fn || noop;

  var req = request[obj.method](obj.url);

  if (obj.data) {req.send(obj.data); }
  if (obj.type) {req.type(obj.type); }
  if (obj.accept) {req.set('Accept', obj.accept); }
  if (obj.query) {req.query(obj.query); }
  if (obj.file) {req.attach(obj.file.name, obj.file.path); }
  if (this.accessToken) {req.set('Authorization', 'OAuth ' + this.accessToken); }

  return req.end(function(err, res) {
    callback(err, res);
  });
};

Salesforce.model = require('./model');

if (Ti instanceof undefined) { Salesforce.patch = require('./tishim'); }
