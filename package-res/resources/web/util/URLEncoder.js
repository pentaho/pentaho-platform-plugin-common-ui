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
 * Copyright 2014 Pentaho Corporation. All rights reserved.
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
 * require( [ "common-ui/util/URLEncoder" ], function( Encoder ){
 *    var queryObject = { bang: "something", baz: ["a","b"]
 *    var encodedURL = Encoder.encode( "some/path/{0}/{1}", [ val1, val2 ], queryObject );
 *    // results in "some/path/val1/val2?bang=something&baz=a&baz=b
 * }
 */
define( "common-ui/util/URLEncoder", [ "dojo/_base/lang", "dojo/_base/array", "dojo/io-query" ], function( lang, array, ioQuery ){

  var Encoder = lang.getObject("pho.Encoder", true); // create global reference for non-amd users

  function doubleEncode(str){
    return str.replace("%5C", "%255C").replace("%2F", "%252F");
  }
  function singleEncode(str){
    return str.replace("\\", "%5C").replace("/", "%2F");
  }

  function encodeQueryObject(obj){
    "use strict";

    for(var prop in obj){
      var val = obj[prop], newProp = singleEncode(prop), newObj = {};

      if(lang.isArray(val)){
        newObj[newProp] = [];
        for(var i = 0; i < val.length; i++){
          newObj[newProp].push(singleEncode(val[i]));
        }
      }else{
        newObj[newProp] = singleEncode(val);
      }

    }
    return newObj;
  }

  Encoder.encode = function( str, args, queryObj ){
    "use strict"
    if( typeof args === "undefined" ){
      return str;
    }
    if( args instanceof Array === false ){
      args = [ args ];
    }
    args = array.map( args, function( item ){
      var encodedStr = encodeURIComponent( String( item ) )
      // double-encode / and \ to work around Tomcat issue
      encodedStr = encodedStr.replace("%5C", "%255C").replace("%2F", "%252F");
      return encodedStr;
    } );
    var result = lang.replace( str, args )
    if( queryObj ){

      result += "?" + ioQuery.objectToQuery( encodeQueryObject(queryObj) );
    }
    return result;
  };
  
  Encoder.encodeRepositoryPath = function( str ) {
    "use strict"
    var encodedStr = String( str ).replace( new RegExp (":", "g"), "::").replace( new RegExp ("[\\\\/]", "g"), ":")
    return encodedStr;
  };
  
  Encoder.decodeRepositoryPath = function ( str ) {
    return String( str ).replace( new RegExp (":", "g"), "\/").replace( new RegExp ("\/\/", "g"), ":");
  };
    
  // Return encoder for AMD use
  return Encoder;
});
require(["common-ui/util/URLEncoder"]);