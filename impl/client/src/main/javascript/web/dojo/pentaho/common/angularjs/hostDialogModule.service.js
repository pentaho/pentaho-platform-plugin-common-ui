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
define([
  "dojo/_base/declare"
], function(declare) {

  // "use strict";

  var HostDialogService = declare(null, /** @memberof pentaho.common.angularjs.HostDialogService# */ {
    /**
     * The host dialog.
     * @type {pentaho.common.angularjs.HostDialog}
     * @private
     */
    __dialog: null,

    /**
     * An AngularJS service class which exposes functionality that allows controlling the host dialog.
     *
     * The AngularJS service name is given by {@link pentaho.common.angularjs.IHostDialogModule#$serviceName}.
     *
     * @alias HostDialogService
     * @memberof pentaho.common.angularjs
     * @class
     *
     * @constructor
     * @param {pentaho.common.angularjs.HostDialog} dialog - The host dialog instance.
     */
    constructor: function(dialog) {
      if(dialog == null) {
        throw new Error("Host dialog service provider not configured.");
      }

      this.__dialog = dialog;
    },

    /**
     * Gets the dialog parameter(s), if any.
     * @return {*} The dialog's parameter(s), if any; `undefined`, otherwise.
     */
    getParams: function() {
      var promiseControl = this.__dialog._promiseControl;
      return promiseControl && promiseControl.params;
    },

    /**
     * Sets the host dialog's title.
     * @param {string} titleHtml - An HTML string.
     */
    setTitle: function(titleHtml) {
      this.__dialog.setTitle(titleHtml);
    },

    /**
     * Cancels the host dialog.
     *
     * Hides the host dialog and marks it as canceled.
     *
     * @param {?Error} [error] - An error, if any.
     */
    cancel: function(error) {
      this.__dialog.cancelDialog();
    },

    /**
     * Accepts the host dialog, optionally with a given result.
     *
     * Hides the host dialog and marks it as accepted.
     * @param {*} [result] - The result value, if any.
     */
    accept: function(result) {
      this.__dialog.acceptDialog(result);
    }
  });

  /**
   * An AngularJS service provider class for configuring the `HostDialogService`.
   *
   * @memberof pentaho.common.angularjs
   * @class
   */
  var HostDialogServiceProvider = declare(null, /** @lends pentaho.common.angularjs.HostDialogServiceProvider# */ {
    /**
     * The host dialog.
     * @type {pentaho.common.angularjs.HostDialog}
     * @private
     */
    __dialog: null,

    /**
     * Sets the host dialog instance.
     * @param {pentaho.common.angularjs.HostDialog} dialog - The host dialog instance.
     * @public
     */
    setDialog: function(dialog) {
      this.__dialog = dialog;
    },

    $get: function() {
      return new HostDialogService(this.__dialog);
    }
  });

  /**
   * The define service in module function.
   */
  return function(module) {

    // NOTE: The property name `$serviceName` is used to avoid clashes with
    // angularJs.Module's own methods (e.g. `service(...)`). And host Dialog Module has a single service.
    // For the actual service name, the longer `$pentahoCommonHostDialogService` is used,
    // given this needs to be unique within an AngularJS application.

    /**
     * Gets the name of the Host Dialog AngularJS service.
     *
     * The value is `$pentahoCommonHostDialog`. However, for using the service, instead of directly using the
     * string value, the following pattern is advised, as exemplified by injecting the service into a controller:
     * ```js
     * define([
     *   "module",
     *   "common-ui/angularjs",
     *   "pentaho/common/angularjs/hostDialogModule"
     * ], function(module, angularJs, hostDialogModule) {
     *
     *   var deps = [
     *     // Use the dependency module's name property to declare dependency.
     *     hostDialogModule.name
     *   ];
     *
     *   var angularJsModule = angularJs.module(module.id, deps);
     *
     *   // Use the dependency module's name property to declare dependency.
     *   angularJsModule.component("my.controller", [hostDialogModule.$serviceName, function(hostDialogService) {
     *     hostDialogService.setTitle("My Title");
     *   }]);
     *
     *   return angularJsModule;
     * });
     * ```
     * @memberOf pentaho.common.angularjs.IHostDialogModule#
     * @type {string}
     * @value "$pentahoCommonHostDialog"
     */
    module.$serviceName = "$pentahoCommonHostDialog";

    module.provider(module.$serviceName, HostDialogServiceProvider);
  };
});
