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
 * <h2>The Multi Button Builder</h2>
 *
 * To use the MultiButtonBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/MultiButtonBuilder'],
 *     function(MultiButtonBuilder) { 
 *       
 *     }
 *   );
 * </code></pre>
 * 
 * To get the component you'll have to create a new instance of the builder and
 * call the <code>build</code> method:
 *
 * <pre><code>
 *   var multiButtonBuilder = new MultiButtonBuilder();
 *
 *   var multiButtonComponent = multiButtonBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the prompt panel and the parameters
 * necessary for the component as per [the CDF documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:56-MultiButtonComponent:multibutton_component.xcdf/generatedContent}.
 * 
 * <p>
 *   Note: the CDF documentation points to the Dashboard located on the Pentaho BI Server
 * </p>
 *
 * @name MultiButtonBuilder
 * @class
 * @extends ValueBasedParameterWidgetBuilder
 */

define(['cdf/components/MultiButtonComponent', './ValueBasedParameterWidgetBuilder', 'common-ui/jquery-clean'],
    function (MultiButtonComponent, ValueBasedParameterWidgetBuilder, $) {

      return ValueBasedParameterWidgetBuilder.extend({
        /**
         * Builds the widget and returns a MultiButtonComponent
         * @method
         * @name MultiButtonBuilder#build
         * @param {Object} args The arguments to build the widget in accordance with [the CDF documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:56-MultiButtonComponent:multibutton_component.xcdf/generatedContent}.
         * @returns {MultiButtonComponent} The MultiButtonComponent built
         */
        build: function (args) {
          var widget = this.base(args);
          $.extend(widget, {
            type: 'MultiButtonComponent',
            isMultiple: args.param.multiSelect,
            verticalOrientation: 'vertical' === args.param.attributes['parameter-layout'],
            expression: function () {
              return this.dashboard.getParameterValue(this.parameter);
            },
            postExecution: function () {
              $('#' + this.htmlObject).addClass('pentaho-toggle-button-container');
            }
          });
          return new MultiButtonComponent(widget);
        }
      });
    });
