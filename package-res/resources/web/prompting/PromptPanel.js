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
 * @property {ParameterDefinition} paramDef The parameter definition fetched and parsed from the server
 * @property {Boolean} autoSubmit True if the prompt is in auto submit mode, false otherwise
 * @property {Dashboard} dashboard The dashboard object assigned to the prompt
 * @property {Boolean} parametersChanged True if the parameters have changed, False otherwise
 */
define(['cdf/lib/Base', 'cdf/Logger', 'dojo/number', 'dojo/i18n', 'common-ui/util/util', 'common-ui/util/GUIDHelper', './WidgetBuilder', 'cdf/Dashboard.Clean', './parameters/ParameterDefinitionDiffer', 'common-ui/jquery-clean', 'common-ui/underscore'],
    function (Base, Logger, DojoNumber, i18n, Utils, GUIDHelper, WidgetBuilder, Dashboard, ParamDiff, $, _) {
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
              if(paramType.indexOf("[") == 0) { // Need to compare arrays
                if(paramValue.length != paramSelectedValue.length)
                  return true;
                return !_.isEqual(paramValue.sort(), paramSelectedValue.sort());
              }
              return paramValue != paramSelectedValue;
          }
        }

        return paramValue != paramSelectedValue;
      };

      var PromptPanel = Base.extend({

        guid: undefined,
        paramDefn: undefined,
        autoSubmit: undefined,

        dashboard: undefined,

        parametersChanged: false,
        onParameterChanged: null,
        onAfterRender: null,
        onBeforeRender: null,

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

          if (!paramDefn) {
            throw 'paramDefn is required';
          }
          this.paramDefn = paramDefn;

          this.autoSubmit = paramDefn.allowAutoSubmit();

          this.promptGUIDHelper = new GUIDHelper();

          this.guid = this.promptGUIDHelper.generateGUID();

          this.dashboard = new Dashboard();

          this.paramDiffer = new ParamDiff();

          this.widgetBuilder = WidgetBuilder;
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
          this.paramDefn.mapParameters(function (param) {
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
         * This should return an object capable of formatting an object to the format used to send over the wire
         * (the format it is transported in). See PromptPanel.createFormatter() for how a format object should look.
         *
         * @name PromptPanel#createDataTransportFormatter
         * @method
         * @param {ParameterDefinition} paramDefn Parameter definition
         * @param {Parameter} parameter Parameter to create text formatter for
         * @param {String} pattern Optional pattern to use instead of any the parameter declares
         * @param {Object} formatter Formatter used to format this parameter to display
         */
        createDataTransportFormatter: function (paramDefn, parameter, pattern, formatter) {
          //return undefined;
        },

        /**
         * This should return an object capable of formatting the 'type' to and from text. If no formatter
         * is required the return value should be undefined.
         *
         * A formatter should have two methods:
         * formatter = {
         *   format: function(object) {
         *     return ...; // string
         *   },
         *   parse: function(string) {
         *     return ...; // object
         *   }
         * }
         *
         * @name PromptPanel#createFormatter
         * @method
         * @param {ParameterDefinition} paramDefn Parameter definition
         * @param {Parameter} parameter Parameter to create text formatter for
         * @param {String} pattern Optional pattern to use instead of any the parameter declares
         *
         * @returns {Object} Optional object capable of formatting the 'type' to and from text
         */
        createFormatter: function (paramDefn, parameter, pattern) {
          //return undefined;
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
         * @param {Object} options
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
         * @param {PromptPanel} promptPanel
         * @param {Object} options
         */
        submit: function (promptPanel, options) {
          this.forceAutoSubmit = false;
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
            this.onParameterChanged(name, value);
          }

          if (param.list && (!value || value == "" || value == "null")) {
            if (!this.nullValueParams) {
              this.nullValueParams = [];
            }

            this.nullValueParams.push(param);
          }

          this._setTimeoutRefreshPrompt();
          this.parametersChanged = true;
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
            this.diff = this.paramDiffer.diff(this.paramDefn, paramDefn, this.nullValueParams);
            this.isRefresh = true;
            this.paramDefn = paramDefn;
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

                if(c.param) {
                  c.param = paramDefn.getParameter(c.param.name);
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
            var errors = this.paramDefn.errors[param.name];
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

                if (JSON.stringify(component.valuesArray) !== JSON.stringify(newValuesArray) || param.forceUpdate) {
                  // Find selected value in param values list and set it. This works, even if the data in valuesArray is different
                  this._initializeParameterValue(null, param);

                  // Set new values array
                  component.valuesArray = newValuesArray;
                  updateNeeded = true;
                }

                if (this.autoSubmit) {
                  this.forceSubmit = true;
                }

                if (!updateNeeded) {
                  var paramSelectedValues = param.getSelectedValuesValue();
                  var dashboardParameter = this.dashboard.getParameterValue(component.parameter);

                  // if the dashboardParameter is not an array, paramSelectedValues shouldn't be either
                  if (!_.isArray(dashboardParameter) && paramSelectedValues.length == 1) {
                    paramSelectedValues = paramSelectedValues[0];
                  }

                  updateNeeded = _areParamsDifferent(dashboardParameter, paramSelectedValues, param.type);
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

          // Determine if there are params which need to be removed
          if (Object.keys(diff.toRemove).length > 0) {
            this._removeComponentsByDiff(diff.toRemove);
          }

          // Determine if there are params which need to be added
          if (Object.keys(diff.toAdd).length > 0) {
            this._addComponentsByDiff(diff.toAdd);
          }

          // Determine if there are params which need to be changed
          if (Object.keys(diff.toChangeData).length > 0) {
            this._changeComponentsByDiff(diff.toChangeData);
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
          if (this.onBeforeRender) {
            this.onBeforeRender();
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
                      delete scrollValue;
                    }
                  });
                } else {
                  setTimeout(function() {setScroll();}, 50);
                }
              }
            }
          }).bind(this);

          if (!this.isRefresh && this.paramDefn.showParameterUI()) { // First time init
            this.promptGUIDHelper.reset(); // Clear the widget helper for this prompt

            var layout = _createWidgetForPromptPanel.call(this);
            _mapComponents(layout, updateComponent);

            this.dashboard.addComponents(components);
            this.dashboard.init();
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
            this.paramDefn.mapParameters(function (param) {
              // initialize parameter values regardless of whether we're showing the parameter or not
              this._initializeParameterValue(this.paramDefn, param);
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

          if (this.onAfterRender) {
            this.onAfterRender();
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

          // initialize parameter values regardless of whether we're showing the parameter or not
          this._initializeParameterValue(this.paramDefn, param);

          //add the label widget
          panelComponents.push(_createWidgetForLabel.call(this, param));

          //add the error widgets
          var errors = this.paramDefn.errors[param.name];
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
          // Create a composite panel of the correct layout type for each group
          $.each(this.paramDefn.parameterGroups, function (i, group) {
            var components = [];
            // Create a label and a CDF widget for each parameter
            $.each(group.parameters, function (i, param) {
              if (param.attributes['hidden'] == 'true') {
                // initialize parameter values regardless of whether we're showing the parameter or not
                this._initializeParameterValue(this.paramDefn, param);
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
        }
      });

      return PromptPanel;
    });
