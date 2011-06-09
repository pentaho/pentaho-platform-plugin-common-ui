dojo.provide("pentaho.common.FieldList");

/**
 * Creates a list of fields from a 
 */
dojo.declare(
    "pentaho.common.FieldList",
    [dijit._Widget, dijit._Templated],
{
  templateString: '<div dojoAttachPoint="containerNode"></div>',
  datasource: undefined,
  connectHandles: [],
  getLocaleString: undefined,
  /**
   * Function to handle disabling the selection of text.
   */
  textSelectionDisabler: undefined,
  /**
   * Function to call when a field's oncontextmenu event is received
   */
  fieldContextMenuCallback: undefined,
  /**
   * Function to handle adding a field. Will receive the fieldId as the only parameter.
   */
  addFieldCallback: undefined,

  /**
   * The dojo.dnd.Source container for the fields
   */
  dndObj: undefined,

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

  registerAddFieldCallback: function(f) {
    this.addFieldCallback = f;
  },

  _localize: function() {
  },

  unload: function() {
    if (this.dndObj) {
      this.dndObj.destroy();
    }
    dojo.forEach(this.connectHandles, function(handle) {
      dojo.disconnect(handle);
    });
    this.connectHandles = [];
    dojo.empty(this.containerNode);
  },

  configureFor: function(datasource) {
    this.unload();

    var addedCategories = [];

    var categories = this.getSortedCategories(datasource);

    this.dndObj = new dojo.dnd.Source(this.containerNode, 
      {
        "copyOnly": true,
        "accept": "",
        "selfAccept": false,
        "creator": dojo.hitch(this, this._dndItemCreator)
      });
    dojo.addClass(this.containerNode, "container");

    dojo.forEach(categories, function(category, idx) {
      if (dojo.indexOf(addedCategories, category.id) != -1) {
        return;
      }
      addedCategories.push(category.id);
      // create div for category
      var categoryDiv = dojo.create("div",
        {
          "id": category.id
        }, this.containerNode);

      // create +- expand/collapse indicator
      var categoryIndicator = dojo.create("img",
        {
          "id": category.id + "-indicator",
          "src": "images/minus.gif",
          "class": "categoryIndicator",
          "categoryId": category.id
        }, categoryDiv);
      this.connectHandles.push(dojo.connect(categoryIndicator, 'onclick', this, this.expandCollapseCategory));

      // create span for categoryName to display text
      var categoryNameSpan = dojo.create("span",
        {
          "id": category.id + "-span",
          "class": "category",
          "innerHTML": category.name,
          "categoryId": category.id
        }, categoryDiv);
      this.textSelectionDisabler(categoryNameSpan);
      this.connectHandles.push(dojo.connect(categoryNameSpan, 'ondblclick', this, this.expandCollapseCategory));

      // create DND field list for this category
      var categoryFieldsDiv = dojo.create("div",
        {
          "id": category.id + "-fields"
        }, categoryDiv);

      var items = [];
      var fields = this.getSortedFields(datasource, category);
      dojo.forEach(fields, function(field) {
        items.push(
          {
            "categoryId": category.id,
            "displayName": field.name,
            "fieldId": field.id,
            "type": ["field"]
          });
      }, this);
      this.dndObj.insertNodes(false, items, false, categoryFieldsDiv);
    }, this);
  },

  _dndItemCreator: function(item, hint) {
    var div = dojo.create("div",
      {
        "id": "field-" + item.fieldId,
        "innerHTML": item.displayName,
        "fieldId": item.fieldId,
        "title": item.fieldId,
        "class": item.categoryId
      });
    if (hint === "avatar") {
      dojo.addClass(div, "dndAvatar");
    } else {
      dojo.addClass(div, "field");
      // Wire up interaction
      this.connectHandles.push(dojo.connect(div, "oncontextmenu", this, function(event) {
        this.updateSelectionForContextMenu(item.fieldId);
        this.fieldContextMenuCallback(event);
      }));
      this.connectHandles.push(dojo.connect(div, 'ondblclick', this, function(event) {
        this.addFieldCallback(item.fieldId);
      }));
    }
    return {node: div, data: item, type: ["field"]};
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

  getSortedCategories: function(datasource) {
    var categories = [];
    dojo.forEach(datasource.getAllElements(), function(element) {
      if (element.elementType == pentaho.pda.Column.ELEMENT_TYPES.CATEGORY && categories[element] == null) {
        categories.push(element);
      }
    });
    categories.sort(this._elementComparator);
    return categories;
  },

  getSortedFields: function(datasource, category) {
    var fields = [];
    var elements = datasource.getAllElements();   
    dojo.forEach(datasource.getAllElements(), function(element) {
      if (element.isQueryElement && element.parent == category && fields[element] == null) {
        fields.push(element);
      }
    });
    fields.sort(this._elementComparator); 
    return fields;
  },

  expandCollapseCategory: function (eventElement) {
    var categoryId = dojo.attr(eventElement.target, "categoryId");
    var node = dojo.byId(categoryId + "-fields");
    var indicatorNode = dojo.byId(categoryId + "-indicator");
    var collapsed = dojo.attr(indicatorNode, "collapsed") != "true";
    if (collapsed) {
      indicatorNode.src="images/plus.gif";
    } else {
      indicatorNode.src="images/minus.gif";
    }
    dojo.attr(indicatorNode, "collapsed", "" + collapsed);

    var fields = dojo.query("." + categoryId, this.containerNode);
    if (collapsed) {
      fields.addClass("hidden")
    } else {
      fields.removeClass("hidden");
    }
  },

  updateFilterIndicators: function(filters) {
    // Remove all filter indicators
    dojo.query(".field", this.containerNode).removeClass("filteredField");
    // Add filter icons to fields that are filtered
    if (!filters) {
      return;
    }
    // For all active filters add the fieldFiltered class to the field list div for the column that's filtered
    dojo.forEach(filters, function(filter) {
      var fieldDiv = dojo.byId("field-" + filter.column);
      dojo.addClass(fieldDiv, "filteredField");
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
    var node = dojo.byId(id);
    if (!selected) {
      this.clearSelection();
      // Logic borrowed from dojo.dnd.Selector.selectAll
      this.dndObj._addItemClass(node, "Selected")
      this.dndObj.selection[id] = 1;
    }
    // Update anchor
    if (this.dndObj.anchor) {
      this.dndObj._addItemClass(this.dndObj.anchor, "Selected");
    }
    this.dndObj._removeAnchor();
    this.dndObj._addItemClass(node, "Anchor");
    this.dndObj.anchor = node;
  },

  getSelectedItems: function() {
    if (this.dndObj) {
      var items = [];
      this.dndObj.forInSelectedItems(function(item) {
        items.push(item);
      });
      return items;
    }
  },

  clearSelection: function() {
    if (this.dndObj) {
      this.dndObj.selectNone();
    }
  }
});