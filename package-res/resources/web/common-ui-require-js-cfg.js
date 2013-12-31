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
var prefix = CONTEXT_PATH + 'content/';

requireCfg['paths']['common-ui'] = prefix+'common-ui/resources/web';
requireCfg['paths']['local'] = prefix+'common-ui/resources/web/util/local';

requireCfg['paths']['common-repo'] = CONTEXT_PATH + 'api/repos/common-ui/resources/web/repo';
requireCfg['paths']['common-data'] = prefix + 'common-ui/resources/web/dataapi';

requireCfg['shim']['common-repo/module'] = [
  'common-repo/state',
  'common-repo/pentaho-ajax',
  'common-repo/pentaho-thin-app'
];

requireCfg['shim']['common-data/module'] = [
  'common-repo/module',
  'common-data/oop',
  'common-data/app',
  'common-data/controller',
  'common-data/xhr',
  'common-data/cda',
  'common-data/models-mql'
];

requireCfg['shim']['common-data/app'] = ['common-data/oop'];
requireCfg['shim']['common-data/controller'] = ['common-data/oop', 'common-data/app'];
requireCfg['shim']['common-data/xhr'] = ['common-data/oop'];
requireCfg['shim']['common-data/cda'] = ['common-data/oop'];
requireCfg['shim']['common-data/models-mql'] = ['common-data/oop', 'common-data/controller'];


requireCfg['paths']['common-ui/jquery'] = prefix + 'common-ui/resources/web/jquery/jquery-1.9.1.min';
requireCfg['shim']['common-ui/jquery'] = { exports: '$' };

requireCfg['paths']['common-ui/handlebars'] = prefix + 'common-ui/resources/web/handlebars/handlebars';
requireCfg['paths']['common-ui/jquery-i18n'] = prefix + 'common-ui/resources/web/jquery/jquery.i18n.properties-min';
requireCfg['paths']['common-ui/bootstrap'] = prefix + 'common-ui/resources/web/bootstrap/bootstrap.min';
requireCfg['paths']['common-ui/ring'] = prefix + 'common-ui/resources/web/ring/ring';
requireCfg['paths']['common-ui/underscore'] = prefix + 'common-ui/resources/web/underscore/underscore';

requireCfg['shim']['common-ui/bootstrap'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/jquery-i18n'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/handlebars'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/ring'] = {deps: ['common-ui/underscore'], exports: "ring"};

requireCfg['paths']['common-ui/angular'] = prefix + 'common-ui/resources/web/angular/angular.min';
requireCfg['paths']['common-ui/angular-resource'] = prefix + 'common-ui/resources/web/angular/angular-resource.min';
requireCfg['paths']['common-ui/angular-route'] = prefix + 'common-ui/resources/web/angular/angular-route.min';
requireCfg['paths']['common-ui/angular-animate'] = prefix + 'common-ui/resources/web/angular/angular-animate.min';

requireCfg['shim']['common-ui/angular'] = {deps: ['common-ui/jquery'], exports: 'angular'};
requireCfg['shim']['common-ui/angular-resource'] = ['common-ui/angular'];
requireCfg['shim']['common-ui/angular-route'] = ['common-ui/angular'];
requireCfg['shim']['common-ui/angular-animate'] = ['common-ui/angular'];

/* UI-Bootstrap configuration */
requireCfg['paths']['common-ui/angular-ui-bootstrap'] = prefix + 'common-ui/resources/web/bootstrap/ui-bootstrap-tpls-0.6.0.min';
requireCfg['shim']['common-ui/angular-ui-bootstrap'] = ['common-ui/angular'];

// Plugin Handlers
requireCfg['paths']['common-ui/PluginHandler'] = prefix + 'common-ui/resources/web/plugin-handler/pluginHandler';
requireCfg['paths']['common-ui/Plugin'] = prefix + 'common-ui/resources/web/plugin-handler/plugin';
requireCfg['paths']['common-ui/AngularPluginHandler'] = prefix + 'common-ui/resources/web/plugin-handler/angularPluginHandler';
requireCfg['paths']['common-ui/AngularPlugin'] = prefix + 'common-ui/resources/web/plugin-handler/angularPlugin';
requireCfg['paths']['common-ui/AnimatedAngularPluginHandler'] = prefix + 'common-ui/resources/web/plugin-handler/animatedAngularPluginHandler';
requireCfg['paths']['common-ui/AnimatedAngularPlugin'] = prefix + 'common-ui/resources/web/plugin-handler/animatedAngularPlugin';

requireCfg['shim']['common-ui/PluginHandler'] = ['common-ui/jquery'];