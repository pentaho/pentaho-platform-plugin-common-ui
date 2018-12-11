/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "../Simple",
  "../List",
  "../util",
  "../ValidationError",
  "../../i18n!../i18n/types",
  "../../util/error"
], function(module, Simple, List, typeUtil, ValidationError, bundle, error) {

  "use strict";

  /**
   * @name pentaho.type.mixins.EnumType
   * @class
   * @extends pentaho.type.SimpleType
   *
   * @classDesc The type class of the `Enum` mixin type.
   *
   * For more information see {@link pentaho.type.mixins.Enum}.
   */

  /**
   * @name pentaho.type.mixins.Enum
   * @abstract
   * @class
   * @extends pentaho.type.Simple
   * @amd pentaho/type/mixins/Enum
   *
   * @classDesc A mixin type that limits the domain, of the simple type it is applied to,
   * to a discrete set of instances.
   *
   * Enum types become final (cannot be further subtyped).
   *
   * The alias of this type is `enum`.
   *
   * The discrete set of valid instances must be specified at type initialization.
   *
   * The order of instances is relevant and is accounted for in [compare]{@link pentaho.type.ElementType#compare}.
   *
   * @example <caption>Defining an enumeration type</caption>
   *
   * ```js
   * define([
   *   "pentaho/module!_",
   *   "pentaho/type/String"
   * ], function(module, PenString) {
   *
   *   return PenString.extend({
   *     $type: {
   *       id: module.id,
   *       mixins: ["enum"],
   *       domain: [
   *         {v: "bad", f: "Bad"},
   *         {v: "neutral", f: "Neutral"},
   *         {v: "good", f: "Good"}
   *       ]
   *     }
   *   })
   *   .configure({$type: module.config});
   * });
   * ```
   *
   * @see pentaho.type.mixins.spec.IEnumType
   */
  return Simple.extend(/** @lends pentaho.type.mixins.Enum# */{

    /** @inheritDoc */
    validate: function() {
      return typeUtil.combineErrors(
        this.base(),
        this.$type.__validateDomain(this));
    },

    $type: /** @lends pentaho.type.mixins.EnumType# */{

      id: module.id,

      /** @inheritDoc */
      _init: function(spec, keyArgs) {

        spec = this.base(spec, keyArgs) || spec;

        // Domain is required.
        var domain = spec.domain;
        if(!domain) throw error.argRequired("spec.domain");

        return spec;
      },

      /**
       * Validates a value w.r.t. the restricted domain.
       *
       * @param {pentaho.type.Simple} value - The value to validate.
       * @return {Nully|pentaho.type.ValidationError|Array.<!pentaho.type.ValidationError>} The error, errors or null.
       * @private
       */
      __validateDomain: function(value) {
        var domain = this.__domain;
        return (!domain || domain.has(value.$key))
          ? null
          : new ValidationError(bundle.structured.errors.enum.notInDomain);
      },

      /** @inheritDoc */
      _fillSpecInContext: function(spec, keyArgs) {

        this.base(spec, keyArgs);

        if(!keyArgs) keyArgs = {};
        keyArgs.declaredType = this.$type;
        spec.domain = this.__domain.toSpecInContext(keyArgs);

        return true;
      },

      // region domain
      __domain: null,
      __domainPrimitive: null,

      /**
       * Gets or sets the list of valid values of the type.
       *
       * Must be set to a non-empty list when the type is defined.
       *
       * After type initialization, can only be set to an object,
       * where its keys are the keys of the contained values,
       * as a means to configure them.
       *
       * @type {pentaho.type.List.<pentaho.type.Simple>}
       *
       * @throws {pentaho.lang.ArgumentInvalidTypeError} When set to a value other than an array or a list during
       * type initialization.
       *
       * @throws {pentaho.lang.ArgumentInvalidTypeError} When set to a value other than a plain object after
       * type initialization.
       *
       * @see pentaho.type.mixins.spec.IEnumType#domain
       */
      get domain() {
        return this.__domain;
      },

      set domain(values) {

        if(values == null) throw error.argRequired("domain");

        if(!this.__domain) {
          // List can only be configured (to allow for simple element's configuration of `formatted` field),
          // but is, for all other purposes, read-only.

          // TODO: Had to remove the {isReadOnly: true}.
          // Find a way to only allow updating/replacing existing elements without
          // letting to add new keys or remove existing keys.

          var ListType = List.extend({$type: {of: this}});
          this.__domain = new ListType(values);
          this.__domainPrimitive = this.__domain.toArray(function(v) { return v.value; });

          if(!this.__domain.count) throw error.argRequired("spec.domain");

        } else if(values.constructor === Object) {
          this.__domain.configure({d: values});
        } else {
          throw error.argInvalidType("domain", ["Object"], typeof values);
        }
      },
      // endregion

      /** @inheritDoc */
      comparePrimitiveValues: function(valueA, valueB) {
        /* eslint no-multi-spaces: 0 */
        var indexA = this.__domainPrimitive.indexOf(valueA);
        var indexB = this.__domainPrimitive.indexOf(valueB);
        return indexA === indexB ?  0 : // Includes both negative.
          indexA < 0 ? -1 : // Undefined is lowest.
          indexB < 0 ? +1 : // Idem.
          indexA - indexB;  // Compare two non-negative indexes.
      }
    }
  }, /** @lends pentaho.type.mixins.Enum */{

    _extend: function() {
      throw error.operInvalid("Enum types are final and cannot be subtyped.");
    }
  })
  .configure({$type: module.config});
});
