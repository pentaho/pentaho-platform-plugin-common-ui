define([
  "dojo/_base/declare",
  "pentaho/common/angularjs/HostDialog",
  "./sampleHostDialogModule"
], function(declare, HostDialog, sampleHostDialogModule) {

  // "use strict";

  /**
   * A sample AngularJS host dialog class.
   *
   * @memberof my.sample
   * @class
   * @extends pentaho.common.angularjs.HostDialog
   */
  var SampleHostDialog = declare(HostDialog, /** @lends my.sample.SampleHostDialog# */{
    /** @override */
    _getRootAngularJsModule: function() {
      return sampleHostDialogModule;
    }
  });

  return SampleHostDialog;
});
