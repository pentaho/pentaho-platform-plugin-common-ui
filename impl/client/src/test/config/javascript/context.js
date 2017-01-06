/* globals window, requirejs */


// Find and inject tests using requirejs
var tests = Object.keys(window.__karma__.files).filter(function(file) {
    return (/.spec\.js$/).test(file);
});

var KARMA_RUN = true;
var CONTEXT_PATH;
var pen = {define: define, require: require};
var SESSION_LOCALE = "en";


//var depDir = "${build.dependenciesDirectory}";
var depDir = "target/dependency";
var depWebJars = depDir + "/META-INF/resources/webjars";

//var basePath = "${build.javascriptTestOutputDirectory}/web";
var basePath = "target/test-javascript/web";
var dojoOverrides = basePath + "/dojo/pentaho/common/overrides/";

requirejs.config({
    baseUrl: "/base",
    paths: {
        "dojo": depWebJars + "/dojo/${dojo.version}",
        "dijit": depWebJars + "/dijit/${dojo.version}",

        // ...Overrides
        "dojo/on": dojoOverrides + "dojo/on",
        "dojo/dom-geometry": dojoOverrides + "dojo/dom-geometry",
        "dojo/dom-prop": dojoOverrides + "dojo/dom-prop",
        "dojox/layout/ResizeHandle": dojoOverrides + "dojox/layout/ResizeHandle",
        "dojox/grid/_View": dojoOverrides + "dojox/grid/_View",
        "dojox/xml/parser": dojoOverrides + "dojox/xml/parser",
        "dojox/grid/Selection": dojoOverrides + "dojox/grid/Selection",
        "dojox/grid/_FocusManager": dojoOverrides + "dojox/grid/_FocusManager",
        "dojox/grid/_Scroller": dojoOverrides + "dojox/grid/_Scroller",
        "dojox/storage": dojoOverrides + "dojox/storage",
        "dojox/json": dojoOverrides + "dojox/json",
        "dojox/rpc": dojoOverrides + "dojox/rpc",
        "dojo/_base/kernel": dojoOverrides + "dojo/_base/kernel",
        "dojo/_base/config": dojoOverrides + "dojo/_base/config",
        "dojo/store/Memory": dojoOverrides + "dojo/store/Memory",
        "dijit/_HasDropDown": dojoOverrides + "dijit/_HasDropDown",
        "dijit/_CssStateMixin": dojoOverrides + "dijit/_CssStateMixin",


        "common-data": basePath + "/dataapi",
        "common-repo": basePath + "/repo",
        "pentaho/common": basePath + "/dojo/pentaho/common",


        /*        "whatwg-fetch": depWebJars + "/whatwg-fetch/${whatwg-fetch.version}/fetch",
         "pentaho/shim": depDir + "/common-ui/resources/web/pentaho/shim",
         "pentaho/util": depDir + "/common-ui/resources/web/pentaho/util",
         "pentaho/lang": depDir + "/common-ui/resources/web/pentaho/lang",
         "pentaho/data": depDir + "/common-ui/resources/web/pentaho/data",
         "pentaho/det/data": src
         */
    },
    map: {
    },
    bundles: {},
    config: {
        service: {}
    },
    packages: [],
    deps: tests,
    callback: function() {
        window.__karma__.start();
    }
});
