// Executes button.expression() in the scope of the button component (instead of the button)
var ScopedPentahoButtonComponent = BaseComponent.extend({
  update : function() {
    $("<button type='button' class='pentaho-button'/>").text(this.label).unbind("click").bind("click", this.expression.bind(this)).button().appendTo($("#"+ this.htmlObject).empty());
  }
});

var SubmitPromptComponent = ScopedPentahoButtonComponent.extend({
  autoSubmitParam: 'auto-submit',
  parameter: 'submit',

  enable: function(enabled) {
    var fnName = enabled ? 'removeAttr' : 'attr';
    $('#'+this.htmlObject + ' button')[fnName]('disabled', 'disabled');
  },

  updateAutoSubmit: function(name) {
    setTimeout((function() {
      this.isAutoSubmit = undefined !== $('#' + this.htmlObject + ' input:checked').val();
      Dashboards.update(this);
    }).bind(Dashboards.getComponentByName(name)));
  },

  getValue: function() {
    this.isAutoSubmit = undefined !== $('#'+this.htmlObject + ' input:checked').val();
    return this.isAutoSubmit;
  },

  update: function() {
    this.base();
    // BISERVER-3821 Provide ability to remove Auto-Submit check box from report viewer
    // only show the UI for the autosubmit checkbox if no preference exists
    if (this.paramDefn.autoSubmit == undefined) {
      // var checkboxStr = "<label><input onclick='ToggleButtonBaseComponent.prototype.callAjaxAfterRender(\"" + this.name + "\")'";
      var checkboxStr = '<label><input onclick=\'SubmitPromptComponent.prototype.updateAutoSubmit("' + this.name + '")\'';
      if (this.isAutoSubmit) {
        checkboxStr += ' checked="checked"';
      }
      checkboxStr += ' type="checkbox"/>Auto-Submit</label>';
      $(checkboxStr).appendTo($('#'+ this.htmlObject));
    }
  },

  postExecution: function() {
    this.enable(true);
    Dashboards.fireChange(this.autoSubmitParam, this.isAutoSubmit + '');
    if (this.isAutoSubmit) {
      this.expression();
    }
  },

  expression: function() {
    // Fire a new change for this parameter with a unique value so it can never be ignored
    Dashboards.fireChange(this.parameter, new Date().getTime() + '');
  }
});

var CompositeComponent = BaseComponent.extend({
  components: undefined, // array of components

  getComponents: function() {
    return this.components;
  },

  clear: function() {
    $.each(this.components, function(i, c) {
      c.clear();
    });
    this.base();
  },

  getClassFor: function(component) {
    return undefined;
  },

  getMarkupFor: function(component) {
    var _class = this.getClassFor(component);
    var html = '<div id="' + component.htmlObject + '"';
    if (_class) {
      html += ' class="' + _class + '"';
    }
    html += '></div>';
    return html;
  },

  update: function() {
    var html = '';
    $.each(this.components, function(i, c) {
      html += this.getMarkupFor(c);
    }.bind(this));

    $('#' + this.htmlObject).html(html);
  }
});

/**
 * Base Prompting Component that builds a layout
 */
