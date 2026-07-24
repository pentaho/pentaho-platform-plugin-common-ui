/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/

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
