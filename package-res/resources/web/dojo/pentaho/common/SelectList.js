dojo.provide("pentaho.common.SelectList");
dojo.require("dojo.dnd.Selector");
dojo.require("dojox.html.entities");

/**
 * Creates a list of fields from a 
 */
dojo.declare(
    "pentaho.common.SelectList",
    [dijit._Widget, dijit._Templated],
{
  templateString: '<div dojoAttachPoint="containerNode" class="pentaho-listbox"></div>',
  connectHandles: [],
  singleSelect: false,
  getLocaleString: undefined,
  idMap: {},
  items:[],
  folderStyle: true,
  fieldContextMenuCallback: null,
  
  sanitizeIdAndClassNames: function(name) {
    var escapedName = dojox.html.entities.encode(name);
    if (escapedName) {
      return escapedName.replace(/ /g,"_");
    } else {
      return name;
    }
  },

  clear: function() {
    dojo.forEach(this.connectHandles, function(handle) {
      dojo.disconnect(handle);
    });
    this.connectHandles = [];
    dojo.empty(this.containerNode);
  },

  init: function() {
        this.fieldContextMenuCallback = this._fieldContextMenuCallback;

        this.selector = new dojo.dnd.Selector(this.containerNode, 
        {
          "copyOnly": true,
          "accept": "",
          "selfAccept": false,
          "singular": this.singleSelect,
          "creator": dojo.hitch(this, this._dndItemCreator)
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
        if( !this.fieldContextMenu ) {
            return;
        }
        dojo.stopEvent(event);
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
  textSelectionDisabler: function(target){
    if (typeof target.onselectstart!="undefined") { //IE route
        this.connectHandles.push(dojo.connect(target, "onselectstart", function() { return false; }));
    } 
    else if (typeof target.style.MozUserSelect!="undefined") { //Firefox route
        target.style.MozUserSelect="none"
    } else { //All other route (ie: Opera)
        this.connectHandles.push(this.connect(target, "onmousedown", function() { return false; }));
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
  
  _localize: function() {
  },

  _addItemClass: function(node, type){
    // summary:
    //		adds a class with prefix "dojoDndItem"
    // node: Node
    //		a node
    // type: String
    //		a variable suffix for a class name
    dojo.addClass(node, "dojoDndItem" + type);
    if(type == 'Selected' || type == 'Anchor'){
        dojo.addClass(node, "pentaho-listitem-selected");
        dojo.removeClass(node, 'pentaho-listitem-hover');
    }
  },
  
  _removeItemClass: function(node, type){
    // summary:
    //		removes a class with prefix "dojoDndItem"
    // node: Node
    //		a node
    // type: String
    //		a variable suffix for a class name
    dojo.removeClass(node, "dojoDndItem" + type);
    if(type == 'Selected' || type == 'Anchor'){
        dojo.removeClass(node, "pentaho-listitem-selected");
        dojo.removeClass(node, 'pentaho-listitem-hover');
    }
  },

  addItems: function( items ) {
      this.items = items;
      var parent = this.containerNode;
      
      // see if we have any nesting

      for(var idx=0; idx<items.length; idx++) {
        var item = items[idx];
        if( item.children ) {
          // create a parent element
          var saneId = this.sanitizeIdAndClassNames(item.id)
          var options = {
              "id": saneId,
              "class": "pentaho-selectlist-container",
              "categoryId": saneId,
              "collapsed": "true"
            };
          var categoryDiv = dojo.create("div",options, this.containerNode);
          if( this.folderStyle ) {
            dojo.addClass(categoryDiv, "categoryIndicator");
            if(options.collapsed == "true") {
                dojo.addClass(categoryDiv, "folder-closed");
            } else {
                dojo.addClass(categoryDiv, "folder-open");
            }
          }
          // create span for categoryName to display text
          var categoryNameSpan = dojo.create("span",
            {
              "id": saneId + "-span",
              "class": "treenode-branch-label",
              "innerHTML": item.label,
              "categoryId": saneId
            }, categoryDiv);
          this.textSelectionDisabler(categoryNameSpan);
          this.textSelectionDisabler(categoryDiv);

          this.connectHandles.push(dojo.connect(categoryDiv, 'onclick', this, this.expandCollapseCategory));
          this.connectHandles.push(dojo.connect(categoryNameSpan, 'ondblclick', this, this.expandCollapseCategory));
          this.connectHandles.push(dojo.connect(categoryDiv, "oncontextmenu", this, function(event) {
            this.updateSelectionForContextMenu(saneId);
            if(this.fieldContextMenuCallback) {
                this.fieldContextMenuCallback(event);
            }
          }));
          this.connectHandles.push(dojo.connect(categoryNameSpan, "oncontextmenu", this, function(event) {
            this.updateSelectionForContextMenu(saneId);
            if(this.fieldContextMenuCallback) {
                this.fieldContextMenuCallback(event);
            }
          }));

          // create DND field list for this category
          var categoryFieldsDiv = dojo.create("div",
            {
              "id": saneId + "-fields",
              "class": options.collapsed == "true" ? "hidden" : ""
            }, categoryDiv);
          for( kidIdx=0; kidIdx<item.children.length; kidIdx++ ) {
            this.addItem(item.children[kidIdx], categoryFieldsDiv, true);
          } 
        } else {
            this.addItem(item, parent, false);
        }
      }
  },
  
  addItem: function( item, parent, indented ) {
    var x = this._dndItemCreator(item,'');
    if( indented ) {
        dojo.addClass(x.node, "pentaho-selectlist-item-indent" );
    }
    parent.appendChild(x.node);
    this.idMap[this.sanitizeIdAndClassNames(item.id)]= item.id;
    this.selector.setItem(this.sanitizeIdAndClassNames(item.id), { "data": item, "type": item.type, "itemId": this.sanitizeIdAndClassNames(item.itemId) });
    this.connectHandles.push(dojo.connect(x.node, 'onmousedown', this, this.onMouseDown));
    this.connectHandles.push(dojo.connect(x.node, 'onmouseup', this, this.onMouseUp));
  },
  
  _dndItemCreator: function(item, hint) {
    var props = {
        "id": this.sanitizeIdAndClassNames(item.id),
        "innerHTML": item.label,
        "itemId": this.sanitizeIdAndClassNames(item.id),
        "class": item.type
    };
    if( !props["class"] ) {
        props["class"] = "pentaho-selectlist-item";
    }

    if(item.title) {
      props.title = this.sanitizeIdAndClassNames(item.title);
    } else if(item.label) {
        props.title = this.sanitizeIdAndClassNames(item.label);
    } else {
    	props.title = props.id;
    }
    var div = dojo.create("div", props);
    if (hint === "avatar") {
      dojo.addClass(div, "dragDropAvatar");
    } else {
      dojo.addClass(div, "field");
//      dojo.addClass(div, "treenode-leaf-label");
      dojo.addClass(div, "pentaho-listitem");
//      if( item.className ) {
//        dojo.addClass(div, item.className);
//      } else {
        if(item.hasIcon) {
            dojo.addClass(div, "pentaho-selectlist-item-icon");
        } else {
            dojo.addClass(div, "pentaho-selectlist-item");
        }
//      }
      // Wire up interaction
      this.connectHandles.push(dojo.connect(div, "oncontextmenu", this, function(event) {
        this.updateSelectionForContextMenu(item.id);
        if(this.fieldContextMenuCallback) {
            this.fieldContextMenuCallback(event);
        }
      }));
      this.connectHandles.push(dojo.connect(div, 'ondblclick', this, function(event) {
        if(this.doubleClickCallback) {
            this.doubleClickCallback(item.id);
        }
      }));
      this.connectHandles.push(dojo.connect(div, 'onmouseover', this, function(event) {
        this.onFieldMouseOver(event);
      }));
      this.connectHandles.push(dojo.connect(div, 'onmouseout', this, function(event) {
        this.onFieldMouseOut(event);
      }));
      this.connectHandles.push(dojo.connect(div, 'onclick', this, function(event) {
        this.onFieldClick(event);
      }));
    }
    return {node: div, data: item, type: ["pentaho-listitem"]};
//    return {node: div, data: item, type: ["treenode-leaf-label"]};
  },

  onMouseDown: function(e) {
    this.selector.current = e.target;
    this.selector.onMouseDown(e);
  },

  onMouseUp: function(e) {
    this.selector.current = e.target;
    this.selector.onMouseUp(e);
  },

  onFieldClick: function(event) {
    event.target.itemId = this.idMap[event.target.id];
    if(this.selector && this.selector.onClick) {
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
    if(!dojo.hasClass(event.target,'pentaho-listitem-selected')) {
        dojo.addClass(event.target, 'pentaho-listitem-hover');
        dojo.removeClass(event.target, 'pentaho-listitem');
    }
  },

  onFieldMouseOut: function(event) {
    if(this.selector) {
        this.selector.onMouseOut(event);
    }
    if(!dojo.hasClass(event.target,'pentaho-listitem-selected')) {
        dojo.addClass(event.target, 'pentaho-listitem');
        dojo.removeClass(event.target, 'pentaho-listitem-hover');
    } else {
        dojo.removeClass(event.target, 'pentaho-listitem-hover');
        dojo.addClass(event.target, 'pentaho-listitem-selected');
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

  setSelectedIndex: function(idx) {
    this.clearSelection();
    if( idx < 0 || idx >= this.items.length ) {
        return;
    }
    var id = this.sanitizeIdAndClassNames(this.items[idx].id);
    var node = dojo.byId(id);
    // Logic borrowed from dojo.dnd.Selector.selectAll
    this.selector._addItemClass(node, "Anchor");
    this.selector._addItemClass(node, "pentaho-listitem-selected");
    this.selector.selection[id] = 1;
  },

  /**
   * If the item we invoked the context menu over is not selected make it the only selection.
   */
  updateSelectionForContextMenu: function(id) {
//alert(id);
    var selected = false;
    this.selector.forInSelectedItems(function(item, id) {
      if (item.data.id === id) {
        selected = true;
      }
    });

//    var id = "field-" + id;
    var saneId = this.sanitizeIdAndClassNames(id);
    var node = dojo.byId(saneId);
    if (!selected) {
      this.clearSelection();
      // Logic borrowed from dojo.dnd.Selector.selectAll
      if( this.dndObj ) {
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

  getSelectedItems: function() {
    if (this.selector) {
      var items = [];
      this.selector.forInSelectedItems(function(item) {
        if( item ) {
          items.push(item.data);
        }
      }, this);
      return items;
    }
  },

  clearSelection: function() {
    if(this.selector) {
      this.selector.selectNone();
    }
  },
  
  setContextMenu: function( fieldContextMenu ) {
    this.fieldContextMenu = fieldContextMenu;
  },
  
  expandCollapseCategory: function (eventElement) {
    var categoryId = dojo.attr(eventElement.target, "categoryId");
    var node = dojo.byId(categoryId + "-fields");
    var indicatorNode = dojo.byId(categoryId);
    var collapsed = dojo.attr(indicatorNode, "collapsed") != "true";
    if (collapsed) {
      if( this.folderStyle ) {
        dojo.addClass(indicatorNode,'folder-closed');
        dojo.removeClass(indicatorNode,'folder-open');
      } else {
        dojo.addClass(indicatorNode,'treenode-closed');
        dojo.removeClass(indicatorNode,'treenode-open');
      }
    } else {
      if( this.folderStyle ) {
        dojo.addClass(indicatorNode,'folder-open');
        dojo.removeClass(indicatorNode,'folder-closed');
      } else {
        dojo.addClass(indicatorNode,'treenode-open');
        dojo.removeClass(indicatorNode,'treenode-closed');
      }
    }
    dojo.attr(indicatorNode, "collapsed", "" + collapsed);

    if (collapsed) {
      dojo.addClass(node,"hidden");
    } else {
      dojo.removeClass(node,"hidden");
    }
    
    if (this.expandCollapseCategoryCallback) {
      this.expandCollapseCategoryCallback(collapsed);
    }
  }
  
  
});
