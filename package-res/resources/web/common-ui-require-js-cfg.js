/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var prefix = (typeof CONTEXT_PATH != "undefined") ? CONTEXT_PATH + 'content/common-ui/resources/web' :
    (typeof KARMA_RUN != "undefined") ? "../../package-res/resources/web" :"common-ui"; //prod vs build
var isDebug = typeof document == "undefined" || document.location.href.indexOf("debug=true") > 0;

requireCfg['paths']['common-ui'] = prefix;

requireCfg['paths']['dojo'] = prefix+'/dojo/dojo';
requireCfg['paths']['dojox'] = prefix+'/dojo/dojox';
requireCfg['paths']['dijit'] = prefix+'/dojo/dijit';
requireCfg['paths']['pentaho/common'] = prefix+'/dojo/pentaho/common';


requireCfg['paths']['local'] = prefix+'/util/local';
requireCfg['paths']['service'] = prefix+'/util/service';
requireCfg['paths']['css'] = prefix+'/util/require-css/css' + (isDebug ? "" : ".min");

requireCfg['paths']['common-repo'] = prefix+'/repo';
//requireCfg['paths']['common-repo/pentaho-ajax'] = prefix+'/repo/pentaho-ajax';

requireCfg['paths']['common-data'] = prefix+'/dataapi';

requireCfg['paths']['dojo/on'] = prefix+'/dojo/pentaho/common/overrides/dojo/on';

requireCfg['paths']['dojox/layout/ResizeHandle'] = prefix+'/dojo/pentaho/common/overrides/dojox/layout/ResizeHandle';
requireCfg['paths']['dojox/grid/_View'] = prefix+'/dojo/pentaho/common/overrides/dojox/grid/_View';
requireCfg['paths']['dojox/xml/parser'] = prefix+'/dojo/pentaho/common/overrides/dojox/xml/parser';
requireCfg['paths']['dojox/grid/Selection'] = prefix+'/dojo/pentaho/common/overrides/dojox/grid/Selection';
requireCfg['paths']['dojox/grid/_FocusManager'] = prefix+'/dojo/pentaho/common/overrides/dojox/grid/_FocusManager';
requireCfg['paths']['dojox/grid/_Scroller'] = prefix+'/dojo/pentaho/common/overrides/dojox/grid/_Scroller';
requireCfg['paths']['dojox/storage'] = prefix+'/dojo/pentaho/common/overrides/dojox/storage';
requireCfg['paths']['dojox/json'] = prefix+'/dojo/pentaho/common/overrides/dojox/json';
requireCfg['paths']['dojox/rpc'] = prefix+'/dojo/pentaho/common/overrides/dojox/rpc';
requireCfg['paths']['dojo/_base/kernel'] = prefix+'/dojo/pentaho/common/overrides/dojo/_base/kernel';
requireCfg['paths']['dojo/store/Memory'] = prefix+'/dojo/pentaho/common/overrides/dojo/store/Memory';


// Plugin Handlers
requireCfg['paths']['common-ui/PluginHandler'] = prefix+'/plugin-handler/pluginHandler';
requireCfg['paths']['common-ui/Plugin'] = prefix+'/plugin-handler/plugin';
requireCfg['paths']['common-ui/AngularPluginHandler'] = prefix+'/plugin-handler/angularPluginHandler';
requireCfg['paths']['common-ui/AngularPlugin'] = prefix+'/plugin-handler/angularPlugin';
requireCfg['paths']['common-ui/AnimatedAngularPluginHandler'] = prefix+'/plugin-handler/animatedAngularPluginHandler';
requireCfg['paths']['common-ui/AnimatedAngularPlugin'] = prefix+'/plugin-handler/animatedAngularPlugin';

requireCfg['paths']['common-ui/jquery'] = prefix+'/jquery/jquery-1.9.1.min';


requireCfg['paths']['common-ui/handlebars'] = prefix+'/handlebars/handlebars';
requireCfg['paths']['common-ui/jquery-i18n'] = prefix+'/jquery/jquery.i18n.properties-min';
requireCfg['paths']['common-ui/jquery-pentaho-i18n'] = prefix+'/jquery/jquery.i18n.properties.supported.languages';
requireCfg['paths']['common-ui/bootstrap'] = prefix+'/bootstrap/bootstrap.min';
requireCfg['paths']['common-ui/ring'] = prefix+'/ring/ring';
requireCfg['paths']['common-ui/underscore'] = prefix+'/underscore/underscore';
requireCfg['paths']['underscore'] = prefix+'/underscore/underscore';

