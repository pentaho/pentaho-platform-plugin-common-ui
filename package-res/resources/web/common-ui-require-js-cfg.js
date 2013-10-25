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

requireCfg['paths']['common-ui'] = CONTEXT_PATH+'content/common-ui/resources/web';
requireCfg['paths']['local'] = CONTEXT_PATH+'content/common-ui/resources/web/util/local';

requireCfg['paths']['common-repo'] = CONTEXT_PATH+'api/repos/common-ui/resources/web/repo';
requireCfg['paths']['common-data'] = CONTEXT_PATH+'api/repos/common-ui/resources/web/dataapi';

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


requireCfg['paths']['common-ui/jquery'] = CONTEXT_PATH+'api/repos/common-ui/resources/web/jquery/jquery-1.9.1.min';
requireCfg['paths']['common-ui/handlebars'] = CONTEXT_PATH+'api/repos/common-ui/resources/web/handlebars/handlebars';
requireCfg['paths']['common-ui/jquery-i18n'] = CONTEXT_PATH+'api/repos/common-ui/resources/web/jquery/jquery.i18n.properties-min';
requireCfg['paths']['common-ui/bootstrap'] = CONTEXT_PATH+'api/repos/common-ui/resources/web/bootstrap/bootstrap.min';
requireCfg['paths']['common-ui/angular'] = CONTEXT_PATH+'api/repos/common-ui/resources/web/angular/angular.min';

requireCfg['shim']['common-ui/bootstrap'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/jquery-i18n'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/handlebars'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/angular'] = ['common-ui/jquery'];
