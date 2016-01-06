/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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

/**
 * RequireJS loader plugin for loading localized messages.
 */
define(["./util/MessageBundle", "json"], function(MessageBundle) {
  "use strict";

  return {
    load: function(bundlePath, require, onLoad, config) {

      if(config.isBuild) {
        // Indicate that the optimizer should not wait for this resource and complete optimization.
        // This resource will be resolved dynamically during run time in the web browser.
        onload();
      } else {
        var bundleInfo = getBundleInfo(require, bundlePath),
            bundleUrl = "json!" + CONTEXT_PATH + "i18n?plugin=" + bundleInfo.pluginId + "&name=" + bundleInfo.name;

        require([bundleUrl], function(bundle) {
          onLoad(new MessageBundle(bundle));
        });
      }
    }
  };

  /**
   * Gets a bundle info object with the plugin id and bundle name,
   * for a given bundle module id.
   *
   * @param {string} bundlePath The specified bundle path argument.
   * @return {Object} A bundle info object.
   *
   * @throws {Error} If the specified module id cannot be resolved
   *   to a plugin id and bundle name.
   */
  function getBundleInfo(require, bundlePath) {
    var bundleMid;
    if(!bundlePath) {
      // "pentaho/messages!"
      // Use the default location and bundle.
      bundleMid = "./messages/messages";
    } else if(bundlePath[0] === "/") {
      // "pentaho/messages!/pentaho/common/nls/messages"
      // The path is, directly, an absolute module id of a message bundle (without the /).
      bundleMid = bundlePath.substr(1);
      if(!bundleMid) throw new Error("[pentaho/messages!] Bundle path argument cannot be a single '/'.");
    } else if(bundlePath[0] !== "." && bundlePath.indexOf("/") < 0) {

      // the name of a bundle in the default "./i18n" sub-module
      bundleMid = "./i18n/" + bundlePath;
    } else {
      // "pentaho/i18n!./nls/information"
      // The path is, directly, a relative module id of a message bundle
      // Or the path has already been resolved by RequireJS.
      bundleMid = bundlePath;
    }

    var absBundleUrl = require.toUrl(bundleMid);
    // e.g.:
    // bundlePath: pentaho/common/nls/messages
    // bundleMid:  pentaho/common/nls/messages
    // absBundleUrl: /pentaho/content/common-ui/resources/web/dojo/pentaho/common/nls/messages
    // CONTEXT_PATH: /pentaho/
    // pluginId: common-ui
    // bundleName: resources/web/dojo/pentaho/common/nls/messages

    // Split the url into pluginId and bundleName

    // Remove CONTEXT_PATH from bundle url
    if(absBundleUrl.indexOf(CONTEXT_PATH) === 0)
      absBundleUrl = absBundleUrl.substr(CONTEXT_PATH.length);

    // The same for content/
    if(absBundleUrl.indexOf("content/") === 0)
      absBundleUrl = absBundleUrl.substr("content/".length);

    //console.log("bundleUrl: " + absBundleUrl);

    // "pluginId/...bundleName..."
    var i = absBundleUrl.indexOf("/");
    if(i > 0 || i < absBundleUrl.length - 1)
      return {
        pluginId: absBundleUrl.substr(0, i),
        name: absBundleUrl.substr(i + 1)
       };

    throw new Error("[pentaho/messages!] Bundle path argument is invalid: '" + bundlePath + "'.");
  }
});
