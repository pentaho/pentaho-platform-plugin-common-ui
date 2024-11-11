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
 * <h2>The ScopedPentahoButtonComponent</h2>
 *
 * <p>The ScopedPentahoButtonComponent is an abstract class, that needs to be extended by whoever needs to create a
 * submit prompt component. This abstraction is used to render a single button and register click event to submit
 * prompts and update report. Also it's used as super class for {@link SubmitPromptComponent}.</p>
 *
 * To use the ScopedPentahoButtonComponent you should require the appropriate file from common-ui:
 *
 * <pre><code>
 *   require([ 'common-ui/prompting/components/ScopedPentahoButtonComponent' ],
 *     function(ScopedPentahoButtonComponent) {
 *
 *     }
 *   );
 * </code></pre>
 *
 * @name ScopedPentahoButtonComponent
 * @class
 * @extends BaseComponent
 */
define(["cdf/components/BaseComponent", "common-ui/jquery-clean"], function(BaseComponent, $) {
  return BaseComponent.extend({

    /**
     * Renders a submit button element.
     *
     * @method
     * @name ScopedPentahoButtonComponent#update
     */
    update: function() {
      this.registerSubmitClickEvent();
    },

    /**
     * Creates a new button element and registers the click and mousedown event for the parameter 'View Report' button
     * to invoke panel's submit to update report.
     *
     * @method
     * @name ScopedPentahoButtonComponent#registerSubmitClickEvent
     * @private
     */
    registerSubmitClickEvent: function() {
      if(!this.viewReportButtonRegistered) {

        var $container = $("#" + this.htmlObject).empty();
        var disabledSubmitBtn = this.promptPanel && !this.promptPanel.isEnableSubmitButton;

        $("<button type='button' class='pentaho-button' " + (disabledSubmitBtn ? "disabled" : "") + "/>")
          .text(this.label)
          .bind("mousedown", this.expressionStart.bind(this)).bind("click", function() {
            // Don't let click-event go as first argument.
            this.expression(false);
          }.bind(this)).appendTo($container);
      }
    },

    /**
     * Called when the submit button is clicked. It's overridden by child class.
     *
     * @name ScopedPentahoButtonComponent#expression
     * @method
     * @param {Boolean} isInit - Flag informing if the prompt is being initialized
     */
    expression: function(isInit) {
    },

    /**
     * Called when the submit button is pressed. It's overridden by child class.
     *
     * @name ScopedPentahoButtonComponent#expressionStart
     * @method
     */
    expressionStart: function() {
    },

    /**
     * Sets `disabled` attribute of the submit button.
     * Can be called by Prompting API to enable/disable the submit button for example, for validation purpose.
     *
     * @name ScopedPentahoButtonComponent#setDisabledButton
     * @method
     * @param {boolean} disabled When `true` enables the submit button, when `false` disables it.
     */
    setDisabledButton: function(disabled) {
      $("#" + this.name).find("button.pentaho-button").attr("disabled", disabled);
    }
  });
});
