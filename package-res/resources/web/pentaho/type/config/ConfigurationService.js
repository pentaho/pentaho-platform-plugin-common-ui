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
  "../../lang/SortedList"
], function(Base, SortedList) {
  "use strict";

  var _selectCriteria = [
    "user",
    "theme",
    "locale",
    "application"
  ];

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

  function _ruleFilterer(rule) {
    // The expected value of `this` is the criteria object

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

  var _ruleCounter = 0;

  var ConfigurationService = Base.extend("pentaho.type.config.ConfigurationService", {
    /**
     * @private
     */
    _ruleStore: null,

    constructor: function() {
      this._ruleStore = {};
    },

    add: function(config) {
      if (config.rules) {
        config.rules.forEach(function(rule) {
          this.addRule(rule);
        }, this);
      }
    },

    addRule: function(rule) {
      // needed to make this explicit to keep the sorting
      // algorithm stable (insertion order would be lost on resorts)
      // also assuming the ConfigurationService takes ownership of
      // the rules, so mutating it directly is ok
      rule._ordinal = _ruleCounter++;

      var select = rule.select || {};
      var typeIds = select.type || ["pentaho/type/value"];
      if (!Array.isArray(typeIds)) {
        typeIds = [typeIds];
      }

      typeIds.forEach(function(typeId) {
        var type = toAbsTypeId(typeId);

        // TODO Replace with custom collection with ordered insert
        if (!this._ruleStore[type]) {
          this._ruleStore[type] = new SortedList({"comparer": _ruleComparer});
        }

        this._ruleStore[type].push(rule);
      }, this);
    },

    select: function(typeId, criteria) {
      var type = toAbsTypeId(typeId);

      var rules = this._ruleStore[type] || [];
      var filtered_rules = rules.filter(_ruleFilterer, criteria || {});
      var configs = filtered_rules.map(function(rule) {
        return rule.apply;
      });

      // TODO Merge and return
      // Temporary placeholder mock implementation
      // always return last configuration (or empty, if none)
      return configs.length === 0 ? null : configs.pop();
    }
  });

  return ConfigurationService;

  function toAbsTypeId(id) {
    return id.indexOf("/") < 0 ? ("pentaho/type/" + id) : id;
  }
});
