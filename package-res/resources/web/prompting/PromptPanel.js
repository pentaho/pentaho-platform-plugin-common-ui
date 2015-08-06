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
define(['cdf/lib/Base', 'cdf/Logger', 'dojo/number', 'dojo/i18n', 'common-ui/util/util', 'common-ui/util/GUIDHelper', './WidgetBuilder', 'cdf/Dashboard.Clean', './parameters/ParameterDefinitionDiffer'],
    function (Base, Logger, DojoNumber, i18n, Utils, GUIDHelper, WidgetBuilder, Dashboard, ParamDiff) {
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


      var PromptPanel = Base.extend({

        guid: undefined,
        paramDefn: undefined,
        autoSubmit: undefined,

        dashboard: undefined,

        parametersChanged: false,

        /**
         * Constructor for the PromptPanel
         * Override to the Base constructor
         *
         * @name PromptPanel#contructor
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
          this.refreshPrompt();
          this.parametersChanged = true;
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
         * @method
         */
        refreshPrompt: function () {
          try {
            this.getParameterDefinition(this, this.refresh.bind(this));
          } catch (e) {
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
            var diff = this.paramDiffer.diff(this.paramDefn, paramDefn);

            if (diff.changesToMake()) {
              this.paramDefn = paramDefn;
              this.update(diff, noAutoAutoSubmit);
            }
          }
        },

        /**
         * Updates the dashboard and prompt panel based off of differences in the parameter definition
         * @method update
         * @param {JSON} diff - contains the differences between the old and new parameter definitions
         * @param {bool} noAutoAutoSubmit
         */
        update: function(diff, noAutoAutoSubmit) {

          // Retrieves a component by a param
          var _getComponentByParam = (function(param, getPanel) {
            var parameterName = this.getParameterName(param);
            return _getComponentByParamName(parameterName, getPanel);
          }).bind(this);

          var _getComponentByParamName = (function(parameterName, getPanel) {
            for (var i in this.components) {
              var component = this.components[i];
              if (component.parameter === parameterName) {
                var isPanel = component.type.search("Panel") > -1;
                if ((getPanel && isPanel) || (!getPanel && !isPanel)) {
                  return component;
                }
              }
            }
            return null;
          }).bind(this);

          // Removes a single component from dashboard and prompt panel
          var _removeComponent = (function(component) {
            this.dashboard.removeComponent(component);
            for (var i in this.components) {
              if (this.components[i].name == component.name) {
                this.components.splice(i, 1);
                break;
              }
            }
            component.clear();
          }).bind(this);

          var _addComponent = (function(component) {
            this.dashboard.addComponent(component);
            this.components.push(component);
            this.dashboard.updateComponent(component);

            for (var i in component.components) { // Loop through panel components
              _addComponent(component.components[i]);
            }
          }).bind(this);

          if(diff.toRemove.length > 0) { // To Remove
            for (var i in diff.toRemove) {
              var param = diff.toRemove[i];
              var component = _getComponentByParam(param, true); // get component panel

              if (component != null) {
                if (component.components) { // Panel component has many components to be cleaned up
                  for (var j in component.components) { // Loop through panel components
                    _removeComponent(component.components[j]);
                  }
                }
                _removeComponent(component);
                $("#" + component.htmlObject).remove(); // Clean up remaining html object
              }
            }

          }

          if(diff.toAdd.length > 0) { // To Add
            for (var i in diff.toAdd) {
              var param = diff.toAdd[i];
              var component = this._buildPanelForParameter(param); // returns a panel component

              var panelComponent = this.dashboard.getComponentByName("prompt" + this.guid);
              panelComponent.components.push(component);

              // Psuedo update call for panel component, without wiping out other components on update
              var markup = panelComponent.getMarkupFor(component);
              var className = component.promptType === 'submit' ? "submit-panel" : "prompt-panel";
              $("#" + panelComponent.htmlObject + " ." + className).append(markup);

              _addComponent(component);
            }
          }

          if(diff.toChangeData.length > 0) { // To Change
            for (var i in diff.toChangeData) {
              var param = diff.toChangeData[i];

              // Find selected value in param values list and set it. This works, even if the data in valuesArray is different
              var selectedValues = param.getSelectedValuesValue();
              for (var j in selectedValues) {
                this.setParameterValue(param, selectedValues[j]);
              }

              var component = _getComponentByParam(param);
              if (component != null) {
                // Create new widget to get properly formatted values array
                var newValuesArray = WidgetBuilder.WidgetBuilder.build({
                  param: param,
                  promptPanel: this
                }, param.attributes["parameter-render-type"]).valuesArray;

                // Compare values array from param (which is formatted into valuesArray) with the current valuesArray
                if (JSON.stringify(component.valuesArray) !== JSON.stringify(newValuesArray)) {
                  component.valuesArray = newValuesArray;
                }

                // Update still needs to be called b/c we are setting a new value above
                this.dashboard.updateComponent(component);
              }
            }
          }

          if(!noAutoAutoSubmit) {
            this.submit(this, {isInit: false});
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
          var myself = this;
          var fireSubmit = true;
          if (this.paramDefn.showParameterUI()) {
            this.promptGUIDHelper.reset(); // Clear the widget helper for this prompt

            var components = [];

            var layout = _createWidgetForPromptPanel.call(this);

            var topValuesByParam = this._multiListBoxTopValuesByParam;
            if (topValuesByParam) {
              delete this._multiListBoxTopValuesByParam;
            }

            var focusedParam = this._focusedParam;
            if (focusedParam) {
              delete this._focusedParam;
            }

            _mapComponents(layout, function (component) {
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
                var scrollTopValue = topValuesByParam['_' + component.name];
                if (scrollTopValue != null) {
                  myself.dashboard.postInit = function(){
                    // restore last scroll position for prompt panel
                    if (scrollTopValue) {
                      $("#" + component.htmlObject).children(".prompt-panel").scrollTop(scrollTopValue);
                      delete scrollTopValue;
                    }
                  };
                }
              }
            });
            
            this.components = components;
            this.dashboard.addComponents(this.components);
            this.dashboard.init();
          } else {
            this.paramDefn.mapParameters(function (param) {
              // initialize parameter values regardless of whether we're showing the parameter or not
              this._initializeParameterValue(this.paramDefn, param);
            }, this);

            // Must submit, independently of auto-submit value.
            // All parameters are initialized, fire the submit
            fireSubmit = !noAutoAutoSubmit;
          }

          if (fireSubmit) {
            this.submit(this, {isInit: true});
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
              component.clear();
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
