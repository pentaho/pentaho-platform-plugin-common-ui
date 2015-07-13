/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
 *
 */

define([], function () {
  return function () {
    return {
      'name': undefined, // string
      'type': undefined, // string, java class name
      'list': undefined, // boolean
      'mandatory': undefined, // boolean
      'multiSelect': undefined, // boolean
      'strict': undefined, // boolean
      'timezoneHint': undefined, // string
      'attributes': {}, // hash of strings
      'values': [],

      /**
       * Checks if the value provided is selected in this parameter
       *
       * @param {Object} value Value to search for
       * @return {Boolean} true if this parameter contains a selection whose value = {value}
       */
      isSelectedValue: function (value) {
        var selected = false;
        $.each(this.values, function (i, v) {
          if (v.selected) {
            if (value === v.value) {
              selected = true;
              return false; // break
            }
          }
        });
        return selected;
      },

      /**
       * Determine if any of our values are selected (selected = true)
       *
       * @return {Boolean} {true} if any value is selected, {false} otherwise
       */
      hasSelection: function () {
        var s = false;
        $.each(this.values, function (i, v) {
          if (v.selected) {
            s = true;
            return false; // break
          }
        });
        return s;
      },

      /**
       * Obtains an array with the values of the selected ParameterValue objects.
       *
       * @return {Array} Array with the values selected
       */
      getSelectedValuesValue: function () {
        var selected = [];
        $.each(this.values, function (i, val) {
          if (val.selected) {
            selected.push(val.value);
          }
        });
        return selected;
      }
    };
  }
});
