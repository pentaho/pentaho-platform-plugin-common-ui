/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
 */
define([
  "./DebugInfo"
], function(DebugInfo) {

  "use strict";

  /**
   * The `DebugInfoByUrl` class provides access to the current debugging level for a given code context,
   * and reads the debugging level from the document's url.
   *
   * @memberOf pentaho.util.debug
   * @amd pentaho/util/debug/DebugInfoByUrl
   * @class
   * @extends pentaho.util.debug.DebugInfo
   * @private
   */
  function DebugInfoByUrl() {

    var maxLevel = 0;

    // Check URL for "debug" and "debugLevel"
    // Because these class will probably be used as a singleton,
    // no "caching" of urlIfHasDebug or of the used RegExps is performed.

    /* global window:true */
    if((typeof window !== "undefined") && window.location) {
      var urlIfHasDebug = function(url) {
        return url && (/\bdebug=true\b/).test(url) ? url : null;
      };

      var url = urlIfHasDebug(window.location.href);
      if(!url) {
        try {
          url = urlIfHasDebug(window.top.location.href);
        } catch(e) {
          /* XSS */
        }
      }

      if(url) {
        var m = /\bdebugLevel=(\d+)/.exec(url);
        maxLevel = m ? (+m[1]) : 3;
      }
    }

    this.__maxLevel = maxLevel;
  }

  DebugInfoByUrl.prototype = Object.create(DebugInfo.prototype);
  DebugInfoByUrl.prototype.constructor = DebugInfoByUrl;

  DebugInfoByUrl.prototype.getMaxLevel = function() {
    return this.__maxLevel;
  };

  return DebugInfoByUrl;
});
