/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/util/error"
], function(error) {
  "use strict";

  /**
   * @name mixinDataFilter
   * @memberOf pentaho.visual.base.mixins.mixinDataFilter
   * @mixin
   */
  return  /** @lends pentaho.visual.base.mixins.mixinDataFilter# */{

    /**
     * Initializes the mixin.
     *
     * @param {!pentaho.data.filter.AbstractFilter} dataFilter - A filter that represents a subset of the data.
     * @param {boolean} [isMutable=false] - Determines if an event listener can modify the [dataFilter]{@link #dataFilter} property.
     * @protected
     */
    _initFilter: function(dataFilter, isMutable) {
      if(!dataFilter) throw error.argRequired("dataFilter");
      this._dataFilter = dataFilter;
      this._isMutable = !!isMutable;
    },

    /**
     * Gets or sets the filter that represents a subset of the data.
     *
     * @type ?pentaho.data.filter.AbstractFilter
     *
     * @throws {TypeError} When `dataFilter` is not mutable.
     */
    get dataFilter() {
      return this._dataFilter;
    },

    set dataFilter(filter) {
      if(this._isMutable) {
        this._dataFilter = filter;
      } else {
        throw TypeError();
      }
    }
  };
});
