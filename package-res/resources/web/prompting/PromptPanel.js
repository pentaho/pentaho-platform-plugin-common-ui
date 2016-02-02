/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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


/**
 * The Prompt Panel Class
 *
 * @name PromptPanel
 * @class
 * @property {String} guid The random generated id of the prompt panel
 * @property {ParameterDefinition} paramDefn The parameter definition fetched and parsed from the server
 * @property {Boolean} autoSubmit True if the prompt is in auto submit mode, false otherwise
 * @property {Dashboard} dashboard The dashboard object assigned to the prompt
 * @property {Boolean} parametersChanged True if the parameters have changed, False otherwise
 * @property {Object} onParameterChanged Collection of parameterNames and the callback called when that parameter is changed.
 * @property {Function} onBeforeRender Callback called if defined before any change is performed in the prompt components
 * @property {Function} onAfterRender Callback called if defined after any change is performed in the prompt components
 * @property {Function} onBeforeUpdate Callback called if defined before the prompt update cycle is called
 * @property {Function} onAfterUpdate Callback called if defined after the prompt update cycle is called
 * @property {Function} onStateChanged Callback called if defined after state variables have been changed on the prompt panel or parameter definition
 * @property {?Function} onSubmit Callback called when the submit function executes, null if no callback is registered.
 */
