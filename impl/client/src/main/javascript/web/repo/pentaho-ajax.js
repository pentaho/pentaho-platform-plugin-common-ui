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
 * @param solution String name of the solution containing the action sequence definition being called
 * @param path String path to the action sequence definition being called
 * @param action String name of the action sequence definition being called
 * @param params Array containing the parameters for the query string
 * @param func String, object, or function. It is optional. Refers to the function to call
 * asynchronously when the client receives the server's response. If the parameter is:
 *   null or undefined:
 *     the request to the server is synchronous, and the response is returned
 *     by this method.
 *   of type String or string:
 *     the name of the function to call
 *   of type function:
 *     the function object to call
 *   of type object, where the object has the properties obj and method:
 *     func.obj is the object to call the method func.method on,
 *     e.g. obj.method()
 *
 * @return String containing the server's response if func is not null or undefined,
 * null if the call is asynchronous.
 *
 * @throws Error when unable to create an XMLHttpRequest object
 */
function pentahoAction(solution, path, action, params, func) {
  // execute an Action Sequence on the server

  var url = WEB_CONTEXT_BASE + "ViewAction";

  // create the URL we need
  var query = "wrapper=false&solution="+solution+"&path="+path+"&action="+action;

	// add any parameters provided
  if (params) {
    for (var idx = 0, P = params.length; idx < P; idx++) {
      query += "&" + encodeURIComponent(params[idx][0]) + "=" + encodeURIComponent(params[idx][1]);
    }
  }

  // submit this as a post
  return pentahoPost(url, query, func);
}

/**
 * @param component String
 * @param params Array containing the parameters for the query string
 * @param func String, object, or function. It is optional. Refers to the function to call when the client
 * receives the server's response. If the parameter is:
 *   null or undefined:
 *     the request to the server is synchronous, and the response is returned
 *     by this method.
 *   of type String or string:
 *     the name of the function to call
 *   of type function:
 *     the function object to call
 *   of type object, where the object has the properties obj and method:
 *     func.obj is the object to call the method func.method on,
 *     e.g. obj.method()
 * @param mimeType String optional, specifies the mime type of the response
 *
 * @return String containing the server's response if func is not null or undefined,
 * null if the call is asynchronous.
 *
 * @throws Error when unable to create an XMLHttpRequest object
 */
function pentahoService(component, params, func, mimeType) {
  // execute a web service on the server
  // create the URL we need
  var url = WEB_CONTEXT_BASE + "ServiceAction";

  var query = "ajax=true&";
  if (component) {
    query += "component=" + component + "&";
  }

  // add any parameters provided
  if (params) {
    for(var idx = 0, P = params.length; idx < P; idx++) {
      query += "&" + encodeURIComponent(params[idx][0]) + "=" + encodeURIComponent(params[idx][1]);
    }
  }

  // submit this as a post
  return pentahoPost(url, query, func, mimeType);
}

/**
 * @param url String url of the web service/servlet
 * @param query String containing the message to send to the server
 * @param func String, object, or function. It is optional. Refers to the function to call when the client
 * receives the server's response. If the parameter is:
 *   null or undefined:
 *     the request to the server is synchronous, and the response is returned
 *     by this method.
 *   of type String or string:
 *     the name of the function to call
 *   of type function:
 *     the function object to call
 *   of type object, where the object has the properties obj and method:
 *     func.obj is the object to call the method func.method on,
 *     e.g. obj.method()
 * @param mimeType String optional, specifies the mime type of the response
 * @param allowCaching If not true a unique request string will be generated
 *
 * @return String containing the server's response if func is not null or undefined,
 * null if the call is asynchronous.
 *
 * @throws Error when unable to create an XMLHttpRequest object
 */
function pentahoGet(url, query, func, mimeType, allowCaching) {
  var async = undefined != func && null != func;

  // submit a 'get' request
  var http_request = null;
  var returnType = "text/xml";
  if (mimeType) {
    returnType = mimeType;
  }

  // create an HTTP request object
  if (window.XMLHttpRequest) { // Mozilla, Safari, ...
    http_request = new XMLHttpRequest();
    if (http_request.overrideMimeType) {
      http_request.overrideMimeType(returnType);
    }
  } else if (window.ActiveXObject) { // IE
    try {
      http_request = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
    	try {
        http_request = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e) {
        http_request = null;
      }
    }
  }

  if (!http_request) {
    throw new Error('Cannot create an XMLHTTP instance');
  }

  // set the callback function
  if (async) {
    http_request.onreadystatechange = function() {
      pentahoResponse(http_request, func);
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
 * @param url String url of the web service/servlet
 * @param query String containing the message to send to the server
 * @param func String, object, or function. It is optional. Refers to the function to call when the client
 * receives the server's response. If the parameter is:
 *   null or undefined:
 *     the request to the server is synchronous, and the response is returned
 *     by this method.
 *   of type String or string:
 *     the name of the function to call
 *   of type function:
 *     the function object to call
 *   of type object, where the object has the properties obj and method:
 *     func.obj is the object to call the method func.method on,
 *     e.g. obj.method()
 * @param mimeType String optional, specifies the mime type of the response
 *
 * @return String containing the server's response if func is not null or undefined,
 * null if the call is asynchronous.
 *
 * @throws Error when unable to create an XMLHttpRequest object
 */
function pentahoPost(url, query, func, mimeType) {
  var async = undefined != func && null != func;

  var http_request = null;
  var returnType = "text/xml";
  if (mimeType) {
    returnType = mimeType;
  }

  // create an HTTP request object
  if (window.XMLHttpRequest) { // Mozilla, Safari,...
    http_request = new XMLHttpRequest();
    if (http_request.overrideMimeType) {
      http_request.overrideMimeType(returnType);
    }
  } else if (window.ActiveXObject) { // IE
    try {
      http_request = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        http_request = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e) {
        http_request = null;
      }
    }
  }

  if (!http_request) {
    throw new Error('Cannot create XMLHTTP instance');
  }

  // set the callback function
  if (async) {
    http_request.onreadystatechange = function() {
      pentahoResponse(http_request, func);
    };
  }

  // submit the request
  http_request.open('POST', url, async);
  http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  // These headers are forbidden for security reasons.
  // See http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method.
  //http_request.setRequestHeader("Content-length", query.length);
  //http_request.setRequestHeader("Connection", "close");
  http_request.send(query);

  if (!async) {
    return getResponse(http_request);
  }

  return null;
}

/**
 * NOTE: http://radio.javaranch.com/pascarello/2006/02/07/1139345471027.html discusses the necessity of the try/catch block
 *
 * @param http_request instance of XMLHttpRequest object, actually object is platform dependent.
 * @param func String, object, or function. Required. Refers to the function to call when the client
 * receives the server's response. If the parameter is:
 *   of type String or string:
 *     the name of the function to call
 *   of type function:
 *     the function object to call
 *   of type object, where the object has the properties obj and method:
 *     func.obj is the object to call the method func.method on,
 *     e.g. obj.method()
 */
function pentahoResponse(http_request, func) {

  // see if we got a good response back
  if (http_request.readyState == COMPLETE) {
    try {
      var content = getResponse(http_request);

      // execute the callback function
      if (typeof(func) == "function") {
        func(content);
      } else if (typeof(func) == "object" && undefined != func.obj) {
        func.method.call(func.obj, content);
      } else if (typeof(func) == "string") {
        // must be a string
        eval(func + "( content );");
      } else {
        //func must be null, which means caller wanted to run async, which means we should never get here
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
