/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
define(["pentaho/i18n/MessageBundle", "json"], function(MessageBundle) {
  return {
    load: function(bundlePath, require, onLoad, config) {
      var bundleUrl = require.toUrl(bundlePath) + ".properties";
      require(["text!" + bundleUrl], function(bundleText) {
        onLoad(new MessageBundle(parseProperties(bundleText)));
      });
    },
    normalize: function(name, normalize) {
      return normalize(getBundleID(name));
    }
  };

  function getBundleID(bundlePath) {
    var bundleMid;
    if(!bundlePath) {
      // "pentaho/i18n!"
      // Use the default location and bundle.
      bundleMid = "./i18n/messages";
    } else if(bundlePath[0] === "/") {
      // "pentaho/i18n!/pentaho/common/nls/messages"
      // The path is, directly, an absolute module id of a message bundle (without the /).
      bundleMid = bundlePath.substr(1);
      if(!bundleMid) throw new Error("[pentaho/i18n!] Bundle path argument cannot be a single '/'.");
    } else if(bundlePath[0] !== "." && bundlePath.indexOf("/") < 0) {

      // the name of a bundle in the default "./i18n" sub-module
      bundleMid = "./i18n/" + bundlePath;
    } else {
      // "pentaho/i18n!./nls/information"
      // The path is, directly, a relative module id of a message bundle
      // Or the path has already been resolved by RequireJS.
      bundleMid = bundlePath;
    }

    return bundleMid;
  }

  function parseProperties(text) {
    // "Brute" parsing.
    var lines = text.split(/[\n\r]+/);
    var props = {};
    lines.forEach(function(line) {
      if(!/^\s*#/.test(line)) {
        var m = /^\s*(.+?)\s*=(.*?)\s*$/.exec(line);
        if(m) {
          props[m[1]] = m[2];
        }
      }
    });
    return props;
  }
});
