/*!
* Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
 defaults for dojoConfig (dojo). to make use of the defaults
 simple extend it rather than redefine it. This will result in the
 combination of the two (must come after webcontext.js include):

  <script type="text/javascript" src="webcontext.js?content=common-ui"></script>
  <script type="text/javascript">

    $.extend(dojoConfig,
        { modulePaths: {
            'pentaho.common': "../pentaho/common"
        },
        parseOnLoad: true,
        baseUrl: '../dojo/dojo/'
    });

  </script>



  *if you want to completely ignore the defaults, just define the dojoConfig var like normal
    <script type="text/javascript">
      var dojoConfig = { modulePaths: {
              'pentaho.common': "../pentaho/common"
          },
          parseOnLoad: true,
          baseUrl: '../dojo/dojo/'
      });
    </script>
 */

// don't overwrite this if they've set dojoConfig ahead of time
if(dojoConfig == 'undefined' || dojoConfig == undefined) {
  var dojoConfig = {
    disableFlashStorage: true, /* turn off flash storage for client-side caching */

    /*
    check if SESSION_LOCALE is in given in valid pattern (xx or xx_YY (ignoring case), which represents
    locale with language and locale with language and dialect respectively)

    If it is so, normalize it and use. Otherwise use default (en) locale.
    */
    locale: SESSION_LOCALE.match(/^[a-zA-Z]{2}_[a-zA-Z]{2}$|^[a-zA-Z]{2}$/) ? normalizeLocale(SESSION_LOCALE) : "en"
  };
} else {
  if(dojoConfig['disableFlashStorage'] == 'undefined' || dojoConfig['disableFlashStorage'] == undefined) {
    dojoConfig.disableFlashStorage = true;
  }
}

function normalizeLocale(locale) {
    return locale.replace("_", "-").toLowerCase();
 }
