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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dojo/dnd/Selector",
  "dojox/html/entities", "dojo/_base/lang", "dojo/dom-class", "dojo/dom-construct", "dojo/dom", "dojo/_base/array"],
    function (declare, _WidgetBase, _Templated, on, query, Selector, entities, lang, domClass, construct, dom, array) {
      return declare("pentaho.common.SelectList",[_WidgetBase, _Templated],
          {
            templateString: '<div data-dojo-attach-point="containerNode" class="pentaho-listbox"></div>',
            connectHandles: [],
            singleSelect: false,
            getLocaleString: undefined,
            idMap: {},
            items: [],
            folderStyle: true,
            fieldContextMenuCallback: null,

            sanitizeIdAndClassNames: function (name) {
              var escapedName = entities.encode(name);
              if (escapedName) {
                return escapedName.replace(/ /g, "_");
              } else {
                return name;
              }
            },

            clear: function () {
              array.forEach(this.connectHandles, function (handle) {
                handle.remove();
              });
              this.connectHandles = [];
              construct.empty(this.containerNode);
            },

            init: function () {
              this.fieldContextMenuCallback = this._fieldContextMenuCallback;

              this.selector = new Selector(this.containerNode,
                  {
                    "copyOnly": true,
                    "accept": "",
                    "selfAccept": false,
                    "singular": this.singleSelect,
                    "creator": lang.hitch(this, this._dndItemCreator)
                  });
              this.selector._addItemClass = this._addItemClass;
              this.selector._removeItemClass = this._removeItemClass;
            },

            /**
             * Function to call when a field's oncontextmenu event is received
             * The default implementation is provided here. Call registerFieldContextMenuCallback
             * to override it.
             */
            _fieldContextMenuCallback: function fieldContextMenuShow(event) {
              if (!this.fieldContextMenu) {
                return;
              }
              event.preventDefault();
              var x = event.pageX;
              var y = event.pageY;
              this.fieldContextMenu._scheduleOpen(event.target, null, {x: x, y: y});
            },

            /**
             * Function to handle adding a field. Will receive the fieldId as the only parameter.
             */
            doubleClickCallback: undefined,

            /**
             * Function to handle adding a field. Will receive the fieldId as the only parameter.
             */
            clickCallback: undefined,

            /**
             * The dojo.dnd.Selector object used if enableDragDrop is false
             */
            selector: undefined,

            /**
             * Function to handle disabling the selection of text.
             * The default implementation is provided here. Call registerTextSelectionDisabler
             * to override it.
             */
            textSelectionDisabler: function (target) {
              if (typeof target.onselectstart != "undefined") { //IE route
                this.connectHandles.push(on(target, "selectstart", function () {
                  return false;
                }));
              }
              else if (typeof target.style.MozUserSelect != "undefined") { //Firefox route
                target.style.MozUserSelect = "none"
              } else { //All other route (ie: Opera)
                this.connectHandles.push(on(target, "mousedown", function () {
                  return false;
                }));
              }
              target.style.cursor = "default"
            },

            registerLocalizationLookup: function (f) {
              this.getLocaleString = f;
              this._localize();
            },

            registerTextSelectionDisabler: function (f) {
              this.textSelectionDisabler = f;
            },

            registerFieldContextMenuCallback: function (f) {
              this.fieldContextMenuCallback = f;
            },

            registerDoubleClickCallback: function (f) {
              this.doubleClickCallback = f;
            },

            registerClickCallback: function (f) {
              this.clickCallback = f;
            },

            _localize: function () {
            },

            _addItemClass: function (node, type) {
              // summary:
              //		adds a class with prefix "dojoDndItem"
              // node: Node
              //		a node
              // type: String
              //		a variable suffix for a class name
              domClass.add(node, "dojoDndItem" + type);
              if (type == 'Selected' || type == 'Anchor') {
                domClass.add(node, "pentaho-listitem-selected");
                domClass.remove(node, 'pentaho-listitem-hover');
              }
            },

            _removeItemClass: function (node, type) {
              // summary:
              //		removes a class with prefix "dojoDndItem"
              // node: Node
              //		a node
              // type: String
              //		a variable suffix for a class name
              domClass.remove(node, "dojoDndItem" + type);
              if (type == 'Selected' || type == 'Anchor') {
                domClass.remove(node, "pentaho-listitem-selected");
                domClass.remove(node, 'pentaho-listitem-hover');
              }
            },

            addItems: function (items) {
              this.items = items;
              var parent = this.containerNode;

              // see if we have any nesting

              for (var idx = 0; idx < items.length; idx++) {
                var item = items[idx];
                if (item.children) {
                  // create a parent element
                  var saneId = this.sanitizeIdAndClassNames(item.id)
                  var options = {
                    "id": saneId,
                    "class": "pentaho-selectlist-container",
                    "categoryId": saneId,
                    "collapsed": "true"
                  };
                  var categoryDiv = construct.create("div", options, this.containerNode);
                  if (this.folderStyle) {
                    domClass.add(categoryDiv, "categoryIndicator");
                    if (options.collapsed == "true") {
                      domClass.add(categoryDiv, "folder-closed");
                    } else {
                      domClass.add(categoryDiv, "folder-open");
                    }
                  }
                  // create span for categoryName to display text
                  var categoryNameSpan = construct.create("span",
                      {
                        "id": saneId + "-span",
                        "class": "treenode-branch-label",
                        "innerHTML": item.label,
                        "categoryId": saneId
                      }, categoryDiv);
                  this.textSelectionDisabler(categoryNameSpan);
                  this.textSelectionDisabler(categoryDiv);

                  this.connectHandles.push(on(categoryDiv, 'click', lang.hitch(this, this.expandCollapseCategory)));
                  this.connectHandles.push(on(categoryNameSpan, 'dblclick', lang.hitch(this, this.expandCollapseCategory)));
                  this.connectHandles.push(on(categoryDiv, "contextmenu", lang.hitch(this, function (event) {
                    this.updateSelectionForContextMenu(saneId);
                    if (this.fieldContextMenuCallback) {
                      this.fieldContextMenuCallback(event);
                    }
                  })));
                  this.connectHandles.push(on(categoryNameSpan, "contextmenu", lang.hitch(this, function (event) {
                    this.updateSelectionForContextMenu(saneId);
                    if (this.fieldContextMenuCallback) {
                      this.fieldContextMenuCallback(event);
                    }
                  })));

                  // create DND field list for this category
                  var categoryFieldsDiv = construct.create("div",
                      {
                        "id": saneId + "-fields",
                        "class": options.collapsed == "true" ? "hidden" : ""
                      }, categoryDiv);
                  for (var kidIdx = 0; kidIdx < item.children.length; kidIdx++) {
                    this.addItem(item.children[kidIdx], categoryFieldsDiv, true);
                  }
                } else {
                  this.addItem(item, parent, false);
                }
              }
            },

            addItem: function (item, parent, indented) {
              var x = this._dndItemCreator(item, '');
              if (indented) {
                domClass.add(x.node, "pentaho-selectlist-item-indent");
              }
              parent.appendChild(x.node);
              this.idMap[this.sanitizeIdAndClassNames(item.id)] = item.id;
              this.selector.setItem(this.sanitizeIdAndClassNames(item.id), { "data": item, "type": item.type, "itemId": this.sanitizeIdAndClassNames(item.itemId) });
              this.connectHandles.push(on(x.node, 'mousedown', lang.hitch(this, this.onMouseDown)));
              this.connectHandles.push(on(x.node, 'mouseup', lang.hitch(this, this.onMouseUp)));
            },

            _dndItemCreator: function (item, hint) {
              var props = {
                "id": this.sanitizeIdAndClassNames(item.id),
                "innerHTML": item.label,
                "itemId": this.sanitizeIdAndClassNames(item.id),
                "class": item.type
              };
              if (!props["class"]) {
                props["class"] = "pentaho-selectlist-item";
              }

              if (item.title) {
                props.title = this.sanitizeIdAndClassNames(item.title);
              } else if (item.label) {
                props.title = this.sanitizeIdAndClassNames(item.label);
              } else {
                props.title = props.id;
              }
              var div = construct.create("div", props);
              if (hint === "avatar") {
                domClass.add(div, "dragDropAvatar");
              } else {
                domClass.add(div, "field");
//      domClass.add(div, "treenode-leaf-label");
                domClass.add(div, "pentaho-listitem");
//      if( item.className ) {
//        domClass.add(div, item.className);
//      } else {
                if (item.hasIcon) {
                  domClass.add(div, "pentaho-selectlist-item-icon");
                } else {
                  domClass.add(div, "pentaho-selectlist-item");
                }
//      }
                // Wire up interaction
                this.connectHandles.push(on(div, "contextmenu", lang.hitch(this, function (event) {
                  this.updateSelectionForContextMenu(item.id);
                  if (this.fieldContextMenuCallback) {
                    this.fieldContextMenuCallback(event);
                  }
                })));
                this.connectHandles.push(on(div, 'dblclick', lang.hitch(this, function (event) {
                  if (this.doubleClickCallback) {
                    this.doubleClickCallback(item.id);
                  }
                })));
                this.connectHandles.push(on(div, 'mouseover', lang.hitch(this, function (event) {
                  this.onFieldMouseOver(event);
                })));
                this.connectHandles.push(on(div, 'mouseout', lang.hitch(this, function (event) {
                  this.onFieldMouseOut(event);
                })));
                this.connectHandles.push(on(div, 'click', lang.hitch(this, function (event) {
                  this.onFieldClick(event);
                })));
              }
              return {node: div, data: item, type: ["pentaho-listitem"]};
//    return {node: div, data: item, type: ["treenode-leaf-label"]};
            },

            onMouseDown: function (e) {
              this.selector.current = e.target;
              this.selector.onMouseDown(e);
            },

            onMouseUp: function (e) {
              this.selector.current = e.target;
              this.selector.onMouseUp(e);
            },

            onFieldClick: function (event) {
              event.target.itemId = this.idMap[event.target.id];
              if (this.selector && this.selector.onClick) {
                this.selector.onClick(event);
              }
              if (this.clickCallback) {
                this.clickCallback(event);
              }
            },

            onFieldMouseOver: function (event) {
              if (this.selector) {
                this.selector.onMouseOver(event);
              }
              if (!domClass.contains(event.target, 'pentaho-listitem-selected')) {
                domClass.add(event.target, 'pentaho-listitem-hover');
                domClass.remove(event.target, 'pentaho-listitem');
              }
            },

            onFieldMouseOut: function (event) {
              if (this.selector) {
                this.selector.onMouseOut(event);
              }
              if (!domClass.contains(event.target, 'pentaho-listitem-selected')) {
                domClass.add(event.target, 'pentaho-listitem');
                domClass.remove(event.target, 'pentaho-listitem-hover');
              } else {
                domClass.remove(event.target, 'pentaho-listitem-hover');
                domClass.add(event.target, 'pentaho-listitem-selected');
              }
            },

            _elementComparator: function (a, b) {
              if (a.name < b.name) {
                return -1;
              } else if (a.name == b.name) {
                return 0;
              } else {
                return 1;
              }
            },

            setSelectedIndex: function (idx) {
              this.clearSelection();
              if (idx < 0 || idx >= this.items.length) {
                return;
              }
              var id = this.sanitizeIdAndClassNames(this.items[idx].id);
              var node = dom.byId(id);
              // Logic borrowed from dojo.dnd.Selector.selectAll
              this.selector._addItemClass(node, "Anchor");
              this.selector._addItemClass(node, "pentaho-listitem-selected");
              this.selector.selection[id] = 1;
            },

            /**
             * If the item we invoked the context menu over is not selected make it the only selection.
             */
            updateSelectionForContextMenu: function (id) {
//alert(id);
              var selected = false;
              this.selector.forInSelectedItems(function (item, id) {
                if (item.data.id === id) {
                  selected = true;
                }
              });

//    var id = "field-" + id;
              var saneId = this.sanitizeIdAndClassNames(id);
              var node = dom.byId(saneId);
              if (!selected) {
                this.clearSelection();
                // Logic borrowed from dojo.dnd.Selector.selectAll
                if (this.dndObj) {
                  this.dndObj._addItemClass(node, "Anchor");
                  this.dndObj.selection[saneId] = 1;
                } else {
                  this.selector._addItemClass(node, "Anchor");
                  this.selector.selection[saneId] = 1;
                }
              }
              // Update anchor
              return;
              if (this.dndObj.anchor) {
                this.dndObj._addItemClass(this.dndObj.anchor, "pentaho-listitem-selected");
              }
              this.dndObj._removeAnchor();
              this.dndObj._addItemClass(node, "Anchor");
              this.dndObj.anchor = node;
            },

            getSelectedItems: function () {
              if (this.selector) {
                var items = [];
                this.selector.forInSelectedItems(function (item) {
                  if (item) {
                    items.push(item.data);
                  }
                }, this);
                return items;
              }
            },

            clearSelection: function () {
              if (this.selector) {
                this.selector.selectNone();
              }
            },

            setContextMenu: function (fieldContextMenu) {
              this.fieldContextMenu = fieldContextMenu;
            },

            expandCollapseCategory: function (eventElement) {
              var categoryId = eventElement.target.getAttribute("categoryId");
              var node = dom.byId(categoryId + "-fields");
              var indicatorNode = dom.byId(categoryId);
              var collapsed = indicatorNode.getAttribute("collapsed") != "true";
              if (collapsed) {
                if (this.folderStyle) {
                  domClass.add(indicatorNode, 'folder-closed');
                  domClass.remove(indicatorNode, 'folder-open');
                } else {
                  domClass.add(indicatorNode, 'treenode-closed');
                  domClass.remove(indicatorNode, 'treenode-open');
                }
              } else {
                if (this.folderStyle) {
                  domClass.add(indicatorNode, 'folder-open');
                  domClass.remove(indicatorNode, 'folder-closed');
                } else {
                  domClass.add(indicatorNode, 'treenode-open');
                  domClass.remove(indicatorNode, 'treenode-closed');
                }
              }
              indicatorNode.setAttribute( "collapsed", "" + collapsed);

              if (collapsed) {
                domClass.add(node, "hidden");
              } else {
                domClass.remove(node, "hidden");
              }

              if (this.expandCollapseCategoryCallback) {
                this.expandCollapseCategoryCallback(collapsed);
              }
            }
          });
    });
