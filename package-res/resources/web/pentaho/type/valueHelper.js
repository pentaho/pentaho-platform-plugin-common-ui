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
   * @classDesc A singleton class that contains utilities for handling with values.
   *
   * @name pentaho.type.ValueHelper
   * @class
   * @static
   */

  /**
   * The value helper singleton.
   *
   * @name pentaho.type.valueHelper
   * @type pentaho.type.ValueHelper
   * @amd pentaho/type/valueHelper
   */

  return /** @lends pentaho.type.ValueHelper# */{

    /**
     * Normalizes an errors result.
     *
     * @param {Nully|Error|Array.<!Error>} errors An error, an errors array, or a `Nully` value.
     *
     * @return {?Array.<!Error>} An array of `Error` or `null`.
     */
    normalizeErrors: function(errors) {
      return errors ? toArray(errors) : null;
    },

    /**
     * Combines two error lists.
     *
     * @param {Nully|Array.<!Error>} errors An errors array, if any.
     * @param {Nully|Error|Array.<!Error>} errorsAdd The error or errors to add, if any.
     * @return {?Array.<!Error>} A combined errors array, or `null`.
     */
    combineErrors: function(errors, errorsAdd) {
      if(errorsAdd) {
        if(!errors)
          errors = toArray(errorsAdd);
        else if(Array.isArray(errorsAdd))
          errors.push.apply(errors, errorsAdd);
        else
          errors.push(errorsAdd);
      }

      return errors || null;
    }
  };

  /**
   * Converts to array.
   *
   * @param {Array|Object} The value to convert to array.
   * @return {Array} The given array or an array with the given value.
   * @ignore
   */
  function toArray(v) {
    return Array.isArray(v) ? v : [v];
  }
});
