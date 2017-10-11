/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
 * <h2>The List Builder</h2>
 *
 * To use the ListBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/ListBuilder'],
 *     function(ListBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and
 * call the <code>build</code> method:
 *
 * <pre><code>
 *   var listBuilder = new ListBuilder();
 *
 *   var listComponent = listBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the prompt panel and the parameters
 * necessary for the component.
 * The property multiSelect defines what is the component created.
 * If multiSelect equals <code>true</code>, a {@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:19-SelectMultiComponent:select_multi_component.xcdf/generatedContent MultiSelectComponent} is created.
 * If multiSelect equals <code>false</code>, a {@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:16-SelectComponent:select_component.xcdf/generatedContent SelectComponent} is created.
 *
 * <p>
 *   Note: the CDF documentation points to the Dashboard located on the Pentaho BI Server
 * </p>
 *
 * @name ListBuilder
 * @class
 * @extends ValueBasedParameterWidgetBuilder
 */

define(['cdf/components/SelectComponent', 'cdf/components/SelectMultiComponent', './ValueBasedParameterWidgetBuilder', 'common-ui/jquery-clean'],
    function (SelectComponent, SelectMultiComponent, ValueBasedParameterWidgetBuilder, $) {

      return ValueBasedParameterWidgetBuilder.extend({
        /**
         * Method used to build the widget, returning an instance of CDF MultiSelect or Select Component
         *
         * @name ListBuilder#build
         * @method
         *
         * @param {Object} args - The object with the properties to build the component
         * @param {Parameter} args.param - The parameter with the properties needed to build the component
         * @returns {BaseComponent} The instance of MultiSelect or Select Component
         */
        build: function (args) {
          var widget = this.base(args);
          $.extend(widget, {
            type: args.param.multiSelect ? 'SelectMultiComponent' : 'SelectComponent',
            size: args.param.attributes['parameter-visible-items'] || 5,
            changeMode: args.param.multiSelect ? 'timeout-focus' : 'immediate',  // PRD-3687
            preExecution: function () {
              // SelectComponent defines defaultIfEmpty = true for non-multi selects.
              // We can't override any properties of the component so we must set them just before update() is called. :(
              this.defaultIfEmpty = false;
            }
          });

          if (args.param.multiSelect) {
            return new SelectMultiComponent(widget);
          } else {
            return new SelectComponent(widget);
          }
        }
      });
    });
