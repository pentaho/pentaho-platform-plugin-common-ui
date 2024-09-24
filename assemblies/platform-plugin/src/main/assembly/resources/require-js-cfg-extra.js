
// Use the server platform i18n service.
(function() {
  var packageDefs = requireCfg.packages;
  var count = packageDefs.length;
  for(var i = 0; i < count; i++) {
    if(packageDefs[i].name === "pentaho/i18n") {
      packageDefs[i].main = "serverService";
      break;
    }
  }
})();

