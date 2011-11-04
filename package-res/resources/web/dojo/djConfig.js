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
var djConfig = {
  disableFlashStorage: true /* turn off flash storage for client-side caching */
};
