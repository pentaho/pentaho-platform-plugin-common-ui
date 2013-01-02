/*!
 * The Pentaho proprietary code is licensed under the terms and conditions of
 * the software license agreement entered into between the entity licensing such
 * code and Pentaho Corporation.
 */


/**
  Example Usage:

    pen.require(['common-ui/util/PentahoSpinner'], function(spin) {
      var config = spin.getMediumConfig();

      // override the color
      config.color = "#555";

      // override the starting top location
      config.top = "-8px"

      // spin.js's Spinner object has been included for us by the pen.require call to PentahoSpinner above
      var spinner = new Spinner(config);

      // show the spinner in your div
      spinner.spin(dojo.byId("yourDivElementId"));

      ...


      // hide the spinner
      spinner.stop();

    });
*/

pen.define(['common-ui/util/spin.min'], function() {

  var local = {

    /* 16x16 */
    getSmallConfig: function() {
      return {
        lines: 9, // The number of lines to draw
        length: 3, // The length of each line
        width: 2, // The line thickness
        radius: 3, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#FFF', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };
    },

    /* 32x32 */
    getMediumConfig: function() {
      return {
        lines: 11, // The number of lines to draw
        length: 7, // The length of each line
        width: 3, // The line thickness
        radius: 6, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#FFF', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };
    },

    /* 48x48 */
    getLargeConfig: function() {
      return {
        lines: 13, // The number of lines to draw
        length: 10, // The length of each line
        width: 4, // The line thickness
        radius: 10, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#FFF', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };
    }
  };


  return local;

});
