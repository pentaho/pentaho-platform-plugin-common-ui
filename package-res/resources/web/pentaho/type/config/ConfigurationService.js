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
  "../../lang/SortedList",
  "../../util/object",
  "../../util/error"
], function(Base, SortedList, O, error) {
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
   * Map of merge operation name to operation handler function.
   *
   * @type {Object.<string, function>}
   * @see mergeSpecsOne
   */
  var _mergeHandlers = {
    "replace": mergeSpecsOperReplace,
    "merge": mergeSpecsOperMerge,
    "add": mergeSpecsOperAdd
  };

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

      var config = configs.reduce(mergeSpecsInto, {});

      return config;
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

  //region merge
  /**
   * Merges a value type configuration specification into another.
   *
   * The target specification is modified,
   * but the source specification isn't.
   * The latter is actually deep-cloned, whenever full-subtrees are set at a target place,
   * to prevent future merges from inadvertently changing the source's internal structures.
   *
   * @param {!pentaho.type.spec.IValueTypeProto} typeSpecTarget - The target specification.
   * @param {!pentaho.type.spec.IValueTypeProto} typeSpecSource - The source specification.
   *
   * @return {pentaho.type.spec.IValueTypeProto} The target specification.
   */
  function mergeSpecsInto(typeSpecTarget, typeSpecSource) {

    for (var name in typeSpecSource)
      if (O.hasOwn(typeSpecSource, name))
        mergeSpecsOne(typeSpecTarget, name, typeSpecSource[name]);

    return typeSpecTarget;
  }

  /**
   * Merges one property into a target object,
   * given the source property name and value.
   *
   * @param {!Object} target - The target object.
   * @param {string} name - The source property name.
   * @param {any} sourceValue - The source property value.
   */
  function mergeSpecsOne(target, name, sourceValue) {
    var op;

    if (isPlainJSObject(sourceValue)) {
      // Is `sourceValue` an operation structure?
      //   {$op: "merge", value: {}}
      if ((op = sourceValue.$op)) {
        // Always deref source value, whether or not `op` is merge.
        sourceValue = sourceValue.value;

        // Merge operation only applies between two plain objects and
        // add operation only applies between two arrays.
        // Otherwise behaves like _replace_.
        if (op === "merge" && !isPlainJSObject(sourceValue) || op === "add" && !Array.isArray(sourceValue)) {
          op = "replace";
        }
      } else {
        op = "merge";
      }
    }

    var handler = O.getOwn(_mergeHandlers, op || "replace");
    if (!handler)
      throw error.operInvalid("Merge operation '" + op + "' is not defined.");

    handler(target, name, sourceValue);
  }

  /**
   * Performs the merge operation when the target value is also a plain object,
   * or replaces it, if not.
   *
   * @param {!Object} target - The target object.
   * @param {string} name - The source property name.
   * @param {!Object} sourceValue - The source property value.
   */
  function mergeSpecsOperMerge(target, name, sourceValue) {
    // Is `targetValue` also a plain object?
    var targetValue = target[name];
    if (isPlainJSObject(targetValue))
      mergeSpecsInto(targetValue, sourceValue);
    else
      mergeSpecsOperReplace(target, name, sourceValue);
  }

  /**
   * Replaces the target value with a deep, own clone of the source value.
   *
   * @param {!Object} target - The target object.
   * @param {string} name - The source property name.
   * @param {any} sourceValue - The source property value.
   */
  function mergeSpecsOperReplace(target, name, sourceValue) {
    // Clone source value so that future merges into it don't change it, inadvertently.
    target[name] = cloneOwnDeep(sourceValue);
  }

  /**
   * When both the source and target values are arrays,
   * appends the source elements to the target array.
   * Otherwise, replaces the target array with a deep,
   * own clone of the source array.
   *
   * @param {!Object} target - The target object.
   * @param {string} name - The source property name.
   * @param {any} sourceValue - The source property value.
   */
  function mergeSpecsOperAdd(target, name, sourceValue) {
    // If both are arrays, append source to target, while cloning source elements.
    // Else, fallback to replace operation.
    var targetValue;
    if (Array.isArray(sourceValue) && Array.isArray((targetValue = target[name]))) {
      var i = -1;
      var L = sourceValue.length;
      while (++i < L)
        targetValue.push(cloneOwnDeep(sourceValue[i]));

    } else {
      mergeSpecsOperReplace(target, name, sourceValue);
    }
  }

  /**
   * Creates a deep, own clone of a given value.
   *
   * For plain object values, only their _own_ properties are included.
   *
   * @param {any} value - The value to clone deeply.
   *
   * @return {any} The deeply cloned value.
   */
  function cloneOwnDeep(value) {
    if (value && typeof value === "object") {
      if (value instanceof Array) {
        value = value.map(cloneOwnDeep);
      } else if (value.constructor === Object) {
        var clone = {};
        O.eachOwn(value, function(vi, p) {
          this[p] = cloneOwnDeep(vi);
        }, clone);
        value = clone;
      }
    }

    return value;
  }
  //endregion

  /**
   * Checks if a value is a plain JavaScript object.
   *
   * @param {any} value - The value to check.
   *
   * @return {boolean} `true` if it is; `false` if is not.
   */
  function isPlainJSObject(value) {
    return (!!value) && (typeof value === "object") && (value.constructor === Object);
  }

  /**
   * Ensures that standard value type ids are made absolute.
   *
   * @param {string} id - A value type identifier.
   */
  function toAbsTypeId(id) {
    return id.indexOf("/") < 0 ? ("pentaho/type/" + id) : id;
  }
});
