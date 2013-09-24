/**

To create a widget:
var widget = pentaho.common.prompting.builders.WidgetBuilder.build(arguments);

where arguments generally contain:

{
  promptPanel: ...,
  param: the parameter this widget is created for
}

Widget Definition Structure:
{
  promptPanel: the prompt panel this widget belongs to
  promptType: ['prompt', 'submit', 'label'], Used to distinguish types of widgets
  param: The parameter this widget was created for
  name: unique name of widget, usually: param['name'] + GUID
  htmlObject: name of object to inject this widget at
  type: CDF Component type

  *All other properties are subject of the widget type*
}

*/

pen.define(['cdf/cdf-module', 'common-ui/prompting/pentaho-prompting-bind'], function() {
  // TODO Refactor so we're not using global objects. This requires an
  // update to doc for any custom components in addition to code here
  // and anywhere else prompting is used.
  pentaho = typeof pentaho == "undefined" ? {} : pentaho;
  pentaho.common = pentaho.common || {};
  pentaho.common.prompting = pentaho.common.prompting || {};
  pentaho.common.prompting.builders = pentaho.common.prompting.builders || {};

  pentaho.common.prompting.builders.PromptPanelBuilder = Base.extend({
    build: function(promptPanel) {
      var name = 'prompt' + promptPanel.guid;
      var layout = {
        name: name,
        type: 'ScrollingPromptPanelLayoutComponent',
        htmlObject:  promptPanel.destinationId,
        promptPanel: promptPanel,
        components:  promptPanel.buildPanelComponents(),
        postExecution: function() {
          promptPanel._ready();
        }
      };
      return layout;
    }
  });

  pentaho.common.prompting.builders.WidgetBuilder = {
    mapping: {
      'prompt-panel': 'pentaho.common.prompting.builders.PromptPanelBuilder',
      'group-panel': 'pentaho.common.prompting.builders.ParameterGroupPanelBuilder',
      'parameter-panel': 'pentaho.common.prompting.builders.ParameterPanelBuilder',
      'submit-panel': 'pentaho.common.prompting.builders.SubmitPanelBuilder',
      'submit': 'pentaho.common.prompting.builders.SubmitComponentBuilder',
      'label': 'pentaho.common.prompting.builders.LabelBuilder',
      'error-label': 'pentaho.common.prompting.builders.ErrorLabelBuilder',
      'dropdown': 'pentaho.common.prompting.builders.DropDownBuilder',
      'radio': 'pentaho.common.prompting.builders.RadioBuilder',
      'checkbox': 'pentaho.common.prompting.builders.CheckBuilder',
      'togglebutton': 'pentaho.common.prompting.builders.MultiButtonBuilder',
      'list': 'pentaho.common.prompting.builders.ListBuilder',
      'datepicker': 'pentaho.common.prompting.builders.DateInputBuilder',
      'filebrowser': 'pentaho.common.prompting.builders.ExternalInputBuilder',
      'external-input': 'pentaho.common.prompting.builders.ExternalInputBuilder',
      'multi-line': 'pentaho.common.prompting.builders.TextAreaBuilder',
      'gc': 'pentaho.common.prompting.builders.GarbageCollectorBuilder',
      'default': 'pentaho.common.prompting.builders.PlainPromptBuilder'
    },

    cache: {}, // Cache of created builders

    findBuilderFor: function(args, type) {
      type = type || (args.param && args.param.attributes ? args.param.attributes['parameter-render-type'] : null);
      return this.createBuilder(this.mapping[type] || this.mapping['default']);
    },

    createBuilder: function(name) {
      var builder = this.cache[name];
      if (!builder) {
        try {
          builder = eval('new ' + name + '()');
          this.cache[name] = builder;
        } catch (e) {
          if(typeof console !== 'undefined' && console.log) { console.log('Unable to create widget builder of type "' + name + '"'); }
          throw e;
        }
      }
      return builder;
    },

    build: function(args, typeOverride) {
      var widget = this.findBuilderFor(args, typeOverride).build(args);
      if (widget.parameter && widget.param) {
        widget.postChange = function() {
          args.promptPanel.parameterChanged(this.param, this.parameter, this.getValue());
        }.bind(widget);
      }
      return widget;
    }
  };

  pentaho.common.prompting.builders.SubmitPanelBuilder = Base.extend({
    build: function(args) {
      var guid = args.promptPanel.generateWidgetGUID();

      return {
        type: 'FlowPromptLayoutComponent',
        promptType: 'submit',
        name: guid,
        htmlObject: guid,
        executeAtStart: true,
        components: [
          pentaho.common.prompting.builders.WidgetBuilder.build(args, 'submit')
        ]
      }
    }
  });

  pentaho.common.prompting.builders.SubmitComponentBuilder = Base.extend({
    build: function(args) {
      var guid = args.promptPanel.generateWidgetGUID();
      return {
        promptType: 'submit',
        type: 'SubmitPromptComponent',
        name: guid,
        htmlObject: guid,
        label: args.promptPanel.getString('submitButtonLabel', 'Submit'),
        autoSubmitLabel: args.promptPanel.getString('autoSubmitLabel', 'Auto-Submit'),
        promptPanel: args.promptPanel,
        paramDefn: args.promptPanel.paramDefn,
        executeAtStart: true
      };
    }
  });

  pentaho.common.prompting.builders.ParameterWidgetBuilderBase = Base.extend({
    build: function(args) {
      var guid = args.promptPanel.generateWidgetGUID();
      return {
        promptType: 'prompt',
        executeAtStart: true,
        param: args.param,
        name: guid,
        htmlObject: guid,
        type: undefined, // must be declared in extension class
        parameter: args.promptPanel.getParameterName(args.param),
        postExecution: function() {
          this.base();
          var tooltip = this.param.attributes['tooltip'];
          if (tooltip) {
            $('#' + this.htmlObject).attr('title', tooltip);
          }
        }
      }
    }
  });

  pentaho.common.prompting.builders.LabelBuilder = pentaho.common.prompting.builders.ParameterWidgetBuilderBase.extend({
    build: function(args) {
      var widget = this.base(args);
      var name = widget.name + '-label';
      var label = Dashboards.escapeHtml(args.param.attributes['label'] || args.param.name);
      $.extend(widget, {
        promptType: 'label',
        name: name,
        htmlObject: name,
        type: 'TextComponent',
        expression: function() { return label; }
      });
      delete widget.parameter; // labels don't have parameters
      return widget;
    }
  });

  pentaho.common.prompting.builders.ErrorLabelBuilder = pentaho.common.prompting.builders.LabelBuilder.extend({
    build: function(args) {
      var widget = this.base(args);
      var label = args.errorMessage;
      widget.isErrorIndicator = true;
      widget.expression = function() { return label; };
      return widget;
    }
  });

  pentaho.common.prompting.builders.TextInputBuilder = pentaho.common.prompting.builders.ParameterWidgetBuilderBase.extend({
    build: function(args) {
      var widget = this.base(args);
      return $.extend(widget, {
        type: 'TextInputComponent'
      });
    }
  });

  pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder = pentaho.common.prompting.builders.ParameterWidgetBuilderBase.extend({
    getCDFValuesArray: function(param) {
      var valuesArray = [];
      $.each(param.values, function(i, val) {
        valuesArray.push([val.value, val.label]);
      });
      return valuesArray;
    },

    build: function(args) {
      var widget = this.base(args);
      return $.extend(widget, {
        valueAsId: false,
        valuesArray: this.getCDFValuesArray(args.param)
      });
    }
  });

  pentaho.common.prompting.builders.DropDownBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
    build: function(args) {
      var widget = this.base(args);

      if (args.promptPanel.paramDefn.ignoreBiServer5538 && !args.param.hasSelection()) {
        // If there is no empty selection, and no value is selected, create one. This way, we can represent
        // the unselected state.
        widget.valuesArray = [['', '']].concat(widget.valuesArray);
      }

      return $.extend(widget, {
        type: 'SelectComponent',
        preExecution: function() {
          // SelectComponent defines defaultIfEmpty = true for non-multi selects.
          // We can't override any properties of the component so we must set them just before update() is called. :(
          // Only select the first item if we have no selection and are not ignoring BISERVER-5538
          this.defaultIfEmpty = !args.promptPanel.paramDefn.ignoreBiServer5538 && !args.param.hasSelection();
        }
      });
    }
  });

  pentaho.common.prompting.builders.ListBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
    build: function(args) {
      var widget = this.base(args);
      return $.extend(widget, {
        type: args.param.multiSelect ? 'SelectMultiComponent' : 'SelectComponent',
        size: args.param.attributes['parameter-visible-items'] || 5,
        changeMode: args.param.multiSelect ? 'timeout-focus' : 'immediate',  // PRD-3687
        preExecution: function() {
          // SelectComponent defines defaultIfEmpty = true for non-multi selects.
          // We can't override any properties of the component so we must set them just before update() is called. :(
          this.defaultIfEmpty = false;
        }
      });
    }
  });

  pentaho.common.prompting.builders.MultiButtonBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
    build: function(args) {
      var widget = this.base(args);
      return $.extend(widget, {
        type: 'MultiButtonComponent',
        isMultiple: args.param.multiSelect,
        verticalOrientation: 'vertical' === args.param.attributes['parameter-layout'],
        expression: function() {
          return Dashboards.getParameterValue(this.parameter);
        },
        postExecution: function() {
          $('#' + this.htmlObject).addClass('pentaho-toggle-button-container');
        }
      });
    }
  });

  pentaho.common.prompting.builders.ToggleButtonBaseBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
    build: function(args) {
      var widget = this.base(args);
      return $.extend(widget, {
        defaultIfEmpty: false, // Do not auto-select anything if no selection exists
        verticalOrientation: 'vertical' == args.param.attributes['parameter-layout']
      });
    }
  });

  pentaho.common.prompting.builders.CheckBuilder = pentaho.common.prompting.builders.ToggleButtonBaseBuilder.extend({
    build: function(args) {
      var widget = this.base(args);
      widget.type = 'CheckComponent';
      return widget;
    }
  });

  pentaho.common.prompting.builders.RadioBuilder = pentaho.common.prompting.builders.ToggleButtonBaseBuilder.extend({
    build: function(args) {
      var widget = this.base(args);
      widget.type = 'radio'; // Specifically 'radio' instead of 'RadioComponent' because the CoreComponent.js implementation requires it.
      return widget;
    }
  });

  pentaho.common.prompting.builders.ExternalInputBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
    build: function(args) {
      var formatter = args.promptPanel.createFormatter(args.promptPanel.paramDefn, args.param);

      return $.extend(this.base(args), {
        type: 'ExternalInputComponent',
        transportFormatter: args.promptPanel.createDataTransportFormatter(args.promptPanel.paramDefn, args.param, formatter),
        formatter: formatter,
        promptPanel: args.promptPanel,
        paramDefn: args.promptPanel.paramDefn
      });
    }
  });

  pentaho.common.prompting.builders.DateInputBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
    build: function(args) {
      var formatter = args.promptPanel.createFormatter(args.promptPanel.paramDefn, args.param);

      return $.extend(this.base(args), {
        type: 'DojoDateTextBoxComponent',
        transportFormatter: args.promptPanel.createDataTransportFormatter(args.promptPanel.paramDefn, args.param, formatter),
        formatter: formatter
      });
    }
  });

  pentaho.common.prompting.builders.ParameterGroupPanelBuilder = Base.extend({
    lookupPromptType: function(paramDefn) {
      switch(paramDefn.layout) {
        case 'horizontal':
          return 'HorizontalTableBasedPromptLayoutComponent';
        case 'flow':
          return 'FlowPromptLayoutComponent';
        default:
          return 'VerticalTableBasedPromptLayoutComponent';
      }
    },

    build: function(args) {
      var guid = args.promptPanel.generateWidgetGUID();
      var label = undefined;

      return {
        type: this.lookupPromptType(args.promptPanel.paramDefn),
        name: args.paramGroup.name,
        htmlObject: guid,
        promptPanel: args.promptPanel,
        label: label,
        components: args.components,
        cssClass: 'parameter-wrapper'
      };
    }
  });

  pentaho.common.prompting.builders.ParameterPanelBuilder = pentaho.common.prompting.builders.ParameterWidgetBuilderBase.extend({
    build: function(args) {
      var widget = this.base(args);
      var name =  'panel-' + widget.name;
      return {
        name: name,
        htmlObject: name,
        type: 'ParameterPanelComponent',
        executeAtStart: true,
        components: args.components,
        param: args.param
      };
    }
  });

  pentaho.common.prompting.builders.PlainPromptBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
    build: function(args) {
      var formatter = args.promptPanel.createFormatter(args.promptPanel.paramDefn, args.param);
      var transportFormatter = args.promptPanel.createDataTransportFormatter(args.promptPanel.paramDefn, args.param, formatter);
      var convertToAutocompleteValues = function(valuesArray) {
        return $.map(valuesArray, function(v) {
          var value = formatter ? formatter.format(transportFormatter.parse(v[0])) : v[0];
          // Label is key if it doesn't exist
          var label = (formatter ? formatter.format(transportFormatter.parse(v[1])) : v[1]) || value;
          return {
            value: value,
            label: label
          }
        });
      };
      var widget = this.base(args);
      return $.extend(widget, {
        type: 'StaticAutocompleteBoxComponent',
        valuesArray: convertToAutocompleteValues(widget.valuesArray),
        transportFormatter: transportFormatter,
        formatter: formatter
      });
    }
  });

  pentaho.common.prompting.builders.TextAreaBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
    build: function(args) {
      var formatter = args.promptPanel.createFormatter(args.promptPanel.paramDefn, args.param);
      return $.extend(this.base(args), {
        type: 'TextAreaComponent',
        transportFormatter: args.promptPanel.createDataTransportFormatter(args.promptPanel.paramDefn, args.param, formatter),
        formatter: formatter
      });
    }
  });

  /**
   * Provides a way to execute code within Dashboards' update() loop.
   * This can be useful to clean up old components in the same execution block and prevent
   * and partial rendering from being visible to the user.
   */
  pentaho.common.prompting.builders.GarbageCollectorBuilder = Base.extend({
    build: function(args) {
      return {
        type: 'BaseComponent',
        name: 'gc' + args.promptPanel.generateWidgetGUID(),
        executeAtStart: true,
        preExecution: function() {
          // Clear the components in reverse since we have an exploded list of components.
          // Clearing them in order would empty the parent container thus removing all
          // elements from the dom before each individual component has a chance to clean up
          // after themselves.
          $.each(args.components.reverse(), function(i, c) {
            try {
              c.clear();
            } catch (e) {
              Dashboards.log("Error clearing " + c.name +":",'error');
              Dashboards.log(e,'exception');
            }
          });
          setTimeout(function() {
            // Remove myself from Dashboards.components when we're done updating
            pentaho.common.prompting.removeDashboardComponents([this]);
          }.bind(this));
          return false; // Don't try to update, we're done
        }
      }
    }
  });
});