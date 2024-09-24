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
  "module",
  "common-ui/angularjs",
  "./hostDialogModule.service"
], function(module, angularJs, hostDialogServiceDefiner) {

  "use strict";

  /**
   * @name angularjs
   * @namespace
   */

  /**
   * @name angularjs.Module
   * @interface
   * @see https://docs.angularjs.org/api/ng/type/angular.Module
   */

  /**
   * @name angularjs.Injector
   * @interface
   * @see https://docs.angularjs.org/api/auto/service/$injector
   */

  /**
   * @name pentaho.common.angularjs
   * @namespace
   */

  /**
   * An AngularJs module type which provides functionality related with the host dialog of the AngularJS application.
   *
   * The single instance of this type is {@link pentaho.common.angularjs.hostDialogModule}.
   *
   * @name pentaho.common.angularjs.IHostDialogModule
   * @class
   * @extends angularjs.Module
   * @see pentaho.common.angularjs.HostDialog
   */

  /**
   * The single instance of `IHostDialogModule`.
   *
   * The AngularJS module name matches the identifier of the RequireJS module, i.e.,
   * `pentaho/common/angularjs/hostDialogModule`.
   *
   * When defining an AngularJS module that depends on this one,
   * the following pattern is recommended to declare the dependency:
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
   *   // Use the identifier of the RequireJS' module as the name of the AngularJS' module.
   *   var angularJsModule = angularJs.module(module.id, deps);
   *
   *   // Additional angularJsModule configurations...
   *
   *   return angularJsModule;
   * });
   * ```
   *
   * @memberof pentaho.common.angularjs
   * @type {pentaho.common.angularjs.IHostDialogModule}
   */
  var hostDialogModule = angularJs.module(module.id, []);

  hostDialogServiceDefiner(hostDialogModule);

  return hostDialogModule;
});
