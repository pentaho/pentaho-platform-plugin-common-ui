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
  "module",
  "pentaho/util/logger",
  "pentaho/debug",
  "pentaho/debug/Levels"
], function(module, logger, debugMgr, DebugLevels) {
  "use strict";

  /* eslint valid-jsdoc: 0 */

  var _isDebugMode = debugMgr.testLevel(DebugLevels.debug, module);

  /**
   * The `SelectionModes` enumeration contains the collection of standard selection mode functions.
   *
   * @enum {function}
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

      if(_isDebugMode) logger.log("TOGGLE BEGIN");

      if(!input) {
        return current;
      }

      var data = this.model.data;
      if(!data) {
        return current;
      }

      var isAllInputSelected = null;

      /* eslint default-case: 0 */
      switch(current.kind) {
        case "true":
          isAllInputSelected = true;
          break;

        case "false":
          isAllInputSelected = false;
          break;

        case "or":
          if(current.operands.count === 0) {
            // <=> false
            isAllInputSelected = false;
          }
          break;
      }

      if(isAllInputSelected === null) {
        // Determine if all rows in input are currently selected.
        //
        // In times, we did this test intentionally:
        // * current.include(input) ?
        // * <=> input \ current = 0
        // * <=> unselectedInput = input.andNot(current).toDnf();
        //
        // However, this approach proved wrong in cases where `current` and `input` have
        // a different structure (or intentionality character).
        // In particular, admit that `current` and `input` select the same rows of data,
        // with the current data.
        // Additionally, `current = input.toExtensional(data, keys)`.
        // The above test would not return an empty set, but, instead, something like
        // `input - row2 - row1`, cause the algorithm has no way to know that, with the current data,
        // the `input` filter includes only `row1` and `row2`.

        // Skipping rows with all null measures, when converting from cross-tab, can speed up things a lot.
        data = data.toPlainTable({skipRowsWithAllNullMeasures: true});

        var inputData = data.filter(input);
        var currentInputData = inputData.filter(current);
        isAllInputSelected = (inputData.getNumberOfRows() === currentInputData.getNumberOfRows());
      }

      var selectionMode = isAllInputSelected ? SelectionModes.remove : SelectionModes.add;

      var result = selectionMode.call(this, current, input);

      if(_isDebugMode) logger.log("TOGGLE END");

      return result;
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
