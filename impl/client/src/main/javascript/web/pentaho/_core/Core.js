/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
define([
  "require",
  "module",
  "./module/MetaService",
  "./module/Meta",
  "./module/InstanceMeta",
  "./module/TypeMeta",
  "./module/Service",
  "./config/Service",
  "../module/util"
], function(localRequire, module, moduleMetaServiceFactory, moduleMetaFactory, instanceModuleMetaFactory,
            typeModuleMetaFactory, ModuleService, configurationServiceFactory, moduleUtil) {

  "use strict";

  var RULESET_TYPE_ID = "pentaho/config/spec/IRuleSet";
  var MODULES_ID = "pentaho/modules";
  var __keyArgsExcludeGlobal = Object.freeze({excludeGlobal: true});

  /**
   * @classDesc The `Core` class represents the core layer of the Pentaho JavaScript platform.
   *
   * @memberOf pentaho._core
   * @class
   * @private
   *
   * @param {!pentaho.environment.IEnvironment} environment - The environment.
   */
  function Core(environment) {

    this.environment = environment;
  }

  /**
   * Creates and initializes a `Core` instance having the given environment,
   * modules configuration and rule sets.
   *
   * @param {!pentaho.environment.IEnvironment} environment - The environment.
   * @param {pentaho.module.spec.MetaMap} globalModuleMap - The global modules map.
   *
   * @return {!Promise.<!pentaho._core.Core>} A promise that resolves to the created and initialized `Core` instance.
   */
  Core.createAsync = function(environment, globalModuleMap) {

    // Create the Core instance.
    var core = new Core(environment);

    // Standard (and only) module kinds.
    core.ModuleMeta = moduleMetaFactory(core);
    core.TypeModuleMeta = typeModuleMetaFactory(core);
    core.InstanceModuleMeta = instanceModuleMetaFactory(core);

    // Create the module metadata service.
    var ModuleMetaService = moduleMetaServiceFactory(core);

    core.moduleMetaService = new ModuleMetaService();
    core.moduleMetaService.configure(globalModuleMap);

    core.moduleService = new ModuleService(core.moduleMetaService);

    // Module meta service could also be used to obtain a registration for
    // the configuration service itself. Don't think it's worth the effort now.

    return loadConfigRuleSetsAsync().then(initGivenConfigRules);

    /**
     * Loads AMD-config registered configuration rule-set modules.
     *
     * @return {!Promise.<!Array.<pentaho.config.spec.IRuleSet>>} A promise for an array of rule sets.
     */
    function loadConfigRuleSetsAsync() {

      var ruleSetModuleMetas = core.moduleMetaService.getInstancesOf(RULESET_TYPE_ID);
      if(ruleSetModuleMetas.length === 0) {
        return Promise.resolve([]);
      }

      // Ensure repeatable rule application. This effectively ignores the ranking of rule set modules...
      ruleSetModuleMetas = ruleSetModuleMetas.slice().sort(function(a, b) {
        return a.id.localeCompare(b.id);
      });

      return Promise.all(ruleSetModuleMetas.map(loadRuleSetModuleMetaAsync));
    }

    /**
     * Loads a rule set given its module metadata.
     *
     * @param {!pentaho.module.InstanceMeta} ruleSetModuleMeta - The module metadata.
     *
     * @return {!Promise.<pentaho.config.spec.IRuleSet>} A promise for a rule set.
     */
    function loadRuleSetModuleMetaAsync(ruleSetModuleMeta) {

      return ruleSetModuleMeta
        .loadAsync()
        .then(function(ruleSet) {
          // This allows for resolution of relative dependencies.
          if(ruleSet && !ruleSet.contextId) {
            ruleSet.contextId = ruleSetModuleMeta.id;
          }

          return ruleSet;
        }, function() {
          // Swallow and return null.
          return null;
        });
    }

    /**
     * Performs the remaining initialization of the Core instance given the registered configuration rule sets.
     *
     * @param {!Array.<pentaho.config.spec.IRuleSet>} moduleRuleSets - The array of module rule sets.
     *
     * @return {!Promise.<!pentaho._core.Core>} A promise for the `Core` instance.
     */
    function initGivenConfigRules(moduleRuleSets) {

      // Create the configuration service given all of the rule-sets.

      core.ConfigurationService = configurationServiceFactory(core);

      var configService = core.configService = new core.ConfigurationService(environment);

      moduleRuleSets.forEach(function(ruleSet) {
        // Filter out rule sets whose loading failed.
        if(ruleSet !== null) {
          configService.add(ruleSet);
        }
      });

      // Load "pentaho/modules" _environmental_ configuration.
      // Do not include the AMD/RequireJS configuration,
      // as it would unnecessarily account for `globalModuleMap`, twice.
      return configService.selectAsync(MODULES_ID, __keyArgsExcludeGlobal)
        .then(function(modulesConfig) {
          // Configure the `moduleMetaService` with any existing environmental configuration.
          if(modulesConfig !== null) {
            core.moduleMetaService.configure(modulesConfig);
          }

          return core;
        });
    }
  };

  return Core;
});
