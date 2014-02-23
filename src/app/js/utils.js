/**
 * Emulates Function.bind where it does not exist
 * Code from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
 */
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function () {},
      fBound = function () {
        return fToBind.apply(this instanceof fNOP && oThis
          ? this
          : oThis,
          aArgs.concat(Array.prototype.slice.call(arguments)));
      };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

if (typeof window != 'undefined') {
  // otherwise web workers could not include this utils.js
  window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  })();
  
  // builds basic auth string
  window.makeBasicAuth = function(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return "Basic " + hash;
  }
}

if (!Uint8Array.prototype.equals) {
  Uint8Array.prototype.equals = function (arr) {
    if(arr.length !== this.length)
      return false;

    for (var i = 0; i < this.length; i++) {
      if(this[i] !== arr[i])
        return false;
    }

    return true;
  }
}

function isLocalStorageEnabled () {
  try {
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js, MIT
    localStorage.setItem("a", "a");
    localStorage.removeItem("a");
    return true;
  } catch(e) {
    return false;
  }
}