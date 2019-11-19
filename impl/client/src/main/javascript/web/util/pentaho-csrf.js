/*!
 * Copyright 2019 Hitachi Vantara. All rights reserved.
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

/* globals pho, FULL_QUALIFIED_URL */

var pho = pho || {};

pho.csrfUtil = (function() {

  return {
    getToken: function(url) {
      if (!url) {
        throw new Error("Argument 'url' is required.");
      }

      // Check if the request will be for the pentaho application.
      if(url.indexOf(FULL_QUALIFIED_URL) !== 0) {
        // Do not send Pentaho CSRF tokens to other sites.
        return null;
      }

      // Sending the URL as a parameter and not as a header to avoid becoming a pre-flight request.
      var csrfServiceUrl = FULL_QUALIFIED_URL + "api/system/csrf?url=" + encodeURIComponent(url);

      var xhr = new XMLHttpRequest();
      xhr.open("GET", csrfServiceUrl, /* async: */false);

      // In cross-origin contexts, the session where the token is stored must be the same
      // as that used by the actual request...
      xhr.withCredentials = true;
      try {
        xhr.send();
      } catch(ex) {
        // a) CORS is not enabled on the server, or
        // b) this is the origin of an attacker...
        return null;
      }

      if(xhr.status !== 204 && xhr.status !== 200) {
        return null;
      }

      // When CSRF protection is disabled, the token is not returned.
      var token = xhr.getResponseHeader("X-CSRF-TOKEN");
      if(token == null) {
        return null;
      }

      return {
        header: xhr.getResponseHeader("X-CSRF-HEADER"),
        parameter: xhr.getResponseHeader("X-CSRF-PARAM"),
        token: token
      };
    }
  };
})();

define("common-ui/util/pentaho-csrf", function() {
  return pho.csrfUtil;
});

