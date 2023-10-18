/*!
* Copyright 2010 - 2023 Hitachi Vantara.  All rights reserved.
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
"dojo/dom-construct", "dojo/dnd/Source", "dojo/dnd/Selector", "dojo/_base/lang", "dojo/dom", "dojo/_base/event", "dojo/regexp"],
    function(declare, _WidgetBase, _Templated, on, query, entities, domClass, array, construct, Source, Selector, lang, dom, event, regexp){
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
  fieldListNodes: [],
  localeStringFind: "Find:",
  localeStringClearSearch: "Clear Search",

  sanitizeIdAndClassNames: function(name) {
    if(name != null){
      return entities.encode(name).replace(/ /g,"_");
    }
    else{
      return '';
    }
  },

  isCalcField: function (category) {
    return category === pentaho.pda.Column.ELEMENT_TYPES.CAT_CALC_FIELD;
  },

  generateUniqueClassName: function(categoryId) {
    if (this.isCalcField(categoryId)) {
      return categoryId;
    }
    var gen = function(){ return Math.round(Math.random() * 100000);};
    var className = "category" + gen();
    while(this.usedCategoryIds[className]){
      className = gen();
    }
    this.usedCategoryIds[className] = true;
    return "" + className;
  },

  initializeCategoryClassMap: function() {
    if (!this.initialized) {
      this.categoryClassMap[pentaho.pda.Column.ELEMENT_TYPES.CAT_CALC_FIELD] = pentaho.pda.Column.ELEMENT_TYPES.CAT_CALC_FIELD;
      this.initialized = true;
    }
  },

  getCategoryClassName: function(categoryId) {
    var className = this.categoryClassMap[categoryId];
    this.initializeCategoryClassMap();
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
  fieldContextMenuCallback: function fieldContextMenuShow(evt) {
        if( !this.fieldContextMenu ) {
            return;
        }
        event.stop(evt);
        var x = evt.pageX;
        var y = evt.pageY;
        this.fieldContextMenu._scheduleOpen(evt.target, null, {x: x, y: y});
    },

  calcFieldContextMenuCallback: function calcFieldContextMenuShow(evt) {
        if( !this.calcFieldContextMenu ) {
            return;
        }
        event.stop(evt);
        var x = evt.pageX;
        var y = evt.pageY;
        this.calcFieldContextMenu._scheduleOpen(evt.target, null, {x: x, y: y});
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

  registerCalcFieldContextMenuCallback: function(f) {
    this.calcFieldContextMenuCallback = f;
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
    if (this.getLocaleString) {
      this.localeStringFind = this.getLocaleString("fieldListFind");
      this.localeStringClearSearch = this.getLocaleString("fieldListClearSearch");
    }
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
        domClass.remove(node, "pentaho-listitem");
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
    this.fieldListNodes = [];
  },

  openCalcField: function(){
    document.getElementById("MA_name").value = "";
    document.getElementById("MA_content").value = "";
    document.getElementById("cal-field-container").setAttribute("data-edit-mode", "false");
    document.getElementById("dialogTitleText").innerHTML = "Create Calculated Field";
    var availableFields = document.getElementById("availableFields");
    if (availableFields != null) {
      for (var index = availableFields.options.length-1; index >= 0; index--) {
        availableFields.remove(index);
      }
    }
    array.forEach(this.fieldListNodes, function (node) {
      var option = document.createElement("option");
      option.innerText = node.innerText;
      option.value = node.classList.contains("CAT_CALC_FIELD") ? node.innerText : node.getAttribute("fieldid");
      availableFields.appendChild(option);
    });
    var calcFieldDlgClasses = document.getElementById("calfieldparent").classList;
    calcFieldDlgClasses.remove("calculated-field-hide");
    calcFieldDlgClasses.add("calculated-field");

    view.populateCategoriesAndFunctions();
  },
  
  configureFor: function(datasource, searchContainer) {
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

    // If configureFor is called with a searchContainer then search functionality will be added to 
    // this instance of the fieldlist and the search input box will be appended to the searchContainer node
    if (searchContainer) {
      var searchBox = construct.create("div",
      {
        "id": "searchBox"
      }, searchContainer);
      searchBox.innerHTML = this.localeStringFind + " <input type=text id='searchField' /><div id='clearSearchField' title='" + this.localeStringClearSearch + "' class='hidden pentaho-deletebutton'></div>";
      this.connectHandles.push(on(dom.byId("searchField"),  'keyup', lang.hitch( this,  "searchFields")));
      this.connectHandles.push(on(dom.byId("clearSearchField"),  'click', lang.hitch( this,  "onClearSearch")));
    }
    
    if(!this.categorize) {
      var fields = this.getFields(datasource, null, this.filters);
      this.addFields( fields, this.containerNode, '' );
      return;
    }

    var addedCategories = [];

    var categories = this.getCategories(datasource);

    var calc = new pentaho.pda.dataelement();
    calc.id = pentaho.pda.Column.ELEMENT_TYPES.CAT_CALC_FIELD;
    calc.elementType = pentaho.pda.Column.ELEMENT_TYPES.CATEGORY;
    calc.dataType = pentaho.pda.Column.DATA_TYPES.NONE;
    calc.name = "Calculated Fields";

    categories.push(calc);
    
    var isFirstCategory = true;

    array.forEach(categories, function(category, idx) {
      if (array.indexOf(addedCategories, category.id) != -1) {
        return;
      }
      var fields = this.getFields(datasource, category, this.filters);
      if(fields.length == 0 && !(this.isCalcField(category.id))) {
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
      if (isFirstCategory) {
        domClass.add(categoryDiv, "categoryNodeFirst");
        isFirstCategory = false;
      } else {
        domClass.add(categoryDiv, "categoryNodeNotFirst");
      }
      // create +- expand/collapse indicator
      var categoryIndicator = construct.create("div",
        {
          "id": catId + "-indicator",
          "class": "categoryIndicator treenode-open",
          "collapsed": "false",
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
      if(this.isCalcField(category.id)){
        var addCalButton = construct.create("button",
            {
              "id": "catId-add-button",
              "class": "pentaho-addbutton icon-zoomable",
              "onclick": function() {
                this.openCalcField();
              }.bind(this)

            }, categoryDiv);

      }
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
          if(this.isCalcField(parentId)){
              var modifiedField = field.replace(/ /g, '');
              var item = {
                  "categoryId": parentId,
                  "displayName": field,
                  "fieldId": modifiedField+"-id",
                  "dataType": modifiedField+"-dataType",
                  "type": ["treenode-leaf-label"],
                  "description": "CAL-FIELD-"+modifiedField.toUpperCase()
              };
          } else {
              var item = {
                  "categoryId": parentId,
                  "displayName": field.name,
                  "fieldId": field.id,
                  "dataType": field.dataType,
                  "type": ["treenode-leaf-label"],
                  "description": field.description
              };
          }

          if(this.isCalcField(parentId) || field.hiddenForUser != "true"){
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
        "class": item.categoryId,
        "categoryId" : item.categoryId
    };
    if(item.description) {
        props.title = item.description;
    } else {
    	props.title = item.fieldId;
    }
    var div = construct.create("div", props);
    this.fieldListNodes.push(div);
    if (hint === "avatar") {
      domClass.add(div, "dragDropAvatar");
    } else {
      domClass.add(div, "field");
      domClass.add(div, "treenode-leaf-label");
      domClass.add(div, "pentaho-listitem");
      // Wire up interaction
      this.connectHandles.push(on(div,  "contextmenu", lang.hitch( this,  function(event) {
        this.updateSelectionForContextMenu(item.fieldId);
        if (this.isCalcField(item.categoryId)) {
          if (this.calcFieldContextMenuCallback) {
            this.calcFieldContextMenuCallback(event);
          }
        } else if (this.fieldContextMenuCallback) {
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
    if (event.currentTarget==this.dndObj.anchor) {
      return;
    }
    if(this.selector) {
        this.selector.onMouseOver(event);
    }
    if(!domClass.contains(event.target,'pentaho-listitem-selected')) {
        domClass.add(event.target, 'pentaho-listitem-hover');
        domClass.remove(event.target, 'pentaho-listitem');
    }
  },

  onFieldMouseOut: function(event) {
    if (event.currentTarget==this.dndObj.anchor) {
      return;
    }
    if(this.selector) {
        this.selector.onMouseOut(event);
    }
    if(!domClass.contains(event.target,'pentaho-listitem-selected')) {
        domClass.add(event.target, 'pentaho-listitem');
        domClass.remove(event.target, 'pentaho-listitem-hover');
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
    // Logic borrowed from dojo.dnd.Selector.onMouseDown
    if (!selected) {
      this.clearSelection();
      this.dndObj.anchor = node;
      this.dndObj._addItemClass(node, "Anchor");
      this.dndObj.selection[id] = 1;
    }
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
  },

  setCalcFieldContextMenu: function(calcFieldContextMenu) {
    this.calcFieldContextMenu = calcFieldContextMenu;
  },
  
  searchFields: function(key) {
  
    var isFirstCategory = true;
    var searchField = dom.byId("searchField");
    var clearSearchField = dom.byId("clearSearchField");
    
    // if only one field shown, press return to add it
    if (key && key.keyCode == 13) {
      if (this.fieldCount == 1 && this.dndObj && this.dndObj.anchor) {
        if(this.doubleClickCallback) {
            this.doubleClickCallback(dojo.attr(this.dndObj.anchor, "fieldId"));
            this.clearSelection();
        }
      }
      return;
    }
    
    // Reset the highlight on the last selected field if there was one
    this.clearSelection();
  
    // do search
    var key = searchField.value;
    var len = this.fieldListNodes.length;
    this.fieldCount = 0;
    var re = null;
    if (key) {
      re = new RegExp(regexp.escapeString(key), 'i');
      domClass.remove(clearSearchField, "hidden");
    } else {
      domClass.add(clearSearchField, "hidden");
    }

    var showGroup = false, groupHeader = null;
    var firstNode = null;
    for (var x = 0; x < len; ++x) {
      var node = this.fieldListNodes[x];
      // if group changes, hide the group header first
      var nodeGroupHeader = dom.byId(dojo.attr(node, "categoryId"));
      if (groupHeader != nodeGroupHeader) {
        groupHeader = nodeGroupHeader;
        showGroup = false;
        if (groupHeader && node.id) {
          domClass.add(groupHeader, "hidden");
          domClass.remove(groupHeader, "categoryNodeFirst");
          domClass.remove(groupHeader, "categoryNodeNotFirst");
        }
      }
      if (!re || node.textContent.search(re) >= 0) {
        domClass.remove(node, "hidden");
        ++this.fieldCount;
        if (!firstNode)
          firstNode = node; // remember the first node
        if (!showGroup && groupHeader) {
          domClass.remove(groupHeader, "hidden");
          showGroup = true;
          if (isFirstCategory) {
            domClass.add(groupHeader, "categoryNodeFirst");
            isFirstCategory = false;
          } else {
            domClass.add(groupHeader, "categoryNodeNotFirst");
          }
        }
      } else {
        domClass.add(node, "hidden");
      }
    }
    
    // if there is only one node left, do sth special
    if (this.fieldCount === 1) {
      this.updateSelectionForContextMenu(dojo.attr(firstNode, "fieldId"));
    } 
    
    this.expandAllCategories();
  },
  
  onClearSearch : function() {
    var searchField = dom.byId("searchField");
    var clearSearchField = dom.byId("clearSearchField");
    if (searchField.value) {
      searchField.value = "";
      this.searchFields();
      this.expandAllCategories();
      searchField.focus();
    }
    domClass.add(clearSearchField, "hidden");
  },
  
  expandAllCategories : function() {
    for (var categoryId in this.usedCategoryIds) {
      var indicatorNode = dom.byId(categoryId + "-indicator");
      var expanded = dojo.attr(indicatorNode, "collapsed") != "true";
      if (!expanded) {
        this.expandCollapseCategory({target: indicatorNode})
      }
    }
  }

});
});