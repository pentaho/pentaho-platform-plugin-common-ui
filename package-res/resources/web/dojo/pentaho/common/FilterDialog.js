dojo.provide("pentaho.common.FilterDialog");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.DateTextBox");
dojo.require('pentaho.common.Dialog');

dojo.declare(
    "pentaho.common.FilterDialog",
     [pentaho.common.Dialog],
{
  templatePath: new dojo.moduleUrl('pentaho.common', 'FilterDialog.html'),
  widgetsInTemplate: true,
  filterType: "PICKLIST",
  currentFilter: null,
  hasCloseIcon: true,
  // Function for retrieving localized strings

  buttons: ['Ok_txt','Cancel_txt'],

  // Row limit for search list queries
  searchListLimit: 500,

  _reauthenticateCallback: null,

  _onSuccessCallback: undefined,
  _onCancelCallback: undefined,

  postMixInProperties: function() {
    this.inherited(arguments);
  },

  postCreate: function() {
    this.inherited(arguments);
    Messages.addBundle('pentaho.common','messages');
    // Capture all attempts to close the dialog and redirect them
    dojo.connect(this.typePicklistCombinationTypeLinksIncludeLink, "onclick", this, function() {
      this._setPicklistCombinationTypeLink(pentaho.pda.Column.OPERATOR_TYPES.AND);
    });
    dojo.connect(this.typePicklistCombinationTypeLinksExcludeLink, "onclick", this, function() {
      this._setPicklistCombinationTypeLink(pentaho.pda.Column.OPERATOR_TYPES.AND_NOT);
    });
    
    dojo.attr(this.picklistCombinationTypeIncludeOption, "value", pentaho.pda.Column.OPERATOR_TYPES.AND);
    dojo.attr(this.picklistCombinationTypeExcludeOption, "value", pentaho.pda.Column.OPERATOR_TYPES.AND_NOT);
    
    this.callbacks = [dojo.hitch(this, this.save), dojo.hitch(this, this.cancel)];
  },
  
  onCancel: function() {
    this.cancel();
  },

  _localize: function() {
    // TODO replace this with generic code refactored from pir-view.js
    this.inherited(arguments);
    this.typePicklistSpan.innerHTML = this.getLocaleString("filterDialogTypePicklistSpan_content");
    this.typeMatchSpan.innerHTML = this.getLocaleString("filterDialogTypeMatchSpan_content");
    this.typeDateRangeSpan.innerHTML = this.getLocaleString("filterDialogTypeDateRangeSpan_content");
    this.picklistHeadingSpan.innerHTML = this.getLocaleString("filterDialogPicklistHeadingSpan_content");
    this.picklistFindButton.containerNode.innerHTML = this.getLocaleString("filterDialogFindButton_content");
    this.picklistAddSelected.title = this.getLocaleString("filterDialogAddSelected_title");
    this.picklistRemoveSelected.title = this.getLocaleString("filterDialogRemoveSelected_title");
    this.picklistAddAll.title = this.getLocaleString("filterDialogAddAll_title");
    this.picklistRemoveAll.title = this.getLocaleString("filterDialogRemoveAll_title");
    this.parameterNameLabel.innerHTML = this.getLocaleString("filterDialogParameterName_content");
    this.typePicklistCombinationTypeLinksIncludeLink.innerHTML = this.getLocaleString("filterDialogTypePicklistCombinationTypeLinksIncludeLink_content");
    this.typePicklistCombinationTypeLinksExcludeLink.innerHTML = this.getLocaleString("filterDialogTypePicklistCombinationTypeLinksExcludeLink_content");
    this.picklistCombinationTypeIncludeOption.text = this.getLocaleString("filterDialogTypePicklistCombinationTypeIncluded_content");
    this.picklistCombinationTypeExcludeOption.text = this.getLocaleString("filterDialogTypePicklistCombinationTypeExcluded_content");
    this.picklistCombinationTypeSpan.innerHTML = this.getLocaleString("filterDialogTypePicklistCombinationType_label");
    this.matchFieldName.innerHTML = this.getLocaleString("filterDialogFieldName_content");
    this.dateRangeFieldName.innerHTML = this.getLocaleString("filterDialogFieldName_content");
    this.dateRangeBetweenSeparatorSpan.innerHTML = this.getLocaleString("dateRangeBetweenSeparatorSpan_content");
    this.fieldPicklistSpan.innerHTML = this.getLocaleString("filterDialogFieldPicklistSpan_content");
  },

  _filterTypeChanged: function(event) {
    this.setFilterType(event.target.value);
  },

  configureFor: function(filter) {
    this.currentFilter = filter;
    this.currentColumn = this.datasource.getColumnById(this.currentFilter.column);
    this.title = this.getLocaleString("FilterDialogTitle") + " " + this.currentColumn.name;
    this.picklistLoaded = false;

    this.configureFilterTypesFor(this.currentColumn.dataType);
    
    if (this.currentFilter.combinationType != pentaho.pda.Column.OPERATOR_TYPES.AND || (dojo.isArray(this.currentFilter.value) && this.currentFilter.value.length > 1)) {
      this.setFilterType("PICKLIST");
    } else {
      this.setFilterType("MATCH");
    }
    this._initParameterUI();
  },

  // Register a callback function for handling reauthentication which itself takes a callback function when authentication is successful
  registerReauthenticateCallback: function(f) {
    this._reauthenticateCallback = f;
  },

  /**
   * Function to call with filter when the user as saved a valid filter.
   * This should perform an logic required to actually save the filter.
   */
  registerOnSuccessCallback: function(f) {
    this._onSuccessCallback = f;
  },

  /**
   * Function to call when the user has canceled out of the filter dialog.
   * The function will be passed the filter that the dialog was canceled on.
   */
  registerOnCancelCallback: function(f) {
    this._onCancelCallback = f;
  },

  setDatasource: function(datasource) {
    this.datasource = datasource;
  },

  setSearchListLimit: function(limit) {
    this.searchListLimit = limit;
  },
  
  enableFieldSelection: function(enable) {
    if(enable) {
        dojo.removeClass(this.fieldPicklistContainer, "filterDialogHidden");
        this.configureFilterTypesFor(null);
        this.setFilterType(null);
        this.title = this.getLocaleString("FilterDialogTitle");
    } else {
        dojo.addClass(this.fieldPicklistContainer, "filterDialogHidden");
    }
  },
  
  setFieldList: function( fields ) {
        // populate the field list
        this.picklistFields.length = 0;
        this.fieldList = fields;
        var list = this.picklistFields;
        var opt = new Option( "" );
        list.options[0] = opt;
        for(var idx=0; idx<fields.length; idx++) {
            opt = new Option( fields[idx].name, fields[idx].id );
			list.options[list.length] = opt;
        }
  },
  
  _fieldChanged: function() {
    var idx = this.picklistFields.selectedIndex;
    var field = this.fieldList[idx-1];
    this.configureFilterTypesFor(null);
    this.setFilterType(null);

    var filter = {
        "column":field.id,
        "value":null,
        "combinationType":pentaho.pda.Column.OPERATOR_TYPES.AND,
        "operator":pentaho.pda.Column.CONDITION_TYPES.EQUAL
    }
    this.title = this.getLocaleString("FilterDialogTitle") + " " + field.name;
    this.setTitle(this.title);
    filter.value = [];
    this.configureFor(filter);
  },
  
  configureFilterTypesFor: function(dataType) {
    // Hide options not applicable for this data type
    switch (dataType) {
      case null:
        dojo.addClass(this.typePicklistContainer, "filterDialogHidden");
        dojo.addClass(this.typeMatchContainer, "filterDialogHidden");
        dojo.addClass(this.typeDateRangeContainer, "filterDialogHidden");
        break;
      case pentaho.pda.Column.DATA_TYPES.UNKNOWN:
      case pentaho.pda.Column.DATA_TYPES.STRING:
        dojo.removeClass(this.typePicklistContainer, "filterDialogHidden");
        dojo.removeClass(this.typeMatchContainer, "filterDialogHidden");
        dojo.addClass(this.typeDateRangeContainer, "filterDialogHidden");
        break;
      case pentaho.pda.Column.DATA_TYPES.NUMERIC:
      case pentaho.pda.Column.DATA_TYPES.DATE:
        dojo.addClass(this.typePicklistContainer, "filterDialogHidden");
        dojo.removeClass(this.typeMatchContainer, "filterDialogHidden");
        dojo.addClass(this.typeDateRangeContainer, "filterDialogHidden");
        break;
      case pentaho.pda.Column.DATA_TYPES.BOOLEAN:
        // TODO Add boolean data type filtering
      default:
        alert("Unknown data type for filter: " + dataType);
        dojo.addClass(this.typePicklistContainer, "filterDialogHidden");
        dojo.addClass(this.typeMatchContainer, "filterDialogHidden");
        dojo.addClass(this.typeDateRangeContainer, "filterDialogHidden");
    }
  },

  setFilterType: function(type) {
    switch (type) {
      case null:
        dojo.addClass(this.picklistContainer, "filterDialogHidden");
        dojo.addClass(this.matchContainer, "filterDialogHidden");
        dojo.addClass(this.dateRangeContainer, "filterDialogHidden");
        break;
      case "PICKLIST":
        dojo.attr(this.typePicklistInput, "checked", true);
        dojo.removeClass(this.picklistContainer, "filterDialogHidden");
        dojo.addClass(this.matchContainer, "filterDialogHidden");
        dojo.addClass(this.dateRangeContainer, "filterDialogHidden");
        this._configurePicklistContainer();
        break;
      case "MATCH":
        dojo.attr(this.typeMatchInput, "checked", true);
        dojo.addClass(this.picklistContainer, "filterDialogHidden");
        dojo.removeClass(this.matchContainer, "filterDialogHidden");
        dojo.addClass(this.dateRangeContainer, "filterDialogHidden");
        this._configureMatchContainer();
        break;
//      case "DATERANGE":
//        dojo.attr(this.typeDateInput, "checked", true);
//        dojo.addClass(this.picklistContainer, "filterDialogHidden");
//        dojo.addClass(this.matchContainer, "filterDialogHidden");
//        dojo.removeClass(this.dateRangeContainer, "filterDialogHidden");
//        this._configureDateRangeContainer();
//        break;
      default:
        alert("Unknown filter type: " + type);
        return;
    }
    this.filterType = type;
  },
  
  _initParameterUI: function() {
    // Find the parameter for this filter
    if (this.currentFilter.parameterName) {
      this.parameterNameInput.set("value", this.currentFilter.parameterName);
    } else {
      this.parameterNameInput.set("value", "");
    }
  },

  save: function() {
    switch (this.filterType) {
      case "PICKLIST":
        if (!this._savePicklistContainer()) {
          return false;
        }
        break;
      case "MATCH":
        if (!this._saveMatchContainer()) {
          return false;
        }
        break;
      default:
        alert("Unknown filter type: " + type);
        return;
    }

    var parameterName = this.parameterNameInput.get("value");
    if (parameterName) {
      parameterName = dojo.trim(parameterName).replace(/[^a-zA-Z]/g, "");
      if (parameterName.length > 0) {
        this.currentFilter.parameterName = parameterName;
      } else {
        this.currentFilter.parameterName = null;
      }
    }

    if (this._onSuccessCallback) {
      try {
        this._onSuccessCallback(this.currentFilter);
      } catch (e) {
        console.warn("Error in onSuccessCallback of Filter Dialog: " + e);
      }
    }
    this.hide();
    return true;
  },

  cancel: function() {
    if (this._onCancelCallback) {
      try {
        this._onCancelCallback(this.currentFilter);
      } catch (e) {
        console.warn("Error in onCancelCallback of Filter Dialog: " + e);
      }
    }
    this.hide();
  },

  // PICKLIST IMPL
  _configurePicklistContainer: function() {
    dojo.empty(this.picklistUsedValues.domNode);

    dojo.attr(this.picklistCombinationType, "value", this.currentFilter.combinationType);

    // Set the used values
    var values = dojo.isArray(this.currentFilter.value) ? this.currentFilter.value : [this.currentFilter.value];
    var idx = 0;
    dojo.forEach(values, function(value) {
      if (value != null) {
        this.containerNode.options[idx++] = new Option(value, value);
      }
    }, this.picklistUsedValues);

    // Load all values
    if (this.picklistLoaded != true) {
      this.picklistFindInput.set("value", "");
      this.filterPicklist("");
    }
  },

  _flagPicklistAvailableValuesLoading: function() {
    dojo.empty(this.picklistAvailableValues.domNode);
    var loadingMsg = this.getLocaleString("filterDialogPicklistLoadingMessage");
    this.picklistAvailableValues.containerNode.options[0] = new Option(loadingMsg, loadingMsg);
  },
  
  _updatePicklistAvailableValues: function(values) {
    dojo.empty(this.picklistAvailableValues.domNode);
    var sel = this.picklistAvailableValues.domNode;
    dojo.forEach(values, function (result, idx) {
      this.containerNode.options[idx] = new Option(result, result)
    }, this.picklistAvailableValues);
    this.picklistLoaded = true;
  },

  _picklistAddSelected: function() {
    dojo.forEach(this.picklistAvailableValues.getSelected(), function(option) {
      var found = false;
      // Check if we already have the value in the used list
      dojo.some(this.domNode.options, function(usedOption) {
        if (usedOption.value === option.value) {
          found = true;
          return true;
        }
      });
      if (!found) {
        this.containerNode.appendChild(dojo.clone(option));
      }
    }, this.picklistUsedValues);
  },

  _picklistRemoveSelected: function() {
    dojo.forEach(this.picklistUsedValues.getSelected(), function(option) {
      this.containerNode.removeChild(option);
    }, this.picklistUsedValues);
  },

  _picklistAddAll: function() {
    this._picklistRemoveAll();
    dojo.forEach(this.picklistAvailableValues.containerNode.options, function(option) {
      this.containerNode.appendChild(dojo.clone(option));
    }, this.picklistUsedValues);
  },

  _picklistRemoveAll: function() {
    dojo.empty(this.picklistUsedValues.domNode);
  },

  _savePicklistContainer: function() {
    var values = [];
    dojo.forEach(this.picklistUsedValues.domNode.options, function(option) {
      values.push(option.value);
    });
    if (values.length == 0) {
      alert("Please select a value");
      return false;
    }
    this.currentFilter.operator = pentaho.pda.Column.CONDITION_TYPES.EQUAL;
    this.currentFilter.value = values;
    this.currentFilter.combinationType = dojo.attr(this.picklistCombinationType, "value");
    return true;
  },
  
  _picklistFindKeyPressed: function(event) {
    if (event.keyCode === dojo.keys.ENTER) {
      this._filterPicklistByFindInput();
    }
  },

  _filterPicklistByFindInput: function() {
    var value = this.picklistFindInput.get("value");
    if (this.oldPicklistFindValue !== value) {
      this.filterPicklist(value);
      this.oldPicklistFindValue = value;
    }
  },

  filterPicklist: function(value) {
    this._flagPicklistAvailableValuesLoading();
    this.datasource.searchColumn(this.currentColumn, value, this.searchListLimit, dojo.hitch(this, function(values) {
      this._updatePicklistAvailableValues(values == null ? [] : values.resultset);
      if (values == null && this._reauthenticateCallback) {
        this._reauthenticateCallback(dojo.hitch(this, function() {
          this.filterPicklist(value);
        }));
      }
    }));
  },
  
  _setPicklistCombinationTypeLink: function(combinationType) {
    if (this.filterType != "PICKLIST") {
      this.setFilterType("PICKLIST");
    }
    dojo.attr(this.picklistCombinationType, "value", combinationType);
  },
  
  // MATCH IMPL
  _isDateType: function() {
    return this.currentColumn.dataType === pentaho.pda.Column.DATA_TYPES.DATE;
  },

  _matchComparatorChanged: function() {
    var node = this._isDateType() ? this.matchValueInputDate.domNode : this.matchValueInput;
    if (this._matchOperatorRequiresValue()) {
      dojo.removeClass(node, "filterDialogHidden");
    } else {
      dojo.addClass(node, "filterDialogHidden");
    }
  },

  _matchOperatorRequiresValue: function() {
    return pentaho.pda.Column.SINGLE_COMPARATORS[this.matchComparator.value] == undefined;
  },

  _configureMatchContainer: function() {
    this.matchFieldName.innerHTML = this.currentColumn.name;
    var value = dojo.isArray(this.currentFilter.value) ? this.currentFilter.value[0] : null;
    if (this._isDateType()) {
      this.matchValueInputDate.setValue(dojo.date.stamp.fromISOString(value));
      dojo.removeClass(this.matchValueInputDate.domNode, "filterDialogHidden");
      dojo.addClass(this.matchValueInput, "filterDialogHidden");
    } else {
      this.matchValueInput.value = value == null ? "" : value;
      dojo.removeClass(this.matchValueInput, "filterDialogHidden");
      dojo.addClass(this.matchValueInputDate.domNode, "filterDialogHidden");
    }
    dojo.empty(this.matchComparator);
    var dataType = this.currentColumn.dataType === pentaho.pda.Column.DATA_TYPES.UNKNOWN ? pentaho.pda.Column.DATA_TYPES.STRING : this.currentColumn.dataType;
    dojo.forEach(pentaho.pda.Column.COMPARATOR[dataType], function(cArray, idx) {
      this.options[idx] = new Option(cArray[0], cArray[1]);
    }, this.matchComparator);
    this.matchComparator.value = this.currentFilter.operator;
    this._matchComparatorChanged();
  },

  _saveMatchContainer: function() {
    this.currentFilter.operator = this.matchComparator.value;
    this.currentFilter.combinationType = pentaho.pda.Column.OPERATOR_TYPES.AND;
    if (!this._matchOperatorRequiresValue()) {
      this.currentFilter.value = [""];
    } else {
      if (this._isDateType()) {
        var date = this.matchValueInputDate.getValue();
        if (date == null) {
          this.currentFilter.value = "";
        } else {
          // Convert date into format metadata is expecting for dates (ISO8601/RFC3339)
          this.currentFilter.value = dojo.date.stamp.toISOString(date, {selector: 'date'});
        }
      } else {
        this.currentFilter.value = this.matchValueInput.value;
//        if (typeof this.currentFilter.value === "string") {
//          this.currentFilter.value = dojo.string.trim(this.currentFilter.value);
//        }
      }
      if (this.currentFilter.value == "") {
        alert("Please enter a value");
        return false;
      }
      this.currentFilter.value = [this.currentFilter.value];
    }
    return true;
  },

  // DATERANGE IMPL
  _configureDateRangeContainer: function() {
    this.dateRangeFieldName.innerHTML = this.currentColumn.name;

    this.dateRangeValueInputDate1.value = dojo.date.stamp.fromISOString(this.currentFilter.value);
    this.dateRangeValueInputDate2.value = null;
  },
  _dateRangeComparatorChanged: function() {
    alert("_dateRangeComparatorChanged() Not yet implemented");
  },
  
  /**
   * Build the textual representation of a filter for display on the Filter Panel.
   * @param filter
   */
  buildFilterText: function(filter) {
    var column = this.datasource.getColumnById(filter.column);
    var friendlyOperator = filter.operator;
    if (filter.combinationType != pentaho.pda.Column.OPERATOR_TYPES.AND || (filter.operator == pentaho.pda.Column.CONDITION_TYPES.EQUAL && dojo.isArray(filter.value) && filter.value.length > 1)) {
      switch (filter.combinationType) {
        case pentaho.pda.Column.OPERATOR_TYPES.AND:
          friendlyOperator = this.getLocaleString("FilterCombinationTypeIn");
          break;
        case pentaho.pda.Column.OPERATOR_TYPES.AND_NOT:
          friendlyOperator = this.getLocaleString("FilterCombinationTypeNotIn");
          break;
        default:
          console.log("Unknown filter combination type for IN condition type: " + filter.combinationType);
      }
    } else {
      // Treat pentaho.pda.Column.DATA_TYPES.UNKNOWN as pentaho.pda.Column.DATA_TYPES.STRING
      var dataType = column.dataType == pentaho.pda.Column.DATA_TYPES.UNKNOWN ? pentaho.pda.Column.DATA_TYPES.STRING : column.dataType;
      var comparatorMapping = pentaho.pda.Column.COMPARATOR[dataType];
      if (comparatorMapping) {
        dojo.some(comparatorMapping, function(cArray) {
          if (cArray[1] === filter.operator) {
            friendlyOperator = cArray[0];
            return true;
          }
        });
      }
    }
    var values = "";
    if (filter.value != undefined) {
      if (filter.value.length > 10) {
        values = filter.value.length + " values";
      } else {
        dojo.forEach(filter.value, function(value) {
          if (values.length > 0) {
            values += ", ";
          }
          values += dojox.html.entities.encode(value);
        }, this);
      }
    }
    return column.name + " " + friendlyOperator + " " + values;
  }
});