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


/**
 Example Usage:

 require(['common-ui/util/PentahoSpinner'], function(spin) {
      var config = spin.getMediumConfig();

      // override the color
      config.color = "#555";

      // override the starting top location
      config.top = "-8px"

      // spin.js's Spinner object has been included for us by the require call to PentahoSpinner above
      var spinner = new Spinner(config);

      // show the spinner in your div
      spinner.spin(dojo.byId("yourDivElementId"));

      ...

      // hide the spinner
      spinner.stop();

    });
 */

define("common-ui/util/PentahoSpinner", ['common-ui/util/spin', 'common-ui/util/Glasspane'], function(spinJs, glasspane) {

  var local = {

    /* 16x16 */
    getSmallConfig: function() {
      return {
        lines: 5, // The number of lines to draw
        length: 3, // The length of each line
        width: 3, // The line thickness
        radius: 3, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 90, // The rotation offset
        // color will be overriden by themed css (globalOnyx.css for example) -- .spinner div > div{...}
        color: '#999', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 100, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner small-spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };
    },

    /* 32x32 */
    getMediumConfig: function() {
      return {
        lines: 7, // The number of lines to draw
        length: 7, // The length of each line
        width: 4, // The line thickness
        radius: 6, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 90, // The rotation offset
        // color will be overriden by themed css (globalOnyx.css for example) -- .spinner div > div{...}
        color: '#999', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 100, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner medium-spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };
    },

    /* 48x48 */
    getLargeConfig: function() {
      return {
        lines: 9, // The number of lines to draw
        length: 9, // The length of each line
        width: 5, // The line thickness
        radius: 7, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 90, // The rotation offset
        // color will be overriden by themed css (globalOnyx.css for example) -- .spinner div > div{...}
        color: '#999', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 100, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner large-spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };
    }

  };

  return local;

});
