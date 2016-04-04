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
  "../../lang/Base"
], function(Base) {
  "use strict";

  var ConfigurationService = Base.extend("pentaho.type.config.ConfigurationService", /** @lends pentaho.type.config.ConfigurationService#*/{
    /**
     * @private
     */
    ruleStore: {},

    constructor: function() {
    },

    add: function(config) {
      if (config.rules) {
        config.rules.forEach(function(rule) {
          this.addRule(rule);
        }, this);
      }
    },

    addRule: function(rule) {
      var select = rule.select || {};
      var typeIds = select.type || ["pentaho/type/Instance"];
      if (!Array.isArray(typeIds)) {
        typeIds = [typeIds];
      }

      typeIds.forEach(function(typeId) {
        // TODO Replace with custom collection with ordered insert
        if (!this.ruleStore[typeId]) {
          this.ruleStore[typeId] = [];
        }

        this.ruleStore[typeId].push(rule);
      }, this);
    },

    select: function(typeId, criteria) {
      // TODO Select the apropriate rules, merge them and return

      // Temporary placeholder mock implementation
      // always return first configuration (or empty, if none)
      var rules = [];
      if (this.ruleStore[typeId]) {
        rules = this.ruleStore[typeId].map(function(rule) {
          return rule.apply;
        });
      }

      return rules.length === 0 ? null : rules[0];
    }
  });

  return ConfigurationService;
});
