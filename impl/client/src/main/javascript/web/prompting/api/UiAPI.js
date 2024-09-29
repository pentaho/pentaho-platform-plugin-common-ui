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
 * This is the prompting user interface API class. Contains all general functions for working with the prompting user
 * interface.
 *
 * @name UiAPI
 * @class
 */
define([], function() {
  return function(api) {
    /**
     * Makes visible the progress indicator.
     * By default it adds elements to the DOM to give the appearance and behavior of blocking user interaction.
     * For example, this API function can be used during long-running calls or to show a special popup with messages.
     * To cancel this action can be used {@link UiAPI#hideProgressIndicator}.
     *
     * @name UiAPI#showProgressIndicator
     * @method
     * @example
     *     api.ui.showProgressIndicator();
     */
    this.showProgressIndicator = function() {
      api.operation._getPromptPanel().showProgressIndicator();
    };

    /**
     * Hides the progress indicator.
     * The main use-case of this API function is cancel the {@link UiAPI#showProgressIndicator} action.
     * By default it removes elements from the DOM to hide the progress indicator and unblock user interaction.
     *
     * @name UiAPI#hideProgressIndicator
     * @method
     * @example
     *     api.ui.hideProgressIndicator();
     */
    this.hideProgressIndicator = function() {
      api.operation._getPromptPanel().hideProgressIndicator();
    };

    /**
     * Sets the default options for blockUI, which allows you to simulate synchronous behavior when using AJAX
     * by preventing user activity. Visually, an overlay can be used to cover the user interface.
     *
     * @name UiAPI#setBlockUiOptions
     * @method
     * @param {Object} options - The options to configure the block ui
     * @param {string} options.message - The message or html to display on the block ui
     * @param {Object} options.css - A json which accepts valid css key/value pairs for the message container
     * @param {Object} options.overlayCSS - A json which accepts valid css key/value pairs for the block ui overlay
     * @param {boolean} options.showOverlay - Allows you to show or hide the overlay on the block ui
     * @example
     *      var defaults = {
     *          message : '',
     *          css : {
     *              left : '0%',
     *              top : '0%',
     *              marginLeft : '85px',
     *              width : '100%',
     *              height : '100%',
     *              opacity : '1',
     *              backgroundColor : '#ffffcc'
     *          },
     *          overlayCSS : {
     *              backgroundColor : '#000000',
     *              opacity : '0.6',
     *              cursor : 'wait'
     *          },
     *          showOverlay : false
     *      };
     *      api.ui.setBlockUiOptions(defaults);
     */
    this.setBlockUiOptions = function(options) {
      api.operation._getPromptPanel().setBlockUiOptions(options);
    };

    /**
     * Enables or disables a submit button in a submit panel. Checks if it's necessary change "disabled" attribute of
     * the button and applies it to a submit button component in the dashboard.
     *
     * @name UiAPI#setDisabledSubmitButton
     * @method
     * @param {Boolean} disabled When `true` enables the submit button, when `false` disables it.
     * @example
     *      api.ui.setDisabledSubmitButton(true);
     */
    this.setDisabledSubmitButton = function(disabled) {
      api.operation._getPromptPanel().setDisabledSubmitButton(disabled);
    };
  };
});
