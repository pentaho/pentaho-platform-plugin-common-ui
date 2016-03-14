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
     * @param {pentaho.data.filter.AbstractFilter} currentFilter - The filter representing the current selection.
     * @param {pentaho.data.filter.AbstractFilter} candidateFilter - The filter that will replace the current selection.
     * @return {?pentaho.data.filter.AbstractFilter}
     * @static
     */
    REPLACE: function(currentFilter, candidateFilter) {
      return candidateFilter;
    },

    /**
     * Returns the candidate filter.
     *
     * @param {pentaho.data.filter.AbstractFilter} currentFilter - The filter representing the current selection.
     * @param {pentaho.data.filter.AbstractFilter} candidateFilter - The filter that will replace the current selection.
     * @return {?pentaho.data.filter.AbstractFilter}
     * @static
     */
    TOGGLE: function(currentFilter, candidateFilter) {
      return currentFilter.and(candidateFilter).invert().or(currentFilter);
    },

    ADD: function(currentFilter, candidateFilter) {
      return  currentFilter.or(candidateFilter);
    },

    REMOVE: function(currentFilter, candidateFilter) {
      return currentFilter.and(candidateFilter.invert());
    }
  };


});