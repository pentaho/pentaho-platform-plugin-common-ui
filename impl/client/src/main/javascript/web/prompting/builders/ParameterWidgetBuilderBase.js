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
define(['cdf/lib/Base', 'common-ui/jquery-clean'], function(Base, $) {

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
