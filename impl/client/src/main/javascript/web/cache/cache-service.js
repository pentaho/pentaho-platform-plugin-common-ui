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


getCacheExpirations = function() {

  if(window.XMLHttpRequest) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if(request.readyState == 4 && request.status == 200) {
        window.pentahoCacheExpirationServiceResults = request.responseText;
      }
    }

    request.open("GET", CONTEXT_PATH + "CacheExpirationService", true);
    request.send();
  }

}

getCacheExpirations();
