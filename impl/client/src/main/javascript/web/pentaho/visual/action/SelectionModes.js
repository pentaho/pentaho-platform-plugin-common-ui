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

  /* eslint valid-jsdoc: 0 */

  /**
   * The `SelectionModes` enumeration contains the collection of standard selection mode functions.
   *
   * @enum {pentaho.visual.action.SelectionMode}
   * @memberOf pentaho.visual.action
   * @readonly
   */
  var SelectionModes = {
    /**
     * Replaces the current selection filter with the provided filter.
     */
    replace: function(current, input) {
      return input;
    },

    /**
     * Adds the input filter to the current selection filter,
     * if it is not already fully contained within the selection filter.
     * Otherwise, removes the input filter from the current selection filter.
     */
    toggle: function(current, input) {
      if(!input) return current;

      // Determine if all rows in input are currently selected.
      // current.include(input) ?
      // input \ current = 0

      return input.andNot(current).toDnf().kind === "false"
          // all input is already selected, so, actually, toggle it all
          ? SelectionModes.remove.call(this, current, input)
          // not all input is already selected, so, add what's missing first, before actually toggling.
          : SelectionModes.add.call(this, current, input);
    },

    /**
     * Adds the input filter to the current selection filter.
     */
    add: function(current, input) {
      return current.or(input);
    },

    /**
     * Removes the input filter from the current selection filter.
     */
    remove: function(current, input) {
      return current.andNot(input);
    }
  };

  return SelectionModes;
});
