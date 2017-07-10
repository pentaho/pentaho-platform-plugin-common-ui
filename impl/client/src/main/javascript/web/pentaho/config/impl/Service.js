/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "module",
  "../../lang/Base",
  "../../util/spec",
  "../../lang/ArgumentRequiredError",
  "../../lang/SortedList"
], function(module, Base, specUtil, ArgumentRequiredError, SortedList) {

  "use strict";

  /**
   * List of names of environment variables that are handled "generically" when sorting rules.
   * More specific first.
   *
   * @type {string[]}
   * @see pentaho.environment.IEnvironment
   * @see _ruleComparer
   * @see _ruleFilterer
   */
  var _selectCriteria = [
    "user", // TODO: is now user.id and will not have effect as is
    "theme",
    "locale",
    "application"
  ];

  /**
   * The ordinal value of the next rule that is registered.
   *
   * This is used as the fallback rule order.
   * Ensures sorting algorithm stability, because insertion order would be lost during a re-sort.
   *
   * @type {number}
   * @see pentaho.config.Service#addRule
   */
  var _ruleCounter = 0;

  /**
   * @classDesc The `Service` class is the base implementation of the {@link pentaho.config.IService} interface.
   *
   * @class
   * @alias Service
   * @memberOf pentaho.config.impl
   * @amd pentaho/config/impl/Service
   *
   * @extends pentaho.lang.Base
   * @implements pentaho.config.IService
   *
   * @description Creates a configuration service instance with no registrations.
   */
  var ConfigurationService = Base.extend(module.id, /** @lends pentaho.config.impl.Service# */{

    constructor: function() {
      /**
       * A map connecting a value type's absolute identifier to
       * the applicable type configuration rules,
       * ordered from least to most specific.
       *
       * @type {Object.<string, Array.<pentaho.config.spec.IRule>>}
       * @private
       */
      this.__ruleStore = {};
    },

    /** @inheritdoc */
    add: function(config) {
      if(config.rules) {
        config.rules.forEach(function(rule) {
          this.addRule(rule);
        }, this);
      }
    },

    /**
     * Adds a type configuration rule.
     *
     * The insertion order is used as the fallback rule order.
     * For more information on the specificity of rules,
     * see [config.spec.IRuleSet]{@link pentaho.config.spec.IRuleSet}.
     *
     * Note that the specified rule object may be slightly modified to serve
     * the service's internal needs.
     *
     * @param {!pentaho.config.spec.IRule} rule - The type configuration rule to add.
     */
    addRule: function(rule) {
      // Assuming the Service takes ownership of
      // the rules, so mutating it directly is ok
      rule._ordinal = _ruleCounter++;

      var select = rule.select || {};
      var typeIds = select.type;
      if(!typeIds)
        throw new ArgumentRequiredError("rule.select.type");

      if(!Array.isArray(typeIds)) {
        typeIds = [typeIds];
      }

      typeIds.forEach(function(typeId) {
        if(!typeId)
          throw new ArgumentRequiredError("rule.select.type");

        if(!this.__ruleStore[typeId]) {
          this.__ruleStore[typeId] = new SortedList({"comparer": _ruleComparer});
        }

        this.__ruleStore[typeId].push(rule);
      }, this);
    },

    /** @inheritdoc */
    select: function(typeId, context) {
      var rules = this.__ruleStore[typeId] || [];
      var filtered_rules = rules.filter(_ruleFilterer, context || {});
      var configs = filtered_rules.map(function(rule) {
        return rule.apply;
      });

      if(configs.length === 0) {
        return null;
      }

      return configs.reduce(specUtil.merge.bind(specUtil), {});
    }
  });

  return ConfigurationService;

  // region compare and select
  /**
   * Compares two type-configuration rules according to specificity.
   *
   * @param {pentaho.config.spec.IRule} r1 - The first type configuration rule.
   * @param {pentaho.config.spec.IRule} r2 - The second type configuration rule.
   *
   * @return {number} `-1`, if `r1` is more specific than `r2`,
   * `1`, if `r2` is more specific than `r1`,
   * and `0` if they have the same specificity.
   */
  function _ruleComparer(r1, r2) {
    var priority1 = r1.priority || 0;
    var priority2 = r2.priority || 0;

    if(priority1 !== priority2) {
      return priority1 > priority2 ? 1 : -1;
    }

    var s1 = r1.select || {};
    var s2 = r2.select || {};

    for(var i = 0, ic = _selectCriteria.length; i !== ic; ++i) {
      var key = _selectCriteria[i];

      var isDefined1 = s1[key] != null;
      var isDefined2 = s2[key] != null;

      if(isDefined1 !== isDefined2) {
        return isDefined1 ? 1 : -1;
      }
    }

    return r1._ordinal > r2._ordinal ? 1 : -1;
  }

  /**
   * Determines if a given rule is selected by the current context.
   *
   * @param {pentaho.config.spec.IRule} rule - A type configuration rule to check.
   * @this pentaho.environment.IEnvironment
   * @return {boolean} `true` if `rule` is selected, `false`, otherwise.
   */
  function _ruleFilterer(rule) {
    /* jshint validthis:true*/

    var select = rule.select || {};
    for(var i = 0, ic = _selectCriteria.length; i !== ic; ++i) {
      var key = _selectCriteria[i];

      var possibleValues = select[key];

      if(possibleValues != null) {
        var criteriaValue = this[key];

        var multi = Array.isArray(possibleValues);
        if(!multi && possibleValues !== criteriaValue ||
            multi && possibleValues.indexOf(criteriaValue) === -1) {
          return false;
        }
      }
    }

    return true;
  }
  // endregion
});
