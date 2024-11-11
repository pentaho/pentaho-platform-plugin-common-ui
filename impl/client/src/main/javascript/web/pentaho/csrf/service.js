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
      var csrfServiceUrl = serverBaseUrl + "api/csrf/token?url=" + encodeURIComponent(url);

      var xhr = service.__createXhr();
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
    },

    // Exposed for testing purposes.
    __createXhr: function() {
      return new XMLHttpRequest();
    }
  };

  return service;
});
