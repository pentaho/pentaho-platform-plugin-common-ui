/*!
 * Copyright 2017 Hitachi Vantara. All rights reserved.
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
  "./has"
], function(has) {

  "use strict";

  /* eslint new-cap: 0 */

  function createUrl(url) {
    if (url) {
      if (has("URL")) {
        return new URL(url, document.location);
      }

      // Return a MOCK URL
      var m = parseUrl(url) ||

        // tests can reach here, as URL is fed from CONTEXT_PATH, which is usually not absolute
        parseUrl((url = makeAbsoluteUrl(url))) ||

        // TODO: CGG/rhino can reach here, as its createElement is mocked. Remove when the latter dies.
        // Assume the whole url is the pathname.
        [url, "", null, "", null, url];

      var auth = m[2] != null ? m[2].slice(0, -1).split(":") : [];
      return {
        href:     url,
        protocol: m[1],
        username: auth.length > 0 ? auth[0] : "",
        password: auth.length > 1 ? auth[1] : "",
        hostname: m[3],
        host: m[3] + (m[4] != null ? m[4] : ""),
        port: (m[4] != null ? m[4].substring(1) : ""),
        origin: m[1] + "//" + m[3] + (m[4] != null ? m[4] : ""),
        pathname: m[5],

        toString: function() {
          return url;
        }
      };
    }

    return null;
  }

  function parseUrl(url) {
    // 1 - protocol (required)
    // 2 - authority (userName:password) (optional)
    // 3 - host (optional)
    // 4 - port (optional)
    // 5 - pathname (optional)
    return /^\s*([^:\/?#]+:)\/\/([^@]*@)?([^:\/?#]*)(:\d*)?(\/[^?#]*)+/.exec(url);
  }

  function makeAbsoluteUrl(url) {
    var aElem = document.createElement("a");
    aElem.href = url;
    return aElem.href;
  }

  return {
    create: createUrl,
    parse: parseUrl
  };

});
