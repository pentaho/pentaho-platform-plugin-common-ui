/* globals requireCfg, packageInfo, getVersionedModuleId, SESSION_LOCALE, active_theme */

var basePath = packageInfo.webRootPath;

var requirePaths = requireCfg.paths;
var requireShim = requireCfg.shim;

// configure cdf's jquery-clean shim
// (not in package.json because functions aren't supported)
requireShim[getVersionedModuleId("common-ui/jquery-clean")] = {
  exports: "$",
  init: function() {
    return this.$.noConflict(true);
  }
};

// configure cdf's angular shim
// (not in package.json because functions aren't supported)
requireShim[getVersionedModuleId("common-ui/angular")] = {
  deps: [getVersionedModuleId("common-ui/jquery")],
  exports: "angular",
  init: function() {
    // Load i18n for angular.
    var baseMid = getVersionedModuleId("common-ui/angular-i18n/angular-locale_"); // mid = module id
    var locale = (typeof SESSION_LOCALE !== "undefined") ? SESSION_LOCALE : "en";

    locale = locale.replace("_", "-").toLowerCase();

    require([baseMid + locale], function() {
    }, function() {
      // Couldn't find the locale specified, fall back.
      var prev = locale;

      // Strip off the country designation, try to get just the language.
      locale = (locale.length > 2) ? locale.substring(0, 2) : "en";

      if(typeof console !== "undefined" && console.warn)
        console.warn("Could not load locale for '" + prev + "', falling back to '" + locale + "'");

      require([baseMid + locale], function() {
      }, function() {
        // Can't find the language at all, go get english.
        if(typeof console !== "undefined" && console.warn)
          console.warn("Could not load locale for '" + locale + "', falling back to 'en'");

        require([baseMid + "en"], function() {
        });
      });
    });
  }
};

function mapTheme(mid, themeRoot, themes) {
  var theme = (typeof active_theme !== "undefined") ? active_theme : null;
  if(!theme || themes.indexOf(theme) < 0) theme = themes[0];

  // e.g. "/theme" -> "/themes/crystal"
  requirePaths[getVersionedModuleId(mid) + "/theme"] = basePath + "/" + mid + "/" + themeRoot + "/" + theme;
}

// Type API Base Theme
mapTheme("pentaho/type", "themes", ["ruby"]);

// Visual Models Themes
mapTheme("pentaho/visual/models", "themes", ["crystal", "sapphire", "onyx", "det", "ruby"]);

// sample/calc theme
mapTheme("pentaho/visual/samples/calc", "themes", ["ruby"]);

var useDebug = typeof document === "undefined" || document.location.href.indexOf("debug=true") > 0;

// switch paths to use non-compressed versions
if(useDebug) {
  requirePaths[getVersionedModuleId("common-ui/util/require-css/css")] = basePath + "/util/require-css/css";
  requirePaths[getVersionedModuleId("pentaho/shim/_es6-promise/es6-promise")] = basePath + "/pentaho/shim/_es6-promise/es6-promise";
  requirePaths[getVersionedModuleId("common-ui/jquery-clean")] = basePath + "/jquery/jquery";
  requirePaths[getVersionedModuleId("common-ui/bootstrap")] = basePath + "/bootstrap/bootstrap";
  requirePaths[getVersionedModuleId("common-ui/underscore")] = basePath + "/underscore/underscore";
  requirePaths[getVersionedModuleId("common-ui/angular")] = basePath + "/angular/angular";
  requirePaths[getVersionedModuleId("common-ui/angular-resource")] = basePath + "/angular/angular-resource";
  requirePaths[getVersionedModuleId("common-ui/angular-route")] = basePath + "/angular/angular-route";
  requirePaths[getVersionedModuleId("common-ui/angular-animate")] = basePath + "/angular/angular-animate";
  requirePaths[getVersionedModuleId("common-ui/angular-sanitize")] = basePath + "/angular/angular-sanitize";
}
