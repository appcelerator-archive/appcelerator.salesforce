
/**
 * titanium patch for web xhr compatibility
 */

// expose patch

module.exports = patch;

/**
 * xhr polyfill
 */

function XMLHttpRequest() {

  // titanium xhr client

  this._proxy =  Ti.Network.createHTTPClient();

  // mapping for compatible functions

  this.getResponseHeader = this._proxy.getResponseHeader;
  this.open = this._proxy.open;
  this.send = this._proxy.send;
  this.setRequestHeader = this._proxy.setRequestHeader;
  this.abort = this._proxy.abort;
}


Object.defineProperties(XMLHttpRequest.prototype, {
   'onreadystatechange' : {
      set: function (val) {
        return this._proxy.onreadystatechange = val
      }
    },
    'readyState': {
      get: function () {
        return this._proxy.readyState;
      }
    },
    'responseText': {
      get: function () {
        return this._proxy.responseText;
      }
    },
    'responseXML': {
      get: function () {
        return this._proxy.responseXML;
      }
    },
    'status': {
      get: function () {
        return this._proxy.status;
      }
    }
});

XMLHttpRequest.prototype.getAllResponseHeaders = function() {
  return '';
};

function btoa(value) {
  return Ti.Utils.base64encode( value ).toString();
}

/**
 * apply polyfill
 * @param  {Object} global `this`
 * @return {NULL}
 */

function patch (global) {
  global.XMLHttpRequest = XMLHttpRequest;
  global.location = {};
  global.btoa = btoa;
};