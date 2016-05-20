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
  "../util/object"
], function(O) {

  "use strict";

  /**
   * @classDesc A singleton class that contains utilities for handling with values.
   *
   * @name pentaho.type.ValueHelper
   * @class
   * @amd {pentaho.type.ValueHelper} pentaho/type/valueHelper
   */

  return /** @lends pentaho.type.ValueHelper# */{

    /**
     * Normalizes a validation errors result.
     *
     * @param {Nully|pentaho.type.ValidationError|Array.<!pentaho.type.ValidationError>} errors An error,
     * an errors array, or a `Nully` value.
     *
     * @return {?Array.<!pentaho.type.ValidationError>} An array of validation errors or `null`.
     */
    normalizeErrors: function(errors) {
      return errors ? toArray(errors) : null;
    },

    /**
     * Combines two validation error lists.
     *
     * @param {Nully|Array.<!pentaho.type.ValidationError>} errors An errors array, if any.
     * @param {Nully|pentaho.type.ValidationError|Array.<!pentaho.type.ValidationError>} errorsAdd The error or
     * errors to add, if any.
     * @return {?Array.<!pentaho.type.ValidationError>} A combined errors array, or `null`.
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
    },

    /**
     * Fills the given specification with the specification of a method attribute of a given object,
     * and returns whether it was actually added.
     *
     * This method requires that there currently exists an
     * [ambient specification context]{@link pentaho.type.SpecificationContext.current}.
     *
     * @param {!Object} spec - The specification to be filled.
     * @param {!Object} obj - The object where the method is defined.
     * @param {string} name - The name of the method.
     *
     * @return {boolean} `true` if the attribute was added, `false`, otherwise.
     */
    fillSpecMethodInContext: function(spec, obj, name) {
      var any = false;
      var method;

      if(O.hasOwn(obj, name) && (method = obj[name])) {
        any = true;

        // Unwrap to original, overriding method.
        // Otherwise, we get the wrapper method.
        // This has the limitation of only allowing to output the first
        // override. If this is overridden twice locally, we only output the last one...
        spec[name] = method.valueOf();
      }

      return any;
    }
  };

  /**
   * Converts to array.
   *
   * @param {Array|Object} v The value to convert to array.
   * @return {Array} The given array or an array with the given value.
   * @ignore
   */
  function toArray(v) {
    return Array.isArray(v) ? v : [v];
  }
});
