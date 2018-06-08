
// Use the server platform i18n service.
requireCfg.packages.forEach(function(packageDef) {
  if(packageDef.name === "pentaho/i18n") {
    packageDef.main = "serverService";
  }
});
