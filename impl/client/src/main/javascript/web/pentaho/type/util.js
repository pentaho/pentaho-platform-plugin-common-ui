/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
     * Obtains the container of the first reference, if any, of the given instance.
     *
     * @param {pentaho.type.Instance} inst The instance.
     * @return {pentaho.type.Instance} The container of the first reference.
     * @private
     * @internal
     */
    __getFirstRefContainer: function(inst) {
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
    __getFirstRefProperty: function(inst) {
      var refs = inst.$references;
      return refs && refs.length ? refs[0].property : null;
    },

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

    __baseIdOf: function(id) {
      return id && id.replace(/.[^\/]+$/, "");
    },

    __absolutizeDependencyOf: function(id, siblingId) {

      return this.__absolutizeId(id, this.__baseIdOf(siblingId));
    },

    __absolutizeId: function(id, baseId) {
      if(id) {
        var baseIds = baseId ? baseId.split("/") : [];
        var ids = id.split("/");
        var needsBase = false;

        while(ids.length) {
          var segment = ids[0];
          if(segment === ".") {
            ids.shift();
            needsBase = true;
          } else if(segment === "..") {
            if(!baseIds.pop()) {
              throw error.operInvalid("Invalid path: '" + id + "'.");
            }
            ids.shift();
            needsBase = true;
          } else {
            break;
          }
        }

        if(needsBase) {
          baseId = baseIds.join("/");
          id = ids.join("/");

          return (baseId && id) ? (baseId + "/" + id) : (baseId || id);
        }
      }

      return id;
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
