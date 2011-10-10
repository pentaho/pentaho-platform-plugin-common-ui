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
            if (value === null && v.value == null) {
              selected = true;
              return false; // break
            }
            if (value === null && value === v.value) {
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

  removeDashboardComponents: function(components) {
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
      // component.clear();

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

  /**
   * Parses a Parameter XML into a proper JSON object.
   */
  ParameterXmlParser: function() {
    this.parseParameterXml = function(xmlString) {
      var xml = $($.parseXML(xmlString));

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
        var groupName = node.attr('parameter-group');
        if (groupName == undefined || !$.trim(groupName).length) {
          groupName = 'parameters'; // default group
        }
        var group = paramDefn.getParameterGroup(groupName);
        if (!group) {
          group = new pentaho.common.prompting.ParameterGroup();
          group.name = groupName;
          group.label = node.attr('parameter-group-label');
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
      param.timezoneHint = node.attr('timezone-hint'); // TODO Change this to timzone-hint?

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
    },

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

  PromptPanel: function(destinationId, paramDefn, submitCallback, refreshCallback) {
    if (!destinationId) {
      throw 'destinationId is required';
    }
    this.destinationId = destinationId;
    if (!paramDefn) {
      throw 'paramDefn is required';
    }
    this.paramDefn = paramDefn;
    if (!submitCallback) {
      throw 'submitCallback is required';
    }
    this.submitCallback = submitCallback;
    // Refresh callback is optional to be able to refresh the prompts when a parameter changes
    this.refreshCallback = refreshCallback;

    // Initialize the auto submit setting for this panel from the parameter definition
    this.autoSubmit = paramDefn.allowAutoSubmit();

    this.guid = pentaho.common.prompting.promptGUIDHelper.generateGUID();

    /**
     * Get a localized string for this prompt panel.
     */
    this.getString = function(key, defaultString) {
      return defaultString || '!' + key + '!';
    }

    /**
     * Get the current auto submit setting for this panel.
     */
    this.getAutoSubmitSetting = function() {
      return this.autoSubmit;
    }

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
          var value;
          if ('true' != param.attributes['hidden']) {
            value = Dashboards.getParameterValue(this.getParameterName(param));
          }
          // Empty string is Dashboards' "null"
          if (value !== '' && typeof value != 'undefined' && !$.isArray(value)) {
            value = [value];
          }
          params[param.name] = value;
        }.bind(this));
      }.bind(this));
      return params;
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
    this.createTextFormatter = function(paramDefn, parameter, pattern) {
      return undefined;
    };

    this._widgetGUIDHelper = new GUIDHelper();
    this.generateWidgetGUID = function() {
      return this._widgetGUIDHelper.generateGUID();
    };

    /**
     * Sets the parameter value in Dashboards' parameter map.
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
      Dashboards.setParameter(this.guid + param.name, value);
    };

    /**
     * Called when the prompt panel's submit button is clicked or auto-submit is enabled and a parameter value changes.
     */
    this.submit = function() {
      if (this.submitCallback) {
        this.submitCallback(this);
      }
    };

    /**
     * Called when a parameter value changes.
     */
    this.parameterChanged = function(name, value) {
      this.refreshPrompt();
    };

    /**
     * Called to refresh the prompt panel. This will invoke the refreshCallback to get a new parameter definition.
     * If the new parameter definition is undefined or is the same as the previous no re-initialization is done.
     */
    this.refreshPrompt = function() {
      var newParamDefn;
      try {
        newParamDefn = this.refreshCallback(this);
      } catch (e) {
        alert('Error in refreshCallback'); // TODO Add better error message
        return;
      }
      try {
        var a = JSON.stringify(this.paramDefn);
        var b = JSON.stringify(newParamDefn);
      } catch (e) {
        alert('Error parsing parameter definition'); // TODO Add better error message
        return;
      }
      if (b != undefined && a != b) {
        this.paramDefn = newParamDefn;
        pentaho.common.prompting.removeDashboardComponents(this.components);
        this.init();
      }
    };

    /**
     * Initialize this prompt panel. This will create the components and pass them to CDF to be loaded.
     */
    this.init = function() {
      pentaho.common.prompting.prepareCDF();

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

      this.components = components;

      Dashboards.init(components);
    },

    this.hide = function() {
      $('#' + this.destinationId).css('display', 'none');
    }
  }
}