define(['cdf/lib/Base', 'cdf/Logger', 'dojo/number', 'dojo/i18n', 'common-ui/util/util', 'common-ui/util/GUIDHelper', './WidgetBuilder', 'cdf/Dashboard.Clean', './parameters/ParameterDefinitionDiffer', 'common-ui/jquery-clean'],
    function (Base, Logger, DojoNumber, i18n, Utils, GUIDHelper, WidgetBuilder, Dashboard, ParamDiff, $) {

      var _STATE_CONSTANTS = {
        readOnlyProperties: ["promptNeeded", "paginate", "totalPages", "showParameterUI", "allowAutoSubmit"],
        msgs: {
          notChangeReadonlyProp: function(readOnlyProperties) {
            return "Not possible to change the following read-only properties: " + readOnlyProperties + ".";
          },
          incorrectBooleanType: function(name, value) {
            return "Unexpected value '" + value + "' for '" + name + "'. Must be boolean type.";
          },
          notAllowedAutoSubmit: "Not possible to set 'autoSubmit'. It's limited by the 'allowAutoSubmit' flag.",
          incorrectNumberType: function(page) {
            return "Unexpected value '" + page + "' for 'page'. Must be a number type.";
          },
          paginationNotActivated: function(page) {
            return "Not possible to set page '" + page + "'. The pagination should be activated.";
          },
          incorrectPageValue: function(page, totalPages) {
            return "Not possible to set page '" + page + "'. The correct value should be between 0 and " + totalPages + ".";
          },
          incorrectStateObjType: "The input parameter 'state' is incorrect. It should be an object."
        }
      };

      /**
       * Creates a Widget calling the widget builder factory
       *
       * @name PromptPanel#_createWidget
       * @method
       * @param {Object} options with the properties to be added to the Widget
       * @param {String} type the type of the Widget to build
       * @returns {BaseComponent} A widget instance
       * @private
       */
      function _createWidget(options, type) {
        var newObj = $.extend(options, {
          promptPanel: this
        });
        return this.widgetBuilder.build(newObj, type);
      };

      /**
       * Creates a Widget for the Parameter
       *
       * @name PromptPanel#_createWidgetForParameter
       * @method
       * @param param {Parameter} The param to be created
       * @returns {Object} A widget for the given parameter
       * @private
       */
      function _createWidgetForParameter(param) {
        if (param.strict && param.values.length === 0) {
          // if the parameter is strict but we have no valid choices for it, it is impossible for the user to give it a
          // value, so we will hide this parameter it is highly likely that the parameter is driven by another parameter
          // which doesn't have a value yet, so eventually, we'll show this parameter.. we hope
          return null;
        }

        return _createWidget.call(this, {
          param: param
        });
      };

      /**
       * Creates a Widget for the Label
       *
       * @name PromptPanel#_createWidgetForLAbel
       * @method
       * @param {Parameter} param The param to be created
       * @returns {BaseComponent} A widget for the given parameter
       * @private
       */
      function _createWidgetForLabel(param) {
        return _createWidget.call(this, {
          param: param
        }, 'label');
      };

      /**
       * Creates a Widget for the Error Label
       *
       * @name PromptPanel#_createWidgetForErrorLabel
       * @method
       * @param {Parameter} param The param to be created
       * @param {String} e The error message
       * @returns {BaseComponent} A widget for the given parameter
       * @private
       */
      function _createWidgetForErrorLabel(param, e) {
        return _createWidget.call(this, {
          param: param,
          errorMessage: e
        }, 'error-label');
      };

      /**
       * Creates a Widget for the Parameter Panel
       *
       * @name PromptPanel#_createWidgetForParameterPanel
       * @method
       * @param {Parameter} param The param definition
       * @param {Array|BaseComponent} components The Array of components to add to the Group Panel
       * @returns {BaseComponent} The Widget for the Parameter Panel
       * @private
       */
      function _createWidgetForParameterPanel(param, components) {
        return _createWidget.call(this, {
          param: param,
          components: components
        }, 'parameter-panel');
      };

      /**
       * Creates a Widget for the Group Panel
       *
       * @name PromptPanel#_createWidgetForGroupPanel
       * @method
       * @param {ParameterGroup} group The group definition
       * @param {Array|BaseComponent} components The Array of components to add to the Group Panel
       * @returns {BaseComponent} The Widget for the Group Panel
       * @private
       */
      function _createWidgetForGroupPanel(group, components) {
        return _createWidget.call(this, {
          paramGroup: group,
          components: components
        }, 'group-panel');
      };

      /**
       * Creates a Widget for the Submit Panel
       *
       * @name PromptPanel#_createWidgetForSubmitPanel
       * @method
       * @returns {BaseComponent}
       * @private
       */
      function _createWidgetForSubmitPanel() {
        return _createWidget.call(this,{}, 'submit-panel');
      };

      /**
       * Creates a Widget for the Prompt Panel
       *
       * @name PromptPanel#_createWidgetForPromptPanel
       * @method
       * @returns {BaseComponent}
       * @private
       */
      function _createWidgetForPromptPanel() {
        return this.widgetBuilder.build(this, 'prompt-panel');
      };

      /**
       * @callback callback~cb
       * @param {BaseComponent} component The component
       */

      /**
       * Pre-order traversal of a component and its descendants.
       *
       * @name PromptPanel#_mapComponents
       * @method
       * @param {BaeComponent} component The component to iterate
       * @param {callback~cb} callback The callback to call on each component
       * @private
       */
      function _mapComponents(component, callback) {
        callback(component);
        if (component.components) {
          _mapComponentsList(component.components, callback);
        }
      };

      /**
       * Pre-order traversal of components given a list of root components.
       *
       * @name PromptPanel#_mapComponentsList
       * @method
       * @param {Array|BaseComponent} components The list of components to iterate
       * @param {callback~cb} callback The callback to call on each component
       */
      function _mapComponentsList(components, callback) {
        $.each(components, function(i, component) {
          _mapComponents(component, callback);
        });
      };

      /**
       * Gets a component by its parameter definition.
       *
       * @name _getComponentByParam
       * @method
       * @private
       * @param {ParameterDefinition} param
       * @param {bool} getPanel If true, retrieves the surrounding panel for the component
       *
       * @returns {BaseComponent|null} If no component is found, null will be returned
       */
      var _getComponentByParam = function(param, getPanel) {
        var parameterName = this.getParameterName(param);
        return _getComponentByParamName.call(this, parameterName, getPanel);
      };

      /**
       * Gets a component by its compile parameter name. Normally, it is a combination of the parameter name and the guid of the PromptPanel.
       *
       * @name _getComponentByParamName
       * @method
       * @private
       * @param {String} parameterName The compiled name of the prompt panel component
       * @param {bool} getPanel If true, retrieves the surrounding panel for the component
       *
       * @returns {BaseComponent|null} If no component is found, null will be returned
       */
      var _getComponentByParamName = function(parameterName, getPanel) {
        for (var i in this.dashboard.components) {
          var component = this.dashboard.components[i];
          if (component.parameter === parameterName) {
            var isPanel = component.type.search("Panel") > -1;
            if ((getPanel && isPanel) || (!getPanel && !isPanel)) {
              return component;
            }
          }
        }
        return null;
      };

      /**
       * Recursively adds the component and its children to the current dashboard
       *
       * @name _addComponent
       * @method
       * @private
       * @param {Array} component The parent component, which is added before its children
       */
      var _addComponent = function(component) {
        this.dashboard.addComponent(component);
        this.dashboard.updateComponent(component);

        for (var i in component.components) { // Loop through panel components
          _addComponent.call(this, component.components[i]);
        }
      };

      /**
       * Finds the specific submit component located on the parent panel component
       * @name _findSubmitComponent
       * @method
       * @private
       * @param {BaseComponent} panelComponent The parent panel component to search within for the submit component
       */
      var _findSubmitComponent = function(panelComponent) {
        var result = null;
        for (var i = 0; i < panelComponent.components.length; i++) {
          if (panelComponent.components[i].promptType == "submit"
            && panelComponent.components[i].type == "FlowPromptLayoutComponent") {
            result = panelComponent.components[i];
            break;
          }
        }
        return result;
      };

      /**
       * Finds error's components are located on the parent panel component
       * @name _findErrorComponents
       * @method
       * @private
       * @returns {Array} The array of error's components
       */
      var _findErrorComponents = function(panelComponent) {
        var result = [];
        if (panelComponent.components) {
          result = panelComponent.components.filter(function(item) {
            return item.promptType == "label" && item.type == "TextComponent" && item.isErrorIndicator;
          });
        }
        return result;
      };

      /**
       * Removes a component from parent panel
       * @name _removeChildComponent
       * @method
       * @private
       * @param {BaseComponent} parent The parent component that has array of child components
       * @param {BaseComponent} toRemoveComponent The child component that should be deleted
       */
      var _removeChildComponent = function(parent, toRemoveComponent) {
        var index = parent.components.indexOf(toRemoveComponent);
        if (index > -1) {
          parent.components.splice(index, 1);
        }
      };

      /**
       * Compares the parameter value to its stored value
       * @name _areParamsDifferent
       * @method
       * @private
       * @param {String|Date|Number} paramValue The stored parameter value
       * @param {String|Date|Number} paramSelectedValue The value of the selected parameter
       * @param {String} paramType The parameter type
       * @returns {bool} The result of comparison
       */
      var _areParamsDifferent = function(paramValue, paramSelectedValue, paramType) {
        if (paramValue && paramSelectedValue) {
          switch (paramType) {
            case "java.lang.String": // Used upper case to eliminate UPPER() post-process formula influence on the strings comparison
              return paramValue.toUpperCase() != paramSelectedValue.toUpperCase();
            case "java.sql.Date": // Set time to zero to eliminate its influence on the days comparison
              return (new Date(paramValue).setHours(0,0,0,0)) != (new Date(paramSelectedValue).setHours(0,0,0,0));
            default:
              return paramValue != paramSelectedValue;
          }
        }

        return paramValue != paramSelectedValue;
      };

      /**
       * Checks input state parameter to contain read only properties. If contains, it throws an exception.
       *
       * @name PromptPanel#_validateReadOnlyState
       * @method
       * @private
       * @param  {Object} state The set of properties
       * @throws {String}       Exception if input state parameter contains read only properties
       */
      var _validateReadOnlyState = function(state) {
        var cantModify = _STATE_CONSTANTS.readOnlyProperties.some(function(item) {
          return state.hasOwnProperty(item);
        });
        if (cantModify) {
          throw _STATE_CONSTANTS.msgs.notChangeReadonlyProp(_STATE_CONSTANTS.readOnlyProperties);
        }
      };

      /**
       * Checks input value as boolean type.
       *
       * @name PromptPanel#_validateBooleanState
       * @method
       * @private
       * @param  {String} name  The name of the state property
       * @param  {Object} value The value of the state property
       * @throws {String}       Exception if input value is not a boolean type
       */
      var _validateBooleanState = function(name, value) {
        if (value != null && typeof value !== "boolean") {
          throw _STATE_CONSTANTS.msgs.incorrectBooleanType(name, value);
        }
      };

      /**
       * Validates property 'autoSubmit'.
       *
       * @name PromptPanel#_validateAutoSubmit
       * @method
       * @private
       * @param  {Boolean} autoSubmit      The value of the 'autoSubmit' property
       * @param  {Boolean} allowAutoSubmit The whether auto-submit is allowed
       * @throws {String}                  Exception if type of 'autoSubmit' is incorrect or setting autoSubmit is not allowed
       */
      var _validateAutoSubmit = function(autoSubmit, allowAutoSubmit) {
        _validateBooleanState("autoSubmit", autoSubmit);
        if (autoSubmit != null && !allowAutoSubmit) {
          throw _STATE_CONSTANTS.msgs.notAllowedAutoSubmit;
        }
      };

      /**
       * Validates property 'page'.
       *
       * @name PromptPanel#_validateStatePage
       * @method
       * @private
       * @param {Number} page       The value of page
       * @param {Boolean} paginate  The whether pagination is active
       * @param {Number} totalPages The value of total pages
       * @throws {String}           Exception if type of 'page' is incorrect or pagination is not activated or 'page' has incorrect value
       */
      var _validateStatePage = function(page, paginate, totalPages) {
        if (page != null) {
          if (typeof page !== "number") {
            throw _STATE_CONSTANTS.msgs.incorrectNumberType(page);
          }
          if (!paginate) {
            throw _STATE_CONSTANTS.msgs.paginationNotActivated(page);
          }
          if (page < 0 || page >= totalPages) {
            throw _STATE_CONSTANTS.msgs.incorrectPageValue(page, totalPages - 1);
          }
        }
      };

      /**
       * Validates all state's properties.
       *
       * @name PromptPanel#_validateState
       * @method
       * @private
       * @param  {Object} state                  The set of properties
       * @param  {ParameterDefinition} paramDefn The parameter definition instance
       * @throws {String}                        Exception if input 'state' parameter is invalid
       */
      var _validateState = function(state, paramDefn) {
        if (!state || typeof state !== 'object') {
          throw _STATE_CONSTANTS.msgs.incorrectStateObjType;
        }
        _validateReadOnlyState(state);
        _validateBooleanState("parametersChanged", state.parametersChanged);
        _validateAutoSubmit(state.autoSubmit, paramDefn.allowAutoSubmit());
        _validateStatePage(state.page, paramDefn.paginate, paramDefn.totalPages);
      };

      var PromptPanel = Base.extend({

        guid: undefined,
        paramDefn: undefined,
        autoSubmit: undefined,

        dashboard: undefined,

        parametersChanged: false,
        onParameterChanged: null,
        onBeforeRender: null,
        onAfterRender: null,
        onBeforeUpdate: null,
        onAfterUpdate: null,
        onStateChanged: null,
        onSubmit: null,

        /**
         * Constructor for the PromptPanel
         * Override to the Base constructor
         *
         * @name PromptPanel#constructor
         * @method
         * @param {String} destinationId The html id to place the prompt
         * @param {ParameterDefinition} paramDefn The parameter definition assigned to the prompt
         */
        constructor: function (destinationId, paramDefn) {
          if (!destinationId) {
            throw 'destinationId is required';
          }

          /**
           * The html id destination where the prompt will be rendered
           *
           * @name PromptPanel#destinationId
           * @type String
           * @default undefined
           */
          this.destinationId = destinationId;

          this.setParamDefn(paramDefn);

          this.promptGUIDHelper = new GUIDHelper();

          this.guid = this.promptGUIDHelper.generateGUID();

          this.dashboard = new Dashboard();

          this.paramDiffer = new ParamDiff();

          this.widgetBuilder = WidgetBuilder;
        },

        /**
         * Returns the dashboard store on the prompt panel
         *
         * @return {Object}
         */
        getDashboard: function() {
          return this.dashboard;
        },

        /**
         * Returns the parameter definition if it has been set. Otherwise an exception is thrown.
         *
         * @returns {Object}
         */
        getParamDefn: function() {
          if (!this.paramDefn) {
            throw 'paramDefn is required. Call setParameterDefn';
          }

          return this.paramDefn;
        },

        /**
         * Sets the parameter definition for the prompt panel. Also sets whether the prompt panel has auto submit
         * @param paramDefn {Object} The parameter definition object
         */
        setParamDefn: function(paramDefn) {
          var prevParamDefn = this.paramDefn;
          this.paramDefn = paramDefn;

          var fireStateChanged = function(paramName, oldParamDefn, newParamDefn, getValueCallback) {
            if (this.onStateChanged == null) {
              return;
            }

            var oldVal = oldParamDefn ? getValueCallback(oldParamDefn) : undefined;
            var newVal = newParamDefn ? getValueCallback(newParamDefn) : undefined;

            if (oldVal != newVal) {
              this.onStateChanged(paramName, oldVal, newVal);
            }
          }.bind(this);

          if (paramDefn) {
            if(this.autoSubmit == undefined) {
              this.setAutoSubmit(paramDefn.allowAutoSubmit());
            }

            fireStateChanged("promptNeeded", prevParamDefn, this.paramDefn, function(paramDefn) { return paramDefn.promptNeeded; });
            fireStateChanged("paginate", prevParamDefn, this.paramDefn, function(paramDefn) { return paramDefn.paginate; });
            fireStateChanged("totalPages", prevParamDefn, this.paramDefn, function(paramDefn) { return paramDefn.totalPages; });
            fireStateChanged("showParameterUI", prevParamDefn, this.paramDefn, function(paramDefn) { return paramDefn.showParameterUI(); });
            fireStateChanged("allowAutoSubmit", prevParamDefn, this.paramDefn, function(paramDefn) { return paramDefn.allowAutoSubmit(); });
            fireStateChanged("page", prevParamDefn, this.paramDefn, function(paramDefn) { return paramDefn.page; });
          }
        },

        /**
         * Sets the autoSubmit property on the PromptPanel
         *
         * @param autoSubmit {Boolean} The autoSubmit boolean
         */
        setAutoSubmit: function(autoSubmit) {
          var prevVal = this.autoSubmit;
          this.autoSubmit = autoSubmit;

          if (this.onStateChanged != null && prevVal != this.autoSubmit) {
            this.onStateChanged("autoSubmit", prevVal, this.autoSubmit);
          }
        },

        /**
         * Get the current auto submit setting for this panel.
         *
         * @name PromptPanel#getAutoSubmitSetting
         * @method
         * @returns {Boolean}
         */
        getAutoSubmitSetting: function () {
          return this.autoSubmit;
        },

        /**
         * Get a localized string for this prompt panel.
         *
         * @name PromptPanel#getString
         * @method
         * @param {String} key The key
         * @param {String} defaultString The default value
         *
         * @returns {String} The localized string
         */
        getString: function (key, defaultString) {
          return defaultString || '!' + key + '!';
        },

        /**
         * Returns a parameter name unique to this parameter panel.
         *
         * @name PromptPanel#getParameterName
         * @method
         * @param {Parameter} parameter The parameter
         * @returns {String} The parameter name
         */
        getParameterName: function (parameter) {
          if (typeof parameter === 'string') {
            return this.guid + parameter;
          }
          return this.guid + parameter.name;
        },

        /**
         * Returns a map of parameter name value. This will extract the current parameter value from the dashboard
         * instance as necessary
         *
         * @name PromptPanel#getParameterValues
         * @method
         * @returns {Object} parameters The parameters name|value pair assigned to the dashboard instance
         */
        getParameterValues: function () {
          var params = {};
          this.getParamDefn().mapParameters(function (param) {
            var value = this.getParameterValue(this.getParameterName(param));
            if (value === '' || typeof value == 'undefined') {
              return;
            }
            if (param.multiSelect && !$.isArray(value)) {
              value = [value];
            }
            if (Utils.isNumberType(param.type)) {
              var localization = i18n.getLocalization("dojo.cldr", "number", SESSION_LOCALE.toLowerCase());
              var defaultLocalization = i18n.getLocalization("dojo.cldr", "number", null);
              var valueParsed;
              try {
                if (value.indexOf(localization ? localization.decimal : defaultLocalization.decimal) > 0) {
                  valueParsed = DojoNumber.parse(value, {
                    locale: SESSION_LOCALE.toLowerCase()
                  });
                  if (valueParsed.toString().indexOf(defaultLocalization.decimal) < 0) {
                    valueParsed = DojoNumber.format(valueParsed, {
                      places: value.length - value.indexOf(localization ? localization.decimal : defaultLocalization.decimal) - 1
                    });
                    defaultLocalization = i18n.getLocalization("dojo.cldr", "number", null);
                    valueParsed = valueParsed.split(defaultLocalization.group).join("");
                  }
                } else {
                  valueParsed = DojoNumber.parse(value, {locale: SESSION_LOCALE.toLowerCase()});
                }
              } catch (e) {
                valueParsed = value;
              }
            }
            params[param.name] = isNaN(valueParsed) ? value : valueParsed;
          }, this);
          return params;
        },

        /**
         * Generate a unique GUID for a widget of this panel.
         *
         * @name PromptPanel#generateWidgetGUID
         * @method
         * @returns {String} The join of the guid of the prompt with a new one generated by the GUIDHelper
         */
        generateWidgetGUID: function () {
          return this.guid + '-' + this.promptGUIDHelper.generateGUID();
        },

        /**
         * Sets the parameter value in Dashboards' parameter map to a properly initialized value.
         *
         * @name PromptPanel#_initializeParameterValue
         * @method
         * @param {ParameterDefinition} paramDefn The parameter definition map
         * @param {Parameter} param The parameter name
         * @private
         */
        _initializeParameterValue: function (paramDefn, param) {
          var value = param.getSelectedValuesValue();
          if (value.length === 0) {
            value = ''; // Dashboards' null value is an empty string
          } else if (value.length === 1) {
            value = value[0];
          }
          this.setParameterValue(param, value);
        },

        /**
         * Sets the parameter value in the dashboard instance parameter map
         *
         * @name PromptPanel#setParameterValue
         * @method
         * @param {Parameter} param The name of the parameter
         * @param {Object} value The value of the parameter
         */
        setParameterValue: function (param, value) {
          this.dashboard.setParameter(this.getParameterName(param), value);
        },

        /**
         * Gets the parameter value from the dashboard instance parameter map
         *
         * @name PromptPanel#getParameterValue
         * @method
         * @param {Parameter} param The parameter name
         * @returns {Object} The parameter value stored in the dashboard instance
         */
        getParameterValue: function (param) {
          if (typeof param !== 'string') {
            param = this.getParameterName(param);
          }

          return this.dashboard.getParameterValue(param);
        },

        /**
         * Called by the prompt-panel component when the CDE components have been updated.
         *
         * @name PromptPanel#_ready
         * @method
         * @private
         */
        _ready: function () {
          this.ready(this);
        },

        /**
         * Called when the prompt-panel component's submit button is clicked or auto-submit is enabled and a parameter
         * value changes.
         *
         * @name PromptPanel#_submit
         * @method
         * @param {Object}  [options]        Additional configuration options.
         * @param {Boolean} [options.isInit] Flag indicating if submit is being executed during initialization.
         * @private
         */
        _submit: function (options) {
          this.submit(this, options);
        },

        /**
         * Called when the prompt-panel component's submit button is pressed (mouse-down only).
         *
         * @name PromptPanel#_submitStart
         * @method
         * @private
         */
        _submitStart: function () {
          this.submitStart(this);
        },

        /**
         * Called by the prompt-panel component when the CDE components have been updated.
         *
         * @name PromptPanel#ready
         * @method
         * @param {PromptPanel} promptPanel
         */
        ready: function (promptPanel) {
        },

        /**
         * Called when the prompt-panel component's submit button is clicked or auto-submit is enabled and a parameter
         * value changes.
         *
         * @name PromptPanel#submit
         * @method
         * @param {PromptPanel} promptPanel  A prompt panel whose settings should be used for configuration purposes.
         * @param {Object}  [options]        Additional configuration options.
         * @param {Boolean} [options.isInit] Flag indicating if submit is being executed during initialization.
         */
        submit: function (promptPanel, options) {
          this.forceAutoSubmit = false;
          if (this.onSubmit) {
            if (typeof this.onSubmit === "function") {
              this.onSubmit(promptPanel, options);
            } else {
              Logger.warn("The onSubmit event callback is not a function");
            }
          }
        },

        /**
         * Called when the prompt-panel component's submit button is pressed (mouse-down only).
         *
         * @name PromptPanel#submitStart
         * @method
         * @param {PromptPanel} promptPanel
         */
        submitStart: function (promptPanel) {
        },

        /**
         * Called when a parameter value changes.
         *
         * The current implementation of  WidgetBuilder#build hooks
         * a method to the "postChange" CDF method of just built widgets
         * that have a "parameter".
         * This method calls its PromptPanel's "parameterChanged" method.
         *
         * @name PromptPanel#parameterChanged
         * @method
         * @param {Parameter} param
         * @param {String} name
         * @param {Object} value
         */
        parameterChanged: function (param, name, value) {
          if (this.onParameterChanged) {
            var paramCallback = this.onParameterChanged[name] ?
                  this.onParameterChanged[name] :
                  this.onParameterChanged[''];
            if (paramCallback) {
              if (typeof paramCallback === 'function') {
                paramCallback(name, value);
              } else {
                Logger.warn("The parameterChanged callback for '" + name + "' is not a function");
              }
            }
          }

          if (!value || value == "" || value == "null") {
            if (!this.nullValueParams) {
              this.nullValueParams = [];
            }

            this.nullValueParams.push(param);
          }

          this._setTimeoutRefreshPrompt();
          this.parametersChanged = true;

          if (this.onStateChanged != null) {
            this.onStateChanged("parametersChanged", false, this.parametersChanged);
          }
        },

         /**
         * Method called to sync the refresh of the prompt with the renderer calling a setTimeout 0
         *
         * @name PromptPanel#_setTimeoutRefreshPrompt
         * @method
         * @private
         *
         */
        _setTimeoutRefreshPrompt: function() {
          var myself = this;
          setTimeout(function() { myself.refreshPrompt() }, 0);
        },

        /**
         * This is called to refresh the prompt panel.
         * It should return a new parameter definition.
         * If it returns undefined no update will happen
         *
         * This method should be overridden.
         * The default implementation simply calls the provided callback with no parameter definition.
         *
         * @name PromptPanel#getParameterDefinition
         * @method
         * @param {PromptPanel} promptPanel the panel that needs a new parameter definition
         * @param {Function} callback function to call when the parameter definition has been fetched.
         *
         * The callback signature is: <pre>void function([newParamDef=undefined])</pre> and is called in the global context.
         */
        getParameterDefinition: function (promptPanel, callback) {
          callback();
        },

        /**
         * Called to refresh the prompt panel. This will invoke getParameterDefinition() to get a new parameter definition.
         * If the new parameter definition is undefined (default impl) no re-initialization will be done.
         *
         * @name PromptPanel#refreshPrompt
         * @param {Boolean} isForceRefresh The flag indicates ability to update all components regardless of the difference previos and new xml from server
         * @method
         */
        refreshPrompt: function (isForceRefresh) {
          try {
            this.isForceRefresh = isForceRefresh;
            this.getParameterDefinition(this, this.refresh.bind(this));
          } catch (e) {
            this.isForceRefresh = undefined;
            console.log(e);
            alert('Exception caught attempting to execute refreshCallback');
          }
        },

        /**
         * Refreshes the prompt panel with a given parameter definition.
         *
         * @name PromptPanel#refresh
         * @method
         * @param {ParameterDefinition} paramDefn the parameter definition used to refresh the prompt panel.
         * When unspecified, nothing is done.
         * @param {Boolean} noAutoAutoSubmit Prevents auto-submiting, even when auto-submit is false,
         * in the case the the parameter UI is not shown.
         */
        refresh: function (paramDefn, noAutoAutoSubmit) {
          var myself = this;
          // Should really throw an error? Or return?
          if (this.dashboard.waitingForInit && this.dashboard.waitingForInit.length) {
            Logger.warn("Overlapping refresh!");
            setTimeout(function () {
              myself.refresh(paramDefn, noAutoAutoSubmit);
            }, 0);
            return;
          }

          if (paramDefn) {
            this.diff = this.paramDiffer.diff(this.getParamDefn(), paramDefn, this.nullValueParams);
            this.isRefresh = true;
            this.setParamDefn(paramDefn);
            this.nullValueParams = null;

            if (this.dashboard.components) {
              // Create dictionary by parameter name, of topValue of multi-select listboxes, for restoring later, when possible.
              // But not for mobile, cause the UIs vary. Would need more time to check each.
              var topValuesByParam;
              if(!(/android|ipad|iphone/i).test(navigator.userAgent)) {
                topValuesByParam = this._multiListBoxTopValuesByParam = {};
              }

              var focusedParam;
              _mapComponentsList(this.dashboard.components, function(c) {
                if(!c.components && c.param && c.promptType === 'prompt') {
                  if(!focusedParam) {
                    var ph = c.placeholder();
                    if($(":focus", ph).length) {
                      focusedParam = c.param.name;
                    }
                  }

                  if(topValuesByParam && c.type === 'SelectMultiComponent') {
                    var topValue = c.topValue();
                    if(topValue != null) {
                      topValuesByParam['_' + c.param.name] = topValue;
                    }
                  }
                } else if(topValuesByParam && c.type === 'ScrollingPromptPanelLayoutComponent'){
                  // save last scroll position for prompt panel
                  var scrollTopElem = c.placeholder().children(".prompt-panel");
                  var scrollTopValue = scrollTopElem.scrollTop();
                  var scrollLeftElem = scrollTopElem.children(".parameter-wrapper");
                  var scrollLeftValue = scrollLeftElem.scrollLeft();
                  if(scrollTopValue != null && scrollLeftValue != null){
                    topValuesByParam['_' + c.name] = {
                      scrollTopValue : scrollTopValue,
                      scrollLeftValue : scrollLeftValue
                    };
                  }
                }
              });

              this._focusedParam = focusedParam;
            }

            this.init(noAutoAutoSubmit);
          }
        },

        /**
         * Removes a set of components determined by the ParameterDefinitionDiffer#diff
         *
         * @name PromptPanel#_removeComponentsByDiff
         * @method
         * @param {JSON} toRemoveDiff The group of paramters which need to be removed
         */
        _removeComponentsByDiff: function(toRemoveDiff) {
          var toRemove = [];
          for (var groupName in toRemoveDiff) {
            var removeWrap = toRemoveDiff[groupName];
            var params = removeWrap.params;

            for (var i = 0; i < params.length; i++) {
              var param = params[i];
              var component = _getComponentByParam.call(this, param, true); // get component panel by param
              if (component != null) {
                toRemove.push(component);

                // removes the component from the group panel and also removes the group panel if it's empty
                var groupPanel = this.dashboard.getComponentByName(groupName);
                if (groupPanel) {
                  _removeChildComponent.call(this, groupPanel, component);
                  if (groupPanel.components.length == 0) {
                    toRemove.push(groupPanel);
                  }
                }
              }
            }
          }

          // removes the submit panel if it's needed
          var panelComponent = this.dashboard.getComponentByName("prompt" + this.guid);
          if (panelComponent) {
            // we need to remove components from prompt panel component also
            for (var i in toRemove) {
              _removeChildComponent.call(this, panelComponent, toRemove[i]);
            }

            if (panelComponent.components.length == 1) {
              var submitPanel = _findSubmitComponent.call(this, panelComponent);
              if (submitPanel) {
                toRemove.push(submitPanel);
                _removeChildComponent.call(this, panelComponent, submitPanel);
              }
            }

            this.removeDashboardComponents(toRemove);

            // we need clear global panel if it's empty after removing child components
            if (panelComponent.components.length == 0) {
              panelComponent.clear();
            }
          }
        },

        /**
         * Adds a set of components determined by the ParameterDefinitionDiffer#diff
         *
         * @name PromptPanel#_addComponentsByDiff
         * @method
         * @param {JSON} toAddDiff The group of parameters which need to be added
         */
        _addComponentsByDiff: function(toAddDiff) {
          var panelComponent = this.dashboard.getComponentByName("prompt" + this.guid);

          for (var groupName in toAddDiff) {
            var addWrap = toAddDiff[groupName];
            var params = addWrap.params;

            var fieldComponents = [];
            for (var i = 0; i < params.length; i++) {
              var param = params[i];
              var component = this._buildPanelForParameter(param); // creates a panel component

              if (param.after) { // Find component panel to insert after
                component.after = _getComponentByParam.call(this, param.after, true);
              }

              fieldComponents.push(component);
            }

            // creates a new group panel if it's not present and adds the panel components to the group panel
            var groupPanel = this.dashboard.getComponentByName(groupName);
            if (!groupPanel) {
              groupPanel = _createWidgetForGroupPanel.call(this, addWrap.group, fieldComponents);
              panelComponent.components.push(groupPanel);
            } else {

              for (var j in fieldComponents) {
                var fieldComponent = fieldComponents[j];
                var insertAt = 0;
                if (fieldComponent.after) {
                  var insertAfter = groupPanel.components.indexOf(fieldComponent.after);
                  insertAt = insertAfter + 1;
                }
                groupPanel.components.splice(insertAt, 0, fieldComponent);
              }
            }
          }

          // creates a new submit panel if it's not present and adds the submit panel to the prompt panel
          if (panelComponent.components.length > 0 && !_findSubmitComponent.call(this, panelComponent)) {
            var submitPanel = _createWidgetForSubmitPanel.call(this);
            panelComponent.components.push(submitPanel);
          }

          _addComponent.call(this, panelComponent);
        },

        /**
         * Change error's components determined by the ParameterDefinitionDiffer#diff
         *
         * @name PromptPanel#_changeErrors
         * @method
         * @param {Parameter} param The parameter
         * @private
         */
        _changeErrors: function(param) {
          if (param.isErrorChanged) {
            var errors = this.getParamDefn().errors[param.name];
            var panel = _getComponentByParam.call(this, param, true);
            var existingErrors = _findErrorComponents.call(this, panel);

            // remove unused old errors components
            var toRemove = [];
            for (var errIndex in existingErrors) {
              var errComp = existingErrors[errIndex];
              var _isExistingErrComp = errors && errors.some(function(item) {
                return item == errComp.label;
              });
              if (!_isExistingErrComp) {
                for (var i in existingErrors) {
                  _removeChildComponent.call(this, panel, errComp);
                }
                toRemove.push(errComp);
              }
            }
            if (toRemove.length > 0) {
              this.removeDashboardComponents(toRemove);
            }

            // add new errors components
            if (errors) {
              for (var errIndex in errors) {
                var error = errors[errIndex];
                var isExist = existingErrors.some(function(item) {
                  return item.label == error;
                });
                if (!isExist) {
                  var errIndex = panel.components.length - 1;
                  var errorComponent = _createWidgetForErrorLabel.call(this, param, error);
                  this.dashboard.addComponent(errorComponent);
                  panel.components.splice(errIndex, 0, errorComponent);
                }
              }
            }

            // checks existing errors components to set correct css style
            var existingErrorComponents = _findErrorComponents.call(this, panel);
            if(existingErrorComponents.length > 0) {
              if (!panel.cssClass || (panel.cssClass && panel.cssClass.indexOf('error') == -1)) {
                panel.cssClass = (panel.cssClass || '') + ' error';
              }
            } else {
              panel.cssClass = (panel.cssClass || '').replace(' error', '');
              panel.removeErrorClass();
            }
          }
        },

        /**
         * Changes the data and selects the current value(s) of a set of components determined by the ParameterDefinitionDiffer#diff.
         *
         * @name PromptPanel#_changeComponentsByDiff
         * @method
         * @param {JSON} toChangeDiff The group of parameters which need to be have their data changed
         */
        _changeComponentsByDiff: function(toChangeDiff) {
          for (var groupName in toChangeDiff) {
            var changeWrap = toChangeDiff[groupName];
            var params = changeWrap.params;

            for (var i in params) {
              var param = params[i];

              var component = _getComponentByParam.call(this, param);
              if (component != null) {
                var updateNeeded = false;
                // also we should check and update errors components
                this._changeErrors(param);

                // Create new widget to get properly formatted values array
                var newValuesArray = this.widgetBuilder.build({
                  param: param,
                  promptPanel: this
                }, param.attributes["parameter-render-type"]).valuesArray;

                // Compare values array from param (which is formatted into valuesArray) with the current valuesArray
                // We need to update the components if autoSubmit is off
                var valArr;
                if ( component.valuesArray ) {
                  valArr = component.valuesArray.slice();
                  if ( "" == component.valuesArray[0][0] && "" == component.valuesArray[0][1] ) {
                    //no update needed if component.valuesArray equals newValuesArray except first empty(default) value
                    valArr = component.valuesArray.slice(1);
                  }
                }
                if (JSON.stringify(valArr) !== JSON.stringify(newValuesArray) || param.forceUpdate) {
                  // Find selected value in param values list and set it. This works, even if the data in valuesArray is different
                  this._initializeParameterValue(null, param);

                  // Set new values array
                  component.valuesArray = newValuesArray;
                  updateNeeded = true;
                }

                if (this.autoSubmit) {
                  this.forceSubmit = true;
                }

                var paramType = null;
                var paramSelectedValues = param.getSelectedValuesValue();
                if (paramSelectedValues.length == 1) {
                  paramSelectedValues = paramSelectedValues[0];
                  paramType = param.type;
                }

                if (!updateNeeded) {
                  var paramValue = this.dashboard.getParameterValue(component.parameter);
                  updateNeeded = _areParamsDifferent(paramValue, paramSelectedValues, paramType);
                }

                if (updateNeeded) {
                  var groupPanel = this.dashboard.getComponentByName(groupName);
                  _mapComponents(groupPanel, function (component) {
                    this.dashboard.updateComponent(component);
                  }.bind(this));
                }
              }
            }
          }
        },

        /**
         * Updates the dashboard and prompt panel based off of differences in the parameter definition
         *
         * @method update
         * @param {JSON} diff - contains the differences between the old and new parameter definitions produced by ParameterDefinitionDiffer.diff
         */
        update: function(diff) {
          var toRemove = Object.keys(diff.toRemove).length > 0,
              toAdd = Object.keys(diff.toAdd).length > 0,
              toChangeData = Object.keys(diff.toChangeData).length > 0;

          if ((toRemove || toAdd || toChangeData) && this.onBeforeRender) {
            this.onBeforeRender();
          }

          // Determine if there are params which need to be removed
          if (toRemove) {
            this._removeComponentsByDiff(diff.toRemove);
          }

          // Determine if there are params which need to be added
          if (toAdd) {
            this._addComponentsByDiff(diff.toAdd);
          }

          // Determine if there are params which need to be changed
          if (toChangeData) {
            this._changeComponentsByDiff(diff.toChangeData);
          }

          if ((toRemove || toAdd || toChangeData) && this.onAfterRender) {
            this.onAfterRender();
          }
        },

        /**
         * Initialize this prompt panel.
         * This will create the components and pass them to CDF to be loaded.
         *
         * @name PromptPanel#init
         * @method
         * @param {Boolean} noAutoAutoSubmit Prevents auto-submiting, even when auto-submit is false,
         * in the case the the parameter UI is not shown.
         */
        init: function (noAutoAutoSubmit) {
          if (this.onBeforeUpdate) {
            this.onBeforeUpdate();
          }

          var myself = this;
          var fireSubmit = true;

          var topValuesByParam = this._multiListBoxTopValuesByParam;
          if (topValuesByParam) {
            delete this._multiListBoxTopValuesByParam;
          }

          var focusedParam = this._focusedParam;
          if (focusedParam) {
            delete this._focusedParam;
          }

          var components = [];

          var updateComponent = (function (component) {
            components.push(component);

            // Don't fire the submit on load if we have a submit button.
            // It will take care of firing this itself (based on auto-submit)
            if (fireSubmit && component.promptType == 'submit') {
              fireSubmit = false;
            }

            if (!component.components && component.param && component.promptType === 'prompt') {
              var name = component.param.name;
              if (focusedParam && focusedParam === name) {
                focusedParam = null;
                component.autoFocus = true;
              }

              if (topValuesByParam && component.type === 'SelectMultiComponent') {
                var topValue = topValuesByParam['_' + name];
                if (topValue != null) {
                  component.autoTopValue = topValue;
                }
              }
            } else if (topValuesByParam && component.type === 'ScrollingPromptPanelLayoutComponent') {
              // save prompt pane reference and scroll value to dummy component
              var scrollValue = topValuesByParam['_' + component.name];
              if (scrollValue != null) {
                var setScroll = function() {
                  var scrollElem = $("#" + component.htmlObject).children(".prompt-panel");
                  scrollElem.scrollTop(scrollValue.scrollTopValue);
                  scrollElem.children(".parameter-wrapper").scrollLeft(scrollValue.scrollLeftValue);
                }

                // restore last scroll position for prompt panel
                if (!this.isRefresh) {
                  this.dashboard.postInit(function() {
                    if (scrollTopValue) {
                      setScroll();
                      scrollValue = undefined;
                    }
                  });
                } else {
                  setTimeout(function() {setScroll();}, 50);
                }
              }
            }
          }).bind(this);

          var paramDefn = this.getParamDefn();
          if (!this.isRefresh && paramDefn.showParameterUI()) { // First time init
            if (this.onBeforeRender) {
              this.onBeforeRender();
            }

            this.promptGUIDHelper.reset(); // Clear the widget helper for this prompt

            var layout = _createWidgetForPromptPanel.call(this);
            _mapComponents(layout, updateComponent);

            this.dashboard.addComponents(components);
            this.dashboard.init();

            if (this.onAfterRender) {
              this.onAfterRender();
            }
          } else if (this.diff) { // Perform update when there are differences
            this.update(this.diff);

            var layout = this.dashboard.getComponentByName("prompt" + this.guid);
            var updateCallback = (function(component) {
              if (this.isForceRefresh) {
                this.dashboard.updateComponent(component);
              }
              updateComponent(component);
            }).bind(this);
            _mapComponents(layout, updateCallback);
          } else { // Simple parameter value initialization
            paramDefn.mapParameters(function (param) {
              // initialize parameter values regardless of whether we're showing the parameter or not
              this._initializeParameterValue(paramDefn, param);
            }, this);

            // Must submit, independently of auto-submit value.
            // All parameters are initialized, fire the submit
            fireSubmit = !noAutoAutoSubmit;
          }

          if (this.forceSubmit || fireSubmit) {
            this.submit(this, {isInit: !this.isRefresh});
          }

          this.diff = null;
          this.isRefresh = null;
          this.forceSubmit = false;
          this.isForceRefresh = undefined;

          if (this.onAfterUpdate) {
            this.onAfterUpdate();
          }
        },

        /**
         * Hides this instance of PromptPanel
         *
         * @name PromptPanel#hide
         * @method
         */
        hide: function () {
          $('#' + this.destinationId).css('display', 'none');
        },

        /**
         * Creates a panel for a parameter
         * If no widget for the parameter is created this method returns null
         *
         * @name PromptPanel#_buildPanelForParameter
         * @method
         * @param {Parameter} param
         * @returns {BaseComponent} The panel parameter. It returns undefined if the panel is not created
         * @private
         */
        _buildPanelForParameter: function(param) {
          var panelComponents = [];
          var paramDefn = this.getParamDefn();

          // initialize parameter values regardless of whether we're showing the parameter or not
          this._initializeParameterValue(paramDefn, param);

          //add the label widget
          panelComponents.push(_createWidgetForLabel.call(this, param));

          //add the error widgets
          var errors = paramDefn.errors[param.name];
          if (errors) {
            $.each(errors, function (i, e) {
              panelComponents.push(_createWidgetForErrorLabel.call(this, param, e));
            }.bind(this));
          }

          //add the parameter widget
          var widget = _createWidgetForParameter.call(this, param);
          if (widget) {
            panelComponents.push(widget);
          } else { // No widget created. Do not create a label or parameter panel
            Logger.log( "No widget created, return");
            return undefined;
          }

          var panel = _createWidgetForParameterPanel.call(this, param, panelComponents);

          if (errors && errors.length > 0) {
            panel.cssClass = (panel.cssClass || '') + ' error';
          }

          return panel;
        },

        /**
         * Creates a Widget for the Submit Component
         *
         * @name PromptPanel#createWidgetForSubmitComponent
         * @method
         * @returns {BaseComponent}
         */
        createWidgetForSubmitComponent: function() {
          return _createWidget.call(this, {}, 'submit');
        },

        /**
         * Builds the Panel and its components for the parameters
         *
         * @name PromptPanel#buildPanelComponents
         * @method
         * @returns {Array|BaseComponents}
         */
        buildPanelComponents: function () {
          var panelGroupComponents = [];
          var paramDefn = this.getParamDefn();
          // Create a composite panel of the correct layout type for each group
          $.each(paramDefn.parameterGroups, function (i, group) {
            var components = [];
            // Create a label and a CDF widget for each parameter
            $.each(group.parameters, function (i, param) {
              if (param.attributes['hidden'] == 'true') {
                // initialize parameter values regardless of whether we're showing the parameter or not
                this._initializeParameterValue(paramDefn, param);
                return;
              }
              components.push(this._buildPanelForParameter(param));
            }.bind(this));

            if (components.length > 0) {
              panelGroupComponents.push(_createWidgetForGroupPanel.call(this, group, components));
            }
          }.bind(this));

          if (panelGroupComponents.length > 0) {
            panelGroupComponents.push(_createWidgetForSubmitPanel.call(this));
          }

          return panelGroupComponents;
        },

        /**
         * Removes all components from the current instance of dashboard
         *
         * @name PromptPanel#removeDashboardComponents
         * @method
         * @param {Array|BaseComponent} components The list of components to be removed
         * @param {Boolean} postponeClear
         */
        removeDashboardComponents: function (components, postponeClear) {
          var myself = this;
          // Traverse all embedded components to remove them

          var removed = [];
          _mapComponentsList(components, function (component) {
            var rc = myself.dashboard.removeComponent(component.name);
            if (rc) {
              removed.push(rc);
            }
          });

          // Remove references to each removed components parameter but leave the parameter so it may be reselected if it's reused by
          // another component
          $.each(removed, function (i, component) {
            // It would be wise to always call component.clear() here except that since Dashboards.init() schedules the components
            // to update() in a setTimeout(). To prevent that, we'll clear the removed components with the GarbageCollectorComponent
            // when we initialize the next set of components.
            if (!postponeClear) {
              if (component.remove) {
                component.remove();
              } else {
                component.clear();
              }
            }

            if (component.parameter) {
              // Remove our parameter from any other listening components
              $.each(myself.dashboard.components, function (i, comp) {
                if ($.isArray(comp.listeners)) {
                  comp.listeners = $.grep(comp.listeners, function (l) {
                    return l !== component.parameter;
                  });
                }
              });
            }
          });
        },

        /**
         * Makes visible the progress indicator by calling the function Dashboard#showProgressIndicator.
         *
         * @name PromptPanel#showProgressIndicator
         * @method
         */
        showProgressIndicator: function() {
          this.getDashboard().showProgressIndicator();
        },

        /**
         * Hides the progress indicator by calling the function Dashboard#hideProgressIndicator.
         *
         * @name PromptPanel#hideProgressIndicator
         * @method
         */
        hideProgressIndicator: function() {
          this.getDashboard().hideProgressIndicator();
        },

        /**
         * Sets the default options for blockUI
         *
         * @name PromptPanel#setBlockUiOptions
         * @method
         * @param {Object} options - The options to configure the block ui
         * @param {string} options.message - The message or html to display on block ui
         * @param {Object} options.css - A json that accepts valid css key/value pairs
         * @param {Object} options.overlayCSS - A json that accepts valid css key/value pairs for the block ui overlay
         * @param {boolean} options.showOverlay - Allows you to show or hide the overlay on block ui
         * @example
         *      var defaults = {
         *          message : '',
         *          css : {
         *              left : '0%',
         *              top : '0%',
         *              marginLeft : '85px',
         *              width : '100%',
         *              height : '100%',
         *              opacity : '1',
         *              backgroundColor : '#ffffcc'
         *          },
         *          overlayCSS : {
         *              backgroundColor : '#000000',
         *              opacity : '0.6',
         *              cursor : 'wait'
         *          },
         *          showOverlay : false
         *      };
         *      promptPanel.setBlockUiOptions(defaults);
         */
        setBlockUiOptions: function(options) {
          this.getDashboard()._setBlockUiOptions(options);
        },

        /**
         * Gets a current state of the prompting system.
         *
         * @name PromptPanel#getState
         * @method
         * @returns {Object} The current state which consists of the next properties:
         *                   <ul>
         *                     <li>'promptNeeded' &lt;Boolean&gt; - True if prompts are needed, False otherwise (read only property)</li>
         *                     <li>'paginate' &lt;Boolean&gt; - True if pagination is active, False otherwise (read only property)</li>
         *                     <li>'totalPages' &lt;Number&gt; - The number of total pages of the report (read only property)</li>
         *                     <li>'showParameterUI' &lt;Boolean&gt; - The boolean value of the parameter ShowParameters (read only property)</li>
         *                     <li>'allowAutoSubmit' &lt;Boolean&gt; - The value of autoSubmit, or if it is undefined the value of autoSubmitUI (read only property)</li>
         *                     <li>'parametersChanged' &lt;Boolean&gt; - True if the parameters have changed, False otherwise</li>
         *                     <li>'autoSubmit' &lt;Boolean&gt; - True is the prompt is in auto submit mode, False otherwise</li>
         *                     <li>'page' &lt;Number&gt; - The number of the page</li>
         *                   </ul>
         * @example
         * var currentState = api.operation.state();
         * // Return value:
         * //   {
         * //     "promptNeeded":false,
         * //     "paginate":true,
         * //     "totalPages":10,
         * //     "showParameterUI":true,
         * //     "allowAutoSubmit":false,
         * //     "parametersChanged":false,
         * //     "autoSubmit":false,
         * //     "page":1
         * //   }
         */
        getState: function() {
          var paramDefn = this.getParamDefn();
          var result = {
            promptNeeded: paramDefn.promptNeeded,
            paginate: paramDefn.paginate,
            totalPages: paramDefn.totalPages,
            showParameterUI: paramDefn.showParameterUI(),
            allowAutoSubmit: paramDefn.allowAutoSubmit(),
            parametersChanged: this.parametersChanged,
            autoSubmit: this.autoSubmit,
            page: paramDefn.page
          };
          return result;
        },

        /**
         * Modifys a state of the prompting system.
         *
         * @name PromptPanel#setState
         * @method
         * @param {Object} state                      The set of flags which will be applied to current state.
         * @param {Boolean} [state.parametersChanged] True if the parameters have changed, False otherwise
         * @param {Boolean} [state.autoSubmit]        True is the prompt is in auto submit mode, False otherwise. It's limited by the 'allowAutoSubmit' flag
         * @param {Number} [state.page]               The number of the current page. It's limited in range by the 'totalPages' and 'paginate' flags
         * @throws {String} Exception if input 'state' parameter is invalid
         * @example
         * var state = {
         *   "parametersChanged":true,
         *   "autoSubmit":true,
         *   "page":5
         * };
         *
         * var updatedState = api.operation.state(state);
         * // Return value:
         * //   {
         * //     "promptNeeded":false,
         * //     "paginate":true,
         * //     "totalPages":10,
         * //     "showParameterUI":true,
         * //     "allowAutoSubmit":true,
         * //     "parametersChanged":true,
         * //     "autoSubmit":true,
         * //     "page":5
         * //   }
         */
        setState: function(state) {
          var paramDefn = this.getParamDefn();
          _validateState(state, paramDefn);

          if(state.parametersChanged != null) {
            if (this.onStateChanged != null && this.parametersChanged != state.parametersChanged ) {
              this.onStateChanged("parametersChanged", this.parametersChanged, state.parametersChanged);
            }
            this.parametersChanged = state.parametersChanged;
          }

          (state.autoSubmit != null) && this.setAutoSubmit(state.autoSubmit);
          (state.page != null) && (paramDefn.page = state.page);
          this.setParamDefn(paramDefn);
        }
      });

      return PromptPanel;
    });
