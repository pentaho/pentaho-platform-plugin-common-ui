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
  "pentaho/module!_",
  "pentaho/type/Complex",
  "pentaho/i18n!model"
], function(module, Complex, bundle) {

  "use strict";

  /**
   * @name pentaho.visual.ApplicationType
   * @class
   * @extends pentaho.type.ComplexType
   *
   * @classDesc The base type class of visual application types.
   *
   * For more information see {@link pentaho.visual.Application}.
   */

  /**
   * @name pentaho.visual.Application
   * @class
   * @extends pentaho.type.Complex
   *
   * @amd pentaho/visual/Application
   *
   * @classDesc The base class of visual applications.
   *
   * @description Creates a visual application instance.
   *
   * @constructor
   * @param {pentaho.visual.spec.IApplication} [spec] A visual application specification.
   */
  return Complex.extend({
    $type: {
      id: module.id
    }
  })
  .localize({$type: bundle.structured.Application})
  .configure();
});
