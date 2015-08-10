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
 * <h2> The Parameter Widget Builder Base Class</h2>
 *
 * To use the ParameterWidgetBuilderBase you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/ParameterWidgetBuilderBase'],
 *     function(ParameterWidgetBuilderBase) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * ParameterWidgetBuilder is an abstract class, that needs to be extended by whoever
 * needs to create a CDF component. This abstraction is used to create the main properties
 * needed to build a component
 *
 * @name ParameterWidgetBuilderBase
 * @class
 * @extends Base
 */
define(['cdf/lib/Base'], function(Base){

  return Base.extend({
    /**
     * Assigns to the widget to be built the main cdf properties needed to build a component
     *
     * @name ParameterWidgetBuilderBase#build
     * @method
     *
     * @param {Object} args - The object with the properties to build the component
     * @param {PromptPanel} args.promptPanel - The PromptPanel instance used to get the parameter name, the component name and the html object, where the component will be attached
     * @param {Parameter} args.param - The parameter with the properties needed to build the component
     * @returns {Object} The object extended with the CDF main properties
     */
    build: function (args) {
      var guid = args.promptPanel.generateWidgetGUID();
      return {
        promptType: 'prompt',
        executeAtStart: true,
        param: args.param,
        name: guid,
        htmlObject: guid,
        type: undefined, // must be declared in extension class
        parameter: args.promptPanel.getParameterName(args.param),
        postExecution: function () {
          this.base();
          var tooltip = this.param.attributes['tooltip'];
          if (tooltip) {
            $('#' + this.htmlObject).attr('title', tooltip);
          }
        }
      }
    }
  });
});
