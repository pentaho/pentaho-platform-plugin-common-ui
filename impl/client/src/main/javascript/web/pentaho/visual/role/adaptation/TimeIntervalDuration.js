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
  "pentaho/type/String",
  "pentaho/type/mixins/Enum"
], function(module, PentahoString, EnumMixin) {
  /**
   * @name pentaho.visual.role.adaptation.TimeIntervalDuration
   * @class
   * @extends pentaho.type.String
   *
   * @amd pentaho/visual/role/adaptation/TimeIntervalDuration
   *
   * @private
   */
  return PentahoString.extend({
    $type: /** @lends pentaho.visual.role.adaptation.TimeIntervalDurationType# */ {
      id: module.id,

      mixins: [EnumMixin],
      domain: [
        "year",
        "halfYear",
        "quarter",
        "month",
        "week",
        "day",
        "hour",
        "minute",
        "second",
        "millisecond",
        "instant"
      ]
    }
  }).configure();
});
