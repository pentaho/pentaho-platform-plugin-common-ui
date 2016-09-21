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
  "../util/object",
  "../util/error"
], function(O, error) {

  "use strict";

  /**
   * Map of merge operation name to operation handler function.
   *
   * @type {Object.<string, function>}
   * @see mergeSpecsOne
   */
  var _mergeHandlers = {
    "replace": mergeSpecsOperReplace,
    "merge": mergeSpecsOperMerge,
    "add": mergeSpecsOperAdd
  };

  /**
   * @classDesc A singleton class that contains utilities for using types and its instances.
   *
   * @name pentaho.type.Util
   * @class
   * @amd {pentaho.type.Util} pentaho/type/util
   */

  return /** @lends pentaho.type.Util# */{

    /**
     * Obtains the container of the first reference, if any, of the given instance.
     *
     * @param {pentaho.type.Instance} inst The instance.
     * @return {pentaho.type.Instance} The container of the first reference.
     * @private
     * @internal
     */
    _getFirstRefContainer: function(inst) {
      var refs = inst.$references;
      return refs && refs.length ? refs[0].container : null;
    },

    /**
     * Obtains the property type of the first reference, if any, of the given instance.
     *
     * @param {pentaho.type.Instance} inst The instance.
     * @return {pentaho.type.Property.Type} The property type of the first reference.
     * @private
     * @internal
     */
    _getFirstRefProperty: function(inst) {
      var refs = inst.$references;
      return refs && refs.length ? refs[0].property : null;
    },

    /**
     * Normalizes a validation errors result.
     *
     * @param {Nully|pentaho.type.ValidationError|Array.<!pentaho.type.ValidationError>} errors - An error,
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
     * @param {Nully|Array.<!pentaho.type.ValidationError>} errors - An errors array, if any.
     * @param {Nully|pentaho.type.ValidationError|Array.<!pentaho.type.ValidationError>} errorsAdd - The error or
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
    },

    mergeSpecs: mergeSpecs
  };

  // region merge
  /**
   * Merges a specification into another.
   *
   * The target specification is modified,
   * but the source specification isn't.
   * The latter is actually deep-cloned, whenever full-subtrees are set at a target place,
   * to prevent future merges from inadvertently changing the source's internal structures.
   *
   * @memberOf pentaho.type.Util#
   * @param {!Object} specTarget - The target specification.
   * @param {Object} specSource - The source specification.
   *
   * @return {!Object} The target specification.
   */
  function mergeSpecs(specTarget, specSource) {

    for(var name in specSource)
      if(O.hasOwn(specSource, name))
        mergeSpecsOne(specTarget, name, specSource[name]);

    return specTarget;
  }

  /**
   * Merges one property into a target object,
   * given the source property name and value.
   *
   * @param {!Object} target - The target object.
   * @param {string} name - The source property name.
   * @param {any} sourceValue - The source property value.
   *
   * @private
   */
  function mergeSpecsOne(target, name, sourceValue) {
    var op;

    if(isPlainJSObject(sourceValue)) {
      // Is `sourceValue` an operation structure?
      //   {$op: "merge", value: {}}
      if((op = sourceValue.$op)) {
        // Always deref source value, whether or not `op` is merge.
        sourceValue = sourceValue.value;

        // Merge operation only applies between two plain objects and
        // add operation only applies between two arrays.
        // Otherwise behaves like _replace_.
        if(op === "merge" && !isPlainJSObject(sourceValue) || op === "add" && !Array.isArray(sourceValue)) {
          op = "replace";
        }
      } else {
        op = "merge";
      }
    }

    var handler = O.getOwn(_mergeHandlers, op || "replace");
    if(!handler)
      throw error.operInvalid("Merge operation '" + op + "' is not defined.");

    handler(target, name, sourceValue);
  }

  /**
   * Performs the merge operation when the target value is also a plain object,
   * or replaces it, if not.
   *
   * @param {!Object} target - The target object.
   * @param {string} name - The source property name.
   * @param {!Object} sourceValue - The source property value.
   *
   * @private
   */
  function mergeSpecsOperMerge(target, name, sourceValue) {
    // Is `targetValue` also a plain object?
    var targetValue = target[name];
    if(isPlainJSObject(targetValue))
      mergeSpecs(targetValue, sourceValue);
    else
      mergeSpecsOperReplace(target, name, sourceValue);
  }

  /**
   * Replaces the target value with a deep, own clone of the source value.
   *
   * @param {!Object} target - The target object.
   * @param {string} name - The source property name.
   * @param {any} sourceValue - The source property value.
   *
   * @private
   */
  function mergeSpecsOperReplace(target, name, sourceValue) {
    // Clone source value so that future merges into it don't change it, inadvertently.
    target[name] = cloneOwnDeep(sourceValue);
  }

  /**
   * When both the source and target values are arrays,
   * appends the source elements to the target array.
   * Otherwise, replaces the target array with a deep,
   * own clone of the source array.
   *
   * @param {!Object} target - The target object.
   * @param {string} name - The source property name.
   * @param {any} sourceValue - The source property value.
   *
   * @private
   */
  function mergeSpecsOperAdd(target, name, sourceValue) {
    // If both are arrays, append source to target, while cloning source elements.
    // Else, fallback to replace operation.
    var targetValue;
    if(Array.isArray(sourceValue) && Array.isArray((targetValue = target[name]))) {
      var i = -1;
      var L = sourceValue.length;
      while(++i < L)
        targetValue.push(cloneOwnDeep(sourceValue[i]));

    } else {
      mergeSpecsOperReplace(target, name, sourceValue);
    }
  }

  /**
   * Creates a deep, own clone of a given value.
   *
   * For plain object values, only their _own_ properties are included.
   *
   * @param {any} value - The value to clone deeply.
   *
   * @return {any} The deeply cloned value.
   *
   * @private
   */
  function cloneOwnDeep(value) {
    if(value && typeof value === "object") {
      if(value instanceof Array) {
        value = value.map(cloneOwnDeep);
      } else if(value.constructor === Object) {
        var clone = {};
        O.eachOwn(value, function(vi, p) {
          this[p] = cloneOwnDeep(vi);
        }, clone);
        value = clone;
      }
    }

    return value;
  }
  // endregion

  /**
   * Checks if a value is a plain JavaScript object.
   *
   * @param {any} value - The value to check.
   *
   * @return {boolean} `true` if it is; `false` if is not.
   *
   * @private
   */
  function isPlainJSObject(value) {
    return (!!value) && (typeof value === "object") && (value.constructor === Object);
  }
  // endregion

  /**
   * Converts to array.
   *
   * @param {Array|Object} v - The value to convert to array.
   * @return {Array} The given array or an array with the given value.
   *
   * @private
   */
  function toArray(v) {
    return Array.isArray(v) ? v : [v];
  }
});
