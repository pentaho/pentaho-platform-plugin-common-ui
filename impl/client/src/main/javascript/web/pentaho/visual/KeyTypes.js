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

define(function() {

  "use strict";

  /**
   * The `KeyTypes` enum is the class of names of visual key types.
   *
   * The type of visual key determines how a visualization identifies
   * the rendered visual elements.
   *
   * @memberOf pentaho.visual
   * @enum {string}
   * @readonly
   */
  var KeyTypes = {
    /**
     * In visualizations having this type of visual key,
     * visual elements are identified by the ordinal of the corresponding data row,
     * possibly with the add of the values of some of the fields
     * (used, for example, for splitting data between multiple small charts).
     *
     * Typically, a Flat Table or a Scatter chart has this type of visual key.
     *
     * @default
     */
    dataOrdinal: "dataOrdinal",

    /**
     * In visualizations having this type of visual key,
     * visual elements are identified by the values of the key columns of the corresponding data row.
     *
     * Typically, a Bar chart or Line chart has this type of visual key.
     *
     * When a visualization has this type of visual key,
     * the key fields of the provided data must be exactly the fields mapped to key visual roles
     * ([isVisualKey]{@link pentaho.visual.role.AbstractPropertyType#isVisualKey}).
     *
     * @default
     */
    dataKey: "dataKey"
  };

  return Object.freeze(KeyTypes);
});
