/**

To create a widget:
var widget = pentaho.common.prompting.builders.WidgetBuilder.build(parameter);

Widget Definition Structure:
{
  promptType: ['prompt', 'submit', 'label'], Used to distinguish types of widgets
  param: The parameter this widget was created for
  name: unique name of widget, usually: param['name'] + GUID
  htmlObject: name of object to inject this widget at
  type: CDF Component type

  *All other properties are subject of the widget type*
}

*/

var pentaho = pentaho || {};
pentaho.common = pentaho.common || {};
pentaho.common.prompting = pentaho.common.prompting || {};
pentaho.common.prompting.builders = pentaho.common.prompting.builders || {};

pentaho.common.prompting.builders.PromptPanelBuilder = Base.extend({
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

  build: function(promptPanel) {
    var name = 'prompt' + promptPanel.guid;
    var layout = {
      name: name,
      type: this.lookupPromptType(promptPanel.paramDefn),
      htmlObject: promptPanel.destinationId,
      promptPanel: promptPanel,
      // Define instance variable of components so they are not shared
      components: []
    };
    Dashboards.bindControl(layout);
    layout.init(promptPanel.paramDefn);
    return layout;
  }
});

pentaho.common.prompting.builders.WidgetBuilder = {
  mapping: {
    'prompt-panel': 'pentaho.common.prompting.builders.PromptPanelBuilder',
    'parameter-panel': 'pentaho.common.prompting.builders.ParameterPanelBuilder',
    'submit-panel': 'pentaho.common.prompting.builders.SubmitComponentBuilder',
    'label': 'pentaho.common.prompting.builders.LabelBuilder',
    'dropdown': 'pentaho.common.prompting.builders.DropDownBuilder',
    'radio': 'pentaho.common.prompting.builders.RadioBuilder',
    'checkbox': 'pentaho.common.prompting.builders.CheckBuilder',
    'togglebutton': 'pentaho.common.prompting.builders.MultiButtonBuilder',
    'list': 'pentaho.common.prompting.builders.ListBuilder',
    'datepicker': 'pentaho.common.prompting.builders.DateInputBuilder',
    'multi-line': 'pentaho.common.prompting.builders.TextAreaBuilder',
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
        console.log('Unable to create widget builder of type "' + name + '"');
        throw e;
      }
    }
    return builder;
  },

  build: function(args, typeOverride) {
    var widget = this.findBuilderFor(args, typeOverride).build(args);
    if (widget.parameter) {
      widget.postChange = function() {
        args.promptPanel.parameterChanged(this.parameter, this.getValue());
      }.bind(widget);
    }
    return widget;
  }
};

pentaho.common.prompting.builders.SubmitComponentBuilder = Base.extend({
  build: function(args) {
    var name = 'submit-' + args.promptPanel.generateWidgetGUID();
    return {
      promptType: 'submit',
      type: 'SubmitPromptComponent',
      name: name,
      htmlObject: name,
      label: args.promptPanel.getString('submitButtonText', 'Submit'),
      promptPanel: args.promptPanel,
      paramDefn: args.paramDefn,
      executeAtStart: true
    };
  }
});

pentaho.common.prompting.builders.ParameterWidgetBuilderBase = Base.extend({
  build: function(args) {
    var name = args.param.name + args.promptPanel.generateWidgetGUID();
    return {
      promptType: 'prompt',
      executeAtStart: true,
      param: args.param,
      name: name,
      htmlObject: name,
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
    $.extend(widget, {
      promptType: 'label',
      name: name,
      htmlObject: name,
      type: 'TextComponent',
      expression: function() { return args.param.attributes['label']; }
    });
    delete widget.parameter; // labels don't have parameters
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
      valuesArray: this.getCDFValuesArray(args.param)
    });
  }
});

pentaho.common.prompting.builders.DropDownBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
  build: function(args) {
    var widget = this.base(args);

    if (args.paramDefn.ignoreBiServer5538 && !args.param.hasSelection()) {
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
        this.defaultIfEmpty = !args.paramDefn.ignoreBiServer5538 && !args.param.hasSelection();
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
      verticalOrientation: 'vertical' === args.param.attributes['parameter-layout'],
      expression: function() {
        return Dashboards.getParameterValue(this.parameter);
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

pentaho.common.prompting.builders.DateInputBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
  build: function(args) {
    var widget = this.base(args);
    var pattern = args.param.attributes['data-format'];
    var formatter = args.promptPanel.createTextFormatter(args.paramDefn, args.param, pattern);

    // clober JQuery UI DatePicker's parse and format functions
    // $.datepicker.parseDate = function(pattern, date) {
    //   return formatter.parse(date);
    // };

    // $.datepicker.formatDate = function(pattern, date) {
    //   return formatter.format(date);
    // };

    // TODO Check and see if we can change this 
    return $.extend(widget, {
      name: widget.name + '-date-picker', // Name must differ from htmlObject for JQuery Date Picker to function.
      type: 'RVDateInputComponent',
      formatter: formatter
    });
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
    var formatter = args.promptPanel.createTextFormatter(args.paramDefn, args.param);
    var convertToAutocompleteValues = function(valuesArray) {
      return $.map(valuesArray, function(v) {
        var value = formatter ? formatter.format(v[0]) : v[0];
        // Label is key if it doesn't exist
        var label = (formatter ? formatter.format(v[1]) : v[1]) || value;
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
      formatter: formatter
    });
  }
});

pentaho.common.prompting.builders.TextAreaBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
  build: function(args) {
    return $.extend(this.base(args), {
      type: 'TextAreaComponent',
      formatter: args.promptPanel.createTextFormatter(args.paramDefn, args.param)
    });
  }
});