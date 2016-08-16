/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
define([
  "dojo/_base/declare", "dojo/Stateful", "dojo/_base/array", "dojo/Evented", "dojo/_base/lang", "dojo/aspect"
], function(declare, Stateful, array, Evented, lang, aspect) {

  var O_hasOwn = Object.prototype.hasOwnProperty;

  var Configuration = declare("pentaho.common.propertiesPanel.Configuration", [Stateful, Evented], {
    constructor: function(configuration) {
      this.items = [];
      this.itemsById = {};
      this.rawConfiguration = configuration;
      if(configuration && configuration.properties) {
        array.forEach(configuration.properties, this.initializeItem, this);
      }
    },

    initializeItem: function(item) {
      var ItemClass = Configuration.registeredTypes[item.ui.type];
      if(!ItemClass)
        throw "No Properties Panel UI implementation found for " + item.ui.type;

      var propItem = new ItemClass(item);
      propItem.postCreate();

      aspect.after(propItem, "onModelEvent", lang.hitch(this, function(eventName, args) {
        this.onModelEvent(propItem, eventName, args);
      }), true);

      propItem.watch(lang.hitch(this, function(propName, old, now) {
        this.onModelEvent(propItem, propName, {prevVal: old, newVal: now});
      }));

      this.items.push(propItem);
      this.itemsById[propItem.id] = propItem;
    },

    onModelEvent: function(item, eventName, args) {
    },

    byId: function(id) {
      if(O_hasOwn.call(this.itemsById, id)) return this.itemsById[id];
    }
  });

  Configuration.registeredTypes = {};

  var propertiesPanel = pentaho.common.propertiesPanel;

  var Property = declare("pentaho.common.propertiesPanel.Property", [Stateful, Evented], {
    value: null,

    constructor: function(item) {
      this.item = item;
      lang.mixin(this, item);

      // Default to 1st possible value.
      if(this.value == null && this.values && this.values.length)
        this.value = this.values[0];
    },

    postCreate: function() {
    },

    setValue: function(value) {
      this.value = value;
    },

    onModelEvent: function(prop, args) {
      // stub which others can connect to to "listen"
    }
  });

  declare("pentaho.common.propertiesPanel.GemBar", [Property], {
    gems: null,
    _value: null,
    selectedGem: null,
    allowMultiple: true,

    constructor: function(item) {
    },

    postCreate: function () {
      var originalGems = this.gems;
      this.gems = [];
      array.forEach(originalGems, this.initializeGem, this);
    },

    initializeGem: function(gemJson) {
      var gem = new Configuration.registeredTypes["gem"](gemJson);
      gem.postCreate();
      this._value = null;
      this.gems.push(gem);
    },

    createGemFromNode: function(sourceNode) {
      var GemClass = Configuration.registeredTypes["gem"];
      var options = {
              id:         "gem-" + sourceNode.id,
              value:      sourceNode.innerHTML.replace(/'/g, "&#39;"),
              gemBar:     this,
              sourceNode: sourceNode,
              dndType:    sourceNode.getAttribute("dndType")
            };

      // check to see if it's a factory class
      return GemClass.create ? GemClass.create(options) : new GemClass(options);
    },

    createGemByFormula: function(formula, value) {
      var GemClass = Configuration.registeredTypes["gem"];
      var options = {
          formula: formula,
          value: value,
          gemBar: this
      };

      // check to see if it's a factory class
      return GemClass.create ? GemClass.create(options) : new GemClass(options);
    },

    remove: function (gem) {
      this._value = null;
      this.gems.splice(this.gems.indexOf(gem), 1);

      // fire event
      this.set("gems", this.gems);
      this.onModelEvent("removedGem", {gem: gem});
    },

    add: function(gem) {
      this._value = null;
      this.gems.push(gem);

      // fire event
      this.set("gems", this.gems);
      this.onModelEvent("insertAt", {gem: gem, idx: this.gems.length, oldIdx: -1});
    },

    reorder: function() {
      this._value = null;
      this.set("gems", this.gems);
      this.onModelEvent("reorderedGems", {});
    },

    insertAt: function(gem, newIdx, oldIdx) {
      this._value = null;
      var currIdx = array.indexOf(this.gems, gem);
      this.gems.splice(newIdx, 0, gem); // add it to the new pos
      var oldIdx = currIdx;
      if(currIdx > -1) { //reorder
        if(currIdx >= newIdx) {
          currIdx++;
        }
        this.gems.splice(currIdx, 1); // remove from old pos
      }
      // adjust new index to account for a move
      if(currIdx > -1 && currIdx < newIdx) {
        newIdx--;
      }
      this.onModelEvent("insertAt", {gem: gem, idx: newIdx, oldIdx: oldIdx});
    }
  });

  // NOTE: Unfortunately, dojo's declare doesn't support JS get/set props.
  // so this has to be defined a posteriori.
  // IVisualRoleRequirement#value : Attribute[]
  // TODO: Anyway this can get real Attribute instances from the current data table Model?
  Object.defineProperty(propertiesPanel.GemBar.prototype, "value", {
    get: function() {
      if(!this.gems) return;

      return this._value ||
        (this._value = this.gems.map(function(gem) {
          return {
            name:  gem.id,
            label: gem.value,
            type:  gem.type === "measure" ? "number" : "string"
          };
        }));
    }
  });

  Configuration.registeredTypes["gemBar"  ] = propertiesPanel.GemBar;
  Configuration.registeredTypes["gem"     ] = Property;
  Configuration.registeredTypes["combo"   ] = Property;
  Configuration.registeredTypes["slider"  ] = Property;
  Configuration.registeredTypes["textbox" ] = Property;
  Configuration.registeredTypes["checkbox"] = Property;
  Configuration.registeredTypes["button"  ] = Property;

  return Configuration;
});
