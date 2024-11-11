/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


/* globals  pho, CONTEXT_PATH, FULL_QUALIFIED_URL */

// see http://developer.mozilla.org/en/docs/AJAX:Getting_Started for other values
var COMPLETE = 4;

// see http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html for other values
var STATUS_OK = 200;
var STATUS_UNAUTHORIZED = 401;
var STATUS_NOT_FOUND = 404;

var base = '';

var pathArray = window.location.pathname.split( '/' );
var webAppPath = "/" + pathArray[1];

(function(window) {
  var pentahoAjax = {};

  /**
   * @param {string} solution - name of the solution containing the action sequence definition being called
   * @param {string} path - path to the action sequence definition being called
   * @param {string} action - name of the action sequence definition being called
   * @param {Array<Array<string>>} params - Array containing the parameters for the query string
   * @param {null|string|Object|function} [callback] - Refers to the function to call when the client
   *        receives the server's response. If the parameter is:
   *          - null or undefined:
   *            the request to the server is synchronous, and the response is returned by this method.
   *          - of type string:
   *            the name of the function to call
   *          - of type function:
   *            the function object to call:
   *          - of type object, where the object has the properties obj and method:
   *            callback.obj is the object to call the method callback.method on, e.g. obj.method()
   *
   * @return {string} The server's response if callback is not null or undefined, null if the call is asynchronous.
   *
   * @throws {Error} When unable to create an XMLHttpRequest object
   */
  pentahoAjax.pentahoAction = window.pentahoAction = function(solution, path, action, params, callback) {
    var result = pentahoAjax.getViewActionUrlAndQuery(solution, path, action, params);

    var url = result.url;
    var query = result.query;

    return pentahoAjax.pentahoPost(url, query, callback);
  };

  pentahoAjax.getViewActionUrl = window.getViewActionUrl = function(solution, path, action, params) {
    var result = pentahoAjax.getViewActionUrlAndQuery(solution, path, action, params);

    var url = result.url;
    var query = result.query;

    return url + '?' + query;
  };

  pentahoAjax.getViewActionUrlAndQuery = window.getViewActionUrlAndQuery = function(solution, path, action, params) {
    var viewActionParams = (params || []).concat([
      ["wrapper", "false"], ["solution", solution], ["path", path], ["action", action]
    ]);

    return {
      url: CONTEXT_PATH + "ViewAction",
      query: buildQueryParams(viewActionParams)
    };
  };

  /**
   * @param {string} component
   * @param {Array<Array<string>>} params - Array containing the parameters for the query string
   * @param {null|string|Object|function} [callback] - Refers to the function to call when the client
   *        receives the server's response. If the parameter is:
   *          - null or undefined:
   *            the request to the server is synchronous, and the response is returned by this method.
   *          - of type string:
   *            the name of the function to call
   *          - of type function:
   *            the function object to call:
   *          - of type object, where the object has the properties obj and method:
   *            callback.obj is the object to call the method callback.method on, e.g. obj.method()
   * @param {string} [mimeType] - specifies the mime type of the response
   *
   * @return {string} The server's response if callback is not null or undefined, null if the call is asynchronous.
   *
   * @throws {Error} When unable to create an XMLHttpRequest object
   */
  pentahoAjax.pentahoService = window.pentahoService = function(component, params, callback, mimeType) {
    var serviceActionParams = (params || []).concat([
      ["ajax", "true"], (component ? ["component", component] : undefined)
    ]);

    var url = FULL_QUALIFIED_URL + "ServiceAction";
    var csrfToken = pho.csrfUtil.getToken(url);

    var query = buildQueryParams(serviceActionParams);

    return pentahoAjax.pentahoPost(url, query, callback, mimeType, csrfToken);
  };

  /**
   * @param {string} url - url of the web service/servlet
   * @param {string} query - containing the message to send to the server
   * @param {null|string|Object|function} [callback] - Refers to the function to call when the client
   *        receives the server's response. If the parameter is:
   *          - null or undefined:
   *            the request to the server is synchronous, and the response is returned by this method.
   *          - of type string:
   *            the name of the function to call
   *          - of type function:
   *            the function object to call:
   *          - of type object, where the object has the properties obj and method:
   *            callback.obj is the object to call the method callback.method on, e.g. obj.method()
   * @param {string} [mimeType] - specifies the mime type of the response
   * @param {boolean} [allowCaching] - If not true a unique request string will be generated
   * @param {?pentaho.csrf.IToken} [csrfToken] - token for csrf protection
   *
   * @return {?string} The server's response if callback is not null or undefined, null if the call is asynchronous.
   *
   * @throws {Error} When unable to create an XMLHttpRequest object
   */
  pentahoAjax.pentahoGet = window.pentahoGet = function(url, query, callback, mimeType, allowCaching, csrfToken) {
    var http_request = createXhr(mimeType, callback);
    var isAsync = isAsyncRequest(callback);

    if (allowCaching !== true) {
      var time = new Date().getTime();
      query = query + (query.length === 0 ? "" : "&") + time + "=" + time;
    }

    http_request.open('GET', url + "?" + query, isAsync);
    if (csrfToken != null) {
      http_request.setRequestHeader(csrfToken.header, csrfToken.token);
    }

    http_request.send(null);

    return isAsync ? null : pentahoAjax.getResponse(http_request);
  };

  pentahoAjax.getUnauthorizedMsg = window.getUnauthorizedMsg = function() {
    return "<web-service><unauthorized/></web-service>";
  };

  pentahoAjax.getNotFoundMsg = window.getNotFoundMsg = function() {
    return "<web-service><not-found/></web-service>";
  };

  /**
   * @param {string} url - url of the web service/servlet
   * @param {string} query - containing the message to send to the server
   * @param {null|string|Object|function} [callback] - Refers to the function to call when the client
   *        receives the server's response. If the parameter is:
   *          - null or undefined:
   *            the request to the server is synchronous, and the response is returned by this method.
   *          - of type string:
   *            the name of the function to call
   *          - of type function:
   *            the function object to call:
   *          - of type object, where the object has the properties obj and method:
   *            callback.obj is the object to call the method callback.method on, e.g. obj.method()
   * @param {string} [mimeType] - specifies the mime type of the response
   * @param {?pentaho.csrf.IToken} [csrfToken] - token for csrf protection
   *
   * @return {?string} The server's response if callback is not null or undefined, null if the call is asynchronous.
   *
   * @throws {Error} When unable to create an XMLHttpRequest object
   */
  pentahoAjax.pentahoPost = window.pentahoPost = function(url, query, callback, mimeType, csrfToken) {
    var http_request = createXhr(mimeType, callback);
    var isAsync = isAsyncRequest(callback);

    http_request.open('POST', url, isAsync);
    http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    if (csrfToken != null) {
      http_request.setRequestHeader(csrfToken.header, csrfToken.token);
    }

    http_request.send(query);

    return isAsync ? null : pentahoAjax.getResponse(http_request);
  };

  /**
   * NOTE: http://radio.javaranch.com/pascarello/2006/02/07/1139345471027.html discusses the necessity of the try/catch block
   *
   * @param {Object} http_request - instance of XMLHttpRequest object, actually object is platform dependent.
   * @param {null|string|Object|function} [callback] - Refers to the function to call when the client
   *        receives the server's response. If the parameter is:
   *          - null or undefined:
   *            the request to the server is synchronous, and the response is returned by this method.
   *          - of type string:
   *            the name of the function to call
   *          - of type function:
   *            the function object to call:
   *          - of type object, where the object has the properties obj and method:
   *            callback.obj is the object to call the method callback.method on, e.g. obj.method()
   */
  pentahoAjax.pentahoResponse = window.pentahoResponse = function(http_request, callback) {
    if (http_request.readyState === COMPLETE) {
      try {
        var content = pentahoAjax.getResponse(http_request);

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
  };

  pentahoAjax.getResponse = window.getResponse = function(http_request) {
    switch (http_request.status) {
      case STATUS_OK:
        return http_request.responseText;
      case STATUS_UNAUTHORIZED:
        return pentahoAjax.getUnauthorizedMsg();
      case STATUS_NOT_FOUND:
        return pentahoAjax.getNotFoundMsg();
      default:
        return null;
    }
  };

  // Private Methods
  var createXhr = function(mimeType, callback) {
    var http_request = null;

    if (window.XMLHttpRequest) { // Mozilla, Safari,...
      http_request = new XMLHttpRequest();

      if (http_request.overrideMimeType) {
        var returnType = "text/xml";
        if (mimeType) {
          returnType = mimeType;
        }

        http_request.overrideMimeType(returnType);
      }
    } else if (window.ActiveXObject) { // IE
      try {
        http_request = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        try {
          http_request = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
          // does nothing
        }
      }
    }

    if (http_request == null) {
      throw new Error('Cannot create XMLHTTP instance');
    }

    if (isAsyncRequest(callback)) {
      http_request.onreadystatechange = function() {
        pentahoResponse(http_request, callback);
      };
    }

    return http_request;
  };

  var buildQueryParams = function(parameters) {
    if (parameters == null) return "";

    var queryParameters = [];

    for (var idx = 0, P = parameters.length; idx < P; idx++) {
      var param = parameters[idx];
      if (param != null) {
        queryParameters.push(encodeURIComponent(param[0]) + "=" + encodeURIComponent(param[1]));
      }
    }

    return queryParameters.join("&");
  };

  var isAsyncRequest = function(callback) {
    return callback != null;
  };

  define("common-repo/pentaho-ajax", ["common-ui/util/pentaho-csrf"], function() {
    return pentahoAjax;
  });

  define("common-ui/repo/pentaho-ajax", ["common-ui/util/pentaho-csrf"], function() {
    return pentahoAjax;
  });
})(window);

