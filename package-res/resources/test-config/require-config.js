// Find and inject tests using require
var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return (/Spec\.js$/).test(file);
});

pen = {};
pen.require = function() {
  return require.apply(this, arguments);
} 
pen.define = function() {
  return define.apply(this, arguments);
}

requirejs.config({

  baseUrl: 'base/web/',
  paths: {
    'common-ui/angular': 'angular/angular',
    'common-ui/angular-resource': 'angular/angular-resource',
    'common-ui/angular-route': 'angular/angular-route',
    'common-ui/angular-ui-bootstrap': 'bootstrap/ui-bootstrap-tpls-0.6.0.min',
    'angular-mocks': 'angular/angular-mocks',
    'angular-scenario': 'angular/angular-scenario',
    'underscore' : 'underscore/underscore',
    'common-ui/ring':  'ring/ring',

    'common-ui/Plugin' : 'plugin-handler/plugin',
    'common-ui/PluginHandler': 'plugin-handler/pluginHandler',
    'common-ui/AngularPlugin': 'plugin-handler/angularPlugin',
    'common-ui/AngularPluginHandler': 'plugin-handler/angularPluginHandler',
    'common-ui/angular-animate': 'angular/angular-animate',
    'common-ui/jquery': 'jquery/jquery-1.9.1.min',
    'common-ui/AnimatedAngularPlugin': 'plugin-handler/animatedAngularPlugin',
    'common-ui/AnimatedAngularPluginHandler': 'plugin-handler/animatedAngularPluginHandler'
  },

  shim: {
    'common-ui/angular': { exports: 'angular' },
    'common-ui/angular-resource': { deps: ['common-ui/angular'], exports: 'Resource' },
    'common-ui/angular-route': { deps: ['common-ui/angular'], exports: 'Route' },
    'common-ui/angular-ui-bootstrap': { deps: ['common-ui/angular'] },
    'angular-mocks': { deps: ['common-ui/angular-resource'] },
    
    'common-ui/jquery': { exports: '$' },
    'common-ui/PluginHandler': { deps: ['common-ui/jquery'] },
    'common-ui/angular-animate': { deps: ['common-ui/angular'] },
    'common-ui/ring' : {exports: 'ring', deps : ['underscore']},
    'underscore': { exports: '_' },
  },

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: function() {
    window.__karma__.start();
  }
});
