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

define("common-ui/prompting/pentaho-prompting-sample-components",
  // We require the Prompting Builder API to be loaded as we'll replace the existing label builder with ours
  ['common-ui/prompting/pentaho-prompting-builders'], function() {
  window.MySimpleComponent = BaseComponent.extend({
    update: function() {
      $('#' + this.htmlObject).html(this.label + ' (My Custom Component)');
    }
  });

  window.MyCustomBuilder = pentaho.common.prompting.builders.ParameterWidgetBuilderBase.extend({
    build: function(args) {
      var widget = this.base(args);
      // Change the name and htmlObject to append -label so we don't conflict with the input component for this parameter
      widget.name = widget.name + '-label';
      widget.htmlObject = widget.name;
      widget.type = 'MySimpleComponent';
      widget.label = args.param.attributes['label'];
      return widget;
    }
  });

  // Replace the label component builder with ours
  pentaho.common.prompting.builders.WidgetBuilder.mapping['label'] = 'MyCustomBuilder';
});
