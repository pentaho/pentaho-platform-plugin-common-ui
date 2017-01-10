/* globals window, requirejs */

// Find and inject tests using requirejs
var tests = Object.keys(window.__karma__.files).filter(function(file) {
    return (/.spec\.js$/).test(file);
});

var requirePaths   = requireCfg.paths;
var requireShim    = requireCfg.shim;
var requireMap     = requireCfg.map;

requireCfg.baseUrl = "/base";

// Javascript Tests source files
requirePaths["tests"] = "src/test/javascript";

requirePaths["dojo"] = depWebJars + "/dojo/${dojo.version}";
requirePaths["dijit"] = depWebJars + "/dijit/${dojo.version}";
requirePaths["dojox"] = depDir + "/dojo-release-${dojo.version}-src/dojox";


// ...Overrides
requirePaths["dojo/on"] = dojoOverrides + "dojo/on";
requirePaths["dojo/dom-geometry"] = dojoOverrides + "dojo/dom-geometry";
requirePaths["dojo/dom-prop"] = dojoOverrides + "dojo/dom-prop";
requirePaths["dojox/layout/ResizeHandle"] = dojoOverrides + "dojox/layout/ResizeHandle";
requirePaths["dojox/grid/_View"] = dojoOverrides + "dojox/grid/_View";
requirePaths["dojox/xml/parser"] = dojoOverrides + "dojox/xml/parser";
requirePaths["dojox/grid/Selection"] =  dojoOverrides + "dojox/grid/Selection";
requirePaths["dojox/grid/_FocusManager"] = dojoOverrides + "dojox/grid/_FocusManager";
requirePaths["dojox/grid/_Scroller"] = dojoOverrides + "dojox/grid/_Scroller";
requirePaths["dojox/storage"] = dojoOverrides + "dojox/storage";
requirePaths["dojox/json"] = dojoOverrides + "dojox/json";
requirePaths["dojox/rpc"] = dojoOverrides + "dojox/rpc";
requirePaths["dojo/_base/kernel"] = dojoOverrides + "dojo/_base/kernel";
requirePaths["dojo/_base/config"] = dojoOverrides + "dojo/_base/config";
requirePaths["dojo/store/Memory"] = dojoOverrides + "dojo/store/Memory";
requirePaths["dijit/_HasDropDown"] = dojoOverrides + "dijit/_HasDropDown";
requirePaths["dijit/_CssStateMixin"] = dojoOverrides + "dijit/_CssStateMixin";

requirePaths["common-ui"] = basePath;
requirePaths["pentaho"]   = basePath + "/pentaho";
requirePaths["common-data"] = basePath + "/dataapi";
requirePaths["common-repo"] = basePath + "/repo";
requirePaths["pentaho/common"] = basePath + "/dojo/pentaho/common";

requirePaths["common-ui/jquery-clean"] = depWebJars + "/jquery/${jquery.version}/dist/jquery";
requireShim["common-ui/jquery-clean"] = {
    exports: "$",
    init: function() { return $.noConflict(true); }
};

requirePaths["common-ui/underscore"] = basePath + "/underscore/underscore";

requirePaths["text"] = basePath + "/util/require-text/text";

requireCfg.deps = tests;

requireCfg.callback = function() {
    window.__karma__.start();
};

requirejs.config(requireCfg);
