/*!
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
* Copyright (c) 2019 Hitachi Vantara..  All rights reserved.
*/
define("common-repo/pentaho-csrf",[], function(){});

/* globals FULL_QUALIFIED_URL */

// TODO: move to new csrf bundle in osgi-bundles ?
var csrfUtil = {
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
