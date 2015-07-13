define(['amd!cdf/lib/underscore', 'cdf/lib/Base', 'cdf/Logger', 'dojo/number', 'common-ui/util/GUIDHelper', './WidgetBuilder', 'cdf/Dashboard.Clean', './components/PostInitComponent'],
    function (_, Base, Logger, DojoNumber, GUIDHelper, WidgetBuilder, Dashboard, PostInitComponent) {

      /**
       * Checks if the type is numeric
       *
       * @param type
       * @return boolean if the type is a numeric type
       * @private
       */
      var _isNumberType = function (type) {
        var whiteList = ["java.lang.Number", "java.lang.Byte", "java.lang.Double", "java.lang.Float", "java.lang.Integer", "java.lang.Long", "java.lang.Short", "java.math.BigDecimal", "java.math.BigInteger"];
        return _.contains(whiteList, type);
      };

      /**
       * Creates a Widget calling the wigdet builder factory
       * @param options {object} with the properties to be added to the Widget
       * @param type {string} the type of the Widget to build
       * @returns {object} A widget instance
       * @private
       */
      function _createWidget(options, type) {
        var newObj = $.extend(options, {
          promptPanel: this
        });
        return WidgetBuilder.WidgetBuilder.build(newObj, type);
      };

      /**
       * Creates a Widget for the Parameter
       *
       * @param param The param to be created
       * @returns {object} A widget for the given parameter
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
       * @param param The param to be created
       * @returns {object} A widget for the given parameter
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
       * @param param The param to be created
       * @param e {string} The error message
       * @returns {Object} A widget for the given parameter
       * @private
       */
      function _createWidgetForErrorLabel(param, e) {
        return _createWidget.call(this, {
          param: param,
          errorMessage: e
        }, 'error-label');
      }

      /**
       * Creates a Widget for the Parameter Panel
       *
       * @param param {Object} The param definition
       * @param components {Object[]} The Array of components to add to the Group Panel
       * @returns {Object} The Widget for the Parameter Panel
       * @private
       */
      function _createWidgetForParameterPanel(param, components) {
        return _createWidget.call(this, {
          param: param,
          components: components
        }, 'parameter-panel');
      }

      /**
       * Creates a Widget for the Group Panel
       *
       * @param group {Object} The group definition
       * @param components {Object[]} The Array of components to add to the Group Panel
       * @returns {Object} The Widget for the Group Panel
       * @private
       */
      function _createWidgetForGroupPanel(group, components) {
        return _createWidget.call(this, {
          paramGroup: group,
          components: components
        }, 'group-panel');
      }

      /**
       * Creates a Widget for the Submit Panel
       *
       * @returns {Object}
       * @private
       */
      function _createWidgetForSubmitPanel() {
        return _createWidget.call(this,{}, 'submit-panel');
      }

      /**
       * Creates a Widget for the Prompt Panel
       *
       * @returns {Object}
       * @private
       */
      function _createWidgetForPromptPanel() {
        return WidgetBuilder.WidgetBuilder.build(this, 'prompt-panel');
      }

      /**
       * @callback callback~cb
       * @param {Object} component The component
       */

      /**
       * Pre-order traversal of a component and its descendants.
       *
       * @function
       * @param {Object} component The component to iterate
       * @param {callback~cb} callback The callback to call on each component
       * @private
       */
      function _mapComponents(component, callback) {
        callback(component);
        if (component.components) {
          _mapComponentsList(component.components, callback);
        }
      }

      /**
       * Pre-order traversal of components given a list of root components.
       *
       * @function
       * @param {Object[]} components The list of components to iterate
       * @param {callback~cb} callback The callback to call on each component
       */
      function _mapComponentsList(components, callback) {
        $.each(components, function(i, component) {
          _mapComponents(component, callback);
        });
      }

      var PromptPanel = Base.extend({

        guid: undefined,
        paramDefn: undefined,
        autoSubmit: undefined,

        dashboard: undefined,

        parametersChanged: false,

        /**
         * Contructor for the PromptPanel
         *
         * @constructor
         * @param destinationId
         * @param paramDefn
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
        },

        /**
         * Get the current auto submit setting for this panel.
         *
         * @returns {Boolean}
         */
        getAutoSubmitSetting: function () {
          return this.autoSubmit;
        },

        /**
         * Get a localized string for this prompt panel.
         *
         * @returns {string} The localized string
         */
        getString: function (key, defaultString) {
          return defaultString || '!' + key + '!';
        },

        /**
         * Returns a parameter name unique to this parameter panel.
         *
         * @param parameter {Object} The parameter
         * @returns {string} The Paramerer Name
         */
        getParameterName: function (parameter) {
          return this.guid + parameter.name;
        },

        /**
         * Returns a map of parameter name value. This will extract the current parameter value from the dashboard
         * instance as necessary
         *
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
            if (_isNumberType(param.type)) {
              var localization = dojo.i18n.getLocalization("dojo.cldr", "number", SESSION_LOCALE.toLowerCase());
              var defaultLocalization = dojo.i18n.getLocalization("dojo.cldr", "number", null);
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
                    defaultLocalization = dojo.i18n.getLocalization("dojo.cldr", "number", null);
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
         * @param paramDefn Parameter definition
         * @param parameter Parameter to create text formatter for
         * @param pattern Optional pattern to use instead of any the parameter declares
         * @param formatter Formatter used to format this parameter to display
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
         * @param paramDefn Parameter definition
         * @param parameter Parameter to create text formatter for
         * @param pattern Optional pattern to use instead of any the parameter declares
         */
        createFormatter: function (paramDefn, parameter, pattern) {
          //return undefined;
        },

        /**
         * Generate a unique GUID for a widget of this panel.
         *
         * @returns {string} The join of the guid of the prompt with a new one generated by the GUIDHelper
         */
        generateWidgetGUID: function () {
          return this.guid + '-' + this.promptGUIDHelper.generateGUID();
        },

        /**
         * Sets the parameter value in Dashboards' parameter map to a properly initialized value.
         *
         * @param {Object} paramDefn The parameter definition map
         * @param {String} param The parameter name
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
         * @param param {String} The name of the parameter
         * @param value {Object} The value of the parameter
         */
        setParameterValue: function (param, value) {
          this.dashboard.setParameter(this.getParameterName(param), value);
        },

        /**
         * Gets the parameter value from the dashboard instance parameter map
         *
         * @param param {String} The parameter name
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
         * @private
         */
        _ready: function () {
          this.ready(this);
        },

        /**
         * Called when the prompt-panel component's submit button is clicked or auto-submit is enabled and a parameter
         * value changes.
         *
         * @param options
         * @private
         */
        _submit: function (options) {
          this.submit(this, options);
        },

        /**
         * Called when the prompt-panel component's submit button is pressed (mouse-down only).
         *
         * @private
         */
        _submitStart: function () {
          this.submitStart(this);
        },

        /**
         * Called by the prompt-panel component when the CDE components have been updated.
         */
        ready: function (promptPanel) {
        },

        /**
         * Called when the prompt-panel component's submit button is clicked or auto-submit is enabled and a parameter
         * value changes.
         */
        submit: function (promptPanel, options) {
          this.forceAutoSubmit = false;
        },

        /**
         * Called when the prompt-panel component's submit button is pressed (mouse-down only).
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
         */
        parameterChanged: function (param, name, value) {
          this.refreshPrompt();
          this.parametersChanged = true;
        },

        /**
         * This is called to refresh the prompt panel.
         * It should return a new parameter definition.
         * If it returns undefined no update will hapdefine
         *
         * This method should be overriden.
         * The default implementation simply calls the provided callback with no parameter definition.
         *
         * @param promptPanel the panel that needs a new parameter definition
         * @param callback function to call when the parameter definition has been fetched.
         *
         * The callback signature is: <pre>void function([newParamDef=undefined])</pre> and is called in the global context.
         */
        getParameterDefinition: function (promptPanel, callback) {
          callback();
        },

        /**
         * Called to refresh the prompt panel. This will invoke getParameterDefinition() to get a new parameter definition.
         * If the new parameter definition is undefined (default impl) no re-initialization will be done.
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
         * @param {ParameterDefinition} [paramDefn] the parameter definition used to refresh the prompt panel.
         * When unspecified, nothing is done.
         * @param {boolean} [noAutoAutoSubmit=false] prevents auto-submiting, even when auto-submit is false,
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
            this.paramDefn = paramDefn;

            // Remove this `PromptPanel`'s components from `Dashboards`.
            if (this.components) {
              // Postpone the clearing of removed components if we'll be showing some components.
              // We'll clear the old components with a special component in front of all other components during init().
              var postponeClear = this.paramDefn.showParameterUI();
              this.removeDashboardComponents(this.components, postponeClear);

              // Create dictionary by parameter name, of topValue of multi-select listboxes, for restoring later, when possible.
              // But not for mobile, cause the UIs vary. Would need more time to check each.
              var topValuesByParam;
              if (!(/android|ipad|iphone/i).test(navigator.userAgent)) {
                topValuesByParam = this._multiListBoxTopValuesByParam = {};
              }

              var focusedParam;
              _mapComponentsList(this.components, function (component) {
                if (!component.components && component.param && component.promptType === 'prompt') {
                  if (!focusedParam) {
                    var ph = component.placeholder();
                    if ($(":focus", ph).length) {
                      focusedParam = component.param.name;
                    }
                  }

                  if (topValuesByParam && component.type === 'SelectMultiComponent') {
                    var topValue = component.topValue();
                    if (topValue != null) {
                      topValuesByParam['_' + component.param.name] = topValue;
                    }
                  }
                } else if (topValuesByParam && component.type === 'ScrollingPromptPanelLayoutComponent') {
                  // save last scroll position for prompt panel
                  var scrollTopValue = component.placeholder().children(".prompt-panel").scrollTop();
                  if (scrollTopValue != null) {
                    topValuesByParam['_' + component.name] = scrollTopValue;
                  }
                }
              });

              this._focusedParam = focusedParam;
            }

            this.init(noAutoAutoSubmit);
          }
        },


        /**
         * Initialize this prompt panel.
         * This will create the components and pass them to CDF to be loaded.
         *
         * @param {boolean} [noAutoAutoSubmit=false] prevents auto-submiting, even when auto-submit is false,
         * in the case the the parameter UI is not shown.
         */
        init: function (noAutoAutoSubmit) {
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

            // dummy component for prompt panel scroll restoring (after all components was rendered)
            var postInitComponent = new PostInitComponent();

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
                    componentautoTopValue = topValue;
                  }
                }
              } else if (topValuesByParam && component.type === 'ScrollingPromptPanelLayoutComponent') {
                // save prompt pane reference and scroll value to dummy component
                var scrollTopValue = topValuesByParam['_' + component.name];
                if (scrollTopValue != null) {
                  postInitComponent.promptPanelScrollValue = scrollTopValue;
                  postInitComponent.promptPanel = component.htmlObject;
                }
              }
            });

            // add dummy component to components list
            if (postInitComponent.promptPanelScrollValue) {
              this.dashboard.addComponent(postInitComponent);
            }

            if (this.components && this.components.length > 0) {
              // We have old components we MUST call .clear() on to prevent memory leaks. In order to
              // prevent flickering we must do this during the same execution block as when Dashboards
              // updates the new components. We'll use our aptly named GarbageCollectorBuilder to handle this.
              var gc = WidgetBuilder.WidgetBuilder.build({
                promptPanel: this,
                components: this.components
              }, 'gc');

              if (!gc) {
                throw 'Cannot create garbage collector';
              }

              components = [gc].concat(components);
            }

            this.components = components;
            this.dashboard.addComponents(this.components);
            this.dashboard.init();
          } else {
            this.paramDefn.mapParameters(function (param) {
              // initialize parameter values regardless of whether we're showing the parameter or not
              this._initializeParameterValue(paramDefn, param);
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
         */
        hide: function () {
          $('#' + this.destinationId).css('display', 'none');
        },

        /**
         * Creates a panel for a parameter
         * If no widget for the parameter is created this method returns null
         *
         * @param param
         * @returns {object} The panel parameter. It returns undefined if the panel is not created
         * @private
         */
        _buildPanelForParameter: function(param) {
          var panelComponents = [];

          // initialize parameter values regardless of whether we're showing the parameter or not
          this._initializeParameterValue(this.paramDefn, param);

          //add the label widget
          panelComponents.push(_createWidgetForLabel.call(this, param));

          //add the parameter widget
          var widget = _createWidgetForParameter.call(this, param);
          if (widget !== 'undefined') {
            panelComponents.push(widget);
          } else { // No widget created. Do not create a label or parameter panel
            Logger.log( "No widget created, return");
            return undefined;
          }

          //add the error widgets
          var errors = this.paramDefn.errors[param.name];
          if (errors && errors.length > 0) {
            $.each(errors, function (i, e) {
              panelComponents.push(_createWidgetForErrorLabel.call(this, param ,e));
            });
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
         * @returns {Object}
         */
        createWidgetForSubmitComponent: function() {
          return _createWidget.call(this,{}, 'submit');
        },
        
        /**
         * Builds the Panel and its components for the parameters
         *
         * @returns {Array}
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
         * @param components The list of components to be removed
         * @param postponeClear
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
