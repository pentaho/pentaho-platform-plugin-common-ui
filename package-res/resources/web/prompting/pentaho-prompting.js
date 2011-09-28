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

// Borrowed from Dashboards, modified to prevent clobbering of existing WidgetHelper GUID methods/collections.
var WidgetHelper = WidgetHelper || {};
WidgetHelper.assignedGUIDs = WidgetHelper.assignedGUIDs || {};
WidgetHelper.generateGUID = WidgetHelper.generateGUID || function(){
  var gen = function(){ return Math.round(Math.random() * 100000);};
  var guid = gen();
  while(WidgetHelper.assignedGUIDs[guid]){
    guid = gen();
  }
  WidgetHelper.assignedGUIDs[guid] = true;
  return '' + guid;
}

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

      getParameterValues: function() {
        var params = {};
        $.each(this.parameterGroups, function(i, group) {
          $.each(group.parameters, function(j, param) {
            var value;
            if ('true' != param.attributes['hidden']) {
              value = Dashboards.getParameterValue(param.name);
            }
            if (value !== null && typeof value != 'undefined' && !$.isArray(value)) {
              value = [value];
            }
            params[param.name] = value;
          });
        });
        return params;
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
      'group': undefined, // string
      'type': undefined, // string, java class name
      'list': undefined, // boolean
      'hidden': undefined, // boolean
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

  parseParameterDefinition: function(xmlString) {
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

    paramDefn.autoSubmitUI = true == parameters.attr('autoSubmitUI');

    this.parseParameters(paramDefn, parameters);
    this.parseErrors(paramDefn, xml);

    return paramDefn;
  },

  parseParameters: function(paramDefn, parametersNode) {
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
  },

  parseParameter: function(node) {
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

    param.values = this.parseParameterXmlValues(node, param);
    return param;
  },

  parseParameterXmlValues: function(paramNode, parameter) {
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
  },

  normalizeParameterValue: function(parameter, type, value) {
    if (value == null || type == null) {
      return null;
    }

    // Strip out actual type from Java array types
    var m = type.match('^\\[L([^;]+);$');
    if (m != null && m.length === 2) {
      type = m[1];
    }

    switch(type) {
      case 'java.util.Date':
      case 'java.sql.Date':
      case 'java.sql.Time':
      case 'java.sql.Timestamp':
        var timezone = parameter.attributes['timezone'];
        var timezoneHint = parameter.timezoneHint;
        if (timezone == null || timezone == 'server') {
          // TODO Determine new timezone hint
          // This is required by the GWT datepicker UI. Verify how the CDF datepicker works.
          return value;
        }

        if(timezone == 'client') {
          return value;
        }

        // for every other mode (fixed timezone modes), translate the time into the specified timezone
        if ((timezoneHint != undefined && $.trim(timezoneHint).length != 0)
         && value.match(timezoneHint + '$'))
        {
          return value;
        }
        // TODO Implement timezone offset conversion
        // return convertTimestampToTimeZone(value, getTimezoneOffset(timezone));
    }

    return value;
  },

  parseErrors: function(paramDefn, xmlRoot) {
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
  },

  /**
   * @param paramDefnCallback: Function expected to return a parameter definition object
   */
  createRefreshPromptComponent: function(args, layoutComponent) {
    return new pentaho.common.prompting.builders.RefreshPromptBuilder().build({
      layoutComponent: layoutComponent,
      listeners: this.gatherParameterNames(layoutComponent.components),
      args: Dashboards.clone(args)
    });
  },

  gatherParameterNames: function(components) {
    var params = [];
    $.each(components, function(i, c) {
      if (typeof c.getParameters === 'function') {
        params = params.concat(this.gatherParameterNames(c.getParameters()));
      } else if (c.components) {
        params = params.concat(this.gatherParameterNames(c.components));
      } else {
        params.push(c.parameter);
      }
    }.bind(this));
    return params;
  },

  prepareCDF: function() {
    if (this.prepared) { return; }
    Dashboards.setGlobalContext(false);

    var fireChange = Dashboards.fireChange;
    Dashboards.fireChange = function(param, value) {
      if (Dashboards.getParameterValue(param) === value) {
        console.log('Ignoring parameter value change: [' + param + ', ' + value + ']');
        return;
      }
      console.log('parameter changed: [' + param + ', ' + value + '] from [' + Dashboards.getParameterValue(param) + ']');
      fireChange.call(Dashboards, param, value);
    };

    var init = Dashboards.init;
    Dashboards.init = function() {
      Dashboards.isInitializing = true;
      try {
        init.apply(Dashboards, arguments);
      } finally{
        setTimeout(function() {
          Dashboards.isInitializing = false;
        }, Dashboards.renderDelay);
      }
    }.bind(Dashboards);

    var setParameter = Dashboards.setParameter;
    Dashboards.setParameter = function(name, value) {
        console.log('Setting ' + name + ' = ' + value);
        setParameter.call(Dashboards, name, value);
    }

    this.prepared = true;
  },

  /**
   * Sets the parameter value in Dashboards' parameter map and performs any conversion necessary.
   */
  initializeParameterValue: function(param) {
    var value = [];
    $.each(param.values, function(i, v) {
      if (v.selected) {
        value.push(v.value);
      }
    });
    if (value.length === 0) {
      value = null;
    } else if (value.length === 1) {
      value = value[0];
    }
    Dashboards.setParameter(param.name, value);
  },

  createPromptPanel: function(args) {
    this.prepareCDF();

    // params = params.splice(0, 1); // Temporary to remove the output-type from our sample Parameters XML

    var layout = this.builders.WidgetBuilder.build(args, 'prompt-panel');

    // TODO Move this to a map so we can support multiple prompt panels within the same page
    // Example: paramDefns = { <unique prompt group id>: paramDefn, <another prompt group id>: anotherParamDefn };
    this.paramDefn = args['paramDefn'];

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

    if (args['extraComponents']) {
        $.each(args['extraComponents'], function(i, c) {
            if (!c.name) {
                c.name = c.type + WidgetHelper.generateGUID();
            }
            components.push(c);
        })
    }

    // Create refresh prompt component last so it is the last to receive change events
    if ($.isFunction(args['refreshParamDefnCallback'])) {
        components.push(this.createRefreshPromptComponent(args, layout));
    }

    Dashboards.init(components);
  }
}