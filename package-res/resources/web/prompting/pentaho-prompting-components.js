// Executes button.expression() in the scope of the button component (instead of the button)
var ScopedPentahoButtonComponent = BaseComponent.extend({
  update : function() {
    $("<button type='button' class='pentaho-button'/>").text(this.label).unbind("click").bind("click", this.expression.bind(this)).button().appendTo($("#"+ this.htmlObject).empty());
  }
});

var SubmitPromptComponent = ScopedPentahoButtonComponent.extend({
  updateAutoSubmit: function(name) {
    var c = Dashboards.getComponentByName(name);
    c.promptPanel.autoSubmit = undefined !== $('#' + c.htmlObject + ' input:checked').val();
    Dashboards.update(c);
  },

  update: function() {
    this.base();
    // BISERVER-3821 Provide ability to remove Auto-Submit check box from report viewer
    // only show the UI for the autosubmit checkbox if no preference exists
    if (this.paramDefn.autoSubmit == undefined) {
      var checkboxStr = '<label class="auto-complete-checkbox"><input onclick=\'SubmitPromptComponent.prototype.updateAutoSubmit("' + this.name + '")\'';
      if (this.promptPanel.autoSubmit) {
        checkboxStr += ' checked="checked"';
      }
      checkboxStr += ' type="checkbox"/>' + this.autoSubmitLabel + '</label>';
      $(checkboxStr).appendTo($('#'+ this.htmlObject));
    }
    if (this.promptPanel.autoSubmit) {
      this.expression();
    }
  },

  expression: function() {
    this.promptPanel._submit();
  }
});

/**
 * This is a component that contains other components and can optionally wrap all components in a
 * <fieldset> to provide a title for the container.
 */
var CompositeComponent = BaseComponent.extend({
  components: undefined, // array of components

  executeAtStart: true,

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
    return component.cssClass;
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

    if (this.label !== undefined) {
      html += '<fieldset>';
      if (this.label.length > 0) {
        html += '<legend>' + Dashboards.escapeHtml(this.label) + '</legend>';
      }
      html += '<div>';
    }

    if (this.components && this.components.length > 0) {
      html += this.updateInternal();
    }

    if (this.label !== undefined) {
      html += '</div></fieldset>';
    }

    $('#' + this.htmlObject).html(html);

    if (this.cssClass) {
      $('#' + this.htmlObject).addClass(this.cssClass);
    }
  },

  updateInternal: function() {
    var html = '';
    $.each(this.components, function(i, c) {
      html += this.getMarkupFor(c);
    }.bind(this));
    return html;
  }
});

/**
 * Base Prompting Component that builds a layout
 */
var PromptLayoutComponent = CompositeComponent.extend({

  getClassFor: function(component) {
    if (!component.param) { return; }
    return (component.cssClass || '') + ' parameter';
  },

  update: function() {
    this.base();
  }
});

var TableBasedPromptLayoutComponent = PromptLayoutComponent.extend({
  buildComponentCell: function(c) {
    return "<td align='left' style='vertical-align: top;'><div id='" + c.htmlObject + "'></div></td>";
  },

  getMarkupFor: function(components) {
    throw 'TableBasedPromptLayoutComponent should not be used directly.';
  },

  updateInternal: function() {
    var html = '<table cellspacing="0" cellpadding="0" class="parameter-container" style="width: 100%;">';
    html += '<tr><td><div><table cellspacing="0" cellpadding="0">';

    html += this.getMarkupFor(this.components);

    return html + '</table></div></td></tr></table>';
  }
});

var VerticalTableBasedPromptLayoutComponent = TableBasedPromptLayoutComponent.extend({
  getMarkupFor: function(components) {
    var html = '';
    $.each(components, function(i, c) {
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
    $.each(components, function(i, c) {
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
    $('#' + this.htmlObject).addClass('flow');
    this.base();
  }
});

var ScrollingPromptPanelLayoutComponent = PromptLayoutComponent.extend({
  update: function() {
    var html = '<div class="prompt-panel">';
    var submitHtml = '<div class="submit-panel">';
    $.each(this.components, function(i, c) {
      if (c.promptType === 'submit') {
        submitHtml += this.getMarkupFor(c);
      } else {
        html += this.getMarkupFor(c);
      }
    }.bind(this));
    html += '</div>' + submitHtml + '</div>';
    $('#' + this.htmlObject).html(html);
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

var DojoDateTextBoxComponent = BaseComponent.extend({
  clear: function() {
    if (this.dijitId) {
      if (this.onChangeHandle) {
        dojo.disconnect(this.onChangeHandle);
      }
      dijit.byId(this.dijitId).destroyRecursive();
      delete this.dijitId;
    }
  },
  update: function() {
    dojo.require("pentaho.common.Calendar");
    dojo.require("pentaho.common.DateTextBox");
    var value = this.transportFormatter.parse(Dashboards.getParameterValue(this.parameter));
    this.dijitId = this.htmlObject + '_input';
    var input = $('#' + this.htmlObject).html($('<input/>').attr('id', this.dijitId));
    var dateTextBox = new pentaho.common.DateTextBox({
      name: this.name,
      constraints: {
        datePattern: this.param.attributes['data-format'],
        selector: 'date',
        formatLength: 'medium' // Used if datePattern is not defined, locale specific
      }
    }, this.dijitId);

    dateTextBox.set('value', value, false);
    this.onChangeHandle = dojo.connect(dateTextBox, "onChange", function() {
      Dashboards.processChange(this.name);
    }.bind(this));
  },

  getValue: function() {
    var date = dijit.byId(this.dijitId).get('value');
    return this.transportFormatter.format(date);
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
          initialValue = this.formatter ? this.formatter.format(this.transportFormatter.parse(v.label)) : v.label;
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
      return this.transportFormatter.format(this.formatter.parse(val));
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
      return this.transportFormatter.format(this.formatter.parse(val));
    } else {
      return val;
    }
  }
});