/*!
 * Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dojo/dnd/Source"
  , "dojo/Stateful", "dojo/_base/array", "dojo/Evented", "dojo/_base/lang", "dojo/aspect"],
    function (declare, _WidgetBase, _Templated, on, query, Source, Stateful, array, Evented, lang, aspect) {
      var Configuration = declare("pentaho.common.propertiesPanel.Configuration", [Stateful, Evented],
          {
            constructor: function (configuration) {
              this.items = [];
              this.rawConfiguration = configuration;
              if (configuration && configuration.properties) {
                array.forEach(configuration.properties, this.initializeItem, this);
              }
            },
            initializeItem: function (item) {

              var propertyClass = Configuration.registeredTypes[item.ui.type];
              if (!propertyClass) {
                throw "No Properties Panel UI implementation found for " + item.ui.type;
              }
              var propItem = new propertyClass(item);
              propItem.postCreate();
              var outterThis = this;
              aspect.after(propItem,  "onModelEvent", function (eventName,  args) {
                outterThis.onModelEvent(propItem, eventName, args);
              }, true);
              propItem.watch(function (propName, old, now) {
                outterThis.onModelEvent(propItem, propName, {prevVal: old, newVal: now});
              });
              this.items.push(propItem);
            },

            onModelEvent: function (item, eventName, args) {

            },
            byId: function (id) {
              for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id == id) {
                  return this.items[i];
                }
              }
            }

          });
      Configuration.registeredTypes = {};

      declare(
          "pentaho.common.propertiesPanel.Property",
          [Stateful, Evented],
          {
            constructor: function (item) {
              this.item = item;
              lang.mixin(this, item);
            },
            postCreate: function () {
            },
            value: null,
            setValue: function (value) {
              this.value = value;
            },
            onModelEvent: function (prop, args) {
              // stub which others can connect to to "listen"
            }
          });


      declare(
          "pentaho.common.propertiesPanel.GemBar",
          [pentaho.common.propertiesPanel.Property],
          {
            gems: null,
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
              this.gems.push(gem);
            },

            createGemFromNode: function(sourceNode) {
              var GemClass = Configuration.registeredTypes["gem"];
              var options = {
                      id:         "gem-" + sourceNode.id,
                      value:      sourceNode.innerHTML,
                      gemBar:     this,
                      sourceNode: sourceNode,
                      dndType:    sourceNode.getAttribute("dndType")
                    };

              // check to see if it's a factory class
              return GemClass.create ? GemClass.create(options) : new GemClass(options);
            },

            remove: function (gem) {
              this.gems.splice(this.gems.indexOf(gem), 1);

              // fire event
              this.set("gems", this.gems);
              this.onModelEvent("removedGem", {gem: gem});
            },

            add: function (gem) {
              this.gems.push(gem);

              // fire event
              this.set("gems", this.gems);
              this.onModelEvent("insertAt", {gem: gem, idx: this.gems.length, oldIdx: -1});
            },

            reorder: function () {
              this.set("gems", this.gems);
              this.onModelEvent("reorderedGems", {});
            },

            insertAt: function (gem, newIdx, oldIdx) {
              var currIdx = array.indexOf(this.gems, gem);
              this.gems.splice(newIdx, 0, gem); // add it to the new pos
              var oldIdx = currIdx;
              if (currIdx > -1) { //reorder
                if (currIdx >= newIdx) {
                  currIdx++;
                }
                this.gems.splice(currIdx, 1); // remove from old pos
              }
              // adjust new index to account for a move
              if (currIdx > -1 && currIdx < newIdx) {
                newIdx--;
              }
              this.onModelEvent("insertAt", {gem: gem, idx: newIdx, oldIdx: oldIdx});
            }
          });

      Configuration.registeredTypes["gemBar"] = pentaho.common.propertiesPanel.GemBar;
      Configuration.registeredTypes["gem"] = pentaho.common.propertiesPanel.Property;
      Configuration.registeredTypes["combo"] = pentaho.common.propertiesPanel.Property;
      Configuration.registeredTypes["slider"] = pentaho.common.propertiesPanel.Property;
      Configuration.registeredTypes["textbox"] = pentaho.common.propertiesPanel.Property;
      Configuration.registeredTypes["checkbox"] = pentaho.common.propertiesPanel.Property;
      Configuration.registeredTypes["button"] = pentaho.common.propertiesPanel.Property;
      return Configuration;
    });
