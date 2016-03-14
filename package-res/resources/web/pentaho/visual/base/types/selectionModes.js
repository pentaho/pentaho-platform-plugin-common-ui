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
define([], function() {
  "use strict";

  /**
   * @name selectionModes
   * @namespace
   * @memberOf pentaho.visual.base.types
   */
  return /** @lends pentaho.visual.base.types.selectionModes */{

    /**
     * Returns the candidate filter.
     *
     * @param {!pentaho.visual.base.Model} model -
     * @param {pentaho.data.filter.AbstractFilter} current - The filter representing the current selection.
     * @param {pentaho.data.filter.AbstractFilter} candidate - The filter that will replace the current selection.
     * @return {?pentaho.data.filter.AbstractFilter}
     * @static
     */
    REPLACE: function(current, candidate) {
      return candidate;
    },

    /**
     * Combines the candidate filter with the current .
     *
     * @param {pentaho.data.filter.AbstractFilter} current - The filter representing the current selection.
     * @param {pentaho.data.filter.AbstractFilter} candidate - The filter that will replace the current selection.
     * @return {?pentaho.data.filter.AbstractFilter}
     * @static
     */
    TOGGLE: function(current, candidate) {
      return current.and(candidate).invert().or(current);
    },

    /**
     * Returns a filter that expands the current selection with the items in the candidate filter.
     *
     * @param {pentaho.data.filter.AbstractFilter} current - The filter representing the current selection.
     * @param {pentaho.data.filter.AbstractFilter} candidate - The filter the current selection.
     * @return {?pentaho.data.filter.AbstractFilter}
     * @static
     */
    ADD: function(current, candidate) {
      return  current.or(candidate);
    },

    REMOVE: function(current, candidate) {
      return current.and(candidate.invert());
    }
  };


});