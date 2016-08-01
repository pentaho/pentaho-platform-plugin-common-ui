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
define(function() {
  "use strict";

  /**
   * The `selectionModes` namespace contains a collection of methods that represent different ways
   * to combine the current selection filter with the selection filter that was created by the user
   * interaction with a visualization.
   *
   * @name selectionModes
   * @namespace
   * @memberOf pentaho.visual.base.types
   */
  var selectionModes = /** @lends pentaho.visual.base.types.selectionModes */{
    /**
     * Replaces the current selection filter with the provided filter.
     *
     * @param {pentaho.type.filter.Abstract} current - The current selection filter.
     * @param {pentaho.type.filter.Abstract} input - The input filter.
     * @return {!pentaho.type.filter.Abstract} The input filter.
     * @static
     */
    REPLACE: function(current, input) {
      return input;
    },

    /**
     * Adds the input filter to the current selection filter,
     * if it is not already fully contained within the selection filter.
     * Otherwise, removes the input filter from the current selection filter.
     *
     * @param {pentaho.type.filter.Abstract} current - The current selection filter.
     * @param {pentaho.type.filter.Abstract} input - The input filter.
     * @return {!pentaho.type.filter.Abstract} The toggled selection filter.
     * @static
     */
    TOGGLE: function(current, input) {
      // Determine if all rows in input are currently selected.
      var inputData = this.data.filter(input);
      var currentInputData = inputData.filter(current);
      var isAllInputSelected = inputData.getNumberOfRows() === currentInputData.getNumberOfRows();

      var selectionMode = isAllInputSelected ? selectionModes.REMOVE : selectionModes.ADD;

      return selectionMode.call(this, current, input);
    },

    /**
     * Adds the input filter to the current selection filter.
     *
     * @param {pentaho.type.filter.Abstract} current - The current selection filter.
     * @param {pentaho.type.filter.Abstract} input - The filter that will be added to the current selection filter.
     * @return {!pentaho.type.filter.Abstract} The combined selection filter.
     * @static
     */
    ADD: function(current, input) {
      return current.or(input);
    },

    /**
     * Removes the input filter from the current selection filter.
     *
     * @param {pentaho.type.filter.Abstract} current - The current selection filter.
     * @param {pentaho.type.filter.Abstract} input - The filter that will be removed from the current selection filter.
     * @return {!pentaho.type.filter.Abstract} The current selection filter without the input filter.
     * @static
     */
    REMOVE: function(current, input) {
      return current.and(input.negate());
    }
  };

  return selectionModes;
});
