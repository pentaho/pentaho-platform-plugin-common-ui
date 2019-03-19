/*
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2014 - 2019 Hitachi Vantara. All rights reserved.
 */
/**
 * This module supports the pentaho-specific URL encoding scheme for templated URLs. The characters / and \ are
 * double-encoded to work-around some webserver's limitation on passing the raw encoded form (%5C and %2F). In all
 * other respects the encoding behavior is exactly the same as encodeURIComponent.
 *
 * To support non-AMD scripts, the URLEncoder is registered in the global scope under the pho namespace. Usage of this
 * global reference should be restricted to those areas which cannot intergrate with AMD
 *
 * General usage is exactly the same as Dojo's dojo/_base/lang#replace function which it is based-on:
 * http://dojotoolkit.org/reference-guide/1.9/dojo/_base/lang.html#replace
 *
 * Usage (AMD):
 * require( [ "common-ui/util/URLEncoder" ], function( Encoder ){
 *    var encodedURL = Encoder.encode( "some/path/{0}/{1}", [ val1, val2 ] );
 * }
 *
 * Usage (Non-AMD):
 * var encodedURL = pho.Encoder.encode( "some/path/{0}/{1}", [ val1, val2 ] );
 *
 *
 * Optional: passing of an Object for query-string generation. This behavior is the same as the Dojo module
 * dojo/io-query: https://dojotoolkit.org/reference-guide/1.9/dojo/io-query.html
 *
 * Example:
 * require( [ "common-ui/util/URLEncoder"], function( Encoder ){
 *    var queryObject = { bang: "something", baz: ["a","b"]
 *    var encodedURL = Encoder.encode( "some/path/{0}/{1}", [ val1, val2 ], queryObject );
 *    // results in "some/path/val1/val2?bang=something&baz=a&baz=b
 * }
 */
define("common-ui/util/URLEncoder", [], function() {

  // Create global reference for non-amd users.

  /* global pho:true */
  pho = typeof pho === "undefined" ? {} : pho;

  var Encoder = pho.Encoder || (pho.Encoder = {});

  // ---

  var O_proto = Object.prototype;

  Encoder.encode = function(str, args, queryObj) {

    "use strict";

    if(args === undefined) {
      // TODO: what about queryObj??
      return str;
    }

    if(typeof args === "string") {
      args = [args];
    }

    // Detect the presence of the "?" to determine
    // when the special double-slash encoding should end.
    var pathPart = str.split("?")[0];
    var pathBounds = (pathPart.match(/\{[\d]+\}/g) || []).length;

    args = (args || []).map(function(item, pos) {

      var encodedStr = encodeURIComponent(String(item));

      // Double-encode / and \ to work around Tomcat issue.
      if(pos < pathBounds) {
        encodedStr = encodedStr.replace(/%5C/g, "%255C").replace(/%2F/g, "%252F");
      }

      return encodedStr;
    });

    var result = format(str, args);
    if(queryObj) {
      result += result.indexOf("?") > -1 ? "&" : "?";
      result += objectToQuery(queryObj);
    }

    return result;
  };

  Encoder.encodeRepositoryPath = function(str) {

    "use strict";

    return String(str)
      .replace(new RegExp(":", "g"), "\t")
      .replace(new RegExp("[\\\\/]", "g"), ":");
  };

  Encoder.decodeRepositoryPath = function(str) {

    "use strict";

    return String(str)
      .replace(new RegExp(":", "g"), "/")
      .replace(new RegExp("\\t", "g"), ":");
  };

  // Return encoder for AMD use.
  return Encoder;

  // Adapted from dojo/io-query.js
  function objectToQuery(map) {

    var pairs = [];

    // eslint-disable-next-line guard-for-in
    for(var name in map) {
      var value = map[name];
      // Ensure not inherited from Object prototype.
      if(value !== O_proto[name]) {

        var prefix = encodeURIComponent(name) + "=";

        if(Array.isArray(value)) {
          for(var i = 0, L = value.length; i < L; ++i) {
            pairs.push(prefix + encodeURIComponent(value[i]));
          }
        } else {
          pairs.push(prefix + encodeURIComponent(value));
        }
      }
    }

    return pairs.join("&");
  }

  function format(text, scope) {
    return String(text).replace(/\{(\d+)\}/g, function($0, prop) {
      return scope[prop];
    });
  }
});

require(["common-ui/util/URLEncoder"]);
