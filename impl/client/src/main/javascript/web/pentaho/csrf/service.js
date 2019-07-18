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
define([
  "pentaho/util/url",
  "pentaho/environment"
], function(urlUtil, environment) {

  "use strict";

  /**
   * The _main_ CSRF service.
   *
   * @alias service
   * @memberOf pentaho.config
   * @type {pentaho.csrf.IService}
   * @readOnly
   */
  var service = {
    getToken: function(url) {

      if(!url) {
        throw new Error("Argument 'url' is required.");
      }

      var serverBaseUrl = environment.server.root;
      if(serverBaseUrl === null) {
        return null;
      }
      serverBaseUrl = serverBaseUrl.href;

      url = urlUtil.create(url).href;

      // Check if the request will be for the pentaho application.
      if(url.indexOf(serverBaseUrl) !== 0) {
        // Do not send Pentaho CSRF tokens to other sites.
        return null;
      }

      // Sending the URL as a parameter and not as a header to avoid becoming a pre-flight request.
      var csrfServiceUrl = serverBaseUrl + "api/system/csrf?url=" + encodeURIComponent(url);

      var xhr = service.__createXhr();
      xhr.open("GET", csrfServiceUrl, /* async: */false);

      // In Cross-Origin contexts, the session where the token is stored must be the same
      // as that used by the actual request...
      xhr.withCredentials = true;
      xhr.send();

      if(xhr.status === 204 || xhr.status === 200) {
        return {
          header: xhr.getResponseHeader("X-CSRF-HEADER"),
          parameter: xhr.getResponseHeader("X-CSRF-PARAM"),
          token: xhr.getResponseHeader("X-CSRF-TOKEN")
        };
      }

      return null;
    },

    // Exposed for testing purposes.
    __createXhr: function() {
      return new XMLHttpRequest();
    }
  };

  return service;
});
