/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
  "pentaho/module!",
  "pentaho/visual/action/Base",
  "pentaho/data/filter/Abstract",
  "pentaho/module/subtypesOf!pentaho/data/filter/Abstract",

  // TODO: This exists only so that r.js sees otherwise invisible dependencies.
  "pentaho/data/filter/standard"
], function(module, ActionBase, AbstractFilter) {

  "use strict";

  var __abstractFilterType = AbstractFilter.type;

  /**
   * @name pentaho.visual.action.mixins.Data.Type
   * @class
   * @extends pentaho.visual.action.Base.Type
   *
   * @classDesc The type class of the data action mixin.
   *
   * For more information see {@link pentaho.visual.action.mixins.Data}.
   */

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
   * which are performed on a subset of a data set.
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

  return ActionBase.extend(/** @lends pentaho.visual.action.mixins.Data# */{
    $type: {
      id: module.id,
      isAbstract: true
    },

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
     * @type {pentaho.data.filter.Abstract}
     */
    get dataFilter() {
      return this.__dataFilter;
    },

    set dataFilter(value) {

      /**
       * The data filter of the action.
       *
       * @alias __dataFilter
       * @type {pentaho.data.filter.Abstract}
       * @memberOf pentaho.visual.action.mixins.Data#
       * @private
       */
      this.__dataFilter = __abstractFilterType.to(value);
    },

    // region serialization
    toSpecInContext: function(keyArgs) {

      var spec = this.base(keyArgs);

      if(this.__dataFilter) {

        keyArgs = keyArgs ? Object.create(keyArgs) : {};

        keyArgs.declaredType = __abstractFilterType;

        spec.dataFilter = this.__dataFilter.toSpecInContext(keyArgs);
      }

      return spec;
    }
    // endregion
  })
  .configure({$type: module.config});
});
