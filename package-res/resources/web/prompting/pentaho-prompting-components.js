pen.define(['common-ui/prompting/pentaho-prompting-bind', 'common-ui/prompting/pentaho-prompting-builders', 'cdf/cdf-module'], function() {
  // Executes button.expression() in the scope of the button component (instead of the button)
  window.ScopedPentahoButtonComponent = BaseComponent.extend({
    viewReportButtonRegistered: false,

    update : function() {
      this.registerSubmitClickEvent();
    },

    // Registers the click event for the parameter 'View Report' button
    // to invoke panel's submit to update report
    registerSubmitClickEvent: function() {
      if (!this.viewReportButtonRegistered) {

        var $container = $("#" + this.htmlObject)
          .empty();

        $("<button type='button' class='pentaho-button'/>")
          .text(this.label)
          .bind("mousedown", this.expressionStart.bind(this))
          .bind("click", function(){
            // Don't let click-event go as first argument.
            this.expression(false);
           }.bind(this))
          .button()
          .appendTo($container);

        this.viewReportButtonRegistered = true;
      }
    },

    expressionStart: function(){}
  });

  window.SubmitPromptComponent = ScopedPentahoButtonComponent.extend({
    update: function() {

      this.base();

      var promptPanel = this.promptPanel;

      // BISERVER-3821 Provide ability to remove Auto-Submit check box from report viewer
      // only show the UI for the auto-submit check-box if no preference exists
      // TODO: true/false is irrelevant?
      if (this.paramDefn.autoSubmit == undefined) {
        var checkboxStr = '<label class="auto-complete-checkbox">' +
                            '<input type="checkbox"' +
                              (promptPanel.autoSubmit ? ' checked="checked"' : '') +
                            ' />' +
                            this.autoSubmitLabel +
                          '</label>';

        $(checkboxStr)
          .appendTo($('#' + this.htmlObject))
          .bind('click', function(ev) { promptPanel.autoSubmit = ev.target.checked; });
      }

      // BISERVER-6915 Should not request pagination when auto-submit is set to false
      if (promptPanel.forceAutoSubmit || promptPanel.autoSubmit) {
        this.expression(/*isInit*/true);
      }
    },

    expression: function(isInit) {
      this.promptPanel._submit({isInit: isInit});
    },

    expressionStart: function() {
      this.promptPanel._submitStart();
    }
  });

  /**
   * This is a component that contains other components and can optionally wrap all components in a
   * &lt;fieldset&gt; to provide a title for the container.
   */
  window.CompositeComponent = BaseComponent.extend({
    components: undefined, // array of components

    executeAtStart: true,

    getComponents: function() {
      return this.components;
    },

    clear: function() {
      if(this.components){
        $.each(this.components, function(i, c) {
          c.clear();
        });
      }
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
   * Pre-order traversal of a component and its descendants.
   */
  window.CompositeComponent.mapComponents = function(c, f, x) {
      f.call(x, c);
      if (c.components) { window.CompositeComponent.mapComponentsList(c.components, f, x); }
      return c;
  };
  
  /**
   * Pre-order traversal of components given a list of root components.
   */
  window.CompositeComponent.mapComponentsList = function(comps, f, x) {
    var me = this;
    $.each(comps, function(i, c) { me.mapComponents(c, f, x); });
    return me;
  };
  
  /**
   * Base Prompting Component that builds a layout
   */
  window.PromptLayoutComponent = CompositeComponent.extend({
    getClassFor: function(component) {
      if (!component.param) { return; }
      return 'parameter' + (component.cssClass ? ' ' + component.cssClass : '');
    }
  });

  window.TableBasedPromptLayoutComponent = PromptLayoutComponent.extend({
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

  window.VerticalTableBasedPromptLayoutComponent = TableBasedPromptLayoutComponent.extend({
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

  window.HorizontalTableBasedPromptLayoutComponent = TableBasedPromptLayoutComponent.extend({
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

  window.FlowPromptLayoutComponent = PromptLayoutComponent.extend({
    update: function() {
      $('#' + this.htmlObject).addClass('flow');
      this.base();
    }
  });

  window.ScrollingPromptPanelLayoutComponent = PromptLayoutComponent.extend({
    update: function() {
      if(this.components){
        if (this.components.length == 0) {
          $('#' + this.htmlObject).empty();
          return;
        }
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
    }
  });

  window.PanelComponent = CompositeComponent.extend({
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

  window.ParameterPanelComponent = PanelComponent.extend({
    getClassFor: function(component) {
      if (component.promptType === 'label') {
        return 'parameter-label';
      }
    }
  });

  window.ExternalInputComponent = BaseComponent.extend({
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

      dojo.require("pentaho.common.TextButtonCombo");
      var parameterValue = Dashboards.getParameterValue(this.parameter);

      var container = $('#' + this.htmlObject)
        .empty();

      var textInputComboId = this.htmlObject + '-textButtonCombo';
      var textInputComboElement = '<div id="' + textInputComboId + '"></div>';
      container.append(textInputComboElement);
      var textInputCombo = new pentaho.common.TextButtonCombo({}, textInputComboId);
      textInputCombo.set('textPlaceHolder', 'file path...');
      textInputCombo.set('value', parameterValue); // set initial value

      // get button label
      var buttonLabel = this.param.attributes['button-label'];
      if(buttonLabel != null && buttonLabel != ''){
        textInputCombo.set('buttonLabel', buttonLabel);
      }

      // override onClickCallback
      textInputCombo.onClickCallback = dojo.hitch(this, function(currentValue){
        try{
          var c = Dashboards.getComponentByName(this.name);
          var resultCallback = function(externalValue){
            textInputCombo.set('text', externalValue);
            Dashboards.processChange(this.name);
          };
          c.param.values = [currentValue]; // insert current value
          c.promptPanel.getExternalValueForParam(c.param, resultCallback); // request new value from prompt panel
        } catch(error) {
          if(typeof console !== 'undefined' && console.error) { console.error(error); }
        }
      });
      this.dijitId = textInputComboId;

      // override onChangeCallback
      textInputCombo.onChangeCallback = dojo.hitch(this, function(newValue){
        Dashboards.processChange(this.name);
      });
    },

    getValue: function() {
      return dijit.byId(this.dijitId).get('value');
    }
  });

  window.DojoDateTextBoxComponent = BaseComponent.extend({
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

      this._doAutoFocus();
    },

    getValue: function() {
      var date = dijit.byId(this.dijitId).get('value');
      return this.transportFormatter.format(date);
    }
  });

  window.StaticAutocompleteBoxComponent = BaseComponent.extend({
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
        source: function( request, response ) {
          var term = request.term.toUpperCase();
          var matches = $.map( this.valuesArray, function(tag) {
            if ( tag.label.toUpperCase().indexOf(term) >= 0 ) { // PRD-3745
              return tag;
            }
          });
          response(matches);
        }.bind(this),

        // change() is called on blur
        //change: function(event, ui) {
        // blur wasn't good enough.
        // clicking on the submit button without previously moving out of the text component
        // doesn't trigger blur on time, because jQuery.autocomplete fires changing on a setTimeout,
        // Causing the click to be processed before the change.
        // We now use the jQuery ui focusout event on the input.
        //}.bind(this),

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

      var _inValue;
      input.focus(function() {
        _inValue = this.getValue();
      }.bind(this));

      input.focusout(function() {
      if(_inValue !== this.getValue()) {
          Dashboards.processChange(this.name);
        }
      }.bind(this));

      this._doAutoFocus();
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

  window.TextAreaComponent = BaseComponent.extend({
    update: function() {
      var value = Dashboards.getParameterValue(this.parameter);
      var html = '<textarea id="' + this.htmlObject + '-input">';
      if (value != undefined) {
        html += Dashboards.escapeHtml(value);
      }
      html += '</textarea>';
      $('#' + this.htmlObject).html(html);
      var input = $('#' + this.htmlObject + '-input');
      //change() is called on blur
      input.change(function() {
        // blur wasn't good enough. clicking of the submit button without clicking out of the text component
        // doesn't trigger blur. so modified text fields can have a stale value.
        // we now use the jQuery ui focusout event on the input.
      }.bind(this));
      input.keypress(function(e) {
        if (e.which === 13) {
          Dashboards.processChange(this.name);
        }
      }.bind(this));

      input.focusout(function() {
        Dashboards.processChange(this.name);
      }.bind(this));

      this._doAutoFocus();
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
});
