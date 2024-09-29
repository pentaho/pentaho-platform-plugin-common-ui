/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


/**
 * Define a custom component that replaces the exiting label component. This must be a named module.
 * 
 * See http://requirejs.org/docs/api.html#modulename for more information.
 */

define("MySimpleComponent", [ 'cdf/components/BaseComponent' ], function(BaseComponent) {

  return BaseComponent.extend({
    update : function() {
      $('#' + this.htmlObject).html(this.expression() + ' (My Custom Component)');
    }
  });
});

define("MyCustomBuilder", [ "MySimpleComponent", 'common-ui/prompting/builders/ParameterWidgetBuilderBase' ], function(
  MySimpleComponent, ParameterWidgetBuilderBase) {

  return ParameterWidgetBuilderBase.extend({
    build : function(args) {
      var widget = this.base(args);
      var name = widget.name + '-label';
      var label = args.param.attributes['label'];
      $.extend(widget, {
        promptType : 'label',
        name : name,
        htmlObject : name,
        type : 'TextComponent',
        expression : function() {
          return label;
        }
      });
      delete widget.parameter; // labels don't have parameters

      return new MySimpleComponent(widget);
    }
  });
});

define("common-ui/prompting/pentaho-prompting-sample-component",
// We require the Prompting Builder API to be loaded as we'll replace the existing label builder with ours
[ 'common-ui/prompting/WidgetBuilder', 'MyCustomBuilder' ], function(WidgetBuilder, MyCustomBuilder) {
  // Replace the label component builder with ours
  WidgetBuilder.mapping['label'] = new MyCustomBuilder();
});
