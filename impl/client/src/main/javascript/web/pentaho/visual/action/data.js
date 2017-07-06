/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "module",
  "pentaho/visual/action/base",
  "pentaho/type/filter/abstract"
], function(module, baseActionFactory, abstractFilterFactory) {

  "use strict";

  return function(context) {

    var AbstractFilter = context.get(abstractFilterFactory);

    // Cannot depend directly or an AMD dependency cycle would arise...
    var baseViewType = null;

    /**
     * @name pentaho.visual.action.Data.Type
     * @class
     * @extends pentaho.visual.action.Base.Type
     *
     * @classDesc The base type class of data actions.
     *
     * For more information see {@link pentaho.visual.action.Data}.
     */

    var ActionBase = context.get(baseActionFactory);

    return ActionBase.extend(/** @lends pentaho.visual.action.Data# */{
      type: /** @lends pentaho.visual.action.Data.Type# */{
        id: module.id,
        isAbstract: true
      },

      /**
       * @alias Data
       * @memberOf pentaho.visual.action
       * @class
       * @extends pentaho.visual.action.Base
       * @abstract
       *
       * @amd {pentaho.type.Factory<pentaho.visual.action.Data>} pentaho/visual/action/data
       *
       * @classDesc The `visual.action.Data` class is the base class of action types
       * which are performed on a subset of a dataset and
       * whose [target]{@link pentaho.visual.action.Base#target} is a [View]{@link pentaho.visual.base.View}.
       *
       * The actual subset is determined by the [data filter]{@link pentaho.visual.action.Data#dataFilter} property.
       *
       * @description Creates a data action instance given its specification.
       * @param {pentaho.visual.action.spec.IData} [spec] A data action specification.
       * @constructor
       */
      constructor: function(spec) {

        this.base(spec);

        this.dataFilter = spec && spec.dataFilter;
      },

      /**
       * Gets or sets the _data filter_ of this action.
       *
       * Can only be set while the action is in an [editable]{@link pentaho.type.action.Base#isEditable} state.
       *
       * When set to a filter specification, {@link pentaho.type.filter.spec.IAbstract},
       * it is converted into a filter object.
       *
       * @type {pentaho.type.filter.Abstract}
       *
       * @throws {pentaho.lang.OperationInvalidError} When set and the action is not in an editable state.
       */
      get dataFilter() {

        return this.__dataFilter;
      },

      set dataFilter(value) {

        this._assertEditable();

        /**
         * The data filter of the action.
         *
         * @alias __dataFilter
         * @type {pentaho.type.filter.Abstract}
         * @memberOf pentaho.visual.action.Data#
         * @private
         */
        this.__dataFilter = AbstractFilter.type.to(value);
      },

      // region serialization
      /** @inheritDoc */
      toSpecInContext: function(keyArgs) {

        var spec = this.base(keyArgs);

        if(this.__dataFilter) spec.dataFilter = this.__dataFilter.toSpecInContext(keyArgs);

        return spec;
      }
      // endregion
    });
  };
});