var PromptLayoutComponent = CompositeComponent.extend({
  executeAtStart: true,

  createSubmitPanel: function(paramDefn, widgets) {
    return pentaho.common.prompting.builders.WidgetBuilder.build({
      paramDefn: paramDefn,
      widgets: widgets
    }, 'submit-panel');
  },

  getParameterPanelType: function() {
    return 'parameter-panel';
  },

  createWidgetForParameter: function(paramDefn, param) {
    if (param.strict && param.values.length === 0) {
      // if the parameter is strict but we have no valid choices for it, it is impossible
      // for the user to give it a value, so we will hide this parameter
      // it is highly likely that the parameter is driven by another parameter which
      // doesn't have a value yet, so eventually, we'll show this parameter.. we hope
      return;
    }
    return pentaho.common.prompting.builders.WidgetBuilder.build({paramDefn: paramDefn, param: param});
  },

  init: function(paramDefn) {
    this.paramDefn = paramDefn;
    // Create a label and a CDF widget for each parameter
    $.each(paramDefn.parameterGroups, function(i, group) {

      $.each(group.parameters, function(i, param) {
        // initialize parameter values regardless of whether we're showing the parameter or not
        pentaho.common.prompting.initializeParameterValue(paramDefn, param);

        if ('true' == param.attributes['hidden']) {
          return; // continue
        }

        var widget = this.createWidgetForParameter(paramDefn, param);
        if (!widget) {
          // No widget created. Do not create a label or parameter panel
          return; // continue
        }
        var label = pentaho.common.prompting.builders.WidgetBuilder.build({paramDefn: paramDefn, param: param}, 'label');

        var panel = pentaho.common.prompting.builders.WidgetBuilder.build({
            paramDefn: paramDefn,
            param: param,
            components: [label, widget]
          }, this.getParameterPanelType());

        this.components.push(panel);
      }.bind(this));
    }.bind(this));

    if (this.components.length > 0) {
      if (paramDefn.subscribe) {
        // TODO Create the schedule prompt
      }
      var submitPanel = this.createSubmitPanel(paramDefn, this.components.slice(0));
      if (submitPanel) {
        this.components.push(submitPanel);
      }
    }

    if (paramDefn.promptNeeded) {
      // TODO Add pagination control
    }
  },

  getClassFor: function(component) {
    if (!component.param) { return; }
    var errors = this.paramDefn.errors[component.param.name];
    // TODO Round out the error prompting. Should probably move this to where we create the components (Panel.init()).
    var classes = 'parameter';
    if (errors && errors.length > 0) {
      classes += ' error';
    }
    return classes;
  },

  update: function() {
    this.base();
    $('#' + this.htmlObject).addClass('prompt-panel');
  }
});

var TableBasedPromptLayoutComponent = PromptLayoutComponent.extend({
  buildComponentCell: function(c) {
    return "<td align='left' align='left' style='vertical-align: top;'><div id='" + c.htmlObject + "'></div></td>";
  },

  getMarkupFor: function(components) {
    throw 'TableBasedPromptLayoutComponent should not be used directly.';
  },

  update: function() {
    if (!this.components) { return; }
    this.base();
    var html = '<table cellspacing="0" cellpadding="0" class="parameter-container" style="width: 100%">';
    html += '<tr><td><div class="parameter-wrapper"><table cellspacing="0" cellpadding="0">';
    // TODO Clean up this layout generation and possibly use CDE to generate it.

    html += this.getMarkupFor(this.components);

    html += '</table></div></td></tr>';

    html += '<tr><td><div class="parameter-submit-panel"><table cellspacing="0" cellpadding="0" class="parameter"><tr>';
    $.each(this.components, function(i, c) {
      if (c.promptType !== 'submit') { return; }
      html += this.buildComponentCell(c);
      html +='</tr>'
    }.bind(this));

    html += '</table></div></td></tr></table>';

    $('#' + this.htmlObject).html(html);
  }
});

var VerticalTableBasedPromptLayoutComponent = TableBasedPromptLayoutComponent.extend({
  getMarkupFor: function(components) {
    var html = '';
    $.each(this.components, function(i, c) {
      if (c.promptType === 'submit') { return; }
      var _class = this.getClassFor(c);
      // Assume components are contained in panels of components
      html += '<tr><td><div id="' + c.htmlObject + '"';
      if(_class) {
        html += ' class="' + _class + '"';
      }
      html += '></div></td></tr>';
    }.bind(this));
    return html;
  }
});

var HorizontalTableBasedPromptLayoutComponent = TableBasedPromptLayoutComponent.extend({
  getMarkupFor: function(components) {
    var html = '<tr>';
    $.each(this.components, function(i, c) {
      if (c.promptType === 'submit') { return; }
      var _class = this.getClassFor(c);
      // Assume components are contained in panels of components
      html += '<td align="left" style="vertical-align: top;"><div id="' + c.htmlObject + '"';
      if(_class) {
        html += ' class="' + _class + '"';
      }
      html += '></div></td>';
    }.bind(this));
    return html + '</tr>';
  }
});

var FlowPromptLayoutComponent = PromptLayoutComponent.extend({
  update: function() {
    this.base();
    $('#' + this.htmlObject).addClass('flow');
  }
});


var PanelComponent = CompositeComponent.extend({
  getClassFor: function(component) {
    return undefined;
  },

  getMarkupFor: function(component) {
    var _class = this.getClassFor(component);
    var html = '<div id="' + component.htmlObject + '"';
    if (_class) {
      html += ' class="' + _class + '"';
    }
    html += '></div>';
    return html;
  }
});

var ParameterPanelComponent = PanelComponent.extend({
  getClassFor: function(component) {
    if (component.promptType === 'label') {
      return 'parameter-label';
    }
  }
});

