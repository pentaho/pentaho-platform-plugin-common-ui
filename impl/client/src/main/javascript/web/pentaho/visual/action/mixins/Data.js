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
  "pentaho/visual/action/Interaction",
  "pentaho/data/filter/Abstract",
  "pentaho/module/subtypesOf!pentaho/data/filter/Abstract",

  // TODO: This exists only so that r.js sees otherwise invisible dependencies.
  "pentaho/data/filter/standard"
], function(module, Interaction, AbstractFilter) {

  "use strict";

  var __abstractFilterType = AbstractFilter.type;

  /**
   * @name Data
   * @memberOf pentaho.visual.action.mixins
   * @class
   * @extends pentaho.visual.action.Base
   * @abstract
   *
   * @amd pentaho/visual/action/mixins/Data
   *
   * @classDesc The `visual.action.mixins.Data` class is a mixin class for visual actions
   * which are performed on a subset of a dataset.
   *
   * The actual subset is determined by the
   * [data filter]{@link pentaho.visual.action.mixins.Data#dataFilter} property.
   *
   * The mixin adds [spec.IData]{@link pentaho.visual.action.mixins.spec.IData}
   * to the specification of an action.
   *
   * @description This class was not designed to be constructed directly.
   * It was designed to be used as a **mixin**.
   * @constructor
   */

  return Interaction.extend(module.id, /** @lends pentaho.visual.action.mixins.Data# */{
    // @override
    _init: function(spec) {

      this.base(spec);

      this.dataFilter = spec && spec.dataFilter;
    },

    /**
     * Gets or sets the _data filter_ of this action.
     *
     * When set to a filter specification, {@link pentaho.data.filter.spec.IAbstract},
     * it is converted into a filter object.
     * Any registered visual filter type can be safely loaded synchronously.
     *
     * When `null`, the action targets the entire dataset.
     *
     * @type {?pentaho.data.filter.Abstract}
     */
    get dataFilter() {
      return this.__dataFilter;
    },

    set dataFilter(value) {

      /**
       * The data filter of the action.
       *
       * @alias __dataFilter
       * @type {?pentaho.data.filter.Abstract}
       * @memberOf pentaho.visual.action.mixins.Data#
       * @private
       */
      this.__dataFilter = __abstractFilterType.to(value);
    },

    // region serialization
    _fillSpec: function(spec) {

      this.base(spec);

      if(this.__dataFilter) {
        spec.dataFilter = this.__dataFilter;
      }
    }
    // endregion
  });
});
