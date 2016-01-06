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
 */
define([
  "./value",
  "../../util/error",
  "../../i18n!../i18n/types"
], function(valueFactory, error, bundle) {

  "use strict";

  /**
   * Creates the `Simple` class for the given context.
   *
   * ### AMD
   *
   * Module Id: `pentaho/type/simple`
   *
   * @alias simpleFactory
   * @memberOf pentaho.type
   * @type pentaho.type.Factory
   * @amd pentaho/type/simple
   * @return {Class.<pentaho.type.Simple>} The `Simple` class of the given context.
   */
  return function(context) {

    var Value = context.get(valueFactory);

    /**
     * @name pentaho.type.Simple.Meta
     * @class
     * @extends pentaho.type.Value.Meta
     *
     * @classDesc The metadata class of {@link pentaho.type.Simple}.
     * @ignore
     */

    /**
     * @name pentaho.type.Simple
     * @class
     * @extends pentaho.type.Value
     *
     * @classDesc The base abstract class of un-structured, indivisible values.
     *
     * Simple type example:
     * ```javascript
     * define(["pentaho/type/simple"], function(simpleFactory) {
     *
     *   return function(context) {
     *
     *     var Simple = context.get(simpleFactory);
     *
     *     return Simple.extend({
     *
     *     });
     *   };
     * });
     * ```
     *
     * @description Creates a simple instance.
     */
    return Value.extend("pentaho.type.Simple", /** @lends pentaho.type.Simple# */{

      constructor: function(spec) {
        // Should allow a spec at construction time?
        // Throw if not possible?
        // What if we want a try cast?
        // meta.cast(.) -> meta.create( . )
        if(spec && spec.constructor === Object) {
          // TODO: more efficient implementation?
          this.extend(spec);

          // Required validation
          if(this._value == null) this.value = null;
        } else {
          this.value = spec;
        }
      },

      //region value attribute
      _value: undefined,

      /**
       * Gets the underlying primitive value of the _simple_ value.
       *
       * @type !any
       * @readonly
       */
      get value() {
        return this._value;
      },

      set value(value) {
        // Can only be set once.
        // Throws if nully.
        value = this.meta.cast(value);

        if(this._value == null) {
          // First set
          this._value = value;
        } else if(this._value !== value) {
          throw error.operInvalid("Cannot change the primitive value of a simple value.");
        }
      },

      // configuration alias
      set v(value) {
        this.value = value;
      },
      //endregion

      //region formatted attribute
      _formatted: null,

      /**
       * Gets or sets the formatted value of the property.
       *
       * @type ?string
       */
      get formatted() {
        return this._formatted;
      },

      set formatted(value) {
        this._formatted = nonEmptyString(value);
      },

      // configuration alias
      set f(value) {
        this.formatted = value;
      },
      //endregion

      valueOf: function() {
        return this._value;
      },

      toString: function() {
        var f = this._formatted;
        return f != null ? f : String(this._value);
      },

      meta: {
        id: "pentaho/type/simple",
        "abstract": true,
        styleClass: "pentaho-type-simple",

        //region cast method
        // Configurable in a special way.
        // Setting always sets the core.
        // Getting always gets the wrapper.
        get cast() {
          return castTop;
        },

        set cast(cast) {
          this._cast = cast || castCore;
        },

        _cast: castCore,
        //endregion

        toJSON: function(value) {
          return this._value.toString();
        }
      }
    }).implement({
      meta: bundle.structured.simple
    });

    //region cast private methods
    function castTop(value) {
      if(value == null)
        throw new Error("Simple value cannot contain null.");

      value = this._cast(value);

      if(value == null)
        throw new Error(bundle.format(bundle.structured.errors.value.cannotConvertToType, [this.label]));

      return value;
    }

    function castCore(value) {
      return value;
    }
    //endregion

    function nonEmptyString(value) {
      return value == null ? null : (String(value) || null);
    }
  };
});
