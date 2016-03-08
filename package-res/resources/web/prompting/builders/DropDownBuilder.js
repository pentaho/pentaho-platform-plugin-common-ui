/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
 * <h2>The Drop Down Builder</h2>
 *
 * To use the DropDownBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/DropDownBuilder'],
 *     function(DropDownBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and
 * call the <code>build</code> method:
 *
 * <pre><code>
 *   var dropDownBuilder = new DropDownBuilder();
 *
 *   var dropDownComponent = dropDownBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the prompt panel and the parameters
 * necessary for the component.
 * {@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:16-SelectComponent:select_component.xcdf/generatedContent SelectComponent} is created.
 *
 * <p>
 *   Note: the CDF documentation points to the Dashboard located on the Pentaho BI Server
 * </p>
 *
 * @name DropDownBuilder
 * @class
 * @extends ValueBasedParameterWidgetBuilder
 */
define(['cdf/components/SelectComponent', './ValueBasedParameterWidgetBuilder'],
    function(SelectComponent, ValueBasedParameterWidgetBuilder){

  return ValueBasedParameterWidgetBuilder.extend({
    /**
     * Method used to build the widget, returning an instance of CDF SelectComponent
     *
     * @name DropDownBuilder#build
     * @method
     *
     * @param   {Object}          args - The object with the properties to build the component according to [the CDF Documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:16-SelectComponent:select_component.xcdf/generatedContent SelectComponent}
     * @param   {Parameter}       args.param - The parameter with the properties needed to build the component
     * @returns {SelectComponent} The instance of SelectComponent
     */
    build: function(args) {
      var widget = this.base(args);

      if (args.promptPanel.paramDefn.ignoreBiServer5538 && !args.param.hasSelection()) {
        // If there is no empty selection, and no value is selected, create one. This way, we can represent
        // the unselected state.
        widget.valuesArray = widget.valuesArray.concat([['', '']]);
      }

      $.extend(widget, {
        type: 'SelectComponent',
        preExecution: function() {
          // SelectComponent defines defaultIfEmpty = true for non-multi selects.
          // We can't override any properties of the component so we must set them just before update() is called. :(
          // Only select the first item if we have no selection and are not ignoring BISERVER-5538
          this.defaultIfEmpty = !args.promptPanel.paramDefn.ignoreBiServer5538 && !args.param.hasSelection();
        }
      });

      return new SelectComponent(widget);
    }
  });
});
