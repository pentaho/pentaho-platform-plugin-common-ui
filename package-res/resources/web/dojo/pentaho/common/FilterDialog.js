dojo.provide("pentaho.common.FilterDialog");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("pentaho.common.Calendar");
dojo.require("pentaho.common.DateTextBox");
dojo.require('pentaho.common.Dialog');
dojo.require('pentaho.common.MessageBox');
dojo.declare(
    "pentaho.common.FilterDialog",
     [pentaho.common.Dialog],
{
  templatePath: dojo.moduleUrl('pentaho.common', 'FilterDialog.html'),
  widgetsInTemplate: true,
  filterType: "PICKLIST",
  currentFilter: null,
  hasCloseIcon: true,
  // Function for retrieving localized strings

  buttons: ['Ok_txt','Cancel_txt'],

  // Row limit for search list queries
  searchListLimit: 500,

  _reauthenticateCallback: null,

  _preSaveCallback: undefined,
  _onSuccessCallback: undefined,
  _onCancelCallback: undefined,

  errorDialog: undefined,

  // Default numeric format will strip out anything that's not a number or the default decimal separator (a period).
  // The easiest way to change this is to update setDecimalSeparator().
  _numericFormatRegex: /[^0-9.]/g,

  postMixInProperties: function() {
    this.inherited(arguments);
  },

  postCreate: function() {
    this.inherited(arguments);
    pentaho.common.Messages.addUrlBundle('pentaho.common',CONTEXT_PATH+'i18n?plugin=common-ui&name=resources/web/dojo/pentaho/common/nls/messages');
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

    this.errorDialog.setButtons([this.getLocaleString('Ok_txt')]);
    this.errorDialog.callbacks = [dojo.hitch(this, function() {
      this.errorDialog.hide();
    })];
  },

  _createNumericFormatRegex: function(pattern) {
    return new RegExp(pattern, 'g');
  },
  
  setDecimalSeparator: function(s) {
    this._numericFormatRegex = this._createNumericFormatRegex('[^0-9' + s + ']');
  },

  onCancel: function() {
    this.cancel();
  },

  _localize: function() {
    // TODO replace this with generic code refactored from pir-view.js
    this.inherited(arguments);
    var decSep = this.getLocaleString("filterDialogDecimalSeparator");
    if (decSep !== undefined && decSep !== "filterDialogDecimalSeparator") {
      this.setDecimalSeparator(decSep);
    }
    this.typePicklistSpan.innerHTML = this.getLocaleString("filterDialogTypePicklistSpan_content");
    this.typeMatchSpan.innerHTML = this.getLocaleString("filterDialogTypeMatchSpan_content");
    this.typeDateRangeSpan.innerHTML = this.getLocaleString("filterDialogTypeDateRangeSpan_content");
    this.picklistHeadingSpan.innerHTML = this.getLocaleString("filterDialogPicklistHeadingSpan_content");
    this.picklistFindButton.innerHTML = this.getLocaleString("filterDialogFindButton_content");
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
    
    if (this.currentColumn.dataType === pentaho.pda.Column.DATA_TYPES.STRING && (this.currentFilter.combinationType != pentaho.pda.Column.OPERATOR_TYPES.AND || (dojo.isArray(this.currentFilter.value) && this.currentFilter.value.length > 1))) {
      this.setFilterType("PICKLIST");
    } else {
      this.setFilterType("MATCH");
    }
    this._initParameterUI();
  },

  /**
   * Register a callback function for checking if the filter can be saved at all or not.
   * The function should accept the following parameters: 
   *   dialog: this filter dialog
   *   filter: the current filter being edited
   *   saveCallback: the function to call if this filter should be saved
   *
   * The reason this pre-save callback must call the saveCallback instead of returning a result is to allow for prompting of the user
   */
  registerPreSaveCallback: function(f) {
    this._preSaveCallback = f;
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
            opt.title = fields[idx].name;
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
        dojo.addClass(this.typePicklistContainer, "filterDialogHidden");
        dojo.addClass(this.typeMatchContainer, "filterDialogHidden");
        dojo.addClass(this.typeDateRangeContainer, "filterDialogHidden");
        break;
      default:
        this.showErrorDialog(this.getLocaleString('filterDialogUnknownDataType') + dataType);
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
        console.log("Unknown filter type: " + type);
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
    if (this._preSaveCallback) {
      this._preSaveCallback.call(this, this, this.currentFilter, this._save.bind(this));
    } else {
      this._save();
    }
  },

  // Internal save function to be called by a preSaveCallback if it exists
  _save: function() {
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
        console.log("Unknown filter type: " + type);
        return;
    }

    this._scrubFilterValues(this.currentFilter);

    var parameterName = this.getParameterName();
    if (parameterName) {
        this.currentFilter.parameterName = parameterName;
      } else {
        this.currentFilter.parameterName = null;
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

  getParameterName: function() {
    var parameterName = this.parameterNameInput.get("value");
    if (parameterName) {
      parameterName = dojo.trim(parameterName).replace(/[^a-zA-Z0-9 ]/g, "");
    }
    return parameterName.length > 0 ? parameterName : undefined;
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
        var opt =  new Option(value, value);
        opt.title = value;
        this.containerNode.options[idx++] = opt;
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
      this.containerNode.options[idx] = new Option(result, result);
      this.containerNode.options[idx].title = result;
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
      this.showErrorDialog(this.getLocaleString('filterDialogMissingValueError_title'), this.getLocaleString('filterDialogMissingValueError_message'));
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
    switch(this.currentColumn.dataType) {
      case pentaho.pda.Column.DATA_TYPES.DATE:
        this.matchValueInputDate.setValue(dojo.date.stamp.fromISOString(value));
        dojo.removeClass(this.matchValueInputDate.domNode, "filterDialogHidden");
        dojo.addClass(this.matchValueInput, "filterDialogHidden");
        break;
      case pentaho.pda.Column.DATA_TYPES.NUMERIC:
        var value = "";
        dojo.forEach(this.currentFilter.value, function(val) {
          if (val.length > 0) {
            if (value.length > 0) {
              value += "|";
            }
            value += val;
          }
        });
        this.matchValueInput.value = value;
        dojo.removeClass(this.matchValueInput, "filterDialogHidden");
        dojo.addClass(this.matchValueInputDate.domNode, "filterDialogHidden");
        break;
      default:
        this.matchValueInput.value = value == null ? "" : value;
        dojo.removeClass(this.matchValueInput, "filterDialogHidden");
        dojo.addClass(this.matchValueInputDate.domNode, "filterDialogHidden");
        break;
    }

    dojo.empty(this.matchAggType);
    dojo.forEach(this.currentColumn.availableAggregations, function(aggType, idx) {
      this.options[idx] = new Option(pentaho.pda.Column.AGG_TYPES_STRINGS[aggType], aggType);
      this.options[idx].title = aggType;
    }, this.matchAggType);
    if (this.currentFilter.selectedAggType) {
      this.matchAggType.value = this.currentFilter.selectedAggType;
    }

    dojo.empty(this.matchComparator);
    var dataType = this.currentColumn.dataType === pentaho.pda.Column.DATA_TYPES.UNKNOWN ? pentaho.pda.Column.DATA_TYPES.STRING : this.currentColumn.dataType;
    dojo.forEach(pentaho.pda.Column.COMPARATOR[dataType], function(cArray, idx) {
      this.options[idx] = new Option(cArray[0], cArray[1]);
      this.options[idx].title = cArray[0];
    }, this.matchComparator);
    this.matchComparator.value = this.currentFilter.operator;
    this._matchComparatorChanged();
  },

  _saveMatchContainer: function() {
    this.currentFilter.operator = this.matchComparator.value;
    this.currentFilter.selectedAggType = this.matchAggType.value;
    this.currentFilter.combinationType = pentaho.pda.Column.OPERATOR_TYPES.AND;
    if (!this._matchOperatorRequiresValue()) {
      this.currentFilter.value = [""];
    } else {
      switch(this.currentColumn.dataType) {
        case pentaho.pda.Column.DATA_TYPES.DATE:
          var date = this.matchValueInputDate.getValue();
          if (date == null) {
            this.currentFilter.value = [""];
          } else {
            // Convert date into format metadata is expecting for dates (ISO8601/RFC3339)
            this.currentFilter.value = [dojo.date.stamp.toISOString(date, {selector: 'date'})];
          }
          break;
        case pentaho.pda.Column.DATA_TYPES.NUMERIC:
          if(this.currentFilter.operator === pentaho.pda.Column.CONDITION_TYPES.EQUAL) {
            var value = [];
            dojo.forEach(this.matchValueInput.value.split("|"), function(val) {
              var v = this._scrubNumericValue(val);
              if (v && v !== "") {
                value.push(v);
              }
            }, this);
            this.currentFilter.value = value;
          } else {
            if (this.matchValueInput.value.indexOf("|") > 0) {
              this.showErrorDialog(this.getLocaleString('filterDialogMissingValueError_title'), this.getLocaleString('filterDialogInvalidNumericError_message'));
              return false;
            }
            this.currentFilter.value = [this._scrubNumericValue(this.matchValueInput.value)];
          }
          break;
        default:
          this.currentFilter.value = [this.matchValueInput.value];
          break;
      }
      var hasValue = false;
      dojo.some(this.currentFilter.value, function(val) {
        if (val !== "") {
          hasValue = true;
          return false;
        }
      });
      if (!hasValue) {
        this.showErrorDialog(this.getLocaleString('filterDialogMissingValueError_title'), this.getLocaleString('filterDialogMissingValueError_message'));
        return false;
      }
    }
    return true;
  },

  _scrubNumericValue: function(val) {
    // TODO i18n the thousands and decimal characters
    var sign = (val < 0) ? '-' : ''; // PIR-856 retain numeric sign
    return sign + dojo.trim(val).replace(this._numericFormatRegex, "");
  },

  /*
   * Remove quotes from the filter's value until MQL editor properly supports parsing values with quotes.
   */
  _scrubFilterValues: function(filter) {
    filter.value = dojo.map(filter.value, function(value) {
      return value.replace(/["]/g,'');
    });
  },

  // DATERANGE IMPL
  _configureDateRangeContainer: function() {
    this.dateRangeFieldName.innerHTML = this.currentColumn.name;

    this.dateRangeValueInputDate1.value = dojo.date.stamp.fromISOString(this.currentFilter.value);
    this.dateRangeValueInputDate2.value = null;
  },
  _dateRangeComparatorChanged: function() {
    console.log("_dateRangeComparatorChanged() Not yet implemented");
  },
  
  /**
   * Build the textual representation of a filter for display on the Filter Panel.
   * @param filter
   * @param prompt Is this filter controlled by a prompt? If so the value portion of the filter text will indicate it is controlled by that prompt.
   */
  buildFilterText: function(filter, prompt) {
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

    var aggregation = ' ';
    if (filter.selectedAggType) {
      aggregation = ' (' + pentaho.pda.Column.AGG_TYPES_STRINGS[filter.selectedAggType] + ') ';
    }

    if (prompt) {
      values = this.getLocaleString('FilterTextValueFromPrompt', filter.parameterName);
    } else {
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
    }
    return column.name + aggregation + friendlyOperator + " " + values;
  },

  showErrorDialog: function(message) {
    showErrorDialog(this.getLocaleString('ErrorDialog_title'), message);
  },

  showErrorDialog: function(title, message) {
    this.errorDialog.setTitle(title);
    this.errorDialog.setMessage(message);
    this.errorDialog.show();
  }
});