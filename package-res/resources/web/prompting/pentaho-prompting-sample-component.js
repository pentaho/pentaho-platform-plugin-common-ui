/*!
 * Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
