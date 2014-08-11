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

/*
 defaults for djConfig (dojo). to make use of the defaults
 simple extend it rather than redefine it. This will result in the
 combination of the two (must come after webcontext.js include):

  <script type="text/javascript" src="webcontext.js?content=common-ui"></script>
  <script type="text/javascript">

    $.extend(djConfig,
        { modulePaths: {
            'pentaho.common': "../pentaho/common"
        },
        parseOnLoad: true,
        baseUrl: '../dojo/dojo/'
    });

  </script>



  *if you want to completely ignore the defaults, just define the djConfig var like normal
    <script type="text/javascript">
      var djConfig = { modulePaths: {
              'pentaho.common': "../pentaho/common"
          },
          parseOnLoad: true,
          baseUrl: '../dojo/dojo/'
      });
    </script>
 */

// don't overwrite this if they've set djConfig ahead of time
if(djConfig == 'undefined' || djConfig == undefined) {
  var url = (window.location != window.parent.location) ? document.referrer: document.location.href;
  var djConfig = {
        disableFlashStorage: true, /* turn off flash storage for client-side caching */			
        locale: url.match(/locale=([\w\-]+)/) ? RegExp.$1 : "en" /* look for a locale=xx query string param, else default to 'en' */
  };
} else {
  if(djConfig['disableFlashStorage'] == 'undefined' || djConfig['disableFlashStorage'] == undefined) {
    djConfig.disableFlashStorage = true;
  }
}