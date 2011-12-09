var pentaho = pentaho || {};
pentaho.common = pentaho.common || {};

// Implementation of the .bind method now included in ECMAScript 5th Edition
// (This is the exact implementation from Prototype.js)
//
// Used to encapsulate scope for a function call:
// (function(a, b) {
//   return this.doSomething(a) + b;
// }).bind(this);
//
if (!Function.prototype.bind) { // check if native implementation available
  Function.prototype.bind = function(){ 
    var fn = this, args = Array.prototype.slice.call(arguments),
        object = args.shift(); 
    return function(){ 
      return fn.apply(object, 
        args.concat(Array.prototype.slice.call(arguments)));
    }; 
  };
}

var GUIDHelper = function() {
  /**
   * Simple array of used Prompt GUIDs so they and their components can be uniquely identified.
   */
  this._assignedGUIDs = {},
  this._gen = function() { return Math.round(Math.random() * 100000); };
  this.generateGUID = function() {
    var guid = this._gen();
    while(this._assignedGUIDs[guid]) {
      guid = this._gen();
    }
    this._assignedGUIDs[guid] = true;
    return '' + guid;
  };
  /**
   * Reset the collection of assigned GUIDs
   */
  this.reset = function() {
    this._assignedGUIDs = {};
  }
};

pentaho.common.prompting = {
  ParameterDefinition: function () {
    return {
      'autoSubmit': undefined, // boolean
      'autoSubmitUI': undefined, // boolean
      'ignoreBiServer5538': undefined, // boolean
      'layout': undefined, // string, [vertical, horizontal]
      'page': undefined, // integer
      'paginate': undefined, // boolean
      'parameterGroups': [],
      'promptNeeded': undefined, // boolean
      'subscribe': false, // boolean
      'totalPages': undefined, // integer
      'errors': {}, // hash of {paramName, [error1..n]}. "Global" errors are stored as {'null', [error1..n]}.

      getParameterGroup: function(name) {
        var group;
        $.each(this.parameterGroups, function(i, g) {
          if (g.name === name) {
            group = g;
            return false; // break
          }
        });
        return group;
      },

      allowAutoSubmit: function() {
        if (this.autoSubmit != undefined) {
          return this.autoSubmit;
        }
        return this.autoSubmitUI;
      },

      showParameterUI: function() {
        var showParameters;
        $.each(this.parameterGroups, function(i, g) {
          $.each(g.parameters, function(i, p) {
            if (p.name == 'showParameters') {
              showParameters = p;
              return false; // break
            }
          });
          if (showParameters) {
            return false; // break
          }
        });
        if (!showParameters) {
          return true;
        }
        return !showParameters.isSelectedValue('false');
      },

      getParameter: function(name) {
        var param;
        $.each(this.parameterGroups, function(i, g) {
          $.each(this.parameters, function(j, p) {
            if (p.name === name) {
              param = p;
              return false; // break
            }
          });
          if (param) {
            return false; // break
          }
        });
        return param;
      }
    }
  },

  ParameterGroup: function() {
    return {
      'name': undefined, // string
      'label': undefined, // string
      'parameters': []
    }
  },

  Parameter: function() {
    return {
      'name': undefined, // string
      'type': undefined, // string, java class name
      'list': undefined, // boolean
      'mandatory': undefined, // boolean
      'multiSelect': undefined, // boolean
      'strict': undefined, // boolean
      'timezoneHint': undefined, // string
      'attributes': {}, // hash of strings
      'values': [],

      /**
       * Checks if the value provided is selected in this parameter
       * @param value Value to search for
       * @return true if this parameter contains a selection whose value = {value}
       */
      isSelectedValue: function(value) {
        var selected = false;
        $.each(this.values, function(i, v) {
          if (v.selected) {
            if (value === v.value) {
              selected = true;
              return false; // break
            }
          }
        });
        return selected;
      },

      /**
       * Determine if any of our values are selected (selected = true)
       */
      hasSelection: function() {
        var s = false;
        $.each(this.values, function(i, v) {
          if (v.selected) {
            s = true;
            return false; // break
          }
        });
        return s;
      },

      getSelectedValues: function() {
        var selected = [];
        $.each(this.values, function(i, val) {
          if (val.selected) {
            selected.push(val);
          }
        });
        return selected;
      }
    }
  },

  ParameterValue: function() {
    return {
      type: undefined, // string
      label: undefined, // string
      selected: false, // boolean
      value: undefined // type defined by parameter this value belongs to
    }
  },

  promptGUIDHelper: new GUIDHelper(),

  /**
   * Remove components from Dashboards.
   * 
   * @param components Components to remove from Dashboards.components.
   * @param postponeClear If true we'll postpone calling component.clear() on all removed components.
   */
  removeDashboardComponents: function(components, postponeClear) {
    // Create a list of all embedded components to be removed
    var toRemove = [];
    var getComponents = function(c) {
      var comps = [];
      comps.push(c);
      if (c.getComponents) {
        $.each(c.getComponents(), function(i, cc) {
          comps = comps.concat(getComponents(cc));
        });
      }
      return comps;
    };
    $.each(components, function(i, c) {
      toRemove = toRemove.concat(getComponents(c));
    });

    var removed = this.removeFromArray(Dashboards.components, toRemove, function(original, itemToRemove) {
      return original.name === itemToRemove.name || original === itemToRemove;
    });

    // Remove references to each removed components parameter but leave the parameter so it may be reselected if it's reused by
    // another component
    $.each(removed, function(i, component) {
      // It would be wise to always call component.clear() here except that since Dashboards.init() schedules the components
      // to update() in a setTimeout(). To prevent that, we'll clear the removed components with the GarbageCollectorComponent
      // when we initialize the next set of components.
      if (!postponeClear) {
        component.clear();
      }
      if (!component.parameter) {
        return;
      }

      // Remove our parameter from any listening component
      $.each(Dashboards.components, function(i, c) {
        if ($.isArray(c.listeners)) {
            c.listeners = $.grep(c.listeners, function(l) {
                return l !== component.parameter;
            });
        };
      });

      // Remove our parameter from any component's dynamic parameters list
      $.each(Dashboards.components, function(i, c) {
        if ($.isArray(c.parameters)) {
            c.parameters = $.each(c.parameters, function(j, p) {
                if (p[1] === component.parameter) {
                    return [p[0], '', ''];
                } else {
                    return p;
                }
            });
        };
      });
    });
  },

  /**
   * Remove all components from the first array by the objects in the second.
   * @param components: [{name: 'mycomponent'}, {name: 'secondcomponent'}, ..]
   * @param itemsToRemove: [{name: 'secondcomponent'}]
   * @param comparator: function to compare original and itemsToRemove items
   * @return removed items
   */
  removeFromArray: function(original, itemsToRemove, comparator) {
    var removed = [];
    var n = $.grep(original, function(orig, idx) {
      var keep;
      $.each(itemsToRemove, function(idx, itemToRemove) {
        return (keep = !comparator.call(this, orig, itemToRemove));
      });
      if (!keep) { removed.push(orig);}
      return keep;
    });
    original.splice.apply(original, [0, original.length].concat(n));
    return removed;
  },

  /**
   * Append the array b to the array a.
   */
  appendInline: function(a, b) {
    a.splice.apply(a, [a.length, 0].concat(b));
  },

  prepareCDF: function() {
    if (this.prepared) { return; }
    Dashboards.setGlobalContext(false);

    this.prepared = true;
  },

  parseXML: function( data , xml , tmp ) {
    if ( window.DOMParser ) { // Standard
      tmp = new DOMParser();
      xml = tmp.parseFromString( data , "text/xml" );
    } else { // IE
      xml = new ActiveXObject( "Microsoft.XMLDOM" );
      xml.async = "false";
      xml.loadXML( data );
    }

    tmp = xml.documentElement;

    if ( ! tmp || ! tmp.nodeName || tmp.nodeName === "parsererror" ) {
      jQuery.error( "Invalid XML: " + data );
    }

    return xml;
  },

  /**
   * Parses a Parameter XML into a proper JSON object.
   */
  ParameterXmlParser: function() {
    this.parseParameterXml = function(xmlString) {
      var xml = $(pentaho.common.prompting.parseXML(xmlString));

      if (xml.find('parsererror').length > 0) {
        throw xmlString;
      }

      var paramDefn = new pentaho.common.prompting.ParameterDefinition();
      var parameters = $(xml.find('parameters')[0]);

      paramDefn.promptNeeded = 'true' == parameters.attr('is-prompt-needed');
      paramDefn.ignoreBiServer5538 = 'true' == parameters.attr('ignore-biserver-5538');
      paramDefn.paginate = 'true' == parameters.attr('paginate');
      paramDefn.subscribe = 'true' == parameters.attr('subscribe');
      paramDefn.layout = parameters.attr('layout');

      var parseInteger = function(s, def) {
        var n = parseInt(s);
        return 'NaN' == n ? def : n;
      }
      paramDefn.page = parseInteger(parameters.attr('accepted-page'), 0);
      paramDefn.totalPages = parseInteger(parameters.attr('page-count'), 0);

      paramDefn.autoSubmit = parameters.attr('autoSubmit');
      if (paramDefn.autoSubmit == 'true') {
        paramDefn.autoSubmit = true;
      } else if (paramDefn.autoSubmit == 'false') {
        paramDefn.autoSubmit = false;
      } else {
        paramDefn.autoSubmit = undefined;
      }

      paramDefn.autoSubmitUI = 'true' == parameters.attr('autoSubmitUI');

      this.parseParameters(paramDefn, parameters);
      this.parseErrors(paramDefn, xml);

      return paramDefn;
    };

    this.parseParameters = function(paramDefn, parametersNode) {
      parametersNode.find('parameter').each(function(i, node) {
        var param = this.parseParameter(node);
        node = $(node);
        var groupName = param.attributes['parameter-group'];
        if (groupName == undefined || !$.trim(groupName).length) {
          groupName = 'parameters'; // default group
        }
        var group = paramDefn.getParameterGroup(groupName);
        if (!group) {
          group = new pentaho.common.prompting.ParameterGroup();
          group.name = groupName;
          group.label = param.attributes['parameter-group-label'];
          paramDefn.parameterGroups.push(group);
        }
        group.parameters.push(param);
      }.bind(this));
    };

    this.parseParameter = function(node) {
      var param = new pentaho.common.prompting.Parameter();

      node = $(node);
      param.name = node.attr('name');
      param.mandatory = 'true' == node.attr('is-mandatory');
      param.strict = 'true' == node.attr('is-strict');
      param.list = 'true' == node.attr('is-list');
      param.multiSelect = 'true' == node.attr('is-multi-select');
      param.type = node.attr('type');
      param.timezoneHint = node.attr('timezone-hint');

      // TODO Support namespaces
      $(node).find('attribute').each(function(i, attr) {
        attr = $(attr);
        param.attributes[attr.attr('name')] = attr.attr('value');
      });

      param.values = this.parseParameterValues(node, param);
      return param;
    };

    this.parseParameterValues = function(paramNode, parameter) {
      var values = [];
      $(paramNode).find('values value').each(function(i, value) {
        var pVal = new pentaho.common.prompting.ParameterValue();

        value = $(value);

        pVal.label = value.attr('label');
        if ('true' == value.attr('null')) {
          pVal.value = null;
        } else {
          pVal.value = value.attr('value');
        }
        pVal.type = value.attr('type');
        if (pVal.type == undefined || !$.trim(pVal.type).length) {
          pVal.type = parameter.type;
        }
        pVal.selected = 'true' == value.attr('selected');

        pVal.value = this.normalizeParameterValue(parameter, pVal.type, pVal.value);
        values.push(pVal);
      }.bind(this));
      return values;
    };

    /**
     * Called for every parameter value that is parsed. Override this to update the parameter
     * value at parse time.
     */
    this.normalizeParameterValue = function(parameter, type, value) {
      return value;
    };

    this.parseErrors = function(paramDefn, xmlRoot) {
      var addToParameter = function(paramDefn, paramName, message) {
        var errorList = paramDefn.errors[paramName];
        if (!errorList) {
          errorList = [];
        }
        errorList.push(message);
        paramDefn.errors[paramName] = errorList;
      };

      xmlRoot.find('error').each(function(i, e) {
        var error = $(e);
        var paramName = error.attr('parameter');
        var message = error.attr('message');
        addToParameter(paramDefn, paramName, message);
      }.bind(this));

      xmlRoot.find('global-error').each(function(i, e) {
        var error = $(e);
        var message = error.attr('message');
        addToParameter(paramDefn, null, message);
      }.bind(this));
    };
  },

  PromptPanel: function(destinationId, paramDefn) {
    if (!destinationId) {
      throw 'destinationId is required';
    }
    this.destinationId = destinationId;
    if (!paramDefn) {
      throw 'paramDefn is required';
    }
    this.paramDefn = paramDefn;

    // Initialize the auto submit setting for this panel from the parameter definition
    this.autoSubmit = paramDefn.allowAutoSubmit();

    this.guid = pentaho.common.prompting.promptGUIDHelper.generateGUID();

    /**
     * Get a localized string for this prompt panel.
     */
    this.getString = function(key, defaultString) {
      return defaultString || '!' + key + '!';
    };

    /**
     * Get the current auto submit setting for this panel.
     */
    this.getAutoSubmitSetting = function() {
      return this.autoSubmit;
    };

    /**
     * Returns a parameter name unique to this parameter panel.
     */
    this.getParameterName = function(parameter) {
      return this.guid + parameter.name;
    };

    /**
     * Returns a map of parameter name -> value. This will extract the current parameter value from Dashboards
     * as necessary.
     */
    this.getParameterValues = function() {
      var params = {};
      $.each(this.paramDefn.parameterGroups, function(i, group) {
        $.each(group.parameters, function(j, param) {
          var value = Dashboards.getParameterValue(this.getParameterName(param));
          // if ((value == '' || value == undefined) && 'true' == param.attributes['hidden']) {
          //   value = param.values
          // }
          // Empty string is Dashboards' "null"
          if (value === '' || typeof value == 'undefined') {
            return; // continue
          }
          if (param.multiSelect && !$.isArray(value)) {
            value = [value];
          }
          params[param.name] = value;
        }.bind(this));
      }.bind(this));
      return params;
    };

    /**
     * This should return an object capable of formatting an object to the format used to send over the wire 
     * (the format it is transported in). See PromptPanel.createFormatter() for how a format object should look.
     *
     * @param paramDefn Parameter definition
     * @param parameter Parameter to create text formatter for
     * @param pattern Optional pattern to use instead of any the parameter declares
     * @param formatter Formatter used to format this parameter to display
     */
    this.createDataTransportFormatter = function(paramDefn, parameter, pattern, formatter) {
      return undefined;
    };

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
    this.createFormatter = function(paramDefn, parameter, pattern) {
      return undefined;
    };

    this._widgetGUIDHelper = new GUIDHelper();
    /**
     * Generate a unique GUID for a widget of this panel.
     */
    this.generateWidgetGUID = function() {
      return this.guid + '-' + this._widgetGUIDHelper.generateGUID();
    };

    /**
     * Sets the parameter value in Dashboards' parameter map to a properly initialized value.
     */
    this.initializeParameterValue = function(paramDefn, param) {
      var value = [];
      $.each(param.values, function(i, v) {
        if (v.selected) {
          value.push(v.value);
        }
      });
      if (value.length === 0) {
        value = ''; // Dashboards' null value is an empty string
      } else if (value.length === 1) {
        value = value[0];
      }
      this.setParameterValue(param, value);
    };

    /**
     * Sets the parameter value in Dashboards' parameter map.
     */
    this.setParameterValue = function(param, value) {
      Dashboards.setParameter(this.getParameterName(param), value);
    };

    /**
     * Gets the parameter value from Dashboards' parameter map.
     */
    this.getParameterValue = function(param) {
      if (typeof param == 'string') {
        return Dashboards.getParameterValue(param);
      } else {
        return Dashboards.getParameterValue(this.getParameterName(param));
      }
    };

    this._submit = function() {
      this.submit(this);
    };

    /**
     * Called when the prompt panel's submit button is clicked or auto-submit is enabled and a parameter value changes.
     */
    this.submit = function(promptPanel) {
    };

    this._schedule = function() {
      this.schedule(this);
    };

    /**
     * Called when the prompt panel's schedule button is clicked.
     */
    this.schedule = function(promptPanel) {
    };

    /**
     * Called when a parameter value changes.
     */
    this.parameterChanged = function(param, name, value) {
      this.refreshPrompt();
    };


    /**
     * This is called to refresh the prompt panel. It should return a new parameter definition. If it returns undefined no
     * update will happen.
     * @param promptPanel the panel that needs a new parameter definition
     * @param callback Function to call when the parameter definition has been fetched. It accepts a single argument: the new parameter definition, or undefined.
     */
    this.getParameterDefinition = function(promptPanel, callback) {
      callback();
    };

    /**
     * Called to refresh the prompt panel. This will invoke getParameterDefinition() to get a new parameter definition.
     * If the new parameter definition is undefined (default impl) no re-initialization will be done.
     */
    this.refreshPrompt = function() {
      var newParamDefn;
      try {
        newParamDefn = this.getParameterDefinition(this, this.refresh.bind(this));
      } catch (e) {
        alert('Error in refreshCallback'); // TODO Add better error message
        return;
      }
    };

    this.refresh = function(paramDefn) {
      if (paramDefn != undefined) {
        this.paramDefn = paramDefn;
        // Postpone the clearing of removed components if we'll be showing some components.
        // We'll clear the old components with a special component in front of all other components during init().
        pentaho.common.prompting.removeDashboardComponents(this.components, this.paramDefn.showParameterUI());
        this.init();
      }
    };

    /**
     * Initialize this prompt panel. This will create the components and pass them to CDF to be loaded.
     */
    this.init = function() {
      pentaho.common.prompting.prepareCDF();
      var fireSubmit = true;
      if (this.paramDefn.showParameterUI()) {
        this._widgetGUIDHelper.reset(); // Clear the widget helper for this prompt
        var layout = pentaho.common.prompting.builders.WidgetBuilder.build(this, 'prompt-panel');

        var addComponents = function(components, c) {
          components.push(c);
          if (c.components) {
            $.each(c.components, function(i, cc) {
              addComponents(components, cc);
            });
          }
        };

        var components = [layout];
        $.each(layout.components, function(i, c) {
          addComponents(components, c);
        });

        if (this.components && this.components.length > 0) {
          // We have old components we MUST call .clear() on to prevent memory leaks. In order to 
          // prevent flickering we must do this during the same execution block as when Dashboards
          // updates the new components. We'll use our aptly named GarbageCollectorBuilder to handle this.
          var gc = pentaho.common.prompting.builders.WidgetBuilder.build({
            promptPanel: this,
            components: this.components
          }, 'gc');

          if (gc === undefined) {
            throw 'Cannot create garbage collector';
          }
          components = [gc].concat(components);
        }

        this.components = components;

        // Don't fire the submit on load if we have a submit button. It will take care of firing this itself (based on auto-submit)
        $.each(this.components, function(i, c) {
          if (c.promptType == 'submit') {
            fireSubmit = false;
          }
        });

        Dashboards.init(components);
      } else {
        $.each(paramDefn.parameterGroups, function(i, group) {
          $.each(group.parameters, function(i, param) {
            // initialize parameter values regardless of whether we're showing the parameter or not
            this.initializeParameterValue(paramDefn, param);
          }.bind(this));
        }.bind(this));
        // All parameters are initialized, fire the submit
        fireSubmit = true;
      }
      if (fireSubmit) {
        this.submit(this);
      }
    };

    this.hide = function() {
      $('#' + this.destinationId).css('display', 'none');
    };

    this.createSubmitPanel = function(paramDefn) {
      return pentaho.common.prompting.builders.WidgetBuilder.build({
        promptPanel: this
      }, 'submit-panel');
    };

    this.getParameterPanelType = function() {
      return 'parameter-panel';
    };

    this.createWidgetForParameter = function(paramDefn, param) {
      if (param.strict && param.values.length === 0) {
        // if the parameter is strict but we have no valid choices for it, it is impossible
        // for the user to give it a value, so we will hide this parameter
        // it is highly likely that the parameter is driven by another parameter which
        // doesn't have a value yet, so eventually, we'll show this parameter.. we hope
        return;
      }
      return pentaho.common.prompting.builders.WidgetBuilder.build({
        promptPanel: this,
        param: param
      });
    };

    /**
     * Determines if the submit panel should be built for this panel. Default implementation checks for number of parameters.
     * @param panelComponents Components being built for this panel.
     */
    this.shouldBuildSubmitPanel = function(panelComponents) {
      return panelComponents.length > 0;
    };

    this.buildPanelComponents = function() {
      var panelComponents = [];
      // Create a composite panel of the correct layout type for each group
      $.each(this.paramDefn.parameterGroups, function(i, group) {
        var components = [];
        // Create a label and a CDF widget for each parameter
        $.each(group.parameters, function(i, param) {
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

          var label = pentaho.common.prompting.builders.WidgetBuilder.build({
              promptPanel: this,
              param: param
            }, 'label');

          var errors = this.paramDefn.errors[param.name];
          var errorLabels = [];
          if (errors && errors.length > 0) {
            $.each(errors, function(i, e) {
              var l = pentaho.common.prompting.builders.WidgetBuilder.build({
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
          var panel = pentaho.common.prompting.builders.WidgetBuilder.build({
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
          var groupPanel = pentaho.common.prompting.builders.WidgetBuilder.build({
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
    }
  }
}