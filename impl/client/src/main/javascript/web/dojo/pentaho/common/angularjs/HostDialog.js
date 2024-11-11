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
  "dojo/_base/declare",
  "dijit/Dialog",
  "common-ui/angularjs",
  "./hostDialogModule",
  "dojo/text!./HostDialog.html",
  "../Overrides",
  "pentaho/shim/es6-promise",
  "css!./themes/styles.css"
], function(declare, Dialog, angularJs, hostDialogModule, templateHtml) {

  // "use strict";

  // The pentaho/common/Overrides is needed so that the dialog's modal underlay/backdrop uses the Pentaho
  // glasspane CSS class and associated color.

  /**
   * @name dijit.Dialog
   * @class
   */

  /**
   * A Dojo/Dijit Dialog which hosts an AngularJS application which
   * can render part of the dialog's content.
   *
   * @memberof pentaho.common.angularjs
   * @class
   * @extends dijit.Dialog
   */
  var HostDialog = declare(Dialog, /** @lends pentaho.common.angularjs.HostDialog# */{
    /** @override */
    templateString: templateHtml,

    /**
     * The dialog's Angular app's `$injector` service, which effectively represents the application.
     * @type {?angularjs.Injector}
     * @private
     */
    __angularJsApp: null,

    /**
     * Gets the root module of the AngularJS application of this dialog.
     *
     * This method is designed to be overridden by subclasses.
     *
     * @return {angularjs.Module}
     * @protected
     */
    _getRootAngularJsModule: function() {
      return hostDialogModule;
    },

    /**
     * Bootstraps Angular on the dialog's `ui-view` element (this.angularContentNode).
     *
     * Stores the Angular app's injector in the {@link #__angularJsApp}.
     *
     * Also, passes a reference to this dialog instance to the AngularJS app's root scope.
     * To be used by the Angular service `dialogService`.
     *
     * Called during Dojo's rendering life-cycle, from {@link #_fillContent}.
     * @protected
     */
    _initAngularJsApp: function() {
      var rootAngularJsModule = this._getRootAngularJsModule();

      // Configuration function that configures the host dialog service provider.
      var dialog = this;

      var configHostDialogServiceProvider = [
          hostDialogModule.$serviceName + "Provider",
          /**
           * @param {pentaho.common.angularjs.HostDialogServiceProvider} hostDialogServiceProvider
           */
          function(hostDialogServiceProvider) {
            hostDialogServiceProvider.setDialog(dialog);
          }
        ];

      var configs = [
        rootAngularJsModule.name,
        configHostDialogServiceProvider
      ];

      this.__angularJsApp = angularJs.bootstrap(this.containerNode, configs);
    },

    /**
     * Gets the dialog's parameter(s) that may affect the data displayed.
     *
     * Called when the dialog is being shown to capture the parameter(s).
     *
     * @return {*} The dialog's parameter(s), if any; `undefined`, otherwise.
     * @protected
     */
    _getDialogParams: function() {
      return undefined;
    },

    /**
     * Destroys the Angular app by following https://stackoverflow.com/a/30646201/178749.
     * See also https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$destroy.
     *
     * Called when the widget is destroyed, from {@link #destroy}.
     * @protected
     */
    _destroyAngularJsApp: function() {
      this.__angularJsApp.invoke(["$rootScope", function($rootScope) {
        $rootScope.$destroy();
      }]);

      this.__angularJsApp = null;
    },

    /**
     * Sets the dialog's title.
     *
     * @param {string} titleHtml - The title of the dialog as an HTML string.
     */
    setTitle: function(titleHtml) {
      this.set("title", titleHtml);
    },

    show: function() {
      if (this._promiseControl == null) {
        var promiseControl = this._promiseControl = createPromiseControl();

        promiseControl.params = this._getDialogParams();

        // Initialize just before showing, so that params, if any, are already available for bootstrap.
        this._initAngularJsApp();

        // A Dojo Promise / "Then'able". Not a standard Promise.
        promiseControl.fadeInPromiseLike = this.inherited(arguments);
      }

      return this._promiseControl.fadeInPromiseLike;
    },

    /**
     * Shows the dialog.
     *
     * When the dialog is already being shown,
     * returns the promise that was returned by the method call that initially showed the dialog.
     *
     * This method is equivalent to the {@link #show} method with the distinction of the returned promise —
     * the promise returned by the latter is resolved when the dialog's fade in animation ends.
     *
     * @return {Promise} A promise that is resolved when the dialog is accepted,
     *  and is rejected when the dialog is canceled.
     *  The resolution value is the dialog's result value.
     *  The rejection value is `undefined`, when canceled. However, it may also contain an error object if one occurs
     *  while showing the dialog (e.g. if the fade in animation fails).
     */
    showDialog: function() {

      this.show();

      // assert this._promiseControl != null;

      return this._promiseControl.promise;
    },

    /**
     * Checks that the dialog is showing and throws an error if not.
     * @throws {Error} If method is called when the dialog is not shown or is already hiding.
     * @private
     */
    __checkShowing: function() {
      if(this._promiseControl == null || this._fadeOutDeferred != null) {
        throw new Error("Dialog is not open.");
      }
    },

    /**
     * Accepts the dialog, optionally with a given result.
     *
     * This method hides the dialog and resolves the promise previously returned by {@link #showDialog} with the given
     * result value.
     *
     * @param {*} [result] - The result, if any.
     * @throws {Error} If method is called when the dialog is not shown or is already hiding.
     */
    acceptDialog: function(result) {
      this.__checkShowing();

      this._promiseControl.accepted = true;
      this._promiseControl.result = result;

      // Call DialogMixin#_onSubmit.
      // - Calls onExecute. Which hides the dialog, via aspect.after on dijit.Dialog.
      // - Calls execute.
      this._onSubmit();
    },

    /**
     * Cancels the dialog.
     *
     * Pressing the `ESC` key also cancels the dialog.
     *
     * Directly hiding the dialog via `hide()` has the same effect of calling `cancelDialog()`.
     * The `hide` method does not, however, allow specifying a cancellation error.
     *
     * @param {?Error} [error] - An error, if any.
     * @throws {Error} If method is called when the dialog is not shown or is already hiding.
     * @see #hide
     */
    cancelDialog: function(error) {
      this.__checkShowing();

      // This is the default value.
      // assert this._promiseControl.accepted ==== false;

      this._promiseControl.error = error;

      // - Hides the dialog, via aspect.after on dijit.Dialog.
      this.onCancel();
    },


    /**
     * Called when the dialog is hidden, when the fade out animation ends.
     * @override
     */
    onHide: function() {
      var promiseControl = this._promiseControl;
      // assert promiseControl != null

      this._promiseControl = null;

      if(promiseControl.accepted) {
        promiseControl.resolve(promiseControl.result);
      } else {
        promiseControl.reject(promiseControl.error);
      }
    },


    /**
     * Destroys the Dojo dialog, including the contained AngularJS application.
     * @override
     * @see #_destroyAngularJsApp
     */
    destroy: function() {
      this._destroyAngularJsApp();

      this.inherited(arguments);
    }
  });

  return HostDialog;

  function createPromiseControl() {
    var promiseControl = {
      params: undefined,
      promise: null,
      resolve: null,
      reject: null,
      accepted: false,
      result: undefined,
      error:  undefined,
      fadeInPromiseLike: null
    };

    promiseControl.promise = new Promise(function(resolve, reject) {
      // This function is called synchronously.
      promiseControl.resolve = resolve;
      promiseControl.reject = reject;
    });

    return promiseControl;
  }
});
