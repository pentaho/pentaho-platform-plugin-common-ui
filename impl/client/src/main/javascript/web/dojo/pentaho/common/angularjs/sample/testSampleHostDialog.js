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
  "./SampleHostDialog"
], function(SampleHostDialog) {

  "use strict";

  return testDialog;

  function testDialog() {
    var dlg = new SampleHostDialog();

    dlg.showDialog()
        .then(function(result) {
          alert("Dialog ACCEPTED with '" + result + "'!");
        }, function(error) {
          alert("Dialog REJECTED with '" + error + "'...");
        })
        .finally(function() {
          dlg.destroy();
        });
  }
});
