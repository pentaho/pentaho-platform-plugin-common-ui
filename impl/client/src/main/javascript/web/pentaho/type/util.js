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
  "pentaho/util/object"
], function(O) {

  "use strict";

  /**
   * @classDesc A singleton class that contains utilities for using types and its instances.
   *
   * @name pentaho.type.Util
   * @class
   * @amd {pentaho.type.Util} pentaho/type/util
   *
   * @description This class was not designed to be constructed directly.
   */

  return /** @lends pentaho.type.Util# */{
    /**
     * Normalizes a validation errors result.
     *
     * @param {Nully|pentaho.type.ValidationError|Array.<pentaho.type.ValidationError>} errors - An error,
     * an errors array, or a `Nully` value.
     *
     * @return {Array.<pentaho.type.ValidationError>} An array of validation errors or `null`.
     */
    normalizeErrors: function(errors) {
      return errors ? __toArray(errors) : null;
    },

    /**
     * Combines two validation error lists.
     *
     * @param {Nully|Array.<pentaho.type.ValidationError>} errors - An errors array, if any.
     * @param {Nully|pentaho.type.ValidationError|Array.<pentaho.type.ValidationError>} errorsAdd - The error or
     * errors to add, if any.
     * @return {Array.<pentaho.type.ValidationError>} A combined errors array, or `null`.
     */
    combineErrors: function(errors, errorsAdd) {
      if(errorsAdd) {
        if(!errors)
          errors = __toArray(errorsAdd);
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
     * @param {object} spec - The specification to be filled.
     * @param {object} obj - The object where the method is defined.
     * @param {string} name - The name of the method.
     *
     * @return {boolean} `true` if the attribute was added, `false`, otherwise.
     * @private
     */
    __fillSpecMethodInContext: function(spec, obj, name) {
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
   * @param {Array|Object} v - The value to convert to array.
   * @return {Array} The given array or an array with the given value.
   *
   * @private
   */
  function __toArray(v) {
    return Array.isArray(v) ? v : [v];
  }
});
