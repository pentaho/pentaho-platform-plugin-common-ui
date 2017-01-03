/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
define(["dojo/_base/declare", "dijit/form/Select", "dijit/form/ValidationTextBox", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Templated", "dojo/on", "dojo/keys", "dojo/_base/lang", "dojo/query",
      "dijit/focus", "dojo/dom-class", "dojo/text!pentaho/common/RowLimitControl.html"],
    function (declare, select, TextBox, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Templated, on, keys, lang, query, focusUtil, domClass, templateStr) {

      return declare("pentaho.common.RowLimitControl", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {


            _callback: undefined,
            _systemRowLimit: undefined,
            _reportRowLimit: undefined,
            _selectedRowLimit: undefined,
            _previousRowLimit: undefined,
            _isRowLimitReached: false,
            _initialized: false,
            _getMessage: undefined,
            _getDialog: undefined,
            _showGlassPane: undefined,
            _hideGlassPane: undefined,
            _getLocaleString: undefined,
            // BACKLOG-11517
            _maxRowLimit: 2000000000,

            templateString: templateStr,
            widgetsInTemplate: true,


            apply: function (systemRowLimit, reportRowLimit, isRowLimitReached) {
              if (!this._isRowLimitReached === isRowLimitReached) {
                this._isRowLimitReached = isRowLimitReached;
                this._refreshMessage();
              }
              this._init(reportRowLimit, systemRowLimit);
            },

            postCreate: function () {
              this.inherited(arguments);
              on(this.rowLimitRestrictions, 'change', lang.hitch(this, '_onSelect'));
              on(this.rowsNumberInput, 'keydown, focusout', lang.hitch(this, '_onRowLimitSubmit'));
            },

            registerLocalizationLookup: function (f) {
              this._getLocaleString = f;
              this._localize();
            },

            bindChange: function (f) {
              this._callback = f;
            },

            bindGetMessage: function (f) {
              this._getMessage = f;
            },

            bindGetDialog: function (f) {
              this._getDialog = f;
            },

            bindShowGlassPane: function (f) {
              this._showGlassPane = f;
            },

            bindHideGlassPane: function (f) {
              this._hideGlassPane = f;
            },


            setRowLimit: function (rowLimit) {
              this._previousRowLimit = this._getRowLimit();
              this.rowsNumberInput.set("value", rowLimit > 0  ? rowLimit : '');
            },

            setRowLimitRestrictions: function (rowLimitRestrictionsValue, fireEvent) {
              this.rowLimitRestrictions.set("value", rowLimitRestrictionsValue, fireEvent === true);
            },

            _init: function (reportRowLimit, systemRowLimit ) {
              if (!this._isInitialized()) {
                if (this._reportRowLimit === undefined) {
                  if (reportRowLimit > 0) {
                    this._reportRowLimit = reportRowLimit;
                  } else {
                    this._reportRowLimit = -1;
                  }
                }
                if (this._systemRowLimit === undefined) {
                  if (systemRowLimit > 0) {
                    this._systemRowLimit = systemRowLimit;
                  } else {
                    this._systemRowLimit = 0;
                  }
                }
                this._initialized = true;
                if (this._reportRowLimit > 0) {
                  if (this._systemRowLimit < this._reportRowLimit) {
                    this._selectedRowLimit = this._systemRowLimit;
                  } else {
                    this._selectedRowLimit = this._reportRowLimit;
                  }
                } else {
                  this._selectedRowLimit = this._systemRowLimit;
                  this.setRowLimitRestrictions('MAXIMUM');
                }
                this._initUI();
              }

            },

            _localize: function () {
              if(this._getLocaleString) {
                this.rowLimitLabel.innerHTML = this._getLocaleString("RowLimitLabel");
                this.rowLimitRestrictions.addOption({
                  label: this._getLocaleString("RowLimitNoMoreThanTitle"),
                  value: 'NO_MORE_THAN'
                });
                this.rowLimitRestrictions.addOption({
                  label: this._getLocaleString("RowLimitMaximumTitle"),
                  value: 'MAXIMUM'
                });
              }
            },

            _showSystemMessage: function () {
              if (this._isRowLimitReached) {
                this._getMessage && this._getMessage().systemLimitReached();
              }
            },

            _showMessage: function () {
              if (this._isRowLimitReached) {
                this._getMessage && this._getMessage().limitReached();
              }
            },

            _applySystem: function () {
              var applyReportLimit = this._reportRowLimit > 0 && (this._systemRowLimit <= 0 || this._reportRowLimit < this._systemRowLimit);
              this._setRowsNumberInputDisabled(true);
              this.setRowLimit(applyReportLimit ? this._reportRowLimit : this._systemRowLimit );
              this.setRowLimitRestrictions('MAXIMUM');
              if(!applyReportLimit){
                this._showSystemMessage();
              }
            },

            _applyUser: function () {
              this._setRowsNumberInputDisabled(false);
              this.setRowLimit(this._selectedRowLimit);
              this.setRowLimitRestrictions('NO_MORE_THAN');
              this._showMessage();
            },

            _initUI: function () {
              var me = this;
              if (!this._isInitialized()) {
                return;
              }
              this._getMessage && this._getMessage().hide();
              if (this._reportRowLimit > 0) {
                //No doubt - disable controls
                this._setRowLimitRestrictionDisabled(true);
                this._setRowsNumberInputDisabled(true);
                if (this._systemRowLimit > 0 && this._systemRowLimit < this._reportRowLimit) {
                  //Apply system limit
                  this.setRowLimit(this._systemRowLimit);
                  this.setRowLimitRestrictions('MAXIMUM');
                  this._showSystemMessage();
                } else {
                  //Apply report limit
                  this.setRowLimit(this._reportRowLimit);
                  this.setRowLimitRestrictions('MAXIMUM');
                  this._getMessage && this._getMessage().hide();
                }
              } else {
                this._setRowLimitRestrictionDisabled(false);

                if ((this._systemRowLimit <= 0 && this._selectedRowLimit > 0) || this._systemRowLimit > this._selectedRowLimit) {
                  //If we have nothing defined - go to the next clause. If only user - show it. If both - check and show the one which is smaller.
                  this._applyUser();
                  if (this._callback) {
                    this._callback(this._selectedRowLimit);
                  }
                } else if (this._systemRowLimit == this._selectedRowLimit) {
                  this.setRowLimit(this._selectedRowLimit);
                  this.rowLimitNumberLabel.innerHTML = this._systemRowLimit > 0 && this._systemRowLimit !== Infinity ? this._systemRowLimit : '';
                  if (this._getRowLimitRestrictions() === 'MAXIMUM') {
                    this._setRowsNumberInputDisabled(true);
                    this._showSystemMessage();
                  } else {
                    this._setRowsNumberInputDisabled(false);
                    this._showMessage();
                  }
                  if (this._callback) {
                    this._callback(this._selectedRowLimit);
                  }
                } else {
                  //User limit is greater than system - apply system
                  this._applySystem();
                  if (this._callback) {
                    this._callback(this._systemRowLimit);
                  }
                }

              }

              this.rowsNumberInput.validator = function (value, constraints) {
                if (value && (isNaN(value) || value < 1 || value > me._maxRowLimit)) {
                  this.set("invalidMessage", "<div class='customTooltip'>" + me._getLocaleString("MaximumRowLimitValueErrorMessage", me._maxRowLimit.toString()) +"</div>");
                  return false;
                }
                return true;
              }

            },

            _refreshMessage: function () {
              if (this._isInitialized()) {
                this._getMessage && this._getMessage().hide();
                if (this._getRowLimitRestrictions() === 'MAXIMUM') {
                  this._applySystem();
                } else if(this._reportRowLimit < 0){
                  this._applyUser();
                }
              }
            },

            _isInitialized: function () {
              return this._initialized;
            },

            _getRowLimit: function () {
              var value = this.rowsNumberInput.get('value');
              return value === '' ? '-1' : value ;
            },

            _getRowLimitRestrictions: function () {
              return this.rowLimitRestrictions.get('value');
            },

            _setRowsNumberInputDisabled: function (isDisabled) {
              this.rowsNumberInput.set('disabled', isDisabled);
              this.rowsNumberInput.set('readonly', isDisabled);
              if(isDisabled) {
                $(".rl_rowsNumberInput").hide();
                this.rowLimitNumberLabel.hidden = false;
              } else {
                $(".rl_rowsNumberInput").show();
                this.rowLimitNumberLabel.hidden = true;
              }
            },

            _setRowLimitRestrictionDisabled: function (isDisabled) {
              this.rowLimitRestrictions.set('disabled', isDisabled);
              this.rowLimitRestrictions.set('readonly', isDisabled);
            },

            _onSelect: function (event) {
              this._getMessage().hide()
              this._isRowLimitReached = false;
              if (event === 'MAXIMUM') {
                this._applySystem();
                if (this._callback) {
                  this._callback(this._systemRowLimit);
                }
              } else {
                this._applyUser();
                if (this._callback) {
                  this._callback(this._selectedRowLimit);
                }
              }
            },

            _onRowLimitSubmit: function (event) {
              if (typeof event != 'undefined' && event.keyCode === keys.ENTER) {
                focusUtil.curNode && focusUtil.curNode.blur();
                return;
              }

              if (typeof event != 'undefined' && (event.type === 'blur' || event.type === 'focusout')) {
                if (!this.rowsNumberInput.isValid() || this._getRowLimit() < 1) {
                  this.setRowLimit(this._selectedRowLimit);
                  return;
                }

                if (this._getRowLimit() > this._systemRowLimit && this._systemRowLimit > 0) {
                  var dialog = this._getDialog && this._getDialog();
                  if (dialog) {
                    var rowLimitExceededDialogCallbacks = [
                      lang.hitch(this, function (event) {
                        this._hideGlassPane && this._hideGlassPane();
                        this._onSelect('MAXIMUM');
                        dialog.hide();
                      })];
                    dialog.callbacks = rowLimitExceededDialogCallbacks;
                    dialog.setSystemRowLimit(this._systemRowLimit);
                    this._showGlassPane && this._showGlassPane();
                    dialog.showDialog();
                  }
                } else {
                  if (this._previousRowLimit == this._getRowLimit()) {
                    return;
                  }
                  this._previousRowLimit = this._selectedRowLimit;
                  this._selectedRowLimit = this._getRowLimit();
                  if (this._callback) {
                    this._callback(this._selectedRowLimit);
                  }
                }
              }

              // Allow: backspace, delete, tab, escape, enter and .
              if ($.inArray(event.keyCode, [46, 8, 9, 27, 13]) !== -1 ||
                  // Allow: Ctrl+A
                  (event.keyCode == 65 && event.ctrlKey === true) ||
                  // Allow: Ctrl+C
                  (event.keyCode == 67 && event.ctrlKey === true) ||
                  // Allow: Ctrl+X
                  (event.keyCode == 88 && event.ctrlKey === true) ||
                  // Allow: home, end, left, right
                  (event.keyCode >= 35 && event.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
              }
              // Ensure that it is a number and stop the keypress
              if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault();
              }
            }

          }
      );
    });
