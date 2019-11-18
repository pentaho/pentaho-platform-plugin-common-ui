/*!
* Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/
define("common-repo/pentaho-ajax",[], function(){});

// Project: pentaho-platform-plugin-common-ui

/* globals CONTEXT_PATH, FULL_QUALIFIED_URL, WEB_CONTEXT_BASE */

// see http://developer.mozilla.org/en/docs/AJAX:Getting_Started for other values
var COMPLETE = 4;

// see http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html for other values
var STATUS_OK = 200;
var STATUS_UNAUTHORIZED = 401;
var STATUS_NOT_FOUND = 404;

var base = '';

var pathArray = window.location.pathname.split( '/' );
var webAppPath = "/" + pathArray[1];

/**
 * @param {String} solution - name of the solution containing the action sequence definition being called
 * @param {String} path - path to the action sequence definition being called
 * @param {String} action - name of the action sequence definition being called
 * @param {Array} params - Array containing the parameters for the query string
 * @param {String|Object|Function} [callback] - Refers to the function to call when the client
 *        receives the server's response. If the parameter is:
 *          - null or undefined:
 *            the request to the server is synchronous, and the response is returned by this method.
 *          - of type String or string
 *            the name of the function to call
 *          - of type function
 *            the function object to call
 *          - of type object, where the object has the properties obj and method:
 *            callback.obj is the object to call the method callback.method on, e.g. obj.method()
 *
 * @return String containing the server's response if callback is not null or undefined,
 * null if the call is asynchronous.
 *
 * @throws Error when unable to create an XMLHttpRequest object
 */
function pentahoAction(solution, path, action, params, callback) {
  var viewActionParams = (params || []).concat(
    ["wrapper", "false"], ["solution", solution], ["path", path], ["action", action]
  );

  var url = WEB_CONTEXT_BASE + "ViewAction";
  var query = __buildQueryParams(viewActionParams);

  return pentahoPost(url, query, callback);
}

/**
 * @param {String} component
 * @param {Array} params - Array containing the parameters for the query string
 * @param {String|Object|Function} [callback] - Refers to the function to call when the client
 *        receives the server's response. If the parameter is:
 *          - null or undefined:
 *            the request to the server is synchronous, and the response is returned by this method.
 *          - of type String or string
 *            the name of the function to call
 *          - of type function
 *            the function object to call
 *          - of type object, where the object has the properties obj and method:
 *            callback.obj is the object to call the method callback.method on, e.g. obj.method()
 * @param {String} [mimeType] - specifies the mime type of the response
 *
 * @return String containing the server's response if callback is not null or undefined,
 * null if the call is asynchronous.
 *
 * @throws Error when unable to create an XMLHttpRequest object
 */
function pentahoService(component, params, callback, mimeType) {
  var serviceActionParams = (params || []).concat(
    ["ajax", "true"], (component ? ["component", component] : undefined)
  );

  var url = FULL_QUALIFIED_URL + "ServiceAction";

  var query = __buildQueryParams(serviceActionParams);

  return pentahoPost(url, query, callback, mimeType);
}

/**
 * @param {String} url - url of the web service/servlet
 * @param {String} query - containing the message to send to the server
 * @param {String|Object|Function} [callback] Refers to the function to call when the client
 *        receives the server's response. If the parameter is:
 *          - null or undefined:
 *            the request to the server is synchronous, and the response is returned by this method.
 *          - of type String or string
 *            the name of the function to call
 *          - of type function
 *            the function object to call
 *          - of type object, where the object has the properties obj and method:
 *            callback.obj is the object to call the method callback.method on, e.g. obj.method()
 * @param {String} [mimeType] - specifies the mime type of the response
 * @param {Boolean} [allowCaching] - If not true a unique request string will be generated
 *
 * @return String containing the server's response if callback is not null or undefined,
 * null if the call is asynchronous.
 *
 * @throws Error when unable to create an XMLHttpRequest object
 */
function pentahoGet(url, query, callback, mimeType, allowCaching) {
  var returnType = "text/xml";
  if (mimeType) {
    returnType = mimeType;
  }

  var http_request = __createXhr(returnType);

  var async = __isAsyncRequest(callback);
  if (async) {
    http_request.onreadystatechange = function() {
      pentahoResponse(http_request, callback);
    };
  }

  if (allowCaching !== true) {
    var time = new Date().getTime();
    query = query + (query.length === 0 ? "" : "&") + time + "=" + time;
  }

  // submit the request
  http_request.open('GET', url + "?" + query, async);
  http_request.send(null);

  if (!async) {
    return getResponse( http_request );
  }

  return null;
}

