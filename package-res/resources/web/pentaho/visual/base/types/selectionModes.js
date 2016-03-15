/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
define(function() {
  "use strict";

  /**
   * @name selectionModes
   * @namespace
   * @memberOf pentaho.visual.base.types
   */
  return /** @lends pentaho.visual.base.types.selectionModes */{

    /**
     * Replaces the current selection filter with the provided filter.
     * Returns the input filter.
     *
     * @param {pentaho.data.filter.AbstractFilter} current - The filter representing the current selection filter.
     * @param {pentaho.data.filter.AbstractFilter} input - The filter that will replace the current selection filter.
     * @return {?pentaho.data.filter.AbstractFilter}
     * @static
     */
    REPLACE: function(current, input) {
      return input;
    },

    /**
     * Adds the input filter to the current selection filter, but
     * previously selected items will be unselected.
     *
     * @param {pentaho.data.filter.AbstractFilter} current - The current selection filter.
     * @param {pentaho.data.filter.AbstractFilter} input -
     * @return {?pentaho.data.filter.AbstractFilter}
     * @static
     */
    TOGGLE: function(current, input) {
      throw Error("Not Implemented"); // Haven't had time to think about this properly.
      return current.and(input).invert().or(current);
    },

    /**
     * Adds the input filter to the current selection filter.
     *
     * @param {pentaho.data.filter.AbstractFilter} current - The current selection filter.
     * @param {pentaho.data.filter.AbstractFilter} input -
     * @return {?pentaho.data.filter.AbstractFilter}
     * @static
     */
    ADD: function(current, input) {
      return  current.or(input);
    },

    /**
     * Removes the input filter from the current selection filter.
     *
     * @param {pentaho.data.filter.AbstractFilter} current - The current selection filter.
     * @param {pentaho.data.filter.AbstractFilter} input -
     * @return {?pentaho.data.filter.AbstractFilter}
     * @static
     */
    REMOVE: function(current, input) {
      return current.and(input.invert());
    }

  }
});