var RefreshPromptComponent = BaseComponent.extend({
  update: function() {
    // if (Dashboards.isInitializing) {
    //   console.log('Ignoring update during initialization');
    //   return;
    // }
    // Stop listening
    // this.listeners = [];
    var newParamDefn;
    try {
      newParamDefn = this.args['refreshParamDefnCallback'].call(this);
    } catch (e) {
      alert('Error in refreshParamDefnCallback'); // TODO Add better error message
    }
    try {
      var a = JSON.stringify(this.args.paramDefn);
      var b = JSON.stringify(newParamDefn);
    } catch (e) {
      alert('Error parsing parameter definition'); // TODO Add better error message
    }
    if (b != undefined && a != b) {
      this.args.paramDefn = newParamDefn;
      pentaho.common.prompting.removeDashboardComponents(this.layoutComponent.components.concat([this, this.layoutComponent]));
      pentaho.common.prompting.removeDashboardComponents(this.args['extraComponents']);
      pentaho.common.prompting.createPromptPanel(this.args);
    }
  }
});

var RVDateInputComponent = DateInputComponent.extend({
  update: function() {
    this.base();
    var picker = $('#' + this.name);
    picker.datepicker('option', 'autoSize', true); // Automatically resize field to accomodate date format
    picker.val(Dashboards.getParameterValue(this.parameter));
  },

  getValue: function() {
    var picker = $('#' + this.name);
    return picker.val();
  }
});

var StaticAutocompleteBoxComponent = BaseComponent.extend({
  update: function() {
    // Prepare label-value map
    if (this.labelValueMap === undefined) {
      this.labelValueMap = {};
      $.each(this.valuesArray, function(i, item) {
        this.labelValueMap[item.label] = item.value;
      }.bind(this));
    }

    var ph = $('#' + this.htmlObject);
    ph.empty();

    var html = '<input type="text" id="' + this.htmlObject + '-input"'
    if(this.parameter) {
      var initialValue;
      $.each(this.param.values, function(i, v) {
        if (v.selected) {
          initialValue = this.formatter ? this.formatter.format(v.label) : v.label;
        }
      }.bind(this));

      if (initialValue !== undefined) {
        html += ' value="' + initialValue + '"';
      }
    }
    html += '></input>';
    ph.html(html);

    var input = $('input', ph);
    input.autocomplete({
      delay: 0,
      // Filter by starts-with instead of a global match
      source: function( request, response ) {
        var term = request.term.toUpperCase();
        var matches = $.map( this.valuesArray, function(tag) {
          if ( tag.label.toUpperCase().indexOf(term) === 0 ) {
            return tag;
          }
        });
        response(matches);
      }.bind(this),
      // change() is called on blur
      change: function(event, ui) {
        Dashboards.processChange(this.name);
      }.bind(this),
      // select() is called when an item from the menu is selected
      select: function(event, ui) {
        $('#' + this.htmlObject + '-input').val(ui.item.value);
        Dashboards.processChange(this.name);
      }.bind(this)
    });
    // Fire a change any time the user presses enter on the field
    input.keypress(function(e) {
      if (e.which === 13) {
        Dashboards.processChange(this.name);
      }
    }.bind(this));
  },

  getValue: function() {
    var val = $('#' + this.htmlObject + '-input').val();
    if (this.param.list) {
      // Return key for value or the value if not found
      return this.labelValueMap[val] || val;
    } else if (this.formatter) {
      return this.formatter.parse(val);
    } else {
      return val;
    }
  }
});

var TextAreaComponent = BaseComponent.extend({
  update: function() {
    var value = Dashboards.getParameterValue(this.parameter);
    var html = '<textarea id="' + this.htmlObject + '-input">';
    if (value != undefined) {
      html += Dashboards.escapeHtml(value);
    }
    html += '</textarea>';
    $('#' + this.htmlObject).html(html);
    var input = $('#' + this.htmlObject + '-input');
    input.change(function() {
      Dashboards.processChange(this.name);
    }.bind(this));
    input.keypress(function(e) {
      if (e.which === 13) {
        Dashboards.processChange(this.name);
      }
    }.bind(this));
  },

  getValue: function() {
    var val = $('#' + this.htmlObject + '-input').val();
    if (this.formatter) {
      return this.formatter.parse(val);
    } else {
      return val;
    }
  }
});