function getUnauthorizedMsg() {
  return "<web-service><unauthorized/></web-service>";
}

function getNotFoundMsg() {
  return "<web-service><not-found/></web-service>";
}

/**
 * @param {String} url - url of the web service/servlet
 * @param {String} query - containing the message to send to the server
 * @param {String|Object|Function} [callback] Refers to the function to call when the client
 *        receives the server's response. If the parameter is:
 *          - null or undefined:
 *            the request to the server is synchronous, and the response is returned by this method.
 *          - of type String or string
 *            the name of the function to call
 *          - of type function
 *            the function object to call
 *          - of type object, where the object has the properties obj and method:
 *            callback.obj is the object to call the method callback.method on, e.g. obj.method()
 * @param {String} [mimeType] - specifies the mime type of the response
 *
 * @return String containing the server's response if callback is not null or undefined,
 * null if the call is asynchronous.
 *
 * @throws Error when unable to create an XMLHttpRequest object
 */
function pentahoPost(url, query, callback, mimeType) {
  var returnType = "text/xml";
  if (mimeType) {
    returnType = mimeType;
  }

  var http_request = __createXhr(returnType);

  var async = __isAsyncRequest(callback);
  if (async) {
    http_request.onreadystatechange = function() {
      pentahoResponse(http_request, callback);
    };
  }

  // submit the request
  http_request.open('POST', url, async);
  http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  // These headers are forbidden for security reasons.
  // See http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method.
  // http_request.setRequestHeader("Content-length", query.length);
  // http_request.setRequestHeader("Connection", "close");
  http_request.send(query);

  if (!async) {
    return getResponse(http_request);
  }

  return null;
}

/**
 * NOTE: http://radio.javaranch.com/pascarello/2006/02/07/1139345471027.html discusses the necessity of the try/catch block
 *
 * @param {Object} http_request - instance of XMLHttpRequest object, actually object is platform dependent.
 * @param {String|Object|Function} [callback] Refers to the function to call when the client
 *        receives the server's response. If the parameter is:
 *          - null or undefined:
 *            the request to the server is synchronous, and the response is returned by this method.
 *          - of type String or string
 *            the name of the function to call
 *          - of type function
 *            the function object to call
 *          - of type object, where the object has the properties obj and method:
 *            callback.obj is the object to call the method callback.method on, e.g. obj.method()
 */
function pentahoResponse(http_request, callback) {

  // see if we got a good response back
  if (http_request.readyState == COMPLETE) {
    try {
      var content = getResponse(http_request);

      // execute the callback function
      if (typeof(callback) == "function") {
        callback(content);
      } else if (typeof(callback) == "object" && undefined != callback.obj) {
        callback.method.call(callback.obj, content);
      } else if (typeof(callback) == "string") {
        // must be a string
        eval(callback + "( content );");
      } else {
        //callback must be null, which means caller wanted to run async, which means we should never get here
        throw new Error("Invalid state in pentahoResponse, unrecognized callback function.");
      }
    } catch(e) {
      alert("pentaho-ajax.js.pentahoResponse(): " + e);

      throw e;
    }
  }
}

function getResponse(http_request) {
  switch (http_request.status) {
    case STATUS_OK:
      return http_request.responseText;
    case STATUS_UNAUTHORIZED:
      return getUnauthorizedMsg();
    case STATUS_NOT_FOUND:
      return getNotFoundMsg();
    default:
      return null;
  }
}

function __createXhr(returnType) {
  if (window.XMLHttpRequest) { // Mozilla, Safari,...
    var http_request = new XMLHttpRequest();

    if (http_request.overrideMimeType) {
      http_request.overrideMimeType(returnType);
    }

    return http_request;
  }

  if (window.ActiveXObject) { // IE
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      // does nothing
    }

    try {
      return new ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) {
      // does nothing
    }
  }

  throw new Error('Cannot create XMLHTTP instance');
}

function __buildQueryParams(parameters) {
  if (parameters == null) return "";

  var queryParameters = [];

  for (var idx = 0, P = parameters.length; idx < P; idx++) {
    var param = parameters[idx];
    if (param != null) {
      queryParameters.push(encodeURIComponent(param[0]) + "=" + encodeURIComponent(param[1]));
    }
  }

  return queryParameters.join("&");
}

function __isAsyncRequest(callback) {
  return undefined != callback && null != callback;
}
