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
 * <h2>The ScopedPentahoButtonComponent</h2>
 *
 * <p>The ScopedPentahoButtonComponent is an abstract class, that needs to be extended by whoever needs to create a submit
 * prompt component. This abstraction is used to render a single button and register click event to submit prompts and
 * update report. Also it's used as super class for {@link SubmitPromptComponent}.</p>
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
define([ 'cdf/components/BaseComponent', 'cdf/lib/jquery' ], function(BaseComponent, $) {
  return BaseComponent.extend({

    /**
     * Renders a submit button element.
     *
     * @method
     * @name ScopedPentahoButtonComponent#update
     */
    update : function() {
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
    registerSubmitClickEvent : function() {
      if (!this.viewReportButtonRegistered) {

        var $container = $("#" + this.htmlObject).empty();

        $("<button type='button' class='pentaho-button'/>").text(this.label).bind("mousedown",
          this.expressionStart.bind(this)).bind("click", function() {
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
     * @param {Boolean} isInit
     */
    expression : function(isInit) {
    },

    /**
     * Called when the submit button is pressed. It's overridden by child class.
     *
     * @name ScopedPentahoButtonComponent#expressionStart
     * @method
     */
    expressionStart : function() {
    }
  });
});
