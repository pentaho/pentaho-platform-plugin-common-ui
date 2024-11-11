/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dojox/html/entities", "dojo/dom-class", "dojo/_base/array",
"dojo/dom-construct", "dojo/dnd/Source", "dojo/dnd/Selector", "dojo/_base/lang", "dojo/dom", "dojo/_base/event", "dojo/regexp", "dojo/keys", "dojo/dom-geometry", "common-ui/util/_focus"],
    function(declare, _WidgetBase, _Templated, on, query, entities, domClass, array, construct, Source, Selector, lang, dom, event, regexp, keys, domGeometry, focusUtil){
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
  fieldCategories: [],

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
    this.fieldCategories = [];
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
        "id": "searchBox",
        "class": "flex-row flex-center-v"
      }, searchContainer);
      searchBox.innerHTML = this.localeStringFind + " <input type=text id='searchField' /><div id='clearSearchField' title='" + this.localeStringClearSearch + "' class='hidden pentaho-deletebutton icon-zoomable flex-none'></div>";
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
    calc.name = this.getLocaleString("calcFieldDlgSelectCalculatedFields");

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
      this.fieldCategories.push(catId);
      // create div for category
      var categoryDiv = construct.create("div",
        {
          "id": catId,
          "class": "flex-row flex-center-v gap-none"
        }, this.containerNode);
      if (isFirstCategory) {
        domClass.add(categoryDiv, "categoryNodeFirst");
        categoryDiv.setAttribute("tabindex", "0");
        isFirstCategory = false;
      } else {
        domClass.add(categoryDiv, "categoryNodeNotFirst");
      }
      this.connectHandles.push(on(categoryDiv,  'keydown', lang.hitch( this,  this._onKeydownHeader)));

      // create +- expand/collapse indicator
      var categoryIndicator = construct.create("div",
        {
          "id": catId + "-indicator",
          "class": "categoryIndicator treenode-open icon-zoomable",
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
              "tabindex": "-1",
              "collapsed": "true",
              "expanded":"false"
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
      domClass.add(div, "flex-row flex-center-v gap-none");
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
      this.connectHandles.push(on(div,  'keydown', lang.hitch( this, this._onKeyDownFieldListTree)));
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

  _isFieldSelected: function(elem) {
    return elem.classList.contains('pentaho-listitem-selected');
  },

  _toggleSelection: function(node){
    if(this._isFieldSelected(node)) {
      this.dndObj._removeItemClass(node, "Anchor");
      delete this.dndObj.selection[node.getAttribute("id")];
    } else {
      this._updateMultiSelectionForContextMenu(node.getAttribute("fieldId"));
    }
  },

  _updateMultiSelectionForContextMenu: function(fieldId) {
    var selected = false;
    this.dndObj.forInSelectedItems(function(item, id) {
      if (item.data.fieldId === fieldId) {
        selected = true;
      }
    });

    var id = "field-" + fieldId;
    var node = dom.byId(id);

    if (!selected) {
      this.dndObj.anchor = node;
      this.dndObj._addItemClass(node, "Anchor");
      this.dndObj.selection[id] = this.dndObj.getSelectedNodes().length + 1;
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
    var hasFocus = this._hasFocus();
    var focusTargetState = this._captureFocusTargetState();

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
            groupHeader.setAttribute("tabindex", "-1");
            isFirstCategory = false;
          } else {
            domClass.add(groupHeader, "categoryNodeNotFirst");
          }
        }
      } else {
        domClass.add(node, "hidden");
      }
    }

    this._restoreFocusTarget(focusTargetState, hasFocus);

    // if there is only one node left, do sth special
    if (this.fieldCount === 1) {
      this.updateSelectionForContextMenu(dojo.attr(firstNode, "fieldId"));
    }

    this.expandAllCategories();
  },

  _getCurrentFocusTarget: function () {
    return this.containerNode.querySelector('[tabindex="0"]');
  },

  _captureFocusTargetState: function () {
    var currentNode = this._getCurrentFocusTarget();
    if (currentNode == null) {
      return null;
    }

    return focusUtil.captureState(currentNode, {
      root: this.containerNode,
      focusable: true
    });
  },

  _restoreFocusTarget: function (focusTargetState, setFocus) {
    var newNode = focusTargetState && focusTargetState.closest();

    newNode = this._setCurrentFocusTarget(newNode, setFocus);

    // If it was not possible to focus any of the tree's target-able nodes,
    // then focus the search field (or previous tabbable element before fieldList).
    if (newNode == null && setFocus) {
      document.querySelector("#searchField").focus();
    }

    return newNode;
  },

  _getDefaultFocusTarget: function () {
    var keyArgs = {root: this.containerNode, focusable: true};

    return focusUtil.firstTabbable(keyArgs.root, keyArgs);
  },

  _setCurrentFocusTarget: function (newNode, setFocus) {
    var currentNode = this._getCurrentFocusTarget();

    if (newNode == null) {
      newNode = this._getDefaultFocusTarget();
    }

    // No targetable nodes?
    if (newNode == null) {
      // assert currentNode === null;
      return null;
    }

    // Effectively changing the current focus target?
    if (newNode !== currentNode) {
      if (currentNode != null) {
        currentNode.setAttribute("tabindex", "-1");
      }

      newNode.setAttribute("tabindex", "0");
    }

    if (setFocus) {
      newNode.focus();
    }

    return newNode;
  },

  _hasFocus: function () {
    return focusUtil.containsFocus(this.containerNode);
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
  },

  _isHiddenChild: function (elem) {
    return elem.classList.contains("hidden");
  },

  _findNextHeader: function (elem) {
    var currentCatId = dojo.attr(elem, "id");
    var catArray = this.fieldCategories;
    var L = catArray.length;

    if (L === 0) {
      return null;
    }

    // Not found or found at last position.
    var index = catArray.indexOf(currentCatId);
    if (index < 0 || index === (L - 1)) {
      return null;
    }

    var nextHeader = dom.byId(catArray[index + 1]);
    if (this._isHiddenChild(nextHeader)) {
      return this._findNextHeader(nextHeader);
    }
      var calButton = dom.byId("catId-add-button");
      var tabIndexValue = this.isCalcField(nextHeader.id) ? "0" : "-1";
      calButton.setAttribute("tabindex", tabIndexValue);

    return nextHeader;
  },

  _findPrevHeader: function (elem) {
    var currentCatId = dojo.attr(elem, "id");
    var catArray = this.fieldCategories;
    var L = catArray.length;

    if (L === 0) {
      return null;
    }

    // Not found or found at first position.
    var index = catArray.indexOf(currentCatId);
    if (index <= 0) {
      return null;
    }

    var prevHeader = dom.byId(catArray[index - 1]);
    if (this._isHiddenChild(prevHeader)) {
      return this._findPrevHeader(prevHeader);
    }
    var calButton = dom.byId("catId-add-button");
    var tabIndexValue = this.isCalcField(prevHeader.id) ? "0" : "-1";
    calButton.setAttribute("tabindex", tabIndexValue);
    return prevHeader;
  },

  findNextField: function (elem) {
    var fieldArray = Array.from(this.containerNode.children);
    var L = fieldArray.length;

    if (L === 0) {
      return null;
    }

    // Not found or found at last position.
    var index = fieldArray.indexOf(elem);
    if (index < 0 || index === (L - 1)) {
      return null;
    }

    var nextField = fieldArray[index + 1];
    if (nextField.id === "fieldListFlag" || this._isHiddenChild(nextField)) {
      return this.findNextField(nextField);
    }

    var calButton = dom.byId("catId-add-button");
    var tabIndexValue = this.isCalcField(nextField.id) ? "0" : "-1";
    calButton.setAttribute("tabindex", tabIndexValue);

    return nextField;
  },

  findPrevField: function (elem) {
    var fieldArray = Array.from(this.containerNode.children);
    var L = fieldArray.length;

    if (L === 0) {
      return null;
    }

    // Not found or found at first position.
    var index = fieldArray.indexOf(elem);
    if (index <= 0) {
      return fieldArray[L - 1];
    }

    var prevField = fieldArray[index - 1];
    if (prevField.id === "fieldListFlag" || this._isHiddenChild(prevField)) {
      return this.findPrevField(prevField);
    }

    var calButton = dom.byId("catId-add-button");
    var tabIndexValue = this.isCalcField(prevField.id) ? "0" : "-1";
    calButton.setAttribute("tabindex", tabIndexValue);

    return prevField;
  },

  _onKeydownHeader: function (e) {
      var code = e.keyCode || e.which;
      var header = e.target;
      var categoryId = dojo.attr(header, "id");
      var children;
      var expanded = false;
      if (header.firstElementChild !== null){
        expanded = dojo.attr(header.firstElementChild, "collapsed") !== "true";
      }

    if (code === keys.DOWN_ARROW) {
      e.preventDefault();
      var firstChild;
      if (expanded) {
        children = query("." + categoryId, this.containerNode);
        for (var i = 0; i < children.length; i++) {
          if (this._isHiddenChild(children[i])) {
            continue;
          }
          firstChild = children[i];
          break;
        }
      }
      if (firstChild) {
        // Move focus to first shown child under Nth Header
        firstChild.setAttribute('tabindex', '0');
        header.setAttribute('tabindex', '-1');
        firstChild.focus();
      } else {
          var nextHeader = this._findNextHeader(header);
          if (nextHeader) {
            // Move from Nth header to (N+1) Header if Nth Header is closed
            nextHeader.setAttribute('tabindex', '0');
            header.setAttribute('tabindex', '-1');
            nextHeader.focus();
          }
      }
    } else if (code === keys.UP_ARROW) {
        e.preventDefault();
        var previousHeader = this._findPrevHeader(header);
        if (previousHeader) {
          expanded = dojo.attr(previousHeader.firstElementChild, "collapsed") !== "true";
          var lastChild;

          if (expanded) {
            children = query("." + previousHeader.id, this.containerNode);
            for (var j = children.length - 1; j > -1; j--) {
              if (this._isHiddenChild(children[j])) {
                continue;
              }
              lastChild = children[j];
              break;
            }
          }
          header.setAttribute('tabindex', '-1');
          if (lastChild) {
            // Move from Nth header to Last Sibling under (N-1) Header if (N-1) Header is open
            lastChild.setAttribute('tabindex', '0');
            lastChild.focus();
          } else {
            // Move from Nth header to (N-1) Header if (N-1) header is closed
            previousHeader.setAttribute('tabindex', '0');
            previousHeader.focus();
          }
      }
    } else if (code === keys.LEFT_ARROW) {
      if (expanded) {
        this.expandCollapseCategory({ target: header.firstChild });
      }
    } else if (code === keys.RIGHT_ARROW) {
      if (!expanded) {
        this.expandCollapseCategory({ target: header.firstChild });
      }
    }
  },

  _isField: function (elem) {
    return elem.classList.contains("field");
  },

  _moveFocus: function (node, key) {
    var groupHeader = dom.byId(dojo.attr(node, "categoryId"));
    if (key === 'Up') {
      var previousSibling = this.findPrevField(node);
      var header = groupHeader;
      if (previousSibling && this._isField(previousSibling)) {
        previousSibling.setAttribute('tabindex', '0');
        node.setAttribute('tabindex', '-1');
        previousSibling.focus();
      } else if (header) {
        header.setAttribute('tabindex', '0');
        node.setAttribute('tabindex', '-1');
        header.focus();
      }
    } else if (key === 'Down') {
        var nextSibling = this.findNextField(node);
        if (nextSibling && this._isField(nextSibling)) {
          nextSibling.setAttribute('tabindex', '0');
          node.setAttribute('tabindex', '-1');
          nextSibling.focus();
          return;
        }
        var nextHeader = this._findNextHeader(groupHeader);
        if (nextHeader) {
          nextHeader.setAttribute('tabindex', '0');
          node.setAttribute('tabindex', '-1');
          nextHeader.focus();
        }
    }
  },

  _onKeyDownFieldListTree: function (event) {
    var node = event.target;
    var code = (event.keyCode ? event.keyCode : event.which);
    if (event.shiftKey) {
      switch (code) {
        case keys.UP_ARROW:
          event.preventDefault();
          this._moveFocus(node, 'Up');
          this._updateMultiSelectionForContextMenu(node.getAttribute("fieldId"));
          break;
        case keys.DOWN_ARROW:
          event.preventDefault();
          this._moveFocus(node, 'Down');
          this._updateMultiSelectionForContextMenu(node.getAttribute("fieldId"));
          break;
        default:
          return;
      }
    } else if (event.ctrlKey) {
      switch (code) {
        case keys.UP_ARROW:
          event.preventDefault();
          this._moveFocus(node, 'Up');
          break;
        case keys.DOWN_ARROW:
          event.preventDefault();
          this._moveFocus(node, 'Down');
          break;
        case keys.SPACE:
          event.preventDefault();
          this._toggleSelection(node);
          break;
        default:
          return;
      }
    } else {
      switch (code) {
        case keys.ENTER:
          this.updateSelectionForContextMenu(node.getAttribute("fieldId"));
          coords = domGeometry.position(node, true);
          coords.x += coords.w;
          coords.y += coords.h;
          if (this.isCalcField(node.classList[0])) {
              this.calcFieldContextMenu._scheduleOpen(node, null, coords);
          } else {
              this.fieldContextMenu._scheduleOpen(node, null, coords);
          }
          break;
        case keys.UP_ARROW:
          event.preventDefault();
          this._moveFocus(node, 'Up');
          break;
        case keys.DOWN_ARROW:
          event.preventDefault();
          this._moveFocus(node, 'Down');
          break;
        default:
          return;
      }
    }
  },
});
});
