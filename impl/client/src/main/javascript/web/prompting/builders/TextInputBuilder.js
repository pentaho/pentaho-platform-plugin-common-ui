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
 * <h2>The Text Input Builder</h2>
 *
 * To use the TextInputBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/TextInputBuilder'],
 *     function(TextInputBuilder) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * To get the component you'll have to create a new instance of the builder and
 * call the <code>build</code> method:
 *
 * <pre><code>
 *   var textInputBuilder = new TextInputBuilder();
 *
 *   var textInputComponent = textInputBuilder.build(args);
 * </code></pre>
 *
 * where 'args' is an object that contains the prompt panel and the parameters
 * necessary for the component as per [the CDF documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:37-TextInputComponent:text_input_component.xcdf/generatedContent}.
 *
 * <p>
 *   Note: the CDF documentation points to the Dashboard located on the Pentaho BI Server
 * </p>
 *
 * @name TextInputBuilder
 * @class
 * @extends FormattedParameterWidgetBuilderBase
 */
define(['cdf/components/TextInputComponent', './FormattedParameterWidgetBuilderBase', 'common-ui/jquery-clean'],
  function (TextInputComponent, FormattedParameterWidgetBuilderBase, $) {
    /**
     * Check if value is a valid number.
     * @param value
     * @returns {boolean}
     */
    function isValidValue(value){
      return value != null && ( typeof value === "string" ? (value!=="") : (!isNaN(value) && Math.abs(value) !== Infinity ));
    }

    return FormattedParameterWidgetBuilderBase.extend({
      /**
       * Builds the widget and returns a TextInputComponent
       * @method
       * @name TextInputBuilder#build
       * @param {Object} args The arguments to build the widget in accordance with [the CDF documentation]{@link http://localhost:8080/pentaho/api/repos/:public:plugin-samples:pentaho-cdf:pentaho-cdf-require:30-documentation:30-component_reference:10-core:37-TextInputComponent:text_input_component.xcdf/generatedContent}.
       * @param {PromptPanel} args.promptPanel - The instance of PromptPanel
       * @param {ParameterDefinition} args.promptPanel.paramDefn - The parameter definition
       * @param {Parameter} args.param - The Parameter instance
       * @returns {TextInputComponent} The TextInputComponent built
       */
      build: function (args) {
        var widget = this.base(args);
        var name = widget.name + "-input";
        $.extend(widget, {
          name: name,
          type: 'TextInputComponent',
          /**
           * Convert from the transport format value to the UI value
           * @param {*} transportValue Serialized value according to the transport format.
           * @returns {string} Value that appears on the UI.
           * @protected
           */
          _formatValue: function(transportValue) {
            var uiValue;
            // Apply mask, if there is a formatter.
            if (this.formatter) {
              var value = this.transportFormatter.parse(transportValue);
              uiValue = this.formatter.format(value);
              // If value is already formatted, a NaN is thrown.
              if (!uiValue) {
                uiValue = transportValue;
              }
            } else {
              uiValue = transportValue;
            }
            return uiValue;
          },
          /**
           * Convert from the UI value to the transport format value
           * @param {string} uiValue Value that appears on the UI.
           * @returns {*} Serialized value according to the transport format.
           * @protected
           */
          _parseValue: function(uiValue) {
            var transportValue;
            if (this.formatter) {
              var value = this.formatter.parse(uiValue);
              if (isValidValue(value)) {
                transportValue = this.transportFormatter.format(value);
              } else {
                transportValue = uiValue;
              }
            } else {
              transportValue = uiValue;
            }
            return transportValue;
          },
        });
        return new TextInputComponent(widget);
      }
    });
  });
