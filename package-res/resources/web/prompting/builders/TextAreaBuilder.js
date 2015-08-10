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
 * <h2>The Text Area Builder</h2>
 *
 * To use the TextAreaBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/promting/builders/TextAreaBuilder'],
 *     function(TextAreaBuilder) { 
 *       
 *     }
 *   );
 * </code></pre>
 * 
 * To get the component you'll have to create a new instance of the builder and
 * call the <code>build</code> method:
 *
 * <pre><code>
 *   var textAreaBuilder = new TextAreaBuilder();
 *
 *   var textAreaComponent = textAreaBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the prompt panel and the parameters
 * necessary for the component as per [the CDF documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:38-TextareaInputComponent:text_area_input_component.xcdf/generatedContent}.
 * 
 * <p>
 *   Note: the CDF documentation points to the Dashboard located on the Pentaho BI Server
 * </p>
 *
 * @name TextAreaBuilder
 * @class
 * @extends FormattedParameterWidgetBuilderBase
 */
define(['./FormattedParameterWidgetBuilderBase', 'cdf/components/TextareaInputComponent'],
    function (FormattedParameterWidgetBuilderBase, TextareaInputComponent) {

      return FormattedParameterWidgetBuilderBase.extend({
        /**
         * Builds the widget and returns a TextareaInputComponent
         * @method
         * @name TextAreaBuilder#build
         * @param {Object} args - The arguments to build the widget in accordance with [the CDF documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:38-TextareaInputComponent:text_area_input_component.xcdf/generatedContent}.
         * @param {PromptPanel} args.promptPanel - The instance of PromptPanel
         * @param {ParameterDefinition} args.promptPanel.paramDefn - The parameter definition
         * @param {Parameter} args.param - The Parameter instance
         * @returns {TextareaInputComponent} The TextAreaInputComponent built
         */
        build: function (args) {
          var widget = this.base(args);
          $.extend(widget, {
            name: widget.name + '-input',
            type: 'TextareaInputComponent'
          });

          var comp = new TextareaInputComponent(widget);
          //override just the getValue function to allow format values
          comp.getValue = function(){
            var val = $('#' + name).val();
            if (this.formatter) {
              return this.transportFormatter.format(this.formatter.parse(val));
            } else {
              return val;
            }
          };
          return comp;
        }
      });
    });
