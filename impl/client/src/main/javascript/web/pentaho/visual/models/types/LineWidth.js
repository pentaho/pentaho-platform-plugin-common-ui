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
  "pentaho/type/Number",
  "pentaho/type/mixins/Enum",
  "pentaho/i18n!../i18n/model"
], function(module, PentahoNumber, EnumMixin, bundle) {

  "use strict";

  return PentahoNumber.extend({
    $type: {
      id: module.id,
      mixins: [EnumMixin],
      domain: [1, 2, 3, 4, 5, 6, 7, 8]
    }
  })
  .localize({$type: bundle.structured.LineWidth})
  .configure();
});
