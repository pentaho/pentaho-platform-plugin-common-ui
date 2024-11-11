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
 * <h2>The Text Area Builder</h2>
 *
 * To use the TextAreaBuilder you should require the appropriate file
 * from Common-Ui:
 *
 * <pre><code>
 *   require(['common-ui/prompting/builders/TextAreaBuilder'],
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
define(['./FormattedParameterWidgetBuilderBase', 'cdf/components/TextareaInputComponent', 'common-ui/jquery-clean'],
    function (FormattedParameterWidgetBuilderBase, TextareaInputComponent, $) {

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
            type: 'TextareaInputComponent',
            postExecution: function () {
              
              var input = $('#' + this.htmlObject + '-input');
              
              input.change(function () {
                // blur wasn't good enough. clicking of the submit button without clicking out of the text component
                // doesn't trigger blur. so modified text fields can have a stale value.
                // we now use the jQuery ui focusout event on the input.
              }.bind(this));

              input.keypress(function (e) {
                if (e.which === 13) {
                  this.dashboard.processChange(this.name);
                }
              }.bind(this));

              input.focusout(function () {
                this.getValue();
              }.bind(this));

              this._doAutoFocus();
            }
          });

          var comp = new TextareaInputComponent(widget);
          //override just the getValue function to allow format values
          comp.getValue = function(){
            var val = $('#' + this.name).val();
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
