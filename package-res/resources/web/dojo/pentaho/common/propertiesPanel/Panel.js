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
  ,"dojo/dnd/Source"
  ,"dijit/TitlePane"
  ,"pentaho/common/Messages", "dojo/_base/array", "dojo/_base/lang", "dojo/html", "dojo/dom-construct",
  "dojo/string", "dojo/dom-class", "pentaho/common/propertiesPanel/Configuration", "dijit/registry", "dojo/dnd/Target",
  "dojo/dnd/Source", "dojo/Evented", "dojo/topic", "dojo/dnd/Manager", "dojo/dom", "dojo/dom-geometry", "dojo/aspect"],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, ContentPane, BorderContainer, HorizontalSlider, TextBox, ComboBox, ItemFileReadStore, Select, CheckBox, Source, TitlePane, Messages, array, lang, html, construct, string, domClass, Configuration, registry, Target, Source, Evented, topic, ManagerClass,
              dom, geometry, aspect) {

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
            constructor: function (propertiesConfiguration) {
              this.configuration = propertiesConfiguration;
            },
            postCreate: function () {
              array.forEach(this.configuration.items, lang.hitch(this, "initializeItem"));

              //var placeholderPanel = new dijit.layout.ContentPane({region: "center", splitter: false});
              //this.domNode.appendChild(placeholderPanel.domNode);
              this.inherited(arguments);
            },
            resize: function () {
              this.minHeightDeviation = 0; // zero out adjustments
              this.inherited(arguments);
            },
            initializeItem: function (item) {
              if (item.ui.hidden) {
                return;
              }
              // Lookup class impl from map
              var layoutClass = Panel.registeredTypes[item.ui.type];
              if (!layoutClass) {
                throw "No Properties Panel UI implementation found for " + item.ui.type;
              }

              var propUi;
              // check to see if it's a factory class
              if (layoutClass.create) {
                propUi = layoutClass.create({model: item, propPanel: this});
              } else {
                propUi = new layoutClass({model: item, propPanel: this});
              }
              var targetNode = this.domNode;
              var groupId = item.ui.group;

              // If the property is grouped, create the group or add it to the existing one.
              if (groupId) {
                var group = this.groups[groupId];
                var groupConfig = this.configuration.groups[item.ui.group];
                if (!group && groupConfig) {
                  var groupContents = document.createElement("div");

                  var outterThis = this;
                  group = new TitlePane({
                    title: Messages.getString(groupConfig.title, groupConfig.title),
                    content: groupContents,
                    region: 'top',
                    splitter: false
                  });
                  aspect.after(group,  "resize",  function () {


                    var lastChild = geometry.position(outterThis.domNode.children[outterThis.domNode.children.length - 1]);
                    var totalNumOfGroups = 0;
                    var totalGroupHeight = 0;
                    var totalNonGroupHeight = 0;

                    var minHeightAdjustment = 0;
                    for (var g in outterThis.groups) {
                      totalNumOfGroups++;
                      var gp = outterThis.groups[g];
                      var titleBarHeight = geometry.position(gp.titleBarNode).h
                      totalGroupHeight += (gp.open) ? titleBarHeight + gp.hideNode.scrollHeight : 0;
                      if (gp.open) {
                        minHeightAdjustment += (gp.usingMinHeight) ? gp.heightAdjustment : 0;
                      } else {
                        minHeightAdjustment += titleBarHeight;
                      }
                    }
                    array.forEach(outterThis.domNode.children, function (node) {
                      if (!node.className.match(/dijitTitlePane/)) {
                        totalNonGroupHeight += geometry.position(node).h;
                      }
                    });
                    var panelHeight = geometry.position(outterThis.domNode).h;
                    // if(totalGroupHeight + totalNonGroupHeight < panelHeight - /*margins*/ 20){
                    //   // plenty of space, make natural size
                    //   var gHeight = geometry.position(group.titleBarNode).h + group.hideNode.scrollHeight;
                    //   group.domNode.style.height = gHeight + "px";
                    //   group.hideNode.style.height = (gHeight - geometry.position(group.titleBarNode).h)+ "px";
                    // } else {
                    // divide up available room based on relative sizes of panels
                    var remainderToDivide = geometry.position(outterThis.domNode).h - totalNonGroupHeight - minHeightAdjustment;

                    var titleCoords = geometry.position(group.titleBarNode);
                    var titleBarHeight = titleCoords.h;
                    var titleBarWidth = titleCoords.w;
                    if (group.open) {
                      var naturalHeight = titleBarHeight + group.hideNode.scrollHeight;

                      var calculatedHeight = (naturalHeight / totalGroupHeight) * remainderToDivide;
                      if (calculatedHeight > naturalHeight) {
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
                      if (calculatedHeight < titleBarHeight * minHeightFactor) {
                        group.usingMinHeight = true;
                        group.heightAdjustment = titleBarHeight * minHeightFactor - calculatedHeight;
                        calculatedHeight = titleBarHeight * minHeightFactor;
                      } else {
                        group.usingMinHeight = false;
                      }
                      if (!isNaN(calculatedHeight)) {
                        group.domNode.style.height = calculatedHeight + "px";
                      }

                      if (geometry.position(group.domNode).h > 0) {
                        group.hideNode.style.height = Math.min((geometry.position(group.domNode).h - titleBarHeight), group.hideNode.scrollHeight) + "px";
                      }
                    } else {
                      if (!isNaN(titleBarHeight)) {
                        group.domNode.style.height = titleBarHeight + "px";
                      }
                      group.usingMinHeight = false;
                    }
                    group.domNode.style.width = "";

                    // }

                    // setTimeout(function(){
                    //   group._splitterWidget.domNode.style.top = Math.min(parseInt(group._splitterWidget.domNode.style.top), (parseInt(group.domNode.style.top) + parseInt(group.domNode.style.height))) + "px";
                    // });

                  });

                  aspect.after(group._wipeOut, "onEnd", function () {
                    outterThis.resize();
                  });

                  aspect.after(group._wipeIn, "onEnd", function () {
                    outterThis.resize();
                  });
                  this.groups[groupId] = group;
                  this.domNode.appendChild(group.domNode);
                }
                targetNode = group.content;
              }

              // Items can request a separator to be inserted before themselves

              if (item.ui.seperator) {
                targetNode.appendChild(construct.toDom(this.seperatorTemplate));
              }

              // Items can have a caption. If specified, create and add it before the property UI component
              if (item.ui.caption) {

                var cap = construct.toDom(string.substitute(this.captionTemplate, item, null,
                    {
                      i18n: function (value, key) {
                        return Messages.getString(value, value);
                      }
                    }));

                // support the new Themeable way
                var img = query("i", cap);
                if (img && img != null && img.length > 0) {
                  img = img[img.length - 1]; //select the last i tag found
                  if (item.ui.captionIcon) {
                    domClass.add(img, item.ui.captionIcon);
                  } else {
                    img.style.display = "none";
                  }
                }

                targetNode.appendChild(cap);
              }

              // Route UI events to onPropertyChange
              this.setupEventHandling(propUi);
              this.propUIs.push(propUi);
              this.own(on(propUi, "UIEvent", lang.hitch(this, "onUIEvent")));
              domClass.add(propUi.domNode, "propPanelItem")
              targetNode.appendChild(propUi.domNode);
              this.resize();

            },

            onUIEvent: function (type, args) {
              on.emit(type, args);
            },
            setupEventHandling: function (ui) {

              this.own(on(ui, "contextMenu", function (e) {
                this.onUIEvent("onContextMenu", {item: ui, args: [ui, e]});
              }));
              this.own(on(ui, "click", function (e) {
                this.onUIEvent("onClick", {item: ui, args: [ui, e]});
              }));
              this.own(on(ui, "dblclick", function (e) {
                this.onUIEvent("onDblClick", {item: ui, args: [ui, e]});
              }));
            },

            setConfiguration: function (configJson) {
              this._setConfiguration(new Configuration(configJson));
            },
            _setConfiguration: function (config) {
              this.propUIs.forEach(function (widget) {
                widget.destroyRecursive();
              });
              this.propUIs = [];
              this.groups = {};
              this.domNode.innerHTML = "";
              this.configuration = config;
              this.postCreate();
            },
            reload: function () {
              this._setConfiguration(this.configuration);
            },
            set: function (property, id, value) {
              array.forEach(this.propUIs, function (prop) {
                if (prop.model.id == id) {
                  prop.model.set(property, value);
                }
              })
            }
          }

      );
      Panel.registeredTypes = {};


      var StatefulUI = declare(
          [],
          {
            constructor: function (options) {
              this.model = options.model;
              this.propPanel = options.propPanel;
              var outterThis = this;
              this.model.watch(function (propName, prevVal, newVal) {

                switch (propName) {
                  case "value":
                  case "default":
                    outterThis.set(propName, newVal);
                    break;
                }
              });
            },
            onUIEvent: function (type, args) {

            }
          }
      );

      var GemBarUISource = declare([Source], {

        constructor: function (node) {
          this.dropIndicator = document.createElement("div");
          this.dropIndicator.className = "indicator";
          this.dropIndicator.id = "propertyPanelIndicator";
          var line = document.createElement("div");
          line.className = "indicatorLine";
          this.dropIndicator.appendChild(line);
          this.dropIndicator.style.display = "none";
          on(this.dropIndicator, "mouseover", lang.hitch(this, "_redirectMouseOver"));
          on(this.dropIndicator, "mouseup", lang.hitch(this, "_redirectMouseUp"));
          this.node.parentNode.appendChild(this.dropIndicator);

        },

        _redirectMouseOver: function (e) {
          var idx = this._getNodeUnderMouse(e);
          this.lastItemOver = idx;
          if (idx > -1) {
            if (document.createEvent) {
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
            } else if (document.createEventObject) {
              var evt = document.createEventObject(window.event);
              evt.button = 1;
              this.node.children[idx].fireEvent("onmouseover", evt);
              this.node.children[idx].fireEvent("onmousemove", evt);
            }

          }
        },

        _redirectMouseUp: function (e) {
          var idx = this._getNodeUnderMouse(e);
          if (idx > -1) {
            if (document.createEvent) {
              var evt = document.createEvent("MouseEvent");
              evt.initMouseEvent("mouseup", true, true, window, 0, e.screenX, e.screenY, e.clientX, e.clientY,
                  e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
              // this.node.dispatchEvent(evt);
              this.node.children[idx].dispatchEvent(evt);
            } else if (document.createEventObject) {
              var evt = document.createEventObject(window.event);
              this.node.children[idx].fireEvent("onmouseup", evt);
            }

          }
        },
        onDrop: function (source, nodes, copy, dropAtEnd) {
          this.dropAtEnd = dropAtEnd; // passed in by the placeholder source so we can know to insert at the end of the list
          this.dropZone2Zone = false; // flag moves from one gembar to another

          if (!nodes || nodes.length == 0) {
            return false;
          }
          var droppedNode = nodes[0];

          // Look for an existing gem for the same element
          var gemUI = registry.byId(droppedNode.id);
          if (!gemUI) {
            registry.byId("gem-" + droppedNode.id);
          }

          if ((!gemUI || (gemUI && gemUI.gemBar != this.gemBar)) && !this.gemBar.checkAcceptance(this, nodes, /* showErrors */ true)) { //only check if not a reorder
            return;
          }
          var gem;
          if (gemUI) {
            gem = gemUI.model;
            if (gemUI.gemBar == this.gemBar) { //Reorder, notify model so it can fire an event
              // fire reordered in insertNodes where we know more information
            } else {
              this.dropZone2Zone = true;
              gemUI.gemBar.remove(gemUI, /* suppressEvent */ true);
              // for moves we cache the previous bar in order to add it to the move event
              gemUI.model.previousGemBar = gemUI.gemBar.model;
              gemUI.gemBar = this.gemBar;
            }
          } else {
            var gem = this.createGemFromNode(droppedNode);
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
          return true;

        },

        createGemFromNode: function (sourceNode) {

          var modelClass = pentaho.common.propertiesPanel.Configuration.registeredTypes["gem"];
          var options = {id: "gem-" + sourceNode.id, value: sourceNode.innerHTML, gemBar: this.gemBar.model, sourceNode: sourceNode};

          // check to see if it's a factory class
          if (modelClass.create) {
            return modelClass.create(options)
          } else {
            return new modelClass(options);
          }
        },
        createGemUI: function (gem, sourceNode) {
          var uiClass = Panel.registeredTypes["gem"];
          var options = {id: gem.id, model: gem, gemBar: this.gemBar, dndType: sourceNode.getAttribute("dndType"), sourceNode: sourceNode};
          if (uiClass.create) {
            return uiClass.create(options);
          } else {
            return new uiClass(options);
          }
        },

        onMouseMove: function (e) {
          this.showIndicatorIfReorder(e);
          this.inherited(arguments);
        },
        onMouseOver: function (e) {
          this.showIndicatorIfReorder(e);
          this.inherited(arguments);
        },
        showIndicatorIfReorder: function (e) {
          if (ManagerClass.manager().source && this.checkAcceptance(this, ManagerClass.manager().nodes)) { // drag in progress

            var indicator = this.dropIndicator;

            var tearDown = function () {
              indicator.style.display = "none";
              cancelHandle.remove()
            };
            var cancelHandle = topic.subscribe("/dnd/cancel", tearDown);
            var dropHandle = topic.subscribe("/dnd/drop", tearDown);

            var overNode = this._getNodeUnderMouse(e);
            // console.log("over: "+overNode);
            if(overNode == -1){
              return;
            }
            var before = this.gravity(this.node.children[overNode], e) & 1;
            if (this.node.children[overNode] == ManagerClass.manager().nodes[0] && (before && overNode == 0 || !before && this.node.children.length - 1 == overNode)) {
              this.dropIndicator.style.display = "none";
              return;
            }
            this.placeIndicator(e, overNode, before);
          }
        },
        onMouseOut: function (e) {
          if (e.target == this.dropIndicator) {
            // moused over the indicator. Ignore
            return;
          }
          this.dropIndicator.style.display = "none";

          this.inherited(arguments);
        },
        onDraggingOut: function (e) {
          this.dropIndicator.style.display = "none";
          this.inherited(arguments);
        },
        placeIndicator: function (e, boxIndex, before) {
          var spacing = -5, indicatorHeight = 3;
          var bbCoords = geometry.position(this.node, true);
          with (this.dropIndicator.style) {
            if (boxIndex < 0) {
              if (this.node.children.length) {
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
        _getNodeUnderMouse: function (e) {
          // find the child
          var children = this.node.children;
          for (var i = 0, child; children && i < children.length; ++i) {
            if (children[i] == this.dropIndicator) {
              continue;
            }
            var coords = geometry.position(children[i], true);
            if (e.clientX >= coords.x && e.clientX <= coords.x + coords.w &&
                e.clientY >= coords.y && e.clientY <= coords.y + coords.h) return i;
          }
          return -1;
        },
        gravity: function (/* HTMLElement */node, /* DOMEvent */e) {
          //  summary
          //  Calculates the mouse's direction of gravity relative to the centre
          //  of the given node.
          //  <p>
          //  If you wanted to insert a node into a DOM tree based on the mouse
          //  position you might use the following code:
          //  <pre>
          //  if (gravity(node, e) & gravity.NORTH) { [insert before]; }
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


          with (cv.util.gravity) {
            return ((mouse.x < nodecenterx ? WEST : EAST) | (mouse.y < nodecentery ? NORTH : SOUTH)); //  integer
          }
        },
        insertNodes: function (addSelected, data, before, anchor) {
          // When called by a frop on the placeholder before will come in false, this need to be corrected by checking the flag
          // set in the onDrop method
          if (typeof this.dropAtEnd != "undefined") {
            before = !this.dropAtEnd;
          }

          // Append : before = true, anchor = null
          var pos = 0;
          if (anchor == null) {
            // add is fired in onDrop
            pos = this.gemBar.gems.length;
            before = false;
          } else if (anchor != null) {
            // could be adding to the end, ignore ite
            for (var i = 0; i < this.node.children.length; i++) {
              if (this.node.children[i] == anchor) {
                pos = i;
              }
            }

            pos = (before) ? pos : pos + 1;
          }
          this.gemBar.insertAt(this.gemUIbeingInserted, pos, this.dropZone2Zone);
          this.inherited(arguments);
          this.gemBar.propPanel.resize();
        },

        checkAcceptance: function (source, nodes, silent) {
          var ok = this.gemBar.checkAcceptance(source, nodes, silent);
          ;
          return ok;
        }
      });

      var PlaceholderSource = declare([Target], {
        constructor: function (node, opts) {
          this.dropZone = opts.dropZone;
        },
        onDrop: function (source, nodes, copy) {
          return this.dropZone.onDrop(source, nodes, copy, /* dropAtEnd */ true);
        },

        checkAcceptance: function (source, nodes, silent) {
          var ok = this.dropZone.checkAcceptance(source, nodes, silent);
          ;
          return ok;
        }
      });

      var GemBarUI = declare(
          [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented, StatefulUI],
          {
            className: "propPanel_gemBar",
            gemLimit: -1,
            templateString: "<div class='${className}' data-dojo-type='dijit.layout.BorderContainer' data-dojo-props='gutters:false'><div data-dojo-props='region:center'></div><div class='gemPlaceholder'><span>${placeholderText}</span></div></div>",
            gems: [],
            handles: [],
            subscriptions: [],
            accept: ["gem"],
            showPlaceholder: true,
            placeholderText: "Drop Level Here",
            constructor: function (options) {
              this.id = this.model.id + "_ui";
              this.showPlaceholder = this.model.ui.showPlaceholder;
              if (this.model.ui.placeholderText) {
                this.placeholderText = this.model.ui.placeholderText;
              }

            },
            postCreate: function () {
              domClass.add(this.domNode, this.model.dataType); // add dataType as css class.
              this.gems = [];
              this.placeholder = query(".gemPlaceholder", this.domNode)[0];
              this.placeholder.style.display = (this.showPlaceholder && (this.model.allowMultiple || this.model.gems.length == 0)) ? "" : "none";
              if (this.model.required && this.model.gems.length == 0) {
                domClass.add(this.placeholder, "reqiured");
              }

              this.dropZoneNode = this.domNode.firstChild;

              this.dropZone = new GemBarUISource(this.dropZoneNode, {accept: this.model.ui.dndType, gemBar: this});
              // new pentaho.common.propertiesPanel.PlaceholderSource(this.domNode, {accept: this.model.ui.dndType, dropZone: this.dropZone});

              if (this.showPlaceholder && (this.model.allowMultiple || this.model.gems.length < 2)) {
                new PlaceholderSource(this.placeholder, {accept: this.model.ui.dndType, dropZone: this.dropZone});


                // dojo.connect(this.placeholder.firstChild, "onmouseover", function(event){
                //   if(Manager.source && outterThis.checkAcceptance(outterThis.dropZone, Manager.nodes)){
                //     domClass.add(outterThis.placeholder, "over");
                //   }
                // });
                // on(this.placeholder.firstChild, "mouseup", lang.hitch( function(event){
                //   domClass.remove(outterThis.placeholder,  "over"));
                // });
              }


              var outterThis = this;

              this.subscriptions.push(topic.subscribe("/dnd/start", function () {
                if (!outterThis.checkAcceptance(outterThis.dropZone, ManagerClass.manager().nodes)) {
                  domClass.add(outterThis.domNode, "dimished");
                }
              }));
              var unSubscribeFunc = function () {
                if (outterThis.domNode) { // may have been disposed
                  domClass.remove(outterThis.domNode, "dimished");
                }
              };
              this.subscriptions.push(topic.subscribe("/dnd/cancel", unSubscribeFunc));
              this.subscriptions.push(topic.subscribe("/dnd/drop", unSubscribeFunc));


              on(this.domNode,  "mouseover", function (event) {
                if (ManagerClass.manager().source && outterThis.checkAcceptance(outterThis.dropZone,  ManagerClass.manager().nodes)) {
                  domClass.add(outterThis.domNode, "over");
                }
              });
              on(this.domNode, "mouseout", function (event) {
                domClass.remove(outterThis.domNode,  "over");
              });
              on(this.domNode, "mouseup", function (event) {
                domClass.remove(outterThis.domNode,  "over");
              });


              // this.handles.push[on(this.dropZone,  "onDrop", lang.hitch( this,  "onDrop"))];
              this.handles.push[on(this.dropZone,  "createDropIndicator", lang.hitch( this,  "createDropIndicator"))];
              this.handles.push[on(this.dropZone,  "placeDropIndicator", lang.hitch( this,  "placeDropIndicator"))];
              this.handles.push[on(this.dropZone,  "onMouseOver", lang.hitch( this,  "onMouseOver"))];
              this.handles.push[on(this.dropZone,  "onMouseOut", lang.hitch( this,  "onMouseOut"))];
              this.handles.push[on(this.dropZone,  "onDraggingOver", lang.hitch( this,  "onDraggingOver"))];
              this.handles.push[on(this.dropZone,  "onDraggingOver", lang.hitch( this,  "onDraggingOut"))];
              // this.handles.push[on(this.dropZone,  "checkAcceptance", lang.hitch( this,  "checkAcceptance"))];
              this.handles.push[on(this.dropZone,  "insertNodes", lang.hitch( this,  "insertNodes"))];

              array.forEach(this.model.gems, function (gem) {
                var uiClass = Panel.registeredTypes["gem"];
                var options = {sourceNode: gem.sourceNode, id: gem.id, model: gem, gemBar: this, dndType: gem.dndType};
                var gemUI;
                if (uiClass.create) {
                  gemUI = uiClass.create(options);
                } else {
                  gemUI = new uiClass(options);
                }
                this.domNode.firstChild.appendChild(gemUI.domNode);
                this.add(gemUI);
              }, this);
              this.dropZone.sync();
              this.inherited(arguments);

            },
            insertNodes: function (addSelected, data, before, anchor) {
              //this.domNode.appendChild(data[0]);
              this.onUIEvent("insertNodes", {item: this, args: arguments});
            },
            add: function (gemUI) {
              gemUI.model.gemBar = this.model;
              this.gems.push(gemUI);
              gemUI.gemBar = this;
              this.propPanel.setupEventHandling(gemUI);

              if (this.model.required) {
                domClass.remove(this.placeholder, "reqiured");
              }
            },
            insertAt: function (gem, pos, move) {
              var currIdx = array.indexOf(this.gems, gem);


              this.gems.splice(pos, 0, gem); // add it to the new pos
              if (currIdx > -1) { //reorder
                if (currIdx >= pos) { // if we just inserted before the old pos, increment the old pos value
                  currIdx++;
                }
                this.gems.splice(currIdx, 1); // remove from old pos

              }
              this.model.insertAt(gem.model, pos, currIdx, move);

              if (this.model.allowMultiple == false) {
                this.placeholder.style.display = "none";
              }

              if (this.model.required) {
                domClass.remove(this.placeholder, "reqiured");
              }

            },
            remove: function (gemUI, suppressEvent) {
              this.dropZoneNode.removeChild(gemUI.domNode);
              var currIdx = array.indexOf(this.gems, gemUI);
              this.gems.splice(currIdx, 1);
              this.model.remove(gemUI.model, suppressEvent);

              if (this.model.allowMultiple == true || this.model.gems.length == 0) {
                this.placeholder.style.display = "";
              }
              this.propPanel.resize();
            },
            onContextMenu: function (event, gem) {
              // to be overwritten
            },
            createDropIndicator: function () {

            },
            placeDropIndicator: function (e) {

            },
            onMouseOver: function () {
              // this.mouseMoveHandle = this.connect(window, "onMouseMove", this, "placeDropIndicator");
            },
            onMouseOut: function () {
              // if (this.mouseMoveHandle) {
              //   this.mouseMoveHandle.remove();
              // }
            },
            onDraggingOver: function () {
              return this.inherited(arguments);

            },
            onDraggingOut: function () {

            },
            checkAcceptance: function (source, nodes) {
              var ok = this.model.allowMultiple || (this.model.allowMultiple == false && this.model.gems.length == 0);
              return ok;
            },

            createGems: function (gem) {
              var gemUI = createGemUI(gem);
              this.domNode.appendChild(gemUI.domNode);

              this.propPanel.setupEventHandling(gemUI);
            },


            /* extension points */
            validateGem: function (gem) {
              return true;
            },
            createGemFromNode: function (sourceNode) {
              return new pentaho.common.propertiesPanel.Configuration.registeredTypes["gem"]({id: sourceNode.innerHTML});
            },
            createGemUI: function (gem) {
              return new pentaho.common.propertiesPanel.GemUI(gem, this.className);
            },
            destroyRecursive: function () {
              this.inherited(arguments);
              // destroyRecursive should do this, investigate
              array.forEach(this.gems, function (gem) {
                gem.destroy();
              });
              this.destroy();
              array.forEach(this.handles, function(handle){handle.remove()});
            },
            destroy: function () {
              array.forEach(this.subscriptions, function(handle){handle.remove()});
              this.inherited(arguments);
            }
          }
      );

      Panel.registeredTypes["gemBar"] = GemBarUI;

      var GemUI = declare(
          [_WidgetBase, _TemplatedMixin, Evented, StatefulUI],
          {
            className: "gem",

            templateString: "<div id='${id}' class='${className} dojoDndItem' dndType='${dndType}'><div class='gem-label'>${model.value}</div><div class='gemMenuHandle'></div></div>",
            constructor: function (options) {
              this.gemBar = options.gemBar;
              this.dndType = options.dndType;
              this.id = options.id;

            },
            detach: function () {
              model.detach();
            },
            postCreate: function () {
              on(this.domNode, "contextmenu", lang.hitch( this,  "onContextMenu"));
              var outterThis = this;
              this.menuHandle = query("div.gemMenuHandle", this.domNode)[0];

              on(query("div.gemMenuHandle",  this.domNode)[0], "mouseover",  function (e) {
                if (!ManagerClass.manager().source) {
                  domClass.add(e.target, "over");
                }
              });
              on(query("div.gemMenuHandle", this.domNode)[0], "mouseout", function (e) {
                if (!ManagerClass.manager().source) {
                  domClass.remove(e.target, "over");
                }
              });
              on(this.menuHandle, "click", lang.hitch( this,  "onContextMenu"));

              on(this.domNode, "mouseover", lang.hitch( this,  "onMouseOver"));
              on(this.domNode, "mouseout", lang.hitch( this,  "onMouseOut"));
              this.inherited(arguments);
            },
            onMouseOver: function () {
              if (!ManagerClass.manager().source) {
                domClass.add(this.domNode, "over");
              }
            },
            onMouseOut: function () {
              domClass.remove(this.domNode, "over");
            },


            // to be overwritten by container
            onContextMenu: function (e) {
              console.log("inner onContextMenu");
              //event.stop(e);
            }
          }
      );

      Panel.registeredTypes["gem"] = GemUI;

      var ComboUI = declare(
          [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulUI, Evented],
          {
            className: "propPanel_combobox propPanel_control",
            options: [],
            templateString: "<div class='${className}' id='${model.id}_wrapper'></div>",
            handles: [],
            constructor: function (options) {
              this.name = options.id;
              this.options = [];

              array.forEach(this.model.values, function (val, idx) {
                var opt = {label: val, value: val};
                if (this.model.ui.labels) {
                  var lbl = this.model.ui.labels[idx];
                  opt.label = pentaho.common.Messages.getString(lbl, lbl);
                }
                this.options.push(opt);
              }, this);

              if (this.model.value == null)
                this.model.set('value', this.model.values[0]);
              this.value = this.model.value;
            },

            postCreate: function () {
              var me = this;
              var opts = this.options;
              array.forEach(opts, function (val, idx) {
                if (typeof(me.value) == "undefined") {
                  opts['selected'] = true;
                } else {
                  if (me.value == val.value) {
                    val['selected'] = true;
                  }
                }
              }, this);

              if (this.isMobile()) {

                // create native select widget

                var selectId = this.id + "_select";
                var selectBox = construct.create("select", {id: selectId});

                array.forEach(opts, function (val, idx) {
                  if (typeof(val.selected) != "undefined" && val.selected == true) {
                    var selOpt = {label: val.label, value: val.value, selected: true};
                  } else {
                    var selOpt = {label: val.label, value: val.value};
                  }
                  construct.create("option", selOpt, selectBox);
                }, this);


                this.domNode.appendChild(selectBox);
                this.handles.push(on(selectBox,  "onchange", function () {
                  me.model.set('value',  this.value);
                  me.value = this.value;
                }));

              } else {

                // use the styled drop down

                domClass.add(this.domNode, this.className);
                var sel = new Select({
                  options: opts,
                  onChange: function () {
                    me.model.set('value', this.value);
                    me.value = this.value;
                  }
                });
                sel.placeAt(this.domNode);
              }
              this.inherited(arguments);
            },

            isMobile: function () {
              return (this.isMobileSafari() || window.orientation !== undefined);
            },

            isMobileSafari: function () {
              return navigator.userAgent.match(/(iPad|iPod|iPhone)/) != null;
            },

            destroy: function () {
              array.forEach(this.handles, function(handle){handle.remove()});
              this.inherited(arguments);
            }

          }
      );

      Panel.registeredTypes["combo"] = ComboUI;

      var SliderUI = declare(
          [HorizontalSlider, StatefulUI, Evented],
          {
            className: "propPanel_slider propPanel_control",
            minimum: 0,
            maximum: 100,
            style: "width: 100%",
            intermediateChanges: true,
            discreteValues: true,
            constructor: function (options) {
              this.inherited(arguments);
              this.value = this.model.value;
              if (this.model.minimum) {
                this.minimum = this.model.minimum;
              }
              if (this.model.maximum) {
                this.maximum = this.model.maximum;
              }
              this.discreteValues = this.maximum - this.minimum + 1;
              this.id = this.model.id + "_slider";
            },
            onChange: function () {
              this.model.set('value', this.value);
            }
          }
      );
      Panel.registeredTypes["slider"] = SliderUI;

      var TextboxUI = declare(
          [TextBox, StatefulUI, Evented],
          {
            className: "propPanel_control",
            constructor: function (options) {
              this.disabled = this.model.disabled;
              this.value = this.model.value;
              this.inherited(arguments);
            },
            onChange: function () {
              this.model.set('value', this.value);
            }
          }
      );
      Panel.registeredTypes["textbox"] = TextboxUI;


      var CheckBoxUI = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulUI, Evented],
          {
            className: "propPanel_checkbox propPanel_control",
            value: false,
            templateString: "<div class='${className}'><input id='${model.id}_checkbox' name='${model.id}_checkbox' data-dojo-type='dijit.form.CheckBox' /> <label for='${model.id}_checkbox'>${label}</label></div>",
            handles: [],
            constructor: function (options) {
              if (this.model.value) {
                this.value = this.model.value;
              } else {
                this.model.set('value', this.value);
              }
              this.label = pentaho.common.Messages.getString(this.model.ui.label, this.model.ui.label);
            },
            postCreate: function () {
              this.checkbox = registry.byId(this.model.id + "_checkbox");
              var outterThis = this;

              // ANALYZER-1040, IE checkbox issues force us to set the checked status here rather than in the templateString
              if (typeof(this.value) != 'boolean') {
                this.value = false;
              }
              this.checkbox.attr('checked', this.value);

              this.handles.push(on(this.checkbox,  "onChange", function () {
                if (outterThis.model.value != outterThis.checkbox.checked) {
                  outterThis.model.set('value',  outterThis.checkbox.checked);
                }
              }));
            },
            set: function (prop, newVal) {
              if (this.checkbox) {
                if (prop == "value" && newVal != this.checkbox.checked) {
                  this.checkbox.set(prop, newVal);
                }
              }

            },
            onChange: function () {

            },
            destroy: function () {
              array.forEach(this.handles, function(handle){handle});
              this.inherited(arguments);
            }
          }
      );
      Panel.registeredTypes["checkbox"] = CheckBoxUI;


      var ButtonUI = declare(
          [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulUI, Evented],
          {
            templateString: "<div class='button-wrapper'><button id='${model.id}_button' name='${model.id}_button'  data-dojo-type='dijit.form.Button' type='button' >${label}</button></div>",
            constructor: function (options) {
              this.disabled = this.model.disabled;
              this.label = pentaho.common.Messages.getString(this.model.ui.label, this.model.ui.label);
              this.inherited(arguments);
            },

            postCreate: function () {
              this.button = registry.byId(this.model.id + "_button");
              this.connect(this.button, "onClick", "onClick");
            },

            onClick: function () {
              this.model.set('clicked', true);
            }
          }
      );
      Panel.registeredTypes["button"] = ButtonUI;
      return Panel;
    });
