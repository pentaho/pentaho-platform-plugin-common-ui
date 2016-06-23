/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../../lang/Base",
  "../util",
  "../../lang/SortedList"
], function(Base, typeUtil, SortedList) {
  "use strict";

  /**
   * List of names of context variables that are handled "generically" when sorting rules.
   * More specific first.
   *
   * @type {string[]}
   * @see pentaho.spec.IContextVars
   * @see _ruleComparer
   * @see _ruleFilterer
   */
  var _selectCriteria = [
    "user",
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
   * @see pentaho.type.config.ConfigurationService#addRule
   */
  var _ruleCounter = 0;

  /**
   * @classDesc The `ConfigurationService` class is the base implementation of
   * the {@link pentaho.type.IConfigurationService} interface.
   *
   * @class
   * @alias ConfigurationService
   * @memberOf pentaho.type.config
   * @amd pentaho/type/config/ConfigurationService
   *
   * @extends pentaho.lang.Base
   * @implements pentaho.type.IConfigurationService
   *
   * @description Creates a configuration service instance with no registrations.
   */
  var ConfigurationService = Base.extend("pentaho.type.config.ConfigurationService",
  /** @lends pentaho.type.config.ConfigurationService# */{

    constructor: function() {
      /**
       * A map connecting a value type's absolute identifier to
       * the applicable type configuration rules,
       * ordered from least to most specific.
       *
       * @type {Object.<string, Array.<pentaho.type.spec.ITypeConfigurationRule>>}
       * @private
       */
      this._ruleStore = {};
    },

    /** @inheritdoc */
    add: function(config) {
      if (config.rules) {
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
     * see [spec.ITypeConfiguration]{@link pentaho.type.spec.ITypeConfiguration}.
     *
     * Note that the specified rule object may be slightly modified to serve
     * the service's internal needs.
     *
     * @param {!pentaho.type.spec.ITypeConfigurationRule} rule - The type configuration rule to add.
     */
    addRule: function(rule) {
      // Assuming the ConfigurationService takes ownership of
      // the rules, so mutating it directly is ok
      rule._ordinal = _ruleCounter++;

      var select = rule.select || {};
      var typeIds = select.type || ["pentaho/type/value"];
      if (!Array.isArray(typeIds)) {
        typeIds = [typeIds];
      }

      typeIds.forEach(function(typeId) {
        var type = toAbsTypeId(typeId);

        if (!this._ruleStore[type]) {
          this._ruleStore[type] = new SortedList({"comparer": _ruleComparer});
        }

        this._ruleStore[type].push(rule);
      }, this);
    },

    /** @inheritdoc */
    select: function(typeId, contextVars) {
      var type = toAbsTypeId(typeId);

      var rules = this._ruleStore[type] || [];
      var filtered_rules = rules.filter(_ruleFilterer, contextVars || {});
      var configs = filtered_rules.map(function(rule) {
        return rule.apply;
      });

      if (configs.length === 0) {
        return null;
      }

      return configs.reduce(typeUtil.mergeSpecs.bind(typeUtil), {});
    }
  });

  return ConfigurationService;

  //region compare and select
  /**
   * Compares two type-configuration rules according to specificity.
   *
   * @param {pentaho.type.spec.ITypeConfigurationRule} r1 - The first type configuration rule.
   * @param {pentaho.type.spec.ITypeConfigurationRule} r2 - The second type configuration rule.
   *
   * @return {number} `-1`, if `r1` is more specific than `r2`,
   * `1`, if `r2` is more specific than `r1`,
   * and `0` if they have the same specificity.
   */
  function _ruleComparer(r1, r2) {
    var priority1 = r1.priority || 0;
    var priority2 = r2.priority || 0;

    if (priority1 !== priority2) {
      return priority1 > priority2 ? 1 : -1;
    }

    var s1 = r1.select || {};
    var s2 = r2.select || {};

    for (var i = 0, ic = _selectCriteria.length; i !== ic; ++i) {
      var key = _selectCriteria[i];

      var isDefined1 = s1[key] != null;
      var isDefined2 = s2[key] != null;

      if (isDefined1 !== isDefined2) {
        return isDefined1 ? 1 : -1;
      }
    }

    return r1._ordinal > r2._ordinal ? 1 : -1;
  }

  /**
   * Determines if a given rule is selected by the current context variables.
   *
   * @param {pentaho.type.spec.ITypeConfigurationRule} rule - A type configuration rule to check.
   * @this pentaho.spec.IContextVars
   * @return {boolean} `true` if `rule` is selected, `false`, otherwise.
   */
  function _ruleFilterer(rule) {
    /*jshint validthis:true*/

    var select = rule.select || {};
    for (var i = 0, ic = _selectCriteria.length; i !== ic; ++i) {
      var key = _selectCriteria[i];

      var possibleValues = select[key];

      if (possibleValues != null) {
        var criteriaValue = this[key];

        var multi = Array.isArray(possibleValues);
        if (!multi && possibleValues !== criteriaValue ||
            multi && possibleValues.indexOf(criteriaValue) === -1) {
          return false;
        }
      }
    }

    return true;
  }
  //endregion
/**
   * Ensures that standard value type ids are made absolute.
   *
   * @param {string} id - A value type identifier.
   */
  function toAbsTypeId(id) {
    return id.indexOf("/") < 0 ? ("pentaho/type/" + id) : id;
  }
});
