/*!
 * Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
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
 *
 */
var prefix = (typeof CONTEXT_PATH != "undefined") ? CONTEXT_PATH + 'content/common-ui/resources/web' : "common-ui"; //prod vs build

requireCfg['paths']['common-ui'] = prefix;

requireCfg['paths']['dojo'] = prefix+'/dojo/dojo';
requireCfg['paths']['dojox'] = prefix+'/dojo/dojox';
requireCfg['paths']['dijit'] = prefix+'/dojo/dijit';
requireCfg['paths']['pentaho/common'] = prefix+'/dojo/pentaho/common';


requireCfg['paths']['local'] = prefix+'/util/local';

requireCfg['paths']['common-repo'] = prefix+'/repo';
//requireCfg['paths']['common-repo/pentaho-ajax'] = prefix+'/repo/pentaho-ajax';

requireCfg['paths']['common-data'] = prefix+'/dataapi';

requireCfg['paths']['dojox/layout/ResizeHandle'] = prefix+'/dojo/pentaho/common/overrides/dojox/layout/ResizeHandle';
requireCfg['paths']['dojox/grid/_View'] = prefix+'/dojo/pentaho/common/overrides/dojox/grid/_View';
requireCfg['paths']['dojox/xml/parser'] = prefix+'/dojo/pentaho/common/overrides/dojox/xml/parser';
requireCfg['paths']['dojox/grid/Selection'] = prefix+'/dojo/pentaho/common/overrides/dojox/grid/Selection';
requireCfg['paths']['dojox/grid/_FocusManager'] = prefix+'/dojo/pentaho/common/overrides/dojox/grid/_FocusManager';
requireCfg['paths']['dojox/grid/_Scroller'] = prefix+'/dojo/pentaho/common/overrides/dojox/grid/_Scroller';
requireCfg['paths']['dojox/storage'] = prefix+'/dojo/pentaho/common/overrides/dojox/storage';
requireCfg['paths']['dojo/_base/kernel'] = prefix+'/dojo/pentaho/common/overrides/dojo/_base/kernel';


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
requireCfg['paths']['common-ui/bootstrap'] = prefix+'/bootstrap/bootstrap.min';
requireCfg['paths']['common-ui/ring'] = prefix+'/ring/ring';
requireCfg['paths']['common-ui/underscore'] = prefix+'/underscore/underscore';
requireCfg['paths']['underscore'] = prefix+'/underscore/underscore';

requireCfg['paths']['common-ui/angular'] = prefix+'/angular/angular.min';
requireCfg['paths']['common-ui/angular-resource'] = prefix+'/angular/angular-resource.min';
requireCfg['paths']['common-ui/angular-route'] = prefix+'/angular/angular-route.min';
requireCfg['paths']['common-ui/angular-animate'] = prefix+'/angular/angular-animate.min';

requireCfg['paths']['common-ui/angular-ui-bootstrap'] = prefix+'/bootstrap/ui-bootstrap-tpls-0.6.0.min';
//
//requireCfg['shim']['common-data/module'] = [
//  'common-repo/module',
//  'common-data/oop',
//  'common-data/app',
//  'common-data/controller',
//  'common-data/xhr',
//  'common-data/cda',
//  'common-data/models-mql'
//];
//
//requireCfg['shim']['common-data/app'] = ['common-data/oop'];
//requireCfg['shim']['common-data/controller'] = ['common-data/oop', 'common-data/app'];
//requireCfg['shim']['common-data/xhr'] = ['common-data/oop'];
//requireCfg['shim']['common-data/cda'] = ['common-data/oop'];
//requireCfg['shim']['common-data/models-mql'] = ['common-data/oop', 'common-data/controller'];



requireCfg['shim']['common-ui/jquery'] = { exports: '$' };



requireCfg['shim']['common-ui/bootstrap'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/jquery-i18n'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/handlebars'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/ring'] = {deps: ['common-ui/underscore'], exports: "ring"};

requireCfg['shim']['common-ui/angular'] = {deps: ['common-ui/jquery'], exports: 'angular'};
requireCfg['shim']['common-ui/angular-resource'] = ['common-ui/angular'];
requireCfg['shim']['common-ui/angular-route'] = ['common-ui/angular'];
requireCfg['shim']['common-ui/angular-animate'] = ['common-ui/angular'];

/* UI-Bootstrap configuration */
requireCfg['shim']['common-ui/angular-ui-bootstrap'] = ['common-ui/angular'];

requireCfg['shim']['common-ui/PluginHandler'] = ['common-ui/jquery'];