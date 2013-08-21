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

requireCfg['shim']['common-ui/bootstrap'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/jquery-i18n'] = ['common-ui/jquery'];
requireCfg['shim']['common-ui/handlebars'] = ['common-ui/jquery'];
