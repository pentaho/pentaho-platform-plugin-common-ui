define(['amd!cdf/lib/underscore', 'cdf/lib/Base', 'cdf/Logger', 'dojo/number', './utils/GUIDHelper', './WidgetBuilder', 'cdf/Dashboard.Clean', './components/CompositeComponent', './components/PostInitComponent'],
    function (_, Base, Logger, DojoNumber, GUIDHelper, WidgetBuilder, Dashboard, CompositeComponent, PostInitComponent) {

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
       * Pre-order traversal of a component and its descendants.
       */
      var _mapComponents = function (c, f, x) {
        f.call(x, c);
        if (c.components) {
          _mapComponentsList(c.components, f, x);
        }
        return c;
      };

      /**
       * Pre-order traversal of components given a list of root components.
       */
      //TODO REVIEW!
      var _mapComponentsList = function (comps, f, x) {
        var me = this;
        $.each(comps, function (i, c) {
          _mapComponents(c, f, x);
        });
        return me;
      };

      var PromptPanel = Base.extend({

        guid: undefined,
        destinationId: undefined,
        paramDefn: undefined,
        autoSubmit: undefined,
        promptGUIDHelper: new GUIDHelper(),

        dashboard: undefined,

        parametersChanged: false,

        /**
         *
         * @param destinationId
         * @param paramDefn
         */
        constructor: function (destinationId, paramDefn) {
          if (!destinationId) {
            throw 'destinationId is required';
          }
          this.destinationId = destinationId;

          if (!paramDefn) {
            throw 'paramDefn is required';
          }
          this.paramDefn = paramDefn;

          this.autoSubmit = paramDefn.allowAutoSubmit();

          this.guid = this.promptGUIDHelper.generateGUID();

          this.dashboard = new Dashboard();
        },

        /**
         * Get the current auto submit setting for this panel.
         *
         * @returns {*}
         */
        getAutoSubmitSetting: function () {
          return this.autoSubmit;
        },

        /**
         * Get a localized string for this prompt panel.
         *
         * @returns {*}
         */
        getString: function (key, defaultString) {
          return defaultString || '!' + key + '!';
        },

        /**
         * Returns a parameter name unique to this parameter panel.
         */
        getParameterName: function (parameter) {
          return this.guid + parameter.name;
        },

        /**
         * Returns a map of parameter name -> value. This will extract the current parameter value from Dashboards
         * as necessary.
         */
        getParameterValues: function () {
          var params = {};
          this.paramDefn.mapParameters(function (param) {
            var value = this.dashboard.getParameterValue(this.getParameterName(param));
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
                    var defaultLocalization = dojo.i18n.getLocalization("dojo.cldr", "number", null);
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

        _widgetGUIDHelper: new GUIDHelper(),

        /**
         * Generate a unique GUID for a widget of this panel.
         */
        generateWidgetGUID: function () {
          return this.guid + '-' + this._widgetGUIDHelper.generateGUID();
        },

        /**
         * Sets the parameter value in Dashboards' parameter map to a properly initialized value.
         */
        initializeParameterValue: function (paramDefn, param) {
          var value = param.getSelectedValuesValue();
          if (value.length === 0) {
            value = ''; // Dashboards' null value is an empty string
          } else if (value.length === 1) {
            value = value[0];
          }
          this.setParameterValue(param, value);
        },

        /**
         * Sets the parameter value in Dashboards' parameter map.
         */
        setParameterValue: function (param, value) {
          this.dashboard.setParameter(this.getParameterName(param), value);
        },

        /**
         * Gets the parameter value from Dashboards' parameter map.
         */
        getParameterValue: function (param) {
          if (typeof param !== 'string') {
            param = this.getParameterName(param);
          }

          return this.dashboard.getParameterValue(param);
        },

        _ready: function () {
          this.ready(this);
        },

        _submit: function (options) {
          this.submit(this, options);
        },

        _submitStart: function () {
          this.submitStart(this);
        },

        /**
         * Called by the prompt-panel component when the CDE components have been updated.
         */
        ready: function (promptPanel) {
        },

        /**
         * Called when the prompt-panel component's submit button is clicked or auto-submit is enabled and a parameter value changes.
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
            alert('Error in refreshCallback'); // TODO Add better error message
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
              var compositeComponent = new CompositeComponent();
              compositeComponent.mapComponentsList(this.components, function (c) {
                if (!c.components && c.param && c.promptType === 'prompt') {
                  if (!focusedParam) {
                    var ph = c.placeholder();
                    if ($(":focus", ph).length) {
                      focusedParam = c.param.name;
                    }
                  }

                  if (topValuesByParam && c.type === 'SelectMultiComponent') {
                    var topValue = c.topValue();
                    if (topValue != null) {
                      topValuesByParam['_' + c.param.name] = topValue;
                    }
                  }
                } else if (topValuesByParam && c.type === 'ScrollingPromptPanelLayoutComponent') {
                  // save last scroll position for prompt panel
                  var scrollTopValue = c.placeholder().children(".prompt-panel").scrollTop();
                  if (scrollTopValue != null) {
                    topValuesByParam['_' + c.name] = scrollTopValue;
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
         * @param {boolean} [noAutoAutoSubmit=false] prevents auto-submiting, even when auto-submit is false,
         * in the case the the parameter UI is not shown.
         */
        init: function (noAutoAutoSubmit) {
          //TODO: Review!!
          //pentaho.common.prompting.prepareCDF();
          var fireSubmit = true;
          if (this.paramDefn.showParameterUI()) {
            this._widgetGUIDHelper.reset(); // Clear the widget helper for this prompt

            var components = [];

            var layout = WidgetBuilder.WidgetBuilder.build(this, 'prompt-panel');

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

            var compositeComponent = new CompositeComponent();

            compositeComponent.mapComponents(layout, function (c) {
              components.push(c);

              // Don't fire the submit on load if we have a submit button.
              // It will take care of firing this itself (based on auto-submit)
              if (fireSubmit && c.promptType == 'submit') {
                fireSubmit = false;
              }

              if (!c.components && c.param && c.promptType === 'prompt') {
                var name = c.param.name;
                if (focusedParam && focusedParam === name) {
                  focusedParam = null;
                  c.autoFocus = true;
                }

                if (topValuesByParam && c.type === 'SelectMultiComponent') {
                  var topValue = topValuesByParam['_' + name];
                  if (topValue != null) {
                    c.autoTopValue = topValue;
                  }
                }
              } else if (topValuesByParam && c.type === 'ScrollingPromptPanelLayoutComponent') {
                // save prompt pane reference and scroll value to dummy component
                var scrollTopValue = topValuesByParam['_' + c.name];
                if (scrollTopValue != null) {
                  postInitComponent.promptPanelScrollValue = scrollTopValue;
                  postInitComponent.promptPanel = c.htmlObject;
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
              this.initializeParameterValue(paramDefn, param);
            }, this);

            // Must submit, independently of auto-submit value.
            // All parameters are initialized, fire the submit
            fireSubmit = !noAutoAutoSubmit;
          }

          if (fireSubmit) {
            this.submit(this, {isInit: true});
          }
        },

        hide: function () {
          $('#' + this.destinationId).css('display', 'none');
        },

        createSubmitPanel: function (paramDefn) {
          return WidgetBuilder.WidgetBuilder.build({
            promptPanel: this
          }, 'submit-panel');
        },

        getParameterPanelType: function () {
          return 'parameter-panel';
        },

        createWidgetForParameter: function (paramDefn, param) {
          if (param.strict && param.values.length === 0) {
            // if the parameter is strict but we have no valid choices for it, it is impossible
            // for the user to give it a value, so we will hide this parameter
            // it is highly likely that the parameter is driven by another parameter which
            // doesn't have a value yet, so eventually, we'll show this parameter.. we hope
            return;
          }

          return WidgetBuilder.WidgetBuilder.build({
            promptPanel: this,
            param: param
          });
        },

        /**
         * Determines if the submit panel should be built for this panel. Default implementation checks for number of parameters.
         * @param panelComponents Components being built for this panel.
         */
        shouldBuildSubmitPanel: function (panelComponents) {
          return panelComponents.length > 0;
        },

        buildPanelComponents: function () {
          var panelComponents = [];
          // Create a composite panel of the correct layout type for each group
          $.each(this.paramDefn.parameterGroups, function (i, group) {
            var components = [];
            // Create a label and a CDF widget for each parameter
            $.each(group.parameters, function (i, param) {
              // initialize parameter values regardless of whether we're showing the parameter or not
              this.initializeParameterValue(this.paramDefn, param);

              if ('true' == param.attributes['hidden']) {
                return; // continue
              }

              var widget = this.createWidgetForParameter(this.paramDefn, param);
              if (!widget) {
                // No widget created. Do not create a label or parameter panel
                return; // continue
              }

              var label = WidgetBuilder.WidgetBuilder.build({
                promptPanel: this,
                param: param
              }, 'label');

              var errors = this.paramDefn.errors[param.name];
              var errorLabels = [];
              if (errors && errors.length > 0) {
                $.each(errors, function (i, e) {
                  var l = WidgetBuilder.WidgetBuilder.build({
                    promptPanel: this,
                    param: param,
                    errorMessage: e
                  }, 'error-label');
                  if (l) {
                    errorLabels.push(l);
                  }
                }.bind(this));
              }

              var c = [label];
              c = c.concat(errorLabels);
              c.push(widget);
              var panel = WidgetBuilder.WidgetBuilder.build({
                promptPanel: this,
                param: param,
                components: c
              }, this.getParameterPanelType());

              if (errorLabels.length > 0) {
                panel.cssClass = (panel.cssClass || '') + ' error';
              }

              components.push(panel);
            }.bind(this));

            if (components.length > 0) {
              var groupPanel = WidgetBuilder.WidgetBuilder.build({
                promptPanel: this,
                paramGroup: group,
                components: components
              }, 'group-panel');
              panelComponents.push(groupPanel);
            }
          }.bind(this));

          if (this.shouldBuildSubmitPanel(panelComponents)) {
            var submitPanel = this.createSubmitPanel(this.paramDefn);
            if (submitPanel) {
              panelComponents.push(submitPanel);
            }
          }

          return panelComponents;
        },

        removeDashboardComponents: function (components, postponeClear) {
          var myself = this;
          // Traverse all embedded components to remove them

          var removed = [];
          var compositeComponent = new CompositeComponent();
          compositeComponent.mapComponentsList(components, function (c) {
            var rc = myself.dashboard.removeComponent(c.name);
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
              $.each(myself.dashboard.components, function (i, c) {
                if ($.isArray(c.listeners)) {
                  c.listeners = $.grep(c.listeners, function (l) {
                    return l !== component.parameter;
                  });
                }
                ;
              });

              // Remove our parameter from any other component's dynamic parameters list
              $.each(myself.dashboard.components, function (i, c) {
                if ($.isArray(c.parameters)) {
                  // TODO: I'm afraid that the following code does nothing...
                  // The return value of the $.each callback function is only taken account when === false,
                  // meaning to break the loop. Otherwise, it is ignored.
                  // The return value of $.each is the first argument: c.parameters .
                  c.parameters = $.each(c.parameters, function (j, p) {
                    if (p[1] === component.parameter) {
                      return [p[0], '', ''];
                    } else {
                      return p;
                    }
                  });
                }
                ;
              });
            }
          });
        },

      });


      return PromptPanel;
    });
