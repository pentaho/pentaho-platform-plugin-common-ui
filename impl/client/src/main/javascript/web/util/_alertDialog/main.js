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


/* globals Promise */

define([
  "dojo/_base/lang",
  "dojo/on",
  "dojo/query",
  "dijit/Dialog",
  "pentaho/i18n!messages",
  "css!dijit/themes/dijit.css",
  "css!./themes/styles.css",
  "pentaho/shim/es6-promise"
], function (lang, on, query, Dialog, bundle) {

  "use strict";

  var nextElemId = 1;

  var templateHtml =
      '<div class="Caption" role="heading" aria-level="2"></div>\n' +
      '<div class="dialog-content"></div>\n' +
      '<div class="button-panel"></div>';

  var KnownActions = Object.freeze({
    ok: "ok",
    cancel: "cancel"
  });

  var DEFAULT_ACTIONS = (function(){
    var actionsSpec = {};
    actionsSpec[KnownActions.ok] = bundle.structured.actions[KnownActions.ok];
    return Object.freeze(actionsSpec);
  }());

  function getNextElemId() {
    return "pen-alert-dlg-" + (nextElemId++);
  }

  /**
   * Shows an alert dialog.
   *
   * @param {string} dialogSpec.title - The dialog title text.
   * @param {string} dialogSpec.message - The dialog message HTML text.
   * @param {Map.<String, String>} [dialogSpec.actions] - An object map, whose keys are the action codes,
   * and whose values are the action labels.
   *
   * The special action code `"cancel"` is that which cancels the dialog.
   * When not specified, defaults to a single action with code `"ok"`.
   *
   * @return {Promise<string>} A promise which is rejected if the dialog is canceled,
   * and is resolved if the dialog is accepted, with the value of the activated action.
   *
   * @example
   * ```js
   * alertDialogs.showAlert({
   *   title: "Delete selected connection?",
   *   message: "The selected message will be deleted. Are you sure?",
   *   actions: {
   *     "yes": "Yes, Delete",
   *     "cancel": "No"
   *   }
   * }).then(function(actionCode) {
   *    // Proceed with deletion.
   * }, function() {
   *    // Dialog canceled.
   * });
   * ```
   */
  function showAlert(dialogSpec) {

    // a11y's aria-labelledby already handled by Dijit, so keep feeding its hidden Caption element.
    var dlg = new Dialog({title: dialogSpec.title, content: templateHtml});
    dlg.placeAt(document.body);

    var domNode = dlg.domNode;

    // Dialog
    domNode.classList.add("pen-alert-dialog", "responsive", "pentaho-dialog", "modal", "dw-text", "dmh-content");
    domNode.setAttribute("role", "alertdialog");
    domNode.setAttribute("aria-modal", "true");

    // Caption
    query(".dijitDialogPaneContent .Caption", domNode)[0].innerText = dialogSpec.title;

    // Message
    var messageId = getNextElemId();
    var messageNode = document.createElement("div");
    messageNode.id = messageId;
    messageNode.innerHTML = dialogSpec.message;
    query(".dialog-content", domNode)[0].appendChild(messageNode);

    domNode.setAttribute("aria-describedby", messageId);

    // Called on ESC key.
    dlg.onCancel = function () {
      dialogCanceled();
    };

    // Buttons
    var buttonPanelNode = query(".button-panel", domNode)[0];

    var actions = dialogSpec.actions || DEFAULT_ACTIONS;
    Object.keys(actions).forEach(function (code) {
      var buttonNode = document.createElement("button");
      buttonNode.classList.add("pentaho-button");
      buttonNode.innerText = actions[code];

      dlg.own(on(buttonNode, "click", createButtonClickHandler(code)));

      buttonPanelNode.appendChild(buttonNode);
    });

    var promiseControl = createPromiseControl();

    return Promise.resolve(dlg.show())
        .then(function() {
          return promiseControl.promise;
        }, function(reason) {
          promiseControl.reject(reason);
          return promiseControl.promise;
        });

    function dialogCanceled() {
      dlg.hide().always(function () {
        dlg.destroy();

        promiseControl.reject();
      });
    }

    function dialogAccepted(result) {
      dlg.hide().always(function () {
        dlg.destroy();

        promiseControl.resolve(result);
      });
    }

    function createButtonClickHandler(buttonCode) {
      if (buttonCode === "cancel") {
        return function onClickDialogCancel() {
          dialogCanceled();
        };
      }

      return function onClickDialogAccept() {
        dialogAccepted(buttonCode);
      };
    }
  }

  /**
   * Shows an error dialog.
   *
   * The dialog shows a single OK button, with a label such as `OK`.
   *
   * @param {string} [dialogSpec.title] - The dialog title text. When missing a default title, such as `Error` is used.
   * @param {string} dialogSpec.message - The dialog message HTML text.
   *
   * @return {Promise<string>} A promise which is resolved when the dialog is closed.
   *
   * @example
   * ```js
   * alertDialogs.showError({
   *   message: "The connection deletion failed."
   * }).then(function() {
   *    // Dialog was closed.
   * });
   * ```
   */
  function showError(dialogSpec) {
    return showAlert({
      title: dialogSpec.title || bundle.structured.error.title,
      message: dialogSpec.message
    })["catch"](function() {
      // Converts Cancel to a resolution.
      return "ok";
    });
  }

  function createPromiseControl() {
    var promiseControl = {
      promise: null,
      resolve: null,
      reject: null
    };

    promiseControl.promise = new Promise(function(resolve, reject) {
      // Called synchronously.
      promiseControl.resolve = resolve;
      promiseControl.reject = reject;
    });

    return promiseControl;
  }

  return {
    showAlert: showAlert,
    showError: showError
  };
});
