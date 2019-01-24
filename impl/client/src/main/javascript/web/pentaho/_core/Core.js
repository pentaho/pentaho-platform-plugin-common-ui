/*!
 * Copyright 2018 - 2019 Hitachi Vantara. All rights reserved.
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
  "../module/util",
  "../util/fun",
  "../config/ExternalAnnotation",
  "pentaho/util/requireJSConfig!"
], function(localRequire, module, moduleMetaServiceFactory, moduleMetaFactory, instanceModuleMetaFactory,
            typeModuleMetaFactory, ModuleService, configurationServiceFactory, moduleUtil, F, ExternalConfigAnnotation,
            requireJSConfig) {

  "use strict";

  var RULESET_TYPE_ID = moduleUtil.resolveModuleId("pentaho/config/spec/IRuleSet", module.id);
  var MODULES_ID = moduleUtil.resolveModuleId("pentaho/modules", module.id);
  var EXTERNAL_CONFIG_ANNOTATION_ID = ExternalConfigAnnotation.id;

  /**
   * @classDesc The `Core` class represents the core layer of the Pentaho JavaScript platform.
   *
   * @memberOf pentaho._core
   * @class
   * @private
   *
   * @param {pentaho.environment.IEnvironment} environment - The environment.
   */
  function Core(environment) {

    this.environment = environment;
  }

  /**
   * Creates and initializes a `Core` instance having the given environment,
   * modules configuration and rule sets.
   *
   * @param {pentaho.environment.IEnvironment} environment - The environment.
   *
   * @return {Promise.<pentaho._core.Core>} A promise that resolves to the created and initialized `Core` instance.
   */
  Core.createAsync = function(environment) {

    // Create the Core instance.
    var core = new Core(environment);

    // Standard (and only) module kinds.
    core.ModuleMeta = moduleMetaFactory(core);
    core.TypeModuleMeta = typeModuleMetaFactory(core);
    core.InstanceModuleMeta = instanceModuleMetaFactory(core);

    // Create the module metadata service.
    var ModuleMetaService = moduleMetaServiceFactory(core);
    core.moduleMetaService = new ModuleMetaService();

    core.moduleService = new ModuleService(core.moduleMetaService);

    return loadConfigRuleSetsAsync().then(initGivenConfigRules);

    /**
     * Loads AMD-config registered configuration rule-set modules.
     *
     * @return {Promise.<Array.<pentaho.config.spec.IRuleSet>>} A promise for an array of rule sets.
     */
    function loadConfigRuleSetsAsync() {

      var ruleSetModuleMetas = core.moduleMetaService.getInstancesOf(RULESET_TYPE_ID);
      if(ruleSetModuleMetas.length === 0) {
        return Promise.resolve([]);
      }

      // Ensure repeatable rule application. This effectively ignores the ranking of rule set modules...
      ruleSetModuleMetas = ruleSetModuleMetas.slice().sort(function(a, b) {
        return F.compare(a.id, b.id);
      });

      return Promise.all(ruleSetModuleMetas.map(loadRuleSetModuleMetaAsync));
    }

    /**
     * Loads a rule set given its module metadata.
     *
     * @param {pentaho.module.InstanceMeta} ruleSetModuleMeta - The module metadata.
     *
     * @return {Promise.<pentaho.config.spec.IRuleSet>} A promise for a rule set.
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
     * @param {Array.<pentaho.config.spec.IRuleSet>} moduleRuleSets - The array of module rule sets.
     *
     * @return {Promise.<pentaho._core.Core>} A promise for the `Core` instance.
     */
    function initGivenConfigRules(moduleRuleSets) {

      // Create the configuration service given all of the rule-sets.

      core.ConfigurationService = configurationServiceFactory(core);

      var configService = core.configService = new core.ConfigurationService(environment, selectExternalConfigsAsync);

      moduleRuleSets.forEach(function(ruleSet) {
        // Filter out rule sets whose loading failed.
        if(ruleSet !== null) {
          configService.add(ruleSet);
        }
      });

      // Load "pentaho/modules" _environmental_ configuration.
      return configService.selectAsync(MODULES_ID)
        .then(function(modulesConfig) {
          // Configure the `moduleMetaService` with any existing environmental configuration.
          if(modulesConfig !== null) {
            core.moduleMetaService.configure(modulesConfig);
          }

          return core;
        });
    }

    /**
     * Gets a promise for an array of external configurations, including each's priority.
     *
     * @param {string} moduleId - The module identifier.
     *
     * @return {Promise.<?({priority: number, config: object})>} A promise for an array of external configurations.
     */
    function selectExternalConfigsAsync(moduleId) {

      // "pentaho/modules"
      if(moduleId === MODULES_ID) {
        return selectGlobalModulesConfigAsync();
      }

      var prioritizedConfigs = null;

      // Assume "pentaho/modules" has already been setup.
      var module = core.moduleMetaService.get(moduleId);
      if(module !== null) {

        var config = module.__configSpec;
        if(config !== null) {
          prioritizedConfigs = [{priority: -Infinity, config: config}];
        }

        // Get annotations of subtypes of pentaho.config.ExternalAnnotation.
        var prioritizedConfigsPromise = selectModuleAnnotationsConfigAsync(module);
        if(prioritizedConfigsPromise !== null) {

          if(prioritizedConfigs !== null) {
            prioritizedConfigsPromise = prioritizedConfigsPromise.then(function(annotatedPrioritizedConfigs) {

              prioritizedConfigs.push.apply(prioritizedConfigs, annotatedPrioritizedConfigs);

              return prioritizedConfigs;
            });
          }

          return prioritizedConfigsPromise;
        }
      }

      return Promise.resolve(prioritizedConfigs);
    }

    /**
     * Gets a promise for an array with the configuration of "pentaho/modules".
     *
     * @return {Promise.<?({priority: number, config: object})>} A promise for an array with the global modules
     * configuration or for `null`.
     */
    function selectGlobalModulesConfigAsync() {

      var prioritizedConfigs = null;

      // Get the global AMD configuration.
      var globalModulesMap = requireJSConfig.config[MODULES_ID] || null;
      if(globalModulesMap !== null) {
        prioritizedConfigs = [
          {priority: -Infinity, config: globalModulesMap}
        ];
      }

      return Promise.resolve(prioritizedConfigs);
    }

    /**
     * Gets a promise for an array of a module's annotations' prioritized configurations.
     *
     * @param {pentaho.module.IMeta} module - The module.
     *
     * @return {Promise.<?({priority: number, config: object})>} A promise for an array of external configurations.
     */
    function selectModuleAnnotationsConfigAsync(module) {

      var annotationsIds = module.getAnnotationsIds();
      if(annotationsIds !== null) {

        var configAnnotationsIds = annotationsIds.filter(isExternalConfigAnnotation);
        if(configAnnotationsIds.length > 0) {

          var annotatedPrioritizedConfigsPromises = configAnnotationsIds.map(function(configAnnotationId) {

            return loadModuleAsync(configAnnotationId).then(function(Annotation) {

              return module.getAnnotationAsync(Annotation).then(function(configAnnotation) {

                return {priority: Annotation.priority, config: configAnnotation.config};
              });
            });
          });

          return Promise.all(annotatedPrioritizedConfigsPromises);
        }
      }

      return null;
    }

    /**
     * Determines if an annotation is a subtype of {@link pentaho.config.ExternalAnnotation}, given its identifier.
     *
     * @param {string} annotationId - The annotation identifier.
     * @return {boolean} `true` if it is; `false`, otherwise.
     */
    function isExternalConfigAnnotation(annotationId) {

      var module = core.moduleMetaService.get(annotationId);
      return module !== null && module.kind === "type" && __isExternalConfigAnnotation(module);
    }

    /**
     * Determines if an annotation module is a subtype of {@link pentaho.config.ExternalAnnotation}.
     *
     * @param {pentaho.module.ITypeMeta} module - The annotation module.
     * @return {boolean} `true` if it is; `false`, otherwise.
     */
    function __isExternalConfigAnnotation(module) {

      if(module.id === EXTERNAL_CONFIG_ANNOTATION_ID) {
        return true;
      }

      var ancestor;
      return (ancestor = module.ancestor) !== null && __isExternalConfigAnnotation(ancestor);
    }

    /**
     * Loads a module given its identifier.
     *
     * @param {string} moduleId - The module identifier.
     * @return {Promise} A promise for the module's value.
     */
    function loadModuleAsync(moduleId) {
      return core.moduleMetaService.get(moduleId).loadAsync();
    }
  };

  return Core;
});
