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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojo/query"
  ,"dijit/layout/ContentPane"
  ,"dijit/layout/BorderContainer"
  ,"dijit/form/HorizontalSlider"
  ,"dijit/form/TextBox"
  ,"dijit/form/ComboBox"
  ,"dojo/data/ItemFileReadStore"
  ,"dijit/form/Select"
  ,"dijit/form/CheckBox"
  ,"dijit/TitlePane"
  ,"pentaho/common/Messages", "dojo/_base/array", "dojo/_base/lang", "dojo/html", "dojo/dom-construct",
  "dojo/string", "dojo/dom-class", "pentaho/common/propertiesPanel/Configuration", "dijit/registry", "dojo/dnd/Target",
  "dojo/dnd/Source", "dojo/Evented", "dojo/topic", "dojo/dnd/Manager", "dojo/dom", "dojo/dom-geometry", "dojo/aspect"],
    function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, ContentPane, BorderContainer, HorizontalSlider, TextBox, ComboBox, ItemFileReadStore, Select, CheckBox, TitlePane, Messages, array, lang, html, construct, string, domClass, Configuration, registry, Target, Source, Evented, topic, ManagerClass,
              dom, geometry, aspect) {

      var nextId = 0;
      function newId(prefix) {
        return prefix + (++nextId);
      }

      var Panel = declare("pentaho.common.propertiesPanel.Panel",
          [ContentPane, Evented],
          {
            captionTemplate: "<div class='caption'><span class='caption-text'>${ui.caption:i18n}&nbsp;&nbsp;</span><i class='captionIcon'></i></div>",
            seperatorTemplate: "<div class='propPanel-seperator'></div>",
            propUIs: [],
            groups: {},
            gutters: false,
            baseClass: "pentahoPropertiesPanel",
            minHeightDeviation: 0,

            _gemUIByGemId: null,

            constructor: function(propertiesConfiguration) {
              this.configuration = propertiesConfiguration;
              this._gemUIByGemId = {};
            },

            postCreate: function() {
              array.forEach(this.configuration.items, lang.hitch(this, "initializeItem"));

              //var placeholderPanel = new dijit.layout.ContentPane({region: "center", splitter: false});
              //this.domNode.appendChild(placeholderPanel.domNode);
              this.inherited(arguments);
            },

            resize: function() {
              this.minHeightDeviation = 0; // zero out adjustments
              this.inherited(arguments);
            },

            initializeItem: function(item) {
              if(item.ui.hidden) { return; }

              // Lookup class impl from map
              var LayoutItemClass = Panel.registeredTypes[item.ui.type];
              if(!LayoutItemClass) {
                throw "No Properties Panel UI implementation found for " + item.ui.type;
              }

              var propUI;
              // check to see if it's a factory class
              if(LayoutItemClass.create) {
                propUI = LayoutItemClass.create({model: item, propPanel: this});
              } else {
                propUI = new LayoutItemClass({model: item, propPanel: this});
              }

              var targetNode = this.domNode;

              // If the property is grouped, create the group or add it to the existing one.
              var groupId = item.ui.group;
              if(groupId) {
                var group = this._getOrCreateGroup(groupId);
                if(group) { targetNode = group.content; }
              }

              // Items can request a separator to be inserted before themselves
              if(item.ui.seperator) {
                targetNode.appendChild(construct.toDom(this.seperatorTemplate));
              }

              // Items can have a caption.
              // If specified, create and add it before the property UI component
              if(item.ui.caption) {
                var cap = construct.toDom(string.substitute(this.captionTemplate, item, null,
                    {
                      i18n: function(value, key) {
                        return Messages.getString(value, value);
                      }
                    }));

                // support the new Themeable way
                var img = query("i", cap);
                if(img && img != null && img.length > 0) {
                  img = img[img.length - 1]; //select the last i tag found
                  if(item.ui.captionIcon) {
                    domClass.add(img, item.ui.captionIcon);
                  } else {
                    img.style.display = "none";
                  }
                }

                targetNode.appendChild(cap);
              }

              // Route UI events to onPropertyChange
              this.setupEventHandling(propUI);

              if(propUI instanceof GemUI) this.registerGemUI(propUI);

              this.propUIs.push(propUI);
              this.own(on(propUI, "UIEvent", lang.hitch(this, "onUIEvent")));
              domClass.add(propUI.domNode, "propPanelItem")

              targetNode.appendChild(propUI.domNode);

              this.resize();
            },

            _getOrCreateGroup: function(groupId) {
              var group = this.groups[groupId];
              if(!group) {
                var groupConfig = this.configuration.groups[groupId];
                if(groupConfig)
                  group = this._createGroup(groupId, groupConfig);
              }
              return group;
            },

            _createGroup: function(groupId, groupConfig) {
              var group = new TitlePane({
                    title:    Messages.getString(groupConfig.title, groupConfig.title),
                    content:  document.createElement("div"),
                    region:   'top',
                    splitter: false
                  });

              aspect.after(group, "resize", lang.hitch(this, function() {
                this._resizeGroup(group);
              }));

              aspect.after(group._wipeOut, "onEnd", lang.hitch(this, "resize"));
              aspect.after(group._wipeIn,  "onEnd", lang.hitch(this, "resize"));

              this.domNode.appendChild(group.domNode);

              return (this.groups[groupId] = group);
            },

            _resizeGroup: function(group) {
              var lastChild = geometry.position(this.domNode.children[this.domNode.children.length - 1]);
              var totalNumOfGroups = 0;
              var totalGroupHeight = 0;
              var totalNonGroupHeight = 0;

              var minHeightAdjustment = 0;
              for(var g in this.groups) {
                totalNumOfGroups++;
                var gp = this.groups[g];
                var titleBarHeight = geometry.position(gp.titleBarNode).h
                totalGroupHeight += (gp.open) ? titleBarHeight + gp.hideNode.scrollHeight : 0;
                if(gp.open) {
                  minHeightAdjustment += (gp.usingMinHeight) ? gp.heightAdjustment : 0;
                } else {
                  minHeightAdjustment += titleBarHeight;
                }
              }

              array.forEach(this.domNode.children, function(node) {
                if(!node.className.match(/dijitTitlePane/)) {
                  totalNonGroupHeight += geometry.position(node).h;
                }
              });

              var panelHeight = geometry.position(this.domNode).h;
              // if(totalGroupHeight + totalNonGroupHeight < panelHeight - /*margins*/ 20){
              //   // plenty of space, make natural size
              //   var gHeight = geometry.position(group.titleBarNode).h + group.hideNode.scrollHeight;
              //   group.domNode.style.height = gHeight + "px";
              //   group.hideNode.style.height = (gHeight - geometry.position(group.titleBarNode).h)+ "px";
              // } else {
              // divide up available room based on relative sizes of panels
              var remainderToDivide = geometry.position(this.domNode).h - totalNonGroupHeight - minHeightAdjustment;

              var titleCoords = geometry.position(group.titleBarNode);
              var titleBarHeight = titleCoords.h;
              var titleBarWidth = titleCoords.w;
              if(group.open) {
                var naturalHeight = titleBarHeight + group.hideNode.scrollHeight;

                var calculatedHeight = (naturalHeight / totalGroupHeight) * remainderToDivide;
                if(calculatedHeight > naturalHeight) {
                  // No need to scroll
                  group.hideNode.style.overflow = "hidden";
                  //previously scrolling divs don't always relayout when scrolling is disabled. set width to fix
                  group.wipeNode.style.width = titleBarWidth + "px";
                } else {
                  group.hideNode.style.overflow = "auto";
                  group.wipeNode.style.width = "";
                }

                // ensure minimum height
                var minHeightFactor = 2.2;
                if(calculatedHeight < titleBarHeight * minHeightFactor) {
                  group.usingMinHeight = true;
                  group.heightAdjustment = titleBarHeight * minHeightFactor - calculatedHeight;
                  calculatedHeight = titleBarHeight * minHeightFactor;
                } else {
                  group.usingMinHeight = false;
                }

                if(!isNaN(calculatedHeight)) {
                  group.domNode.style.height = calculatedHeight + "px";
                }

                if(geometry.position(group.domNode).h > 0) {
                  group.hideNode.style.height = Math.min((geometry.position(group.domNode).h - titleBarHeight), group.hideNode.scrollHeight) + "px";
                }
              } else {
                if(!isNaN(titleBarHeight)) {
                  group.domNode.style.height = titleBarHeight + "px";
                }
                group.usingMinHeight = false;
              }
              group.domNode.style.width = "";

              // }

              // setTimeout(function(){
              //   group._splitterWidget.domNode.style.top = Math.min(parseInt(group._splitterWidget.domNode.style.top), (parseInt(group.domNode.style.top) + parseInt(group.domNode.style.height))) + "px";
              // });
            },

            onUIEvent: function(type, args) {
              on.emit(this, type, args);
            },

            registerGemUI: function(gemUI) {
              this._gemUIByGemId[gemUI.model.id] = gemUI;
            },

            unregisterGemUI: function(gemUI) {
              delete this._gemUIByGemId[gemUI.model.id];
            },

            getGemUIById: function(id) {
              if(id) {
                var m = /^gem_(.*?)(:?_\d+)?$/.exec(id);
                if(m) id = m[1];
                return this._gemUIByGemId[id];
              }
            },

            setupEventHandling: function(ui) {
              this.own(on(ui, "contextMenu", function(e) {
                this.onUIEvent("onContextMenu", {item: ui, args: [ui, e]});
              }));
              this.own(on(ui, "click", function(e) {
                this.onUIEvent("onClick", {item: ui, args: [ui, e]});
              }));
              this.own(on(ui, "dblclick", function(e) {
                this.onUIEvent("onDblClick", {item: ui, args: [ui, e]});
              }));
            },

            setConfiguration: function(configJson) {
              this._setConfiguration(new Configuration(configJson));
            },

            _setConfiguration: function(config) {
              if(this.propUIs.length) this._destroyChildrenDeferred();

              this.propUIs = [];
              this.groups  = {};
              this._gemUIByGemId = {};

              this.domNode.innerHTML = "";
              this.configuration = config;
              this.postCreate();
            },

            _destroyChildrenDeferred: function() {
              var oldChildren = this.getChildren();

              function destroyOldChildren() {
                array.forEach(oldChildren, function(w) { w.destroyRecursive(); });
              }

              window.setTimeout(destroyOldChildren, 0);
            },

            reload: function() {
              this._setConfiguration(this.configuration);
            },

            set: function(property, id, value) {
              array.forEach(this.propUIs, function(prop) {
                if(prop.model.id == id) {
                  prop.model.set(property, value);
                }
              });
            }
          }
      );

      Panel.registeredTypes = {};

      var StatefulUI = declare([], {
        constructor: function(options) {
          this.model     = options.model;
          this.propPanel = options.propPanel;

          this._watchHandle = this.model.watch(lang.hitch(this, function(propName, prevVal, newVal) {
            switch(propName) {
              case "value":
              case "default":
                if(!this._destroyed) this.set(propName, newVal);
                break;
            }
          }));
        },

        onUIEvent: function(type, args) {
        },

        destroy: function() {
          this.inherited(arguments);

          this.model =
          this.propPanel = null;

          // Otherwise the old widgets get replaced by the new ones when reloading,
          // before being destroyed.
          if(this._watchHandle) {
            this._watchHandle.remove();
            this._watchHandle = null;
          }
        }
      });

      var GemBarUISource = declare([Source], {

        constructor: function(node) {
          this.dropIndicator = document.createElement("div");
          this.dropIndicator.className = "indicator";
          this.dropIndicator.id = "propertyPanelIndicator";
          this.dropIndicator.style.display = "none";

          // Source#topics
          this.topics.push(
            on(this.dropIndicator, "mouseover", lang.hitch(this, "_redirectMouseOver")),
            on(this.dropIndicator, "mouseup",   lang.hitch(this, "_redirectMouseUp"  )));

          var line = document.createElement("div");
          line.className = "indicatorLine";

          this.dropIndicator.appendChild(line);

          this.node.parentNode.appendChild(this.dropIndicator);
        },

        destroy: function() {
          this.inherited(arguments);

          this.gemBar =
          this.dropIndicator =
          this.gemUIbeingInserted = null;
        },

        _redirectMouseOver: function(e) {
          var idx = this._getNodeUnderMouse(e);
          this.lastItemOver = idx;
          if(idx > -1) {
            if(document.createEvent) {
              var evt = document.createEvent("MouseEvent");
              evt.initMouseEvent("mouseover", true, true, window, 0, e.screenX, e.screenY, e.clientX, e.clientY,
                  e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
              this.node.dispatchEvent(evt);
              this.node.children[idx].dispatchEvent(evt);


              evt = document.createEvent("MouseEvent");
              evt.initMouseEvent("mousemove", true, true, window, 0, e.screenX, e.screenY, e.clientX, e.clientY,
                  e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
              this.node.dispatchEvent(evt);
              this.node.children[idx].dispatchEvent(evt);
            } else if(document.createEventObject) {
              var evt = document.createEventObject(window.event);
              evt.button = 1;
              this.node.children[idx].fireEvent("onmouseover", evt);
              this.node.children[idx].fireEvent("onmousemove", evt);
            }
          }
        },

        _redirectMouseUp: function(e) {
          var idx = this._getNodeUnderMouse(e);
          if(idx > -1) {
            if(document.createEvent) {
              var evt = document.createEvent("MouseEvent");
              evt.initMouseEvent("mouseup", true, true, window, 0, e.screenX, e.screenY, e.clientX, e.clientY,
                  e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
              // this.node.dispatchEvent(evt);
              this.node.children[idx].dispatchEvent(evt);
            } else if(document.createEventObject) {
              var evt = document.createEventObject(window.event);
              this.node.children[idx].fireEvent("onmouseup", evt);
            }
          }
        },

        onDrop: function(source, nodes, copy, dropAtEnd) {
          this.dropAtEnd = dropAtEnd; // passed in by the placeholder source so we can know to insert at the end of the list
          this.dropZone2Zone = false; // flag moves from one gembar to another

          if(!nodes || nodes.length == 0) {
            return false;
          }

          var droppedNode = nodes[0];

          // Look for an existing gem for the same element.
          // Only check if not a reorder (same gemBar).
          var gemUI = this.gemBar.propPanel.getGemUIById(droppedNode.id);
          if((!gemUI || (gemUI && gemUI.gemBar != this.gemBar)) &&
             !this.gemBar.checkAcceptance(this, nodes, /* showErrors */ true)) {
            return;
          }

          var gem;
          if(gemUI) {
            gem = gemUI.model;
            if(gemUI.gemBar == this.gemBar) { // Reorder, notify model so it can fire an event
              // fire reordered in insertNodes where we know more information
            } else {
              this.dropZone2Zone = true;
              gemUI.gemBar.remove(gemUI, /*suppressEvent:*/true);
              // for moves we cache the previous bar in order to add it to the move event
              gemUI.model.previousGemBar = gemUI.gemBar.model;
              gemUI.gemBar = this.gemBar;
            }
          } else {
            gem   = this.createGemFromNode(droppedNode);
            gemUI = this.createGemUI(gem, droppedNode);

            nodes[0] = gemUI.domNode;
          }

          this.gemUIbeingInserted = gemUI;

          var newId = nodes[0].id;
          nodes[0].id = droppedNode.id; // need to ensure the original id is used when calling superclass
          this.inherited(arguments);
          nodes[0].id = newId;

          this.sync();
          source.sync();

          var postDrop = source.postDrop || gem.postDrop;

          this._executePostDrop(droppedNode.getAttribute("formula"), postDrop);

          return true;
        },

        _executePostDrop: function(formula, postDrop) {
          if(postDrop) {
            postDrop.f.call(postDrop.scope, formula, this.gemBar.id);
          }
        },

        createGemFromNode: function(sourceNode) {
          return this.gemBar.model.createGemFromNode(sourceNode);
        },

        createGemUI: function(gem, sourceNode) {
          return this.gemBar.createGemUI(gem, sourceNode);
        },

        onMouseMove: function(e) {
          this.showIndicatorIfReorder(e);

          this.inherited(arguments);
        },

        onMouseOver: function(e) {
          this.showIndicatorIfReorder(e);

          this.inherited(arguments);
        },

        onMouseOut: function(e) {
          if(e.target == this.dropIndicator) {
            // moused over the indicator. Ignore
            return;
          }

          this.dropIndicator.style.display = "none";

          this.inherited(arguments);
        },

        onDraggingOut: function(e) {
          this.dropIndicator.style.display = "none";

          this.inherited(arguments);
        },

        showIndicatorIfReorder: function(e) {
          if(ManagerClass.manager().source && this.checkAcceptance(this, ManagerClass.manager().nodes)) { // drag in progress

            var indicator = this.dropIndicator;
            var tearDown  = function() {
                    indicator.style.display = "none";
                    cancelHandle.remove()
                  };
            var cancelHandle = topic.subscribe("/dnd/cancel", tearDown);
            var dropHandle   = topic.subscribe("/dnd/drop",   tearDown);

            var overNode = this._getNodeUnderMouse(e);
            // console.log("over: "+overNode);
            if(overNode == -1) {
              return;
            }

            var before = this.gravity(this.node.children[overNode], e) & 1;
            if(this.node.children[overNode] == ManagerClass.manager().nodes[0] &&
               (before && overNode == 0 || !before && this.node.children.length - 1 == overNode)) {
              this.dropIndicator.style.display = "none";
              return;
            }

            this.placeIndicator(e, overNode, before);
          }
        },

        _showDropIndicator: function(e) {
          var overNode = this._getNodeUnderMouse(e);
          if(overNode == -1) {
            return;
          }

          var before = this.gravity(this.node.children[overNode], e) & 1;
          if(this.node.children[overNode] == ManagerClass.manager().nodes[0] &&
             (before && overNode == 0 || !before && this.node.children.length - 1 == overNode)) {
            this.dropIndicator.style.display = "none";
            return;
          }

          this.placeIndicator(e, overNode, before);

          return {
            before: before === 1,
            anchor: this.node.children[overNode]
          }
        },

        _hideDropIndicator: function() {
          if(this.dropIndicator) {
            this.dropIndicator.style.display = "none";
          }
        },

        placeIndicator: function(e, boxIndex, before) {
          var spacing = -5, indicatorHeight = 3;
          var bbCoords = geometry.position(this.node, true);
          with(this.dropIndicator.style) {
            if(boxIndex < 0) {
              if(this.node.children.length) {
                var coords = geometry.position(this.node.children[this.node.children.length - 1], true);
                left = coords.x - 7 - (bbCoords.x - 5) + "px";

                var coords = geometry.position(this.node.children[0]);
                var lastChild = geometry.position(this.node.children[this.node.children.length - 1]);
                top = (before ? coords.y - spacing : lastChild.y + lastChild.h + spacing) - (bbCoords.y - 5) + "px";
                width = coords.w + "px";
              } else {
                var pos = geometry.position(this.node, true);
                left = pos.x - 7 - (bbCoords.x - 5) + "px";
                top = (pos.y + pos.h) - (bbCoords.y - 5) + "px";
                width = pos.w + "px";
              }
            } else {
              var child = geometry.position(this.node.children[boxIndex], true);
              left = child.x - 7 - (bbCoords.x - 5) + "px";
              top = (before) ? (child.y + spacing ) - (bbCoords.y - 5) + "px" : child.y + child.h + spacing - (bbCoords.y - 5) + "px";
              width = child.w + "px";
            }
          }
          this.dropIndicator.style.display = "";
        },

        _getNodeUnderMouse: function(e) {
          // find the child
          var children = this.node.children;
          for(var i = 0, child; children && i < children.length; ++i) {
            if(children[i] == this.dropIndicator) {
              continue;
            }
            var coords = geometry.position(children[i], true);
            if(e.clientX >= coords.x && e.clientX <= coords.x + coords.w &&
               e.clientY >= coords.y && e.clientY <= coords.y + coords.h) return i;
          }
          return -1;
        },

        gravity: function(/* HTMLElement */node, /* DOMEvent */e) {
          //  summary
          //  Calculates the mouse's direction of gravity relative to the centre
          //  of the given node.
          //  <p>
          //  If you wanted to insert a node into a DOM tree based on the mouse
          //  position you might use the following code:
          //  <pre>
          //  if(gravity(node, e) & gravity.NORTH) { [insert before]; }
          //  else { [insert after]; }
          //  </pre>
          //
          //  @param node The node
          //  @param e    The event containing the mouse coordinates
          //  @return    The directions, NORTH or SOUTH and EAST or WEST. These
          //             are properties of the function.
          node = dom.byId(node);
          var mouse = {y: e.clientY, x: e.clientX};

          var bb = geometry.position(node);
          var nodecenterx = bb.x + (bb.w / 2);
          var nodecentery = bb.y + (bb.h / 2);

          with(cv.util.gravity) {
            return ((mouse.x < nodecenterx ? WEST  : EAST) |
                    (mouse.y < nodecentery ? NORTH : SOUTH)); //  integer
          }
        },

        insertNodes: function(addSelected, data, before, anchor, suppressInherited) {
          // When called by a frop on the placeholder before will come in false, this need to be corrected by checking the flag
          // set in the onDrop method
          if(typeof this.dropAtEnd != "undefined") {
            before = !this.dropAtEnd;
          }

          // Append : before = true, anchor = null
          var pos = 0;
          if(anchor == null) {
            // add is fired in onDrop
            pos = this.gemBar.gems.length;
            before = false;
          } else if(anchor != null) {
            // could be adding to the end, ignore ite
            for(var i = 0; i < this.node.children.length; i++) {
              if(this.node.children[i] == anchor) {
                pos = i;
              }
            }

            pos = before ? pos : pos + 1;
          }

          this.gemBar.insertAt(this.gemUIbeingInserted, pos, this.dropZone2Zone);

          if(!suppressInherited) {
            this.inherited(arguments);
          }

          this.gemBar.propPanel.resize();
        },

        checkAcceptance: function(source, nodes, silent) {
          return this.gemBar.checkAcceptance(source, nodes, silent);
        }
      });

      var PlaceholderSource = declare([Target], {
        constructor: function(node, opts) {
          this.dropZone = opts.dropZone;
        },
        onDrop: function(source, nodes, copy) {
          return this.dropZone.onDrop(source, nodes, copy, /* dropAtEnd */ true);
        },

        checkAcceptance: function(source, nodes, silent) {
          return this.dropZone.checkAcceptance(source, nodes, silent);
        },

        destroy: function() {
          this.inherited(arguments);
          this.dropZone = null;
        }
      });

      var GemBarUI = declare(
          [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented, StatefulUI],
          {
            className: "propPanel_gemBar",
            gemLimit: -1,
            templateString: "<div class='${className}' data-dojo-type='dijit.layout.BorderContainer' data-dojo-props='gutters:false'><div data-dojo-props='region:center'></div><div class='gemPlaceholder'><span>${placeholderText}</span></div></div>",
            gems:   null,
            accept: ["gem"],
            showPlaceholder: true,
            placeholderText: "Drop Level Here",

            constructor: function(options) {
              this.id = newId(this.model.id + "_ui");
              this.showPlaceholder = this.model.ui.showPlaceholder;

              if(this.model.ui.placeholderText) {
                this.placeholderText = this.model.ui.placeholderText;
              }

            },

            postCreate: function() {
              domClass.add(this.domNode, this.model.dataType); // add dataType as css class.
              this.gems = [];
              this.placeholder = query(".gemPlaceholder", this.domNode)[0];
              this.placeholder.style.display = (this.showPlaceholder && (this.model.allowMultiple || this.model.gems.length == 0)) ? "" : "none";
              if(this.model.required && this.model.gems.length == 0) {
                domClass.add(this.placeholder, "reqiured");
              }

              this.dropZoneNode = this.domNode.firstChild;

              this.dropZone = new GemBarUISource(this.dropZoneNode, {accept: this.model.ui.dndType, gemBar: this});
              // new pentaho.common.propertiesPanel.PlaceholderSource(this.domNode, {accept: this.model.ui.dndType, dropZone: this.dropZone});

              if(this.showPlaceholder && (this.model.allowMultiple || this.model.gems.length < 2)) {
                this._placeHolderSource = new PlaceholderSource(this.placeholder, {accept: this.model.ui.dndType, dropZone: this.dropZone});

                // dojo.connect(this.placeholder.firstChild, "onmouseover", function(event){
                //   if(Manager.source && outterThis.checkAcceptance(outterThis.dropZone, Manager.nodes)){
                //     domClass.add(outterThis.placeholder, "over");
                //   }
                // });
                // on(this.placeholder.firstChild, "mouseup", lang.hitch( function(event){
                //   domClass.remove(outterThis.placeholder,  "over"));
                // });
              }

              var unSubscribeFunc = lang.hitch(this, function() {
                if(this.domNode) { // may have been disposed
                  this._hideDiminish();
                }
              });

              this.own(
                topic.subscribe("/dnd/start", lang.hitch(this, function() {
                  if(!this.checkAcceptance(this.dropZone, ManagerClass.manager().nodes)) {
                    this._showDiminish();
                  }
                })),
                topic.subscribe("/dnd/cancel", unSubscribeFunc),
                topic.subscribe("/dnd/drop",   unSubscribeFunc),
                on(this.domNode, "mouseover",  lang.hitch(this, function(event) {
                  if(ManagerClass.manager().source &&
                     this.checkAcceptance(this.dropZone, ManagerClass.manager().nodes)) {
                    this._showOver();
                  }
                })),
                on(this.domNode,   "mouseout", lang.hitch(this, "_hideOver")),
                on(this.domNode,   "mouseup",  lang.hitch(this, "_hideOver")),
                // on(this.dropZone,  "onDrop", lang.hitch(this,  "onDrop")),
                on(this.dropZone,  "createDropIndicator", lang.hitch(this, "createDropIndicator")),
                on(this.dropZone,  "placeDropIndicator",  lang.hitch(this, "placeDropIndicator")),
                on(this.dropZone,  "onMouseOver",         lang.hitch(this, "onMouseOver")),
                on(this.dropZone,  "onMouseOut",          lang.hitch(this, "onMouseOut")),
                on(this.dropZone,  "onDraggingOver",      lang.hitch(this, "onDraggingOver")),
                on(this.dropZone,  "onDraggingOver",      lang.hitch(this, "onDraggingOut")),
                // on(this.dropZone,  "checkAcceptance", lang.hitch(this, "checkAcceptance")),
                on(this.dropZone,  "insertNodes",         lang.hitch(this, "insertNodes")));

              array.forEach(this.model.gems, function(gem) {
                var gemUI = this.createGemUI(gem, gem.sourceNode);

                this.domNode.firstChild.appendChild(gemUI.domNode);
                this.add(gemUI);
              }, this);

              this.dropZone.sync();

              this.inherited(arguments);
            },

            _showOver: function() {
              if(this.domNode) {
                domClass.add(this.domNode, "over");
              }
            },

            _hideOver: function() {
              if(this.domNode) {
                domClass.remove(this.domNode, "over");
              }
            },

            _showDiminish: function() {
              if(this.domNode) {
                domClass.add(this.domNode, "dimished");
              }
            },

            _hideDiminish: function() {
              if(this.domNode) {
                domClass.remove(this.domNode, "dimished");
              }
            },

            insertNodes: function(addSelected, data, before, anchor) {
              //this.domNode.appendChild(data[0]);
              this.onUIEvent("insertNodes", {item: this, args: arguments});
            },

            add: function(gemUI) {
              gemUI.model.gemBar = this.model;
              gemUI.gemBar = this;

              this.gems.push(gemUI);

              this.propPanel.setupEventHandling(gemUI);
              this.propPanel.registerGemUI(gemUI);

              if(this.model.required) {
                domClass.remove(this.placeholder, "reqiured");
              }
            },

            insertAt: function(gemUI, pos, move) {
              var currIdx = array.indexOf(this.gems, gemUI);
              if(currIdx > -1) { // move
                this.gems.splice(currIdx, 1); // remove from old pos
              }

              this.gems.splice(pos, 0, gemUI); // add it to the new pos

              this.propPanel.registerGemUI(gemUI);

              this.model.insertAt(gemUI.model, pos, currIdx, move);

              if(this.model.allowMultiple == false) {
                this.placeholder.style.display = "none";
              }

              if(this.model.required) {
                domClass.remove(this.placeholder, "reqiured");
              }
            },

            remove: function(gemUI, suppressEvent) {
              this.dropZoneNode.removeChild(gemUI.domNode);

              var currIdx = array.indexOf(this.gems, gemUI);
              this.gems.splice(currIdx, 1);

              this.model.remove(gemUI.model, suppressEvent);

              if(this.model.allowMultiple == true || this.model.gems.length == 0) {
                this.placeholder.style.display = "";
              }

              this.propPanel.unregisterGemUI(gemUI);
              this.propPanel.resize();
            },

            onContextMenu: function(event, gem) {
              // to be overwritten
            },

            createDropIndicator: function() {
            },

            placeDropIndicator: function(e) {
            },

            onMouseOver: function() {
              // this.mouseMoveHandle = this.connect(window, "onMouseMove", this, "placeDropIndicator");
            },

            onMouseOut: function() {
              // if(this.mouseMoveHandle) {
              //   this.mouseMoveHandle.remove();
              // }
            },

            onDraggingOver: function() {
              return this.inherited(arguments);
            },

            onDraggingOut: function() {
            },

            checkAcceptance: function(source, nodes) {
              return this.model.allowMultiple ||
                     (this.model.allowMultiple == false && this.model.gems.length == 0);
            },

            /* extension points */
            validateGem: function(gem) {
              return true;
            },

            createGemFromNode: function(sourceNode) {
              var options = {id: sourceNode.innerHTML};

              return new Configuration.registeredTypes["gem"](options);
            },

            createGemUI: function(gem, sourceNode) {
              var GemUIClass = Panel.registeredTypes["gem"];
              var options = {
                      model:      gem,
                      postDrop:   gem.postDrop,
                      dndType:    gem.dndType,
                      gemBar:     this,
                      sourceNode: sourceNode
                    };

              return GemUIClass.create ? GemUIClass.create(options) : new GemUIClass(options);
            },

            // -----------

            destroyRecursive: function() {
              this.inherited(arguments);

              // destroyRecursive should do this, investigate
              array.forEach(this.gems, function(gemUI) {
                gemUI.destroyRecursive();
              });
            },

            destroy: function() {
              if(this.dropZone) {
                this.dropZone.destroy();
                this.dropZone = null;
              }

              if(this._placeHolderSource) {
                this._placeHolderSource.destroy();
                this._placeHolderSource = null;
              }

              this.inherited(arguments);

              // Prevent leak
              this.dropZoneNode =
              this.placeholder  =
              this._startupWidgets =
              this._supportingWidgets = null;
            }
          }
      );

      Panel.registeredTypes["gemBar"] = GemBarUI;

      var GemUI = declare([_WidgetBase, _TemplatedMixin, Evented, StatefulUI], {
            className: "gem",
            templateString: "<div id='${id}' class='${className} dojoDndItem' dndType='${dndType}'><div class='gem-label' title='${model.value}'></div><div class='gemMenuHandle'></div></div>",

            constructor: function(options) {

              options.id = newId("gem_" + this.model.id + "_");

              this.gemBar  = options.gemBar;
              this.dndType = options.dndType;
            },

            detach: function() {
              model.detach();
            },

            destroy: function() {
              this.inherited(arguments);

              this.menuHandle =
              this.postDrop   =
              this.gemBar     =
              this._startupWidgets =
              this._supportingWidgets = null;
            },

            postCreate: function() {
              this.menuHandle = query("div.gemMenuHandle", this.domNode)[0];

              var gemLabel = query("div.gem-label", this.domNode)[0];
              gemLabel.appendChild(document.createTextNode(this.model.value));

              this.own(
                on(this.domNode, "contextmenu", lang.hitch(this, "onContextMenu")),
                on(query("div.gemMenuHandle",  this.domNode)[0], "mouseover",  function(e) {
                  if(!ManagerClass.manager().source) {
                    domClass.add(e.target, "over");
                  }
                }),
                on(query("div.gemMenuHandle", this.domNode)[0], "mouseout", function(e) {
                  if(!ManagerClass.manager().source) {
                    domClass.remove(e.target, "over");
                  }
                }),
                on(this.menuHandle, "click", lang.hitch(this,  "onContextMenu")),
                on(this.domNode, "mouseover", lang.hitch(this,  "onMouseOver")),
                on(this.domNode, "mouseout", lang.hitch(this,  "onMouseOut")));

              this.inherited(arguments);
            },

            onMouseOver: function() {
              if(!ManagerClass.manager().source) {
                domClass.add(this.domNode, "over");
              }
            },

            onMouseOut: function() {
              domClass.remove(this.domNode, "over");
            },

            // to be overwritten by container
            onContextMenu: function(e) {
              //console.log("inner onContextMenu");
              //event.stop(e);
            }
          });

      Panel.registeredTypes["gem"] = GemUI;

      var ComboUI = declare(
          [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulUI, Evented],
          {
            className: "propPanel_combobox propPanel_control",
            options: null,
            templateString: "<div class='${className}' id='${id}'></div>",

            constructor: function(options) {
              this.name  = this.model.id;
              options.id = newId(this.name, "_wrapper"); // -> this.id

              this.options = [];

              array.forEach(this.model.values, function(val, idx) {
                var opt = {label: val, value: val};

                if(this.model.ui.labels) {
                  var lbl = this.model.ui.labels[idx];
                  opt.label = Messages.getString(lbl, lbl);
                }

                this.options.push(opt);
              }, this);

              if(this.model.value == null)
                this.model.set('value', this.model.values[0]);

              this.value = this.model.value;
            },

            postCreate: function() {
              var me = this;
              var opts = this.options;

              array.forEach(opts, function(val, idx) {
                if(typeof(me.value) == "undefined") {
                  opts['selected'] = true;
                } else {
                  if(me.value == val.value) {
                    val['selected'] = true;
                  }
                }
              }, this);

              if(this.isMobile()) {
                // create native select widget

                var selectId  = this.id + "_select";
                var selectBox = construct.create("select", {id: selectId});

                array.forEach(opts, function(val, idx) {
                  var selOpt;
                  if(typeof(val.selected) != "undefined" && val.selected == true) {
                    selOpt = {label: val.label, value: val.value, selected: true};
                  } else {
                    selOpt = {label: val.label, value: val.value};
                  }
                  construct.create("option", selOpt, selectBox);
                }, this);


                this.domNode.appendChild(selectBox);

                this.own(on(selectBox, "onchange", function() {
                  me.model.set('value', this.value);
                  me.value = this.value;
                }));

              } else {

                // use the styled drop down

                domClass.add(this.domNode, this.className);

                var sel = this.selNode = new Select({
                  options: opts,
                  onChange: function() {
                    me.model.set('value', this.value);
                    me.value = this.value;
                  }
                });
                sel.placeAt(this.domNode);
              }

              this.inherited(arguments);
            },

            isMobile: function() {
              return this.isMobileSafari() || window.orientation !== undefined;
            },

            isMobileSafari: function() {
              return navigator.userAgent.match(/(iPad|iPod|iPhone)/) != null;
            },

            destroy: function() {

              this.inherited(arguments);

              if(this.selNode) {
                this.selNode.destroyRecursive();
                this.selNode = null;
              }

              // Prevent leak
              this._startupWidgets = null;
              this._supportingWidgets = null;
            }
          });

      Panel.registeredTypes["combo"] = ComboUI;

      var SliderUI = declare([HorizontalSlider, StatefulUI, Evented], {
              className: "propPanel_slider propPanel_control",
              minimum: 0,
              maximum: 100,
              style: "width: 100%",
              intermediateChanges: true,
              discreteValues: true,

              constructor: function(options) {

                options.id = newId(this.model.id + "_slider"); // -> this.id

                this.value = this.model.value;

                if(this.model.minimum) { this.minimum = this.model.minimum; }
                if(this.model.maximum) { this.maximum = this.model.maximum; }

                this.discreteValues = this.maximum - this.minimum + 1;
              },

              onChange: function() {
                this.model.set('value', this.value);
              }
            });
      Panel.registeredTypes["slider"] = SliderUI;

      var TextboxUI = declare([TextBox, StatefulUI, Evented], {
            className: "propPanel_control",

            constructor: function(options) {
              this.disabled = this.model.disabled;
              this.value    = this.model.value;

              options.id = null;

              this.inherited(arguments);
            },

            onChange: function() {
              this.model.set('value', this.value);
            }
          });
      Panel.registeredTypes["textbox"] = TextboxUI;

      var CheckBoxUI = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulUI, Evented],
          {
            className: "propPanel_checkbox propPanel_control",
            value: false,
            templateString: "<div class='${className}'><label for='${checkBoxId}'>${label}</label></div>",

            constructor: function(options) {

              options.id = null; // auto

              this.checkBoxId = newId(this.model.id + "_checkbox");

              if(this.model.value != null) {
                this.value = this.model.value;
              } else {
                this.model.set('value', this.value);
              }

              this.label = Messages.getString(this.model.ui.label, this.model.ui.label);
            },

            postCreate: function() {
              var id = this.checkBoxId;

              this.checkbox = new CheckBox({
                    id:       id,
                    name:     id,
                    checked:  this.model.get('value'),
                    onChange: lang.hitch(this, function(value) { this.model.set('value',  value); })
                  }, id);

              this.checkbox.placeAt(this.domNode, "first");
            },

            destroy: function() {

              this.inherited(arguments);

              if(this.checkbox) {
                this.checkbox.destroyRecursive();
                this.checkbox = null;
              }

              // Prevent leak
              this._startupWidgets =
              this._supportingWidgets = null;
            }
          });
      Panel.registeredTypes["checkbox"] = CheckBoxUI;

      var ButtonUI = declare(
          [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulUI, Evented],
          {
            templateString: "<div class='button-wrapper'><button id='${buttonId}' name='${buttonId}' data-dojo-type='dijit.form.Button' type='button' >${label}</button></div>",

            constructor: function(options) {
              this.buttonId = newId(this.model.id + "_button");
              this.disabled = this.model.disabled;

              options.id = null; // auto

              var lbl = this.model.ui.label;
              this.label = Messages.getString(lbl, lbl);

              this.inherited(arguments);
            },

            postCreate: function() {
              var button = registry.byId(this.buttonId);
              this.own(
                on(button, "click", lang.hitch(this, "onClick")));
            },

            onClick: function() {
              this.model.set('clicked', true);
            },

            destroy: function() {
              this.inherited(arguments);

              // Prevent leak
              this._startupWidgets =
              this._supportingWidgets = null;
            }
          });
      Panel.registeredTypes["button"] = ButtonUI;

      return Panel;
    });
