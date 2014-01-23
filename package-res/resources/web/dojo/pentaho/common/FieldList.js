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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dojox/html/entities", "dojo/dom-class", "dojo/_base/array",
"dojo/dom-construct", "dojo/dnd/Source", "dojo/dnd/Selector", "dojo/_base/lang", "dojo/dom"],
    function(declare, _WidgetBase, _Templated, on, query, entities, domClass, array, construct, Source, Selector, lang, dom){
      return declare("pentaho.common.FieldList",
    [_WidgetBase, _Templated],
{
  templateString: '<div data-dojo-attach-point="containerNode"></div>',
  datasource: undefined,
  connectHandles: [],
  enableDragDrop: true,
  singleSelect: false,
  getLocaleString: undefined,
  filters: [],
  categorize: true,
  categoryClassMap: {},
  usedCategoryIds: {},
  
  sanitizeIdAndClassNames: function(name) {
    if(name != null){
      return entities.encode(name).replace(/ /g,"_");
    }
    else{
      return '';
    }
  },

  generateUniqueClassName: function(categoryId) {
    var gen = function(){ return Math.round(Math.random() * 100000);};
    var className = "category" + gen();
    while(this.usedCategoryIds[className]){
      className = gen();
    }
    this.usedCategoryIds[className] = true;
    return "" + className;
  },

  getCategoryClassName: function(categoryId) {
    var className = this.categoryClassMap[categoryId];
    if (!className) {
      className = this.generateUniqueClassName(categoryId);
      this.categoryClassMap[categoryId] = className;
    }
    return className;
  },
  
  /**
   * Function to call when a field's oncontextmenu event is received
   * The default implementation is provided here. Call registerFieldContextMenuCallback
   * to override it.
   */
  fieldContextMenuCallback: function fieldContextMenuShow(event) {
        if( !this.fieldContextMenu ) {
            return;
        }
        event.stop(event);
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
   * The dojo.dnd.Source container for the fields
   */
  dndObj: undefined,

  /**
   * The dojo.dnd.Selector object used if enableDragDrop is false
   */
  selector: undefined,

  /**
   * A callback function so we can notify someone, if desired, when expand/collapse happens
   */
  expandCollapseCategoryCallback: undefined,
  
  /**
   * Function to handle disabling the selection of text.
   * The default implementation is provided here. Call registerTextSelectionDisabler
   * to override it.
   */
  textSelectionDisabler: function(target){
    if (typeof target.onselectstart!="undefined") { //IE route
        this.connectHandles.push(on(target, "selectstart", function() { return false; }));
    } 
    else if (typeof target.style.MozUserSelect!="undefined") { //Firefox route
        target.style.MozUserSelect="none"
    } else { //All other route (ie: Opera)
        this.connectHandles.push(on(target, "mousedown", function() { return false; }));
    }
    target.style.cursor = "default"
  },

  registerLocalizationLookup: function(f) {
    this.getLocaleString = f;
    this._localize();
  },

  registerTextSelectionDisabler: function(f) {
    this.textSelectionDisabler = f;
  },

  registerFieldContextMenuCallback: function(f) {
    this.fieldContextMenuCallback = f;
  },

  registerDoubleClickCallback: function(f) {
    this.doubleClickCallback = f;
  },
  
  registerClickCallback: function(f) {
    this.clickCallback = f;
  },
  
  registerExpandCollapseCategoryCallback: function(f) {
	this.expandCollapseCategoryCallback = f;  
  },

  _localize: function() {
  },

  _addItemClass: function(node, type){
    // summary:
    //		adds a class with prefix "dojoDndItem"
    // node: Node
    //		a node
    // type: String
    //		a variable suffix for a class name
    domClass.add(node, "dojoDndItem" + type);
    if(type == 'Selected' || type == 'Anchor'){
        domClass.add(node, "pentaho-listitem-selected");
        domClass.remove(node, 'pentaho-listitem-hover');
    }
  },
  
  _removeItemClass: function(node, type){
    // summary:
    //		removes a class with prefix "dojoDndItem"
    // node: Node
    //		a node
    // type: String
    //		a variable suffix for a class name
    domClass.remove(node, "dojoDndItem" + type);
    if(type == 'Selected' || type == 'Anchor'){
        domClass.remove(node, "pentaho-listitem-selected");
        domClass.remove(node, 'pentaho-listitem-hover');
    }
  },
    
  unload: function() {
    if (this.dndObj) {
      this.dndObj.destroy();
    }
    array.forEach(this.connectHandles, function(handle) {
      handle.remove();
    });
    this.connectHandles = [];
    construct.empty(this.containerNode);
    
    this.categoryClassMap = {};
    this.usedCategoryIds = {};
  },

  configureFor: function(datasource) {
    this.unload();

    this.dndObj = new Source(this.containerNode,
      {
        "copyOnly": true,
        "accept": "",
        "selfAccept": false,
        "singular": this.singleSelect,
        "creator": lang.hitch(this, this._dndItemCreator)
      });

    if(!this.enableDragDrop) {
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
    }

    this.dndObj._addItemClass = this._addItemClass;
    this.dndObj._removeItemClass = this._removeItemClass;
    
    if(!this.categorize) {
      var fields = this.getFields(datasource, null, this.filters);
      this.addFields( fields, this.containerNode, '' );
      return;
    }
    
    var addedCategories = [];

    var categories = this.getCategories(datasource);

    array.forEach(categories, function(category, idx) {
      if (array.indexOf(addedCategories, category.id) != -1) {
        return;
      }
      var fields = this.getFields(datasource, category, this.filters);
      if(fields.length == 0) {
        // there are no fields for this category with the current filters
        return;
      }
      var catId = this.getCategoryClassName(category.id);
      addedCategories.push(category.id);
      // create div for category
      var categoryDiv = construct.create("div",
        {
          "id": catId
        }, this.containerNode);

      // create +- expand/collapse indicator
      var categoryIndicator = construct.create("div",
        {
          "id": catId + "-indicator",
          "class": "categoryIndicator treenode-open",
          "categoryId": catId
        }, categoryDiv);
      this.connectHandles.push(on(categoryIndicator,  'click', lang.hitch( this,  this.expandCollapseCategory)));

      // create span for categoryName to display text
      var categoryNameSpan = construct.create("span",
        {
          "id": catId + "-span",
          "class": "treenode-branch-label",
          "innerHTML": category.name,
          "categoryId": catId
        }, categoryDiv);
      this.textSelectionDisabler(categoryNameSpan);
      this.connectHandles.push(on(categoryNameSpan,  'dblclick', lang.hitch( this,  this.expandCollapseCategory)));

      // create DND field list for this category
      var categoryFieldsDiv = construct.create("div",
        {
          "id": catId + "-fields"
        }, categoryDiv);

      this.addFields( fields, categoryFieldsDiv, catId );

    }, this);
  },

  addFields: function( fields, parent, parentId ) {
      var items = [];
      array.forEach(fields, function(field) {
        var item = {
            "categoryId": parentId,
            "displayName": field.name,
            "fieldId": field.id,
            "dataType": field.dataType,
            "type": ["treenode-leaf-label"],
            "description": field.description
          };
        if(field.hiddenForUser != "true"){
          items.push(item);
          this.dndObj.setItem("field-" + item.fieldId, { "data": item, "type": "treenode-leaf-label", "fieldId": item.fieldId });
        }
      }, this);
      if(this.enableDragDrop) {
        this.dndObj.insertNodes(false, items, false, parent);
      } else {
        // add the fields without the DnD stuff
        for(var idx=0; idx<items.length; idx++) {
            var x = this._dndItemCreator(items[idx],'');
            parent.appendChild(x.node);
            this.selector.setItem("field-" + items[idx].fieldId, { "data": items[idx], "type": "treenode-leaf-label", "fieldId": items[idx].fieldId });
            this.connectHandles.push(on(x.node,  'mousedown', lang.hitch( this,  this.onMouseDown)));
            this.connectHandles.push(on(x.node,  'mouseup', lang.hitch( this,  this.onMouseUp)));
        }
      }
  },

  onMouseDown: function(e) {
    this.selector.current = e.target;
    this.selector.onMouseDown(e);
  },

  onMouseUp: function(e) {
    this.selector.current = e.target;
    this.selector.onMouseUp(e);
  },

  _dndItemCreator: function(item, hint) {
    var props = {
        "id": "field-" + this.sanitizeIdAndClassNames(item.fieldId),
        "innerHTML": item.displayName,
        "fieldId": item.fieldId,
        "class": item.categoryId
    };
    if(item.description) {
        props.title = item.description;
    } else {
    	props.title = item.fieldId;
    }
    var div = construct.create("div", props);
    if (hint === "avatar") {
      domClass.add(div, "dragDropAvatar");
    } else {
      domClass.add(div, "field");
      domClass.add(div, "treenode-leaf-label");
      domClass.add(div, "pentaho-listitem");
      // Wire up interaction
      this.connectHandles.push(on(div,  "contextmenu", lang.hitch( this,  function(event) {
        this.updateSelectionForContextMenu(item.fieldId);
        if(this.fieldContextMenuCallback) {
            this.fieldContextMenuCallback(event);
        }
      })));
      this.connectHandles.push(on(div,  'dblclick', lang.hitch( this,  function(event) {
        if(this.doubleClickCallback) {
            this.doubleClickCallback(item.fieldId);
        }
      })));
      this.connectHandles.push(on(div,  'mouseover', lang.hitch( this,  function(event) {
        this.onFieldMouseOver(event);
      })));
      this.connectHandles.push(on(div,  'mouseout', lang.hitch( this,  function(event) {
        this.onFieldMouseOut(event);
      })));
      this.connectHandles.push(on(div,  'click', lang.hitch( this,  function(event) {
        this.onFieldClick(event);
      })));
    }
    return {node: div, data: item, type: ["treenode-leaf-label"]};
  },

  onFieldClick: function(event) {
    if(this.selector) {
        this.selector.onClick(event);
    }
    if(this.clickCallback) {
        this.clickCallback(event);
    }
  },

  onFieldMouseOver: function(event) {
    if(this.selector) {
        this.selector.onMouseOver(event);
    }
    if(!domClass.contains(event.target,'pentaho-listitem-selected')) {
        domClass.add(event.target, 'pentaho-listitem-hover');
        domClass.remove(event.target, 'pentaho-listitem');
    }
  },

  onFieldMouseOut: function(event) {
    if(this.selector) {
        this.selector.onMouseOut(event);
    }
    if(!domClass.contains(event.target,'pentaho-listitem-selected')) {
        domClass.add(event.target, 'pentaho-listitem');
        domClass.remove(event.target, 'pentaho-listitem-hover');
    } else {
        domClass.remove(event.target, 'pentaho-listitem-hover');
        domClass.add(event.target, 'pentaho-listitem-selected');
    }
  },

  _elementComparator: function(a, b) {
    if (a.name < b.name) {
      return -1;
    } else if (a.name == b.name) {
      return 0;
    } else {
      return 1;
    }
  },

  getCategories: function(datasource) {
    var categories = [];
    array.forEach(datasource.getAllElements(), function(element) {
      if (element.elementType == pentaho.pda.Column.ELEMENT_TYPES.CATEGORY && categories[element] == null) {
        categories.push(element);
      }
    });
    return categories;
  },

  getFields: function(datasource, category, filters) {
    var fields = [];
    var elements = datasource.getAllElements();   
    array.forEach(datasource.getAllElements(), function(element) {
      if (element.isQueryElement && ( category == null || element.parent == category) && fields[element] == null) {
      
        if(filters && filters.length > 0) {
            // apply the filters
            var ok = true;
            for(var filterNo=0; filterNo<filters.length; filterNo++) {
                var values = filters[filterNo].values;
                var filterOk = false;
                for(var valueNo=0; valueNo<values.length; valueNo++) {
                    if(element[filters[filterNo].type] == values[valueNo]) {
                        filterOk = true;
                        break;
                    }
                }
                ok = ok && filterOk;
                if(!ok) {
                    break;
                }
            }
            if(ok) {
                fields.push(element);
            }
        } else {
            fields.push(element);
        }
      }
    });
    return fields;
  },

  expandCollapseCategory: function (eventElement) {
    var categoryId = dojo.attr(eventElement.target, "categoryId");
    var node = dom.byId(categoryId + "-fields");
    var indicatorNode = dom.byId(categoryId + "-indicator");
    var collapsed = dojo.attr(indicatorNode, "collapsed") != "true";
    if (collapsed) {
      domClass.add(indicatorNode,'treenode-closed');
      domClass.remove(indicatorNode,'treenode-open');
    } else {
      domClass.add(indicatorNode,'treenode-open');
      domClass.remove(indicatorNode,'treenode-closed');
    }
    dojo.attr(indicatorNode, "collapsed", "" + collapsed);

    var fields = query("." + categoryId, this.containerNode);
    if (collapsed) {
      fields.addClass("hidden")
    } else {
      fields.removeClass("hidden");
    }
    
    if (this.expandCollapseCategoryCallback) {
      this.expandCollapseCategoryCallback(collapsed);
    }
  },

  updateFilterIndicators: function(filters) {
    // Remove all filter indicators
    query(".treenode-leaf-label", this.containerNode).removeClass("fieldlist-filtered-field");
    // Add filter icons to fields that are filtered
    if (!filters) {
      return;
    }
    // For all active filters add the fieldFiltered class to the field list div for the column that's filtered
    array.forEach(filters, function(filter) {
      var fieldDiv = dom.byId("field-" + this.sanitizeIdAndClassNames(filter.column));
      if(fieldDiv != null){
        domClass.add(fieldDiv, "fieldlist-filtered-field");
      }
    }, this);
  },

  /**
   * If the item we invoked the context menu over is not selected make it the only selection.
   */
  updateSelectionForContextMenu: function(fieldId) {
    var selected = false;
    this.dndObj.forInSelectedItems(function(item, id) {
      if (item.data.fieldId === fieldId) {
        selected = true;
      }
    });

    var id = "field-" + fieldId;
    var node = dom.byId(id);
    if (!selected) {
      this.clearSelection();
      // Logic borrowed from dojo.dnd.Selector.selectAll
      this.dndObj._addItemClass(node, "pentaho-listitem-selected")
      this.dndObj.selection[id] = 1;
    }
    // Update anchor
    if (this.dndObj.anchor) {
      this.dndObj._addItemClass(this.dndObj.anchor, "pentaho-listitem-selected");
    }
    this.dndObj._removeAnchor();
    this.dndObj._addItemClass(node, "Anchor");
    this.dndObj.anchor = node;
  },

  getSelectedItems: function() {
    if (this.dndObj && this.enableDragDrop) {
      var items = [];
      this.dndObj.forInSelectedItems(function(item) {
        items.push(item.data);
      });
      return items;
    }
    if (this.selector && !this.enableDragDrop) {
      var items = [];
      this.selector.forInSelectedItems(function(item) {
        items.push(item.data);
      }, this);
      return items;
    }
  },

  clearSelection: function() {
    if (this.dndObj && this.enableDragDrop) {
      this.dndObj.selectNone();
    }
    if(this.selector) {
      this.selector.selectNone();
    }
  },
  
  addFilter: function( filter ) {
    this.filters.push(filter);
  },
  
  clearFilters: function() {
    this.filters = [];
  },
  
  setCategorized: function( categorize ) {
    this.categorize = categorize;
  },
  
  setEnableDragDrop: function( enableDragDrop ) {
    this.enableDragDrop = enableDragDrop;
  },
  
  setContextMenu: function( fieldContextMenu ) {
    this.fieldContextMenu = fieldContextMenu;
  }
  
});
});