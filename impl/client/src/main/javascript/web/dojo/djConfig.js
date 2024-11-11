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
