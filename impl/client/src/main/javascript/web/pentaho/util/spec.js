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
  "./object",
  "../lang/OperationInvalidError"
], function(O, OperationInvalidError) {

  "use strict";

  /**
   * Map of merge operation name to operation handler function.
   *
   * @type {Object.<string, function>}
   * @see mergeOne
   */
  var _mergeHandlers = {
    "replace": mergeOperReplace,
    "merge": mergeOperMerge,
    "add": mergeOperAdd
  };

  /**
   * @classDesc A singleton class that contains utilities related to handling of specification objects.
   *
   * @name pentaho.util.Spec
   * @class
   * @amd {pentaho.util.Spec} pentaho/util/spec
   */

  return /** @lends pentaho.util.Spec# */{
    merge: merge
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
   * @memberOf pentaho.util.Spec#
   * @param {!Object} specTarget - The target specification.
   * @param {Object} specSource - The source specification.
   *
   * @return {!Object} The target specification.
   */
  function merge(specTarget, specSource) {

    for(var name in specSource)
      if(O.hasOwn(specSource, name))
        mergeOne(specTarget, name, specSource[name]);

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
  function mergeOne(target, name, sourceValue) {
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
      throw new OperationInvalidError("Merge operation '" + op + "' is not defined.");

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
  function mergeOperMerge(target, name, sourceValue) {
    // Is `targetValue` also a plain object?
    var targetValue = target[name];
    if(isPlainJSObject(targetValue))
      merge(targetValue, sourceValue);
    else
      mergeOperReplace(target, name, sourceValue);
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
  function mergeOperReplace(target, name, sourceValue) {
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
  function mergeOperAdd(target, name, sourceValue) {
    // If both are arrays, append source to target, while cloning source elements.
    // Else, fallback to replace operation.
    var targetValue;
    if(Array.isArray(sourceValue) && Array.isArray((targetValue = target[name]))) {
      var i = -1;
      var L = sourceValue.length;
      while(++i < L)
        targetValue.push(cloneOwnDeep(sourceValue[i]));

    } else {
      mergeOperReplace(target, name, sourceValue);
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
