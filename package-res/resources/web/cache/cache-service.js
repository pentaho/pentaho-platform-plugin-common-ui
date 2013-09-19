/*!
* Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
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
*
*/

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
