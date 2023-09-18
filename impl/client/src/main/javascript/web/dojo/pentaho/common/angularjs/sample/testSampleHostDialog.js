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
