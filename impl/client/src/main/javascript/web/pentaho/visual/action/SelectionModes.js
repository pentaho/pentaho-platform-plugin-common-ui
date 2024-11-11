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
  "module",
  "pentaho/util/logger",
  "pentaho/debug",
  "pentaho/debug/Levels",
  "pentaho/data/util"
], function(module, logger, debugMgr, DebugLevels, dataUtil) {
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

      var data = this.data;
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

        // Filtering-out rows with all null measures can speed up things a lot.
        var measureFieldNames = this.measureFieldNames;
        if(measureFieldNames.length > 0) {
          var measureIndexes = dataUtil.getColumnIndexesByIds(data, measureFieldNames);

          var allNullMeasuresPredicate = dataUtil.buildRowPredicateNotAllNullColumns(measureIndexes);

          data = dataUtil.filterByPredicate(data, allNullMeasuresPredicate);
        }

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