requireCfg['paths']['common-ui/angular'] = prefix+'/angular/angular'+(isDebug? "" : ".min");
requireCfg['paths']['common-ui/angular-i18n'] = prefix+'/angular/i18n';
requireCfg['paths']['common-ui/angular-resource'] = prefix+'/angular/angular-resource'+(isDebug? "" : ".min");
requireCfg['paths']['common-ui/angular-route'] = prefix+'/angular/angular-route'+(isDebug? "" : ".min");
requireCfg['paths']['common-ui/angular-animate'] = prefix+'/angular/angular-animate'+(isDebug? "" : ".min");
requireCfg['paths']['common-ui/angular-sanitize'] = prefix+'/angular/angular-sanitize'+(isDebug? "" : ".min");

requireCfg['paths']['common-ui/es5-shim'] = prefix+'/util/es5-shim';
requireCfg['paths']['common-ui/properties-parser'] = prefix+'/angular-translate/properties-parser';
requireCfg['paths']['common-ui/angular-translate'] = prefix+'/angular-translate/angular-translate'+(isDebug? "" : ".min");
requireCfg['paths']['common-ui/angular-translate-loader-partial'] = prefix+'/angular-translate/angular-translate-loader-partial'+(isDebug? "" : ".min");
requireCfg['paths']['common-ui/angular-translate-loader-static'] = prefix+'/angular-translate/angular-translate-loader-static'+(isDebug? "" : ".min");

requireCfg['paths']['common-ui/angular-ui-bootstrap'] = prefix+'/bootstrap/ui-bootstrap-tpls-0.6.0.min';

requireCfg['shim']['common-ui/jquery'] = { exports: '$' };

requireCfg['shim']['common-ui/bootstrap'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/jquery-i18n'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/handlebars'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/ring'] = {deps: ['common-ui/underscore'], exports: "ring"};

requireCfg['shim']['common-ui/angular'] = {
  deps: ['common-ui/jquery'],
  exports: 'angular',
  init: function() {
    var locale;
    // go load the i18n for angular
    if (typeof SESSION_LOCALE != "undefined") {
      locale = SESSION_LOCALE;
    } else {
      locale = "en";
    }
    locale = locale.replace('_', "-").toLowerCase();
    require(["common-ui/angular-i18n/angular-locale_" + locale], function() {
      // var $injector = angular.injector(['ng']);
      // $injector.invoke(function($filter) {
      //   console.log($filter('date')(new Date(), "yy-MMM-d"));
      // });
    }, function(err) {
      // couldn't find the locale specified, fall back
      var prev = locale;
      if(locale.length > 2) {
        // strip off the country designation, try to get just the language
        locale = locale.substring(0,2);
      } else {
        locale = "en";
      }
      if(console && console.warn) {
        console.warn("Could not load locale for '" + prev + "', falling back to '" + locale + "'");
      }

      require(["common-ui/angular-i18n/angular-locale_" + locale], function() { }, function(err) {
        // can't find the language at all, go get english
        if(console && console.warn) {
          console.warn("Could not load locale for '" + locale + "', falling back to 'en'");
        }
        require(["common-ui/angular-i18n/angular-locale_en"], function() { });
      });
    });
  }
};

requireCfg['shim']['common-ui/angular-resource'] = ['common-ui/angular'];
requireCfg['shim']['common-ui/angular-route'] = ['common-ui/angular'];
requireCfg['shim']['common-ui/angular-animate'] = ['common-ui/angular'];
requireCfg['shim']['common-ui/angular-sanitize'] = ['common-ui/angular'];

requireCfg['shim']['common-ui/angular-translate'] = ['common-ui/es5-shim', 'common-ui/angular'];
requireCfg['shim']['common-ui/properties-parser'] = ['common-ui/es5-shim'];
requireCfg['shim']['common-ui/angular-translate-loader-partial'] = ['common-ui/angular-translate'];
requireCfg['shim']['common-ui/angular-translate-loader-static'] = ['common-ui/angular-translate'];
requireCfg['shim']['common-ui/angular-translate'] = ['common-ui/es5-shim', 'common-ui/angular'];
requireCfg['shim']['common-ui/angular-translate'] = ['common-ui/es5-shim', 'common-ui/angular'];

/* UI-Bootstrap configuration */
requireCfg['shim']['common-ui/angular-ui-bootstrap'] = ['common-ui/angular'];

requireCfg['shim']['common-ui/PluginHandler'] = ['common-ui/jquery'];
requireCfg['paths']['common-ui/angular-directives'] = prefix + '/angular-directives';
requireCfg['shim']['common-ui/angular-directives'] = ['common-ui/angular-ui-bootstrap'];
