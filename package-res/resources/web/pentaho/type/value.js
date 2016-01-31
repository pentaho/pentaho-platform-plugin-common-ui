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
  "module",
  "./Item",
  "./valueHelper",
  "../i18n!types",
  "../util/error"
], function(module, Item, valueHelper, bundle, error) {

  "use strict";

  // NOTE: PhantomJS does not like this variable to be named context
  // because it would get into trouble on the context getter, below...
  return function(theContext) {

    // Late bound to break cyclic dependency.
    // Resolved on first use, in pentaho.type.Value.refine.
    var Refinement = null;

    /**
     * @name pentaho.type.Value.Meta
     * @class
     * @extends pentaho.type.Item.Meta
     *
     * @classDesc The base type class of value types.
     *
     * For more information see {@link pentaho.type.Value}.
     */

    /**
     * @name pentaho.type.Value
     * @class
     * @extends pentaho.type.Item
     * @amd pentaho/type/value
     *
     * @classDesc
     *
     * ### AMD
     *
     * Module Id: `pentaho/type/value`
     *
     * The AMD module returns the type's factory, a
     * {@link pentaho.type.Factory<pentaho.type.Value>}.
     *
     * @description Creates a value instance.
     */
    var Value = Item.extend("pentaho.type.Value", /** @lends pentaho.type.Value# */{

      /**
       * Gets the key of the value.
       *
       * The key of a value identifies it among values of the same concrete type.
       *
       * If two values have the same concrete type and their
       * keys are equal, then it must also be the case that
       * {@link pentaho.type.Value.Meta#areEqual}
       * returns `true` when given the two values.
       * The opposite should be true as well.
       * If two values of the same concrete type have distinct keys,
       * then {@link pentaho.type.Value.Meta#areEqual} should return `false`.
       *
       * The default implementation returns the result of calling `toString()`.
       *
       * @type string
       * @readonly
       */
      get key() {
        return this.toString();
      },

      /**
       * Creates a shallow clone of this value.
       *
       * @return {!pentaho.type.Value} The value clone.
       */
      clone: function() {
        throw error.notImplemented();
      },

      /**
       * Determines if a given value, of the same type, is equal to this one.
       *
       * The given value **must** be of the same concrete type (or the result is undefined).
       *
       * To test equality for any two arbitrary values,
       * in a robust way, use {@link pentaho.type.Value.Meta#areEqual}.
       *
       * If two values are equal, they must have an equal {@link pentaho.type.Value#key}.
       * Otherwise, if they are different, they must have a different `key`.
       *
       * The default implementation returns `true` is the two values
       * have the same `key` and `false` otherwise.
       *
       * @param {!pentaho.type.Value} other A value to test for equality.
       * @return {boolean} `true` if the given value is equal to this one, `false`, otherwise.
       */
      equals: function(other) {
        return this === other || this.key === other.key;
      },

      //region validation

      /**
       * Determines if this value is a **valid instance** of its type.
       *
       * This attribute calls [validate]{@link pentaho.type.Value#validate} and
       * returns a boolean value indicating if it returned no errors.
       *
       * @type {boolean}
       * @readonly
       */
      get isValid() {
        return !this.validate();
      },

      /**
       * Determines if this value is a **valid instance** of its type.
       *
       * @return {?Array.<!Error>} A non-empty array of `Error` or `null`.
       *
       * @see pentaho.type.Value#isValid
       */
      validate: function() {
        return valueHelper.normalizeErrors(this.meta._validate(this));
      },

      //endregion

      meta: /** @lends pentaho.type.Value.Meta# */{
        // Note: constructor/_init only called on sub-classes of Value.Meta,
        // and not on Value.Meta itself.
        _init: function() {
          this.base.apply(this, arguments);

          // Block inheritance, with default values
          this._abstract = false;
        },

        id: module.id,

        styleClass: "pentaho-type-value",

        //region list property
        /**
         * Gets a value that indicates if a type is a list type.
         *
         * @name list
         * @memberOf pentaho.type.Value.Meta#
         * @type boolean
         * @readOnly
         * @abstract
         */
        //endregion

        //region context property

        // NOTE: any class extended from this one will return the same context...
        //@override
        /**
         * Gets the context that defined this type class.
         * @type pentaho.type.IContext
         * @readonly
         */
        get context() {
          // NOTE: PhantomJS does not like this variable to be named context...
          return theContext;
        },
        //endregion

        //region abstract property
        // @type boolean
        // -> boolean, Optional(false)

        // Default value is for `Value.Meta` only.
        // @see Value.Meta#constructor.
        _abstract: true,

        // TODO: Rhino probably gives a syntax error on this.
        // However, cannot use the `get "abstract"()` syntax cause then Phantom JS 1.9.8 starts failing
        get abstract() {
          return this._abstract;
        },

        set abstract(value) {
          // nully is reset, which is false, so !! works well.
          this._abstract = !!value;
        },
        //endregion

        /**
         * Gets a value that indicates if two given values are equal.
         *
         * If both values are {@link Nully}, `true` is returned.
         * If only one is {@link Nully}, `false` is returned.
         * If the values have different constructors, `false` is returned.
         * Otherwise, {@link pentaho.type.Value#equals} is called
         * on `va`, with `vb` as an argument, and its result is returned.
         *
         * @param {pentaho.type.Value|Nully} [va] The first value.
         * @param {pentaho.type.Value|Nully} [vb] The second value.
         *
         * @return {boolean} `true` if two values are equal, `false` otherwise.
         */
        areEqual: function(va, vb) {
          return va === vb || (va == null && vb == null) ||
                 (va != null && vb != null &&
                  (va.constructor === vb.constructor) && va.equals(vb));
        },

        //region validation
        /**
         * Determines if a value is a **valid instance** of this type.
         *
         * This method calls [validate]{@link pentaho.type.Value.Meta#validate} and
         * returns a boolean value indicating if it returned no errors.
         *
         * The `isValid` method can be seen as a stronger version
         * of {@link pentaho.type.Value.Meta#is}.
         *
         * @param {any} value The value to validate.
         *
         * @return {boolean} `true` if the value is a valid instance of this type, `false` if not.
         */
        isValid: function(value) {
          return !this.validate(value);
        },

        /**
         * Determines if a value is a **valid instance** of this type.
         *
         * Validation of `value` proceeds as follows:
         * 1. If it is {@link Nully}, an error is returned
         * 2. If it does not satisfy [is]{@link pentaho.type.Value.Meta#is}, an error is returned
         * 3. Validation is delegated to [validateInstance]{@link pentaho.type.Value.Meta#validateInstance}.
         *
         * Use this method when you know nothing about a value.
         * Otherwise, if you know that a value is an instance of this type,
         * you can call [validateInstance]{@link pentaho.type.Value.Meta#validateInstance} instead.
         *
         * @param {?any} value The value to validate.
         *
         * @return {?Array.<!Error>} A non-empty array of `Error` or `null`.
         *
         * @see pentaho.type.Value.Meta#isValid
         */
        validate: function(value) {
          // 1. Is of type
          if(value == null)
            return [new Error(bundle.structured.errors.value.cannotBeNull)];

          if(!this.is(value))
            return [new Error(bundle.format(bundle.structured.errors.value.notOfType, [this.label]))];

          // 2. Validate further, knowing it is an instance of.
          return this.validateInstance(value);
        },

        /**
         * Determines if a value,
         * that _is an instance of this type_,
         * is also a **valid instance** of this (and its) type.
         *
         * Thus, `this.is(value)` must be true.
         *
         * This method ensures that the value's actual type, `value.meta`,
         * is called to validate it,
         * whatever the relation that this type has with the actual type.
         *
         * When this type is not a base type of the value's actual type,
         * this type's `_validate` method should also be called to validate it.
         * This is the case with [refinement types]{@link pentaho.type.Refinement}.
         *
         * The default implementation calls `value.validate()`
         * (which in turns calls [_validate]{@link pentaho.type.Value.Meta#_validate}).
         *
         * @param {!pentaho.type.Value} value The value to validate.
         *
         * @return {?Array.<!Error>} A non-empty array of `Error` or `null`.
         *
         * @overridable
         *
         * @see pentaho.type.Value#validate
         * @see pentaho.type.Value.Meta#validate
         * @see pentaho.type.Value.Meta#_validate
         */
        validateInstance: function(value) {
          return value.validate();
        },

        /**
         * Determines if a value,
         * that _is an instance of this type_,
         * is also a **valid instance** of _this_ type.
         *
         * Thus, `this.is(value)` must be true.
         *
         * The default implementation does nothing.
         * Override to implement a type's specific validation logic.
         *
         * @param {!pentaho.type.Value} value The value to validate.
         *
         * @return {Nully|Error|Array.<!Error>} An `Error`, a non-empty array of `Error` or a `Nully` value.
         *
         * @protected
         * @overridable
         *
         * @see pentaho.type.Value.Meta#validate
         * @see pentaho.type.Value.Meta#validateInstance
         */
        _validate: function(value) {
        }
        //endregion
      }
    }, /** @lends pentaho.type.Value */{

      /**
       * Creates a refinement type that refines this one.
       *
       * An error is thrown if `instSpec.meta` is not specified.
       *
       * An error is thrown if `instSpec` contains any property other than `meta`.
       * The instance interface of refinement types is fixed.
       *
       * An error is thrown if `instSpec.meta.facets` specifies no refinement facet classes.
       *
       * @param {string} [name] A name of the refinement type used for debugging purposes.
       * @param {Object} instSpec The refined type instance specification.
       * The available attributes are those defined by the specified refinement facet classes.
       *
       * @return {Class.<pentaho.type.Refinement>} The refinement type's instance class.
       *
       * @see pentaho.type.Refinement.Meta#facets
       * @see pentaho.type.Refinement.Meta#of
       */
      refine: function(name, instSpec) {

        if(typeof name !== "string") {
          instSpec = name;
          name = null;
        }

        if(!instSpec) throw error.argRequired("instSpec");
        if(!instSpec.meta) throw error.argRequired("instSpec.meta");

        // Ugly but effective.
        instSpec.meta.of = this.meta;

        // Resolved on first use to break cyclic dependency.
        if(!Refinement) {
          Refinement = theContext.get("pentaho/type/refinement");
        }

        return Refinement.extend(name || "", instSpec);
      }
    },
    /*keyArgs:*/{
      isRoot: true
    }).implement({
      meta: bundle.structured.value
    });

    return Value;
  };
});
