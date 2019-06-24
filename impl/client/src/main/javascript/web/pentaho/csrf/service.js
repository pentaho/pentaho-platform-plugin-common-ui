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
  return /** @lends pentaho.csrf.IService# */{
    /**
     * Gets a CSRF token for a call to a protected service, given its URL.
     *
     * @param {string} url - The url of the protected service.
     *
     * @return {?({header:string,parameter:string,token:string})} The CSRF token information, if one should be used;
     * `null`, otherwise.
     *
     * @throws {Error} When argument url is not specified.
     */
    getToken: function(url) {

      if(!url) {
        throw new Error("Argument 'url' is required.");
      }

      url = urlUtil.create(url).href;

      var serverBaseUrl = environment.server.root;
      if(serverBaseUrl === null) {
        return null;
      }

      serverBaseUrl = serverBaseUrl.href;

      // Check if the request will be cross-site.
      if(url.indexOf(serverBaseUrl) !== 0) {
        // Do not send Pentaho CSRF tokens to other sites.
        return null;
      }

      var csrfServiceUrl = serverBaseUrl + "api/system/csrf";

      var xhr = new XMLHttpRequest();
      xhr.open("GET", csrfServiceUrl, /* async: */false);
      xhr.setRequestHeader("X-CSRF-SERVICE", url);
      xhr.send();

      if(xhr.status === 200) {
        return {
          header: xhr.getResponseHeader("X-CSRF-HEADER"),
          parameter: xhr.getResponseHeader("X-CSRF-PARAM"),
          token: xhr.getResponseHeader("X-CSRF-TOKEN")
        };
      }

      return null;
    }
  };
});
