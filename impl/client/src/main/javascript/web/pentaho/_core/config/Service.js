/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "../../lang/Base",
  "../../lang/SortedList",
  "../../lang/ArgumentRequiredError",
  "../../util/spec",
  "../../util/object",
  "../../util/promise",
  "../../util/fun",
  "../../util/requireJSConfig!",
  "../../module/util"
], function(localRequire, module, Base, SortedList, ArgumentRequiredError, specUtil,
            O, promiseUtil, F, requireJSConfig, moduleUtil) {

  "use strict";

  /**
   * List of names of environment variables that are handled "generically" when sorting rules.
   * More specific first.
   *
   * @type {string[]}
   * @see pentaho.environment.IEnvironment
   * @see __ruleComparer
   * @see __ruleFilterer
   */
  var __selectCriteria = [
    "user", // TODO: is now user.id and will not have effect as is
    "theme",
    "locale",
    "application"
  ];

  return function(core) {

    /**
     * The ordinal value of the next rule that is registered.
     *
     * This is used as the fallback rule order.
     * Ensures sorting algorithm stability, because insertion order would be lost during a re-sort.
     *
     * @type {number}
     *
     * @see pentaho.config.IService#addRule
     */
    var __ruleCounter = 0;

    var ConfigurationService = Base.extend(module.id, /** @lends pentaho._core.config.Service# */{

      /**
       * @classDesc The `Service` class is an in-memory implementation of
       * the {@link pentaho.config.IService} interface.
       *
       * @alias Service
       * @memberOf pentaho._core.config
       * @class
       * @extends pentaho.lang.Base
       * @implements {pentaho.config.IService}
       *
       * @description Creates a configuration service instance for a given environment.
       *
       * @param {?pentaho.environment.IEnvironment} [environment] - The environment used to select configuration rules.
       */
      constructor: function(environment) {

        /**
         * The environment used to select configuration rules.
         * @type {pentaho.environment.IEnvironment}
         * @readOnly
         */
        this.__environment = environment || {};

        /**
         * A map connecting a type or instance identifier to the applicable configuration rules,
         * ordered from least to most specific.
         *
         * @type {Object.<string, Array.<pentaho.config.spec.IRule>>}
         * @private
         */
        this.__ruleStore = Object.create(null);
      },

      /**
       * Adds a configuration rule set.
       *
       * @param {?pentaho.config.spec.IRuleSet} ruleSet - A configuration rule set to add.
       */
      add: function(ruleSet) {

        if(ruleSet && ruleSet.rules) {

          var contextId = ruleSet.contextId || null;

          ruleSet.rules.forEach(function(rule) {
            this.addRule(rule, contextId);
          }, this);
        }
      },

      /**
       * Adds a configuration rule.
       *
       * The insertion order is used as the fallback rule order.
       * For more information on the specificity of rules,
       * see [config.spec.IRuleSet]{@link pentaho.config.spec.IRuleSet}.
       *
       * Note that the specified rule object may be slightly modified to serve
       * the service's internal needs.
       *
       * @param {pentaho.config.spec.IRule} rule - The configuration rule to add.
       * @param {?string} [contextId] - The module identifier to which rule `modules` and `deps`
       * are relative to. Also, this module determines any applicable AMD/RequireJS mappings.
       *
       * @throw {pentaho.lang.OperationInvalidError} When `rule` has relative dependencies and `contextId`
       * is not specified.
       */
      addRule: function(rule, contextId) {

        // Assuming the Service takes ownership of the rules,
        // so mutating it directly is ok.
        rule._ordinal = __ruleCounter++;

        var select = rule.select || {};

        // TODO: remove the fallbacks.
        var moduleIds = select.module || select.instance || select.type;
        if(!moduleIds) {
          throw new ArgumentRequiredError("rule.select.module");
        }

        if(!Array.isArray(moduleIds)) {
          moduleIds = [moduleIds];
        }

        var depIds = rule.deps;
        if(depIds) {
          // Again, assuming the Service takes ownership of the rules,
          // so mutating it directly is ok.
          depIds.forEach(function(depId, index) {
            depIds[index] = moduleUtil.resolveModuleId(depId, contextId);
          });
        }

        moduleIds.forEach(function(moduleId) {
          if(!moduleId) {
            throw new ArgumentRequiredError("rule.select.module");
          }

          moduleId = moduleUtil.resolveModuleId(moduleId, contextId);

          var list = this.__ruleStore[moduleId];
          if(!list) {
            this.__ruleStore[moduleId] = list = new SortedList({comparer: __ruleComparer});
          }

          list.push(rule);
        }, this);
      },

      /** @inheritDoc */
      selectAsync: function(moduleId, keyArgs) {

        var excludeGlobal = !!(keyArgs && keyArgs.excludeGlobal);
        var globalConfig = excludeGlobal ? null : (requireJSConfig.config[moduleId] || null);

        var rules = O.getOwn(this.__ruleStore, moduleId, null);
        if(rules === null) {
          return Promise.resolve(globalConfig);
        }

        var filteredRules = rules.filter(__ruleFilterer, this.__environment);
        if(filteredRules.length === 0) {
          return Promise.resolve(globalConfig);
        }

        var depPromisesList = null;
        var depIndexesById = null;

        var processDependency = function(depIdOrAlias) {

          var depId = core.moduleMetaService.getId(depIdOrAlias) || depIdOrAlias;

          var depIndex = O.getOwn(depIndexesById, depId, null);
          if(depIndex === null) {
            depIndex = depPromisesList.length;
            depIndexesById[depId] = depIndex;
            depPromisesList.push(__loadDependency(depId));
          }

          return depIndex;
        };

        var createRuleConfigFactory = function(rule) {

          var isFun = F.is(rule.apply);
          var depIndexes = isFun ? [] : null;

          // Process rule dependencies.
          if(rule.deps) {

            if(depPromisesList === null) {
              depPromisesList = [];
              depIndexesById = Object.create(null);
            }

            rule.deps.forEach(function(depIdOrAlias) {
              var depIndex = processDependency(depIdOrAlias);
              if(isFun) {
                depIndexes.push(depIndex);
              }
            });
          }

          return isFun
            ? __wrapRuleConfigFactory(rule.apply, depIndexes)
            : F.constant(rule.apply);
        };

        // Collect all configs and start loading any dependencies.
        var configFactories = filteredRules.map(createRuleConfigFactory);

        if(globalConfig !== null) {
          // Global configuration has the least priority.
          configFactories.unshift(F.constant(globalConfig));
        }

        // Wait for any dependencies to be loaded...
        return Promise.all(depPromisesList || [])
          .then(function(depValues) {

            return configFactories.reduce(function(result, configFactory) {

              // Obtain this rule's configuration.
              var config = configFactory(depValues);

              // Merge the config with the current result.
              return specUtil.merge(result, config);
            }, {});
          });
      }
    });

    function __loadDependency(id) {
      var module = core.moduleMetaService.get(id);
      return module !== null ? module.loadAsync() : promiseUtil.require(id, localRequire);
    }

    return ConfigurationService;
  };

  function __wrapRuleConfigFactory(factory, depIndexes) {

    return function ruleConfigFactoryCaller(allDepValues) {

      // Collect this rule's dependencies.
      var depValues = depIndexes.map(function(depIndex) {
        return allDepValues[depIndex];
      });

      // Call the configuration factory.
      return factory.apply(null, depValues);
    };
  }

  // region compare and select
  /**
   * Compares two type configuration rules according to specificity.
   *
   * @param {pentaho.config.spec.IRule} r1 - The first type configuration rule.
   * @param {pentaho.config.spec.IRule} r2 - The second type configuration rule.
   *
   * @return {number} `-1`, if `r1` is more specific than `r2`,
   * `1`, if `r2` is more specific than `r1`,
   * and `0` if they have the same specificity.
   */
  function __ruleComparer(r1, r2) {
    var priority1 = r1.priority || 0;
    var priority2 = r2.priority || 0;

    if(priority1 !== priority2) {
      return priority1 > priority2 ? 1 : -1;
    }

    var s1 = r1.select || {};
    var s2 = r2.select || {};

    for(var i = 0, ic = __selectCriteria.length; i !== ic; ++i) {
      var key = __selectCriteria[i];

      var isDefined1 = s1[key] != null;
      var isDefined2 = s2[key] != null;

      if(isDefined1 !== isDefined2) {
        return isDefined1 ? 1 : -1;
      }
    }

    return r1._ordinal > r2._ordinal ? 1 : -1;
  }

  /**
   * Determines if a given rule is selected by the current environment.
   *
   * @this pentaho.environment.IEnvironment
   *
   * @param {pentaho.config.spec.IRule} rule - A type configuration rule to check.
   *
   * @return {boolean} `true` if `rule` is selected, `false`, otherwise.
   */
  function __ruleFilterer(rule) {

    var select = rule.select;
    if(select) {
      // Doing it backwards because `application` is the most common criteria...
      var i = __selectCriteria.length;
      while(i--) {
        var key = __selectCriteria[i];

        var possibleValues = select[key];
        if(possibleValues != null) {

          var criteriaValue = this[key];

          if(Array.isArray(possibleValues)
            ? possibleValues.indexOf(criteriaValue) === -1
            : possibleValues !== criteriaValue) {
            return false;
          }
        }
      }
    }

    return true;
  }
  // endregion
});
