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

  build: function(args) {
    var name = 'prompt' + WidgetHelper.generateGUID();
    var layout = {
      name: name,
      type: this.lookupPromptType(args['paramDefn']),
      htmlObject: args['destinationId'],
      // Define instance variable of components so they are not shared
      components: []
    };
    Dashboards.bindControl(layout);
    layout.init(args['paramDefn'], args);
    return layout;
  }
});

pentaho.common.prompting.builders.WidgetBuilder = {
  mapping: {
    'prompt-panel': 'pentaho.common.prompting.builders.PromptPanelBuilder',
    'parameter-panel': 'pentaho.common.prompting.builders.ParameterPanelBuilder',
    'submit-panel': 'pentaho.common.prompting.builders.SubmitComponentBuilder',
    'label': 'pentaho.common.prompting.builders.LabelBuilder',
    'dropdown': 'pentaho.common.prompting.builders.SelectBuilder',
    // function(param) {
    //     // ReportViewer always uses a select for dropdown (See ParameterControllPanel.buildParameterWidget(..))
    //     return 'Select';
    //     // TODO Override this for Report Viewer and restore multiselect functionality
    //     // return param.multiSelect ? 'SelectMulti' : 'Select';
    // },
    'radio': 'pentaho.common.prompting.builders.RadioBuilder',
    'checkbox': 'pentaho.common.prompting.builders.CheckBuilder',
    'togglebutton': 'pentaho.common.prompting.builders.MultiButtonBuilder',
    'list': 'pentaho.common.prompting.builders.SelectBuilder',
    'datepicker': 'pentaho.common.prompting.builders.DateInputBuilder',
    'multi-line': 'pentaho.common.prompting.builders.TextInputBuilder', // TODO Find/implement multi-line text component
    'default': 'pentaho.common.prompting.builders.TextInputBuilder' // TODO Reproduce "PlainParameterUI"
  },

  cache: {}, // Cache of created builders

  findBuilderFor: function(args, type) {
    type = type || (args.attributes ? args.attributes['parameter-render-type'] : null);
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
    return this.findBuilderFor(args, typeOverride).build(args);
  }
};

pentaho.common.prompting.builders.SubmitComponentBuilder = Base.extend({
  build: function(args) {
    var listeners = pentaho.common.prompting.gatherParameterNames(args.widgets);
    var name = 'submit-' + WidgetHelper.generateGUID();
    var submitWidget = {
      promptType: 'submit',
      type: 'SubmitPromptComponent',
      name: name,
      htmlObject: name,
      label: 'View Report', // TODO i18n
      executeAtStart: true,
      isAutoSubmit: args.paramDefn.isAutoSubmit,
      listeners: args.listeners
    };
    return submitWidget;
  }
});

pentaho.common.prompting.builders.ParameterWidgetBuilderBase = Base.extend({
  build: function(param) {
    var name = param['name'] + WidgetHelper.generateGUID();
    return {
      promptType: 'prompt',
      executeAtStart: true,
      param: param,
      name: name,
      htmlObject: name,
      type: undefined, // must be declared in extension class
      parameter: param.name,
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
  build: function(param) {
    var widget = this.base(param);
    var name = widget.name + '-label';
    $.extend(widget, {
      promptType: 'label',
      name: name,
      htmlObject: name,
      type: 'TextComponent',
      expression: function() { return param.attributes['label']; }
    });
    delete widget.parameter; // labels don't have parameters
    return widget;
  }
});

pentaho.common.prompting.builders.TextInputBuilder = pentaho.common.prompting.builders.ParameterWidgetBuilderBase.extend({
  build: function(param) {
    var widget = this.base(param);
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

  build: function(param) {
    var widget = this.base(param);
    return $.extend(widget, {
      valuesArray: this.getCDFValuesArray(param)
    });
  }
});

pentaho.common.prompting.builders.SelectBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
  build: function(param) {
    var widget = this.base(param);
    return $.extend(widget, {
      type: param.multiSelect ? 'SelectMultiComponent' : 'SelectComponent',
      size: param.attributes['parameter-visible-items']
    });
  }
});

pentaho.common.prompting.builders.MultiButtonBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
  build: function(param) {
    var widget = this.base(param);
    return $.extend(widget, {
      type: 'MultiButtonComponent',
      verticalOrientation: 'vertical' === param.attributes['parameter-layout'],
      expression: function() {
        return Dashboards.getParameterValue(this.parameter);
      }
    });
  }
});

pentaho.common.prompting.builders.ToggleButtonBaseBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
  build: function(param) {
    var widget = this.base(param);
    return $.extend(widget, {
      defaultIfEmpty: false, // Do not auto-select anything if no selection exists
      verticalOrientation: 'vertical' == param.attributes['parameter-layout']
    });
  }
});

pentaho.common.prompting.builders.CheckBuilder = pentaho.common.prompting.builders.ToggleButtonBaseBuilder.extend({
  build: function(param) {
    var widget = this.base(param);
    widget.type = 'CheckComponent';
    return widget;
    // return $.extend(widget, {
    //   type: 'CheckComponent',
    //   defaultIfEmpty: false, // Do not auto-select anything if no selection exists
    //   verticalOrientation: 'vertical' == param.attributes['parameter-layout']
    // });
  }
});

pentaho.common.prompting.builders.RadioBuilder = pentaho.common.prompting.builders.ToggleButtonBaseBuilder.extend({
  build: function(param) {
    var widget = this.base(param);
    widget.type = 'radio'; // Specifically 'radio' instead of 'RadioComponent' because the CoreComponent.js implementation requires it.
    return widget;
    // return $.extend(widget, {
    //   type: 'CheckComponent',
    //   defaultIfEmpty: false, // Do not auto-select anything if no selection exists
    //   verticalOrientation: 'vertical' == param.attributes['parameter-layout']
    // });
  }
});

pentaho.common.prompting.builders.DateInputBuilder = pentaho.common.prompting.builders.ValueBasedParameterWidgetBuilder.extend({
  build: function(param) {
    var widget = this.base(param);
    return $.extend(widget, {
      name: widget.name + '-date-picker', // Name must differ from htmlObject for JQuery Date Picker to function.
      type: 'RVDateInputComponent'//,
      // dateFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
      // dateFormat: 'yy-mm-dd'
    });
  }
});

pentaho.common.prompting.builders.ParameterPanelBuilder = pentaho.common.prompting.builders.ParameterWidgetBuilderBase.extend({
  build: function(args) {
    var widget = this.base(args.param);
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

pentaho.common.prompting.builders.RefreshPromptBuilder = Base.extend({
  build: function(args) {
    return {
      name: 'refresh-prompt-' + WidgetHelper.generateGUID(),
      type: 'RefreshPromptComponent',
      layoutComponent: args.layoutComponent,
      listeners: args.listeners,
      args: args.args
    }
  